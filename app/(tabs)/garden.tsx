import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import PikselBalik from "@/components/PikselBalik";
import PikselKaplumbaga from "@/components/PikselKaplumbaga";
import PikselKedi from "@/components/PikselKedi";
import PikselKopek from "@/components/PikselKopek";
import PikselKus from "@/components/PikselKus";
import PikselTavsan from "@/components/PikselTavsan";
import { usePets } from "@/hooks/usePets";

const { width, height } = Dimensions.get("window");

// Basit Bulut Bileşeni
function SimpleCloud({ top, left, scale = 1 }: { top: number, left: number, scale?: number }) {
    return (
        <View style={[styles.simpleCloud, { top, left, transform: [{ scale }] }]}>
            <View style={{ width: 40, height: 20, backgroundColor: "rgba(255,255,255,0.4)", borderRadius: 10 }} />
        </View>
    );
}

// Piksel Ağaç Bileşeni (Gerçek piksel görünümlü)
function PixelTree({ top, left, right, bottom, scale = 1 }: { top?: number, left?: number, right?: number, bottom?: number, scale?: number }) {
    return (
        <View style={[styles.treeWrapper, { top, left, right, bottom, transform: [{ scale }] }]}>
            {/* Gövde */}
            <View style={styles.treeTrunk} />
            {/* Yapraklar (Kare bloklar) */}
            <View style={[styles.treeLeafBlock, { bottom: 60, left: -25, width: 60, height: 50, backgroundColor: "#15803D" }]} />
            <View style={[styles.treeLeafBlock, { bottom: 100, left: -15, width: 40, height: 35, backgroundColor: "#166534" }]} />
            <View style={[styles.treeLeafBlock, { bottom: 80, left: 10, width: 35, height: 40, backgroundColor: "#14532D" }]} />
        </View>
    );
}

function GrassClump({ top, left }: { top: number, left: number }) {
    return (
        <View style={[styles.grassClump, { top, left }]}>
            <View style={styles.grassBlade} />
            <View style={[styles.grassBlade, { transform: [{ rotate: '15deg' }], marginLeft: 4 }]} />
        </View>
    );
}
function RoamingPet({ pet }: { pet: any }) {
    const { tur, renk, isim } = pet;

    function renderKarakter() {
        switch (tur) {
            case "Köpek": return <PikselKopek durum="normal" renk={renk} />;
            case "Balık": return <PikselBalik durum="normal" renk={renk} />;
            case "Kaplumbağa": return <PikselKaplumbaga durum="normal" renk={renk} />;
            case "Kuş": return <PikselKus durum="normal" renk={renk} />;
            case "Tavşan": return <PikselTavsan durum="normal" renk={renk} />;
            case "Kedi":
            default: return <PikselKedi durum="normal" renk={renk} />;
        }
    }

    // Rastgele başlangıç pozisyonu
    const startX = useRef(Math.random() * (width - 140)).current;
    const startY = useRef(Math.random() * (height - 520) + 140).current; // Alt sınırı yükselttim (kesilmeyi önlemek için)

    const moveAnim = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;
    const solukAnim = useRef(new Animated.Value(1)).current;

    const [kare, setKare] = useState("yuruyen1");

    useEffect(() => {
        // Soluk alıp verme
        const soluk = Animated.loop(
            Animated.sequence([
                Animated.timing(solukAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
                Animated.timing(solukAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        );
        soluk.start();

        // Yürüme döngüsü
        const yuru = setInterval(() => {
            setKare(prev => prev === "yuruyen1" ? "yuruyen2" : "yuruyen1");
        }, tur === "Kaplumbağa" ? 1600 : tur === "Köpek" ? 600 : 800);

        // Rastgele gezinme mantığı
        function rastgeleGez() {
            const nextX = Math.random() * (width - 140);
            const nextY = Math.random() * (height - 520) + 140; // Alt sınırı yükselttim

            const duration = tur === "Kaplumbağa" ? 16000 : tur === "Köpek" ? 6000 : 8000;

            Animated.timing(moveAnim, {
                toValue: { x: nextX, y: nextY },
                duration: duration,
                useNativeDriver: true,
            }).start(() => rastgeleGez());
        }

        rastgeleGez();

        return () => {
            soluk.stop();
            clearInterval(yuru);
            moveAnim.stopAnimation();
        };
    }, [tur, moveAnim, solukAnim]);

    return (
        <Animated.View
            style={[
                styles.petContainer,
                { transform: [...moveAnim.getTranslateTransform(), { scale: solukAnim }] },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: "/pet/[id]", params: { id: pet.id } })}
                style={styles.petTouchable}
            >
                <Text style={styles.petName}>{isim}</Text>
                <View style={styles.pixelWrapper}>
                    {renderKarakter()}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}


export default function GardenScreen() {
    const { pets } = usePets();

    const turSirasi = ["Kedi", "Köpek", "Balık", "Kaplumbağa", "Kuş", "Tavşan"] as const;
    const [aktifTur, setAktifTur] = React.useState<(typeof turSirasi)[number]>("Kedi");

    const arkaPlanHaritasi: Record<string, string> = {
        Kedi: "#acd3a5ff",
        Köpek: "#6f685bff",
        Balık: "#779ed1ff",
        Kaplumbağa: "#549ba8ff",
        Kuş: "#a1add5ff",
        Tavşan: "#94c487ff",
    };

    const aktifBg = arkaPlanHaritasi[aktifTur] ?? "#DCFCE7";

    const turPets = pets.filter((p: any) => p.tur === aktifTur);

    return (
        <View style={styles.container}>
            {/* Arka Plan Katmanı */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: aktifBg }]} />

            <Text style={styles.title}>{aktifTur} Bahçesi</Text>
            <Text style={styles.subtitle}>Bu türden sahiplendiğin dostların burada zaman geçiriyor.</Text>

            <View style={styles.tabRow}>
                {turSirasi.map((tur) => {
                    const aktif = tur === aktifTur;
                    return (
                        <TouchableOpacity
                            key={tur}
                            style={[styles.tabButton, aktif && styles.tabButtonActive]}
                            onPress={() => setAktifTur(tur)}
                        >
                            <Text style={[styles.tabText, aktif && styles.tabTextActive]}>
                                {tur}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <ScrollView contentContainerStyle={styles.gardenArea}>
                {turPets.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            Bu türden henüz hiç dostun yok. Yeni bir {aktifTur.toLowerCase()} sahiplen!
                        </Text>
                    </View>
                ) : (
                    turPets.map((pet: any) => (
                        <RoamingPet key={pet.id} pet={pet} />
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#DCFCE7", // Açık doğal yeşil zemin
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#166534",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#15803D",
        textAlign: "center",
        marginTop: 4,
        paddingHorizontal: 20,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        color: "#166534",
    },
    tabRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 16,
        marginBottom: 8,
        gap: 8,
    },
    tabButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.6)",
    },
    tabButtonActive: {
        backgroundColor: "#14532D",
    },
    tabText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#14532D",
    },
    tabTextActive: {
        color: "#FFFFFF",
    },
    section: {
        marginTop: 24,
    },
    gardenArea: {
        flexGrow: 1, // Use flexGrow for ScrollView contentContainerStyle
        marginTop: 16,
    },
    petContainer: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
    },
    petTouchable: {
        alignItems: "center",
    },
    pixelWrapper: {
        transform: [{ scale: 2 }],
        marginTop: 16,
    },
    petName: {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        fontSize: 12,
        fontWeight: "700",
        color: "#4B5563",
        overflow: "hidden",
    },
    decorContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    // Yeni Dekorasyon Stilleri
    cloud: {
        position: "absolute",
        zIndex: 0,
    },
    cloudBlock: {
        position: "absolute",
        borderRadius: 4,
    },
    treeWrapper: {
        position: "absolute",
        alignItems: "center",
        zIndex: 0,
    },
    treeLeafBlock: {
        position: "absolute",
        borderRadius: 8,
        opacity: 0.9,
    },
    treeTrunk: {
        width: 14,
        height: 100,
        backgroundColor: "#78350F",
        opacity: 0.8,
        borderRadius: 4,
    },
    grassClump: {
        position: "absolute",
        flexDirection: "row",
    },
    grassBlade: {
        width: 3,
        height: 12,
        backgroundColor: "#166534",
        opacity: 0.2,
        borderRadius: 2,
    },
    skyDecoration: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.6,
    },
    groundDecoration: {
        ...StyleSheet.absoluteFillObject,
    },
    flower: {
        position: "absolute",
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#FBCFE8",
        opacity: 0.6,
    },
    rock: {
        position: "absolute",
        width: 40,
        height: 25,
        backgroundColor: "#64748B",
        borderRadius: 12,
        opacity: 0.2,
    },
    seaweed: {
        position: "absolute",
        width: 6,
        height: 60,
        backgroundColor: "#059669",
        borderRadius: 3,
        opacity: 0.2,
    },
    simpleCloud: {
        position: "absolute",
        zIndex: 0,
    },
});
