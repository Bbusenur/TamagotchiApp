import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';

const PETS_STORAGE_KEY = '@mypet_adopted_pets';
const STATS_STORAGE_KEY = '@mypet_game_stats';
const PetContext = createContext();

// Web ortamında donanımsal AsyncStorage bazen "null" hatası verir.
// Bu yüzden Web için tarayıcının yerel hafızasını (localStorage) kullanacağız.
const isWeb = Platform.OS === 'web';

const Storage = {
    getItem: async (key) => {
        if (isWeb) {
            try { return window.localStorage.getItem(key); } catch (e) { return null; }
        }
        return await AsyncStorage.getItem(key);
    },
    setItem: async (key, value) => {
        if (isWeb) {
            try { window.localStorage.setItem(key, value); } catch (e) { }
            return;
        }
        return await AsyncStorage.setItem(key, value);
    },
    removeItem: async (key) => {
        if (isWeb) {
            try { window.localStorage.removeItem(key); } catch (e) { }
            return;
        }
        return await AsyncStorage.removeItem(key);
    }
};

const defaultStats = {
    xp: 0,
    level: 1,
    adoptedCount: 0,
    achievements: [],
    // Günlük ilerleme bilgileri (görev sistemi için)
    daily: {
        date: null,
        adoptedToday: 0,
    },
    coins: 100, // Başlangıç parası
    inventory: ["Oda", "Manzara"], // Satın alınan eşyalar
    currentBackground: "Manzara", // Seçili arka plan
};

function calculateLevel(xp) {
    // Profil seviyesi
    return 1 + Math.floor(xp / 100);
}

function calculatePetLevel(xp) {
    // Pet seviyesi daha hızlı artar
    return 1 + Math.floor(xp / 50);
}

function calculatePetStage(level) {
    if (level >= 10) return "Yaşlı";
    if (level >= 5) return "Yetişkin";
    if (level >= 3) return "Genç";
    return "Bebek";
}

export function PetProvider({ children }) {
    const [pets, setPets] = useState([]);
    const [stats, setStats] = useState(defaultStats);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        try {
            const [storedPets, storedStats] = await Promise.all([
                Storage.getItem(PETS_STORAGE_KEY),
                Storage.getItem(STATS_STORAGE_KEY),
            ]);

            if (storedPets) {
                setPets(JSON.parse(storedPets));
            }

            if (storedStats) {
                try {
                    const parsed = JSON.parse(storedStats);
                    setStats({
                        ...defaultStats,
                        ...parsed,
                        level: calculateLevel(parsed.xp ?? 0),
                    });
                } catch {
                    setStats(defaultStats);
                }
            }
        } catch (e) {
            console.error('Failed to load pets or stats from storage', e);
        } finally {
            setLoading(false);
        }
    };

    const persistStats = (nextStats) => {
        Storage.setItem(STATS_STORAGE_KEY, JSON.stringify(nextStats)).catch(err =>
            console.error('Failed to save stats', err),
        );
    };

    const getTodayKey = () => {
        return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    };

    const addPet = async (petData) => {
        try {
            const newPet = {
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                // Tüm statlar başlangıçta 0
                aclik: 0,
                mutluluk: 0,
                enerji: 0,
                temizlik: 0,
                xp: 0,
                level: 1,
                stage: "Bebek",
                aksesuarlar: [], // Satın alınıp takılanlar
                ...petData,
            };

            setPets((prev) => {
                const newPetsList = [...prev, newPet];
                // Asenkron olarak kaydet
                Storage.setItem(PETS_STORAGE_KEY, JSON.stringify(newPetsList)).catch(err =>
                    console.error(err),
                );
                return newPetsList;
            });

            // Oyunlaştırma: sahiplenme ile XP ve rozet kazandır
            let prevLevel = stats.level;
            let currentLevel = prevLevel;

            setStats(prev => {
                prevLevel = prev.level;
                const gainXp = 50;
                const nextXp = (prev.xp ?? 0) + gainXp;
                const adoptedCount = (prev.adoptedCount ?? 0) + 1;
                const level = calculateLevel(nextXp);
                currentLevel = level;

                const achievements = new Set(prev.achievements ?? []);
                if (adoptedCount === 1) achievements.add('İlk Dostunu Sahiplendin');
                if (adoptedCount === 3) achievements.add('Küçük Sürü Sahibi');
                if (adoptedCount === 5) achievements.add('Gerçek Hayvansever');

                const todayKey = getTodayKey();
                const prevDaily = prev.daily || {};
                const isSameDay = prevDaily.date === todayKey;
                const daily = {
                    date: todayKey,
                    adoptedToday: (isSameDay ? (prevDaily.adoptedToday ?? 0) : 0) + 1,
                };

                const nextStats = {
                    ...prev,
                    xp: nextXp,
                    level,
                    adoptedCount,
                    achievements: Array.from(achievements),
                    daily,
                };
                persistStats(nextStats);
                return nextStats;
            });

            if (currentLevel > prevLevel) {
                Alert.alert("Tebrikler!", `Seviye atladın! Artık Seviye ${currentLevel} oldun.`);
            }
            return newPet;
        } catch (e) {
            console.error('Failed to save pet', e);
            throw e;
        }
    };

    const updatePet = async (id, changes) => {
        setPets(prev => {
            const nextPets = prev.map(p => p.id === id ? { ...p, ...changes } : p);
            Storage.setItem(PETS_STORAGE_KEY, JSON.stringify(nextPets)).catch(err =>
                console.error('Failed to update pet', err),
            );
            return nextPets;
        });
    };

    const removePet = async (id) => {
        setPets(prev => {
            const nextPets = prev.filter(p => p.id !== id);
            Storage.setItem(PETS_STORAGE_KEY, JSON.stringify(nextPets)).catch(err =>
                console.error('Failed to remove pet', err),
            );
            return nextPets;
        });

        // İstatistiklerden toplam sahiplenme sayısını azalt (minimum 0)
        setStats(prev => {
            const adoptedCount = Math.max(0, (prev.adoptedCount ?? 1) - 1);
            const nextStats = { ...prev, adoptedCount };
            persistStats(nextStats);
            return nextStats;
        });
    };

    const addCoins = (amount) => {
        setStats(prev => {
            const nextStats = { ...prev, coins: (prev.coins || 0) + amount };
            persistStats(nextStats);
            return nextStats;
        });
    };

    const spendCoins = (amount) => {
        let success = false;
        setStats(prev => {
            if ((prev.coins || 0) >= amount) {
                success = true;
                const nextStats = { ...prev, coins: (prev.coins || 0) - amount };
                persistStats(nextStats);
                return nextStats;
            }
            return prev;
        });
        return success; // Harcama başarılıysa true döner
    };

    const buyItem = (item, price) => {
        let success = false;
        setStats(prev => {
            const inventory = prev.inventory || ["Oda", "Manzara"];
            if (inventory.includes(item)) return prev; // Zaten var
            if ((prev.coins || 0) >= price) {
                success = true;
                const nextStats = {
                    ...prev,
                    coins: (prev.coins || 0) - price,
                    inventory: [...inventory, item]
                };
                persistStats(nextStats);
                return nextStats;
            }
            return prev;
        });
        return success;
    };

    const setBackground = (bgName) => {
        setStats(prev => {
            const nextStats = { ...prev, currentBackground: bgName };
            persistStats(nextStats);
            return nextStats;
        });
    };

    const earnPetXp = (id, amount) => {
        setPets(prev => {
            const nextPets = prev.map(p => {
                if (p.id === id) {
                    const newXp = (p.xp || 0) + amount;
                    const newLevel = calculatePetLevel(newXp);
                    const newStage = calculatePetStage(newLevel);
                    return { ...p, xp: newXp, level: newLevel, stage: newStage };
                }
                return p;
            });
            Storage.setItem(PETS_STORAGE_KEY, JSON.stringify(nextPets)).catch(err => console.error(err));
            return nextPets;
        });
        // Sahiplenen kişiye de XP verelim
        let leveledUp = false;
        let newLevel = 1;
        setStats(prev => {
            const nextXp = (prev.xp || 0) + Math.floor(amount / 2);
            const nextLevel = calculateLevel(nextXp);
            if (nextLevel > prev.level) {
                leveledUp = true;
                newLevel = nextLevel;
            }
            const nextStats = { ...prev, xp: nextXp, level: nextLevel };
            persistStats(nextStats);
            return nextStats;
        });
        if (leveledUp) {
            Alert.alert("Tebrikler!", `Harika bir eğitmensin! Seviye ${newLevel} oldun.`);
        }
    };

    const clearPets = async () => {
        try {
            await Storage.removeItem(PETS_STORAGE_KEY);
            setPets([]);
        } catch (e) {
            console.error('Failed to clear pets', e);
        }
    };

    return (
        <PetContext.Provider
            value={{
                pets,
                stats,
                loading,
                addPet,
                updatePet,
                removePet,
                addCoins,
                spendCoins,
                buyItem,
                setBackground,
                earnPetXp,
                clearPets,
                reload: loadAll,
            }}
        >
            {children}
        </PetContext.Provider>
    );
}

export function usePets() {
    return useContext(PetContext);
}

