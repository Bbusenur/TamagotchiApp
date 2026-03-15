import { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import PikselBalik from "./PikselBalik";
import PikselKaplumbaga from "./PikselKaplumbaga";
import PikselKedi from "./PikselKedi";
import PikselKopek from "./PikselKopek";
import PikselKus from "./PikselKus";
import PikselTavsan from "./PikselTavsan";
import { usePets } from "../hooks/usePets";

export default function DigitalPet({
  id,
  isim = "İsimsiz",
  tur = "Kedi",
  renk = "Turuncu",
  aclik: initialAclik = 0,
  mutluluk: initialMutluluk = 0,
  enerji: initialEnerji = 0,
  temizlik: initialTemizlik = 0,
  stage = "Bebek",
  onStatsChange,
  onAction,
  allowRename = false,
  onRename,
  previewOnly = false,
}) {
  const [aclik, setAclikState] = useState(initialAclik);
  const [mutluluk, setMutlulukState] = useState(initialMutluluk);
  const [enerji, setEnerjiState] = useState(initialEnerji);
  const [temizlik, setTemizlikState] = useState(initialTemizlik);
  const [aksiyon, setAksiyon] = useState(null);

  const [yuruKare, setYuruKare] = useState("yuruyen1");
  const [yuruyorMu, setYuruyorMu] = useState(false);
  const [uykuModu, setUykuModu] = useState(false);
  const [xpFeedback, setXpFeedback] = useState(null);
  const [özelMesaj, setÖzelMesaj] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [yeniIsim, setYeniIsim] = useState(isim);
  const [isimDuzenModu, setIsimDuzenModu] = useState(false);

  const bounceAnim = useRef(new Animated.Value(0)).current;
  const sallanAnim = useRef(new Animated.Value(0)).current;
  const solukAnim = useRef(new Animated.Value(1)).current;
  const yuruAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setAclikState(initialAclik);
    setMutlulukState(initialMutluluk);
    setEnerjiState(initialEnerji);
    setTemizlikState(initialTemizlik);
    setYeniIsim(isim);
  }, [id, initialAclik, initialMutluluk, initialEnerji, initialTemizlik, isim]);

  // Statları ebeveyn bileşene senkronize et
  useEffect(() => {
    if (previewOnly) return;
    onStatsChange?.({ aclik, mutluluk, enerji, temizlik });
  }, [aclik, mutluluk, enerji, temizlik]);

  const setAclik = (updater) => {
    setAclikState(updater);
  };

  const setMutluluk = (updater) => {
    setMutlulukState(updater);
  };

  const setEnerji = (updater) => {
    setEnerjiState(updater);
  };

  const setTemizlik = (updater) => {
    setTemizlikState(updater);
  };

  // Render Edilecek Karakteri Seç
  function renderKarakter(durum) {
    switch (tur) {
      case "Köpek": return <PikselKopek durum={durum} renk={renk} />;
      case "Balık": return <PikselBalik durum={durum} renk={renk} />;
      case "Kaplumbağa": return <PikselKaplumbaga durum={durum} renk={renk} />;
      case "Kuş":
        return <PikselKus durum={aksiyon || (uykuModu ? "uyuyan" : yuruKare)} renk={renk} />;
      case "Tavşan":
        return <PikselTavsan durum={aksiyon || (uykuModu ? "uyuyan" : yuruKare)} renk={renk} />;
      case "Kedi":
      default: return <PikselKedi durum={durum} renk={renk} />;
    }
  }

  // Durum hesapla
  function getDurum() {
    if (previewOnly) return "normal"; // Önizlemede her zaman normal (sabit) dursun
    if (aksiyon) return aksiyon;
    if (enerji <= 20 && tur !== "Balık") return "uyuyan"; // Çok yorgunken uyuyor
    if (aclik >= 70 || mutluluk <= 30 || temizlik <= 30) return "uzgun";
    if (yuruyorMu) return yuruKare;
    if (mutluluk >= 70) return "mutlu";
    return "normal";
  }

  // Idle animasyon - sürekli hafif soluk alıp veriyor
  useEffect(() => {
    if (previewOnly) return; // Önizlemede soluma animasyonu (scale) olmasın
    
    // Balık suda süzülür (daha yumuşak ve farklı bir idle)
    const isFish = tur === "Balık";
    const toVal = isFish ? 1.02 : 1.05;
    const dur = isFish ? 1500 : 1000;

    const dongu = Animated.loop(
      Animated.sequence([
        Animated.timing(solukAnim, {
          toValue: toVal,
          duration: dur,
          useNativeDriver: true,
        }),
        Animated.timing(solukAnim, {
          toValue: 1,
          duration: dur,
          useNativeDriver: true,
        }),
      ]),
    );
    dongu.start();
    return () => dongu.stop();
  }, [solukAnim, tur]);

  // Zamanla açlık artışı, enerji/temizlik düşmesi ve mutluluğun hafif azalması
  useEffect(() => {
    const interval = setInterval(() => {
      setUykuModu((currentSleep) => {
        if (currentSleep) {
          // Enerji artık özel bir useEffect ile saniyelik artıyor, 
          // burada sadece açlık ve mutluluk etkisi kalsın.
          setAclik((prev) => Math.min(100, prev + 1));
          setMutluluk((prev) => Math.max(0, prev - 1));
        } else {
          setAclik((prev) => Math.min(100, prev + 4));
          setEnerji((prev) => Math.max(0, prev - 3));
          setTemizlik((prev) => Math.max(0, prev - 2));
          setMutluluk((prev) => Math.max(0, prev - 2));
        }
        return currentSleep;
      });
    }, 30000); // 30 sn

    return () => clearInterval(interval);
  }, []);

  // Hızlı uyku enerjisi (User isteği: Her saniye 10 artış)
  useEffect(() => {
    let sleepInterval;
    if (uykuModu) {
      sleepInterval = setInterval(() => {
        setEnerji((prev) => Math.min(100, prev + 10));
      }, 1000);
    }
    return () => {
      if (sleepInterval) clearInterval(sleepInterval);
    };
  }, [uykuModu]);

  // Yürüme animasyonu (Idle durumunda devreye girer)
  useEffect(() => {
    let yuruInterval;
    const canWalk = !aksiyon && aclik < 80 && mutluluk > 30 && !previewOnly;

    if (canWalk) {
      setYuruyorMu(true);

      // Kaplumbağa çok yavaş, Balık süzülüyor, Kedi/Köpek normal.
      let walkDur = 5000;
      let walkDist = 50;
      let walkInterval = 700;

      if (tur === "Kaplumbağa") {
        walkDur = 12000; walkDist = 30; walkInterval = 1600;
      } else if (tur === "Balık") {
        walkDur = 8000; walkDist = 60; walkInterval = 1000; // Balık yüzer
      } else if (tur === "Köpek") {
        walkDur = 4000; walkDist = 60; walkInterval = 500; // Köpek hızlı
      }

      Animated.loop(
        Animated.sequence([
          Animated.timing(yuruAnim, { toValue: -walkDist, duration: walkDur, useNativeDriver: true }),
          Animated.timing(yuruAnim, { toValue: walkDist, duration: walkDur * 2, useNativeDriver: true }),
          Animated.timing(yuruAnim, { toValue: 0, duration: walkDur, useNativeDriver: true }),
        ])
      ).start();

      yuruInterval = setInterval(() => {
        setYuruKare((prev) => (prev === "yuruyen1" ? "yuruyen2" : "yuruyen1"));
      }, walkInterval);

    } else {
      setYuruyorMu(false);
      yuruAnim.stopAnimation();
      Animated.timing(yuruAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }

    return () => {
      clearInterval(yuruInterval);
    };
  }, [aksiyon, aclik, mutluluk, yuruAnim, tur]);

  // Zıplama animasyonu
  function zipla(bitince) {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: -40, duration: 200, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(bitince);
  }

  // Sallanma animasyonu (türe göre özel, örneğin balık takla atar)
  function don(bitince) {
    if (tur === "Balık") {
      // Balık suda takla atar veya hızlı süzülür
      Animated.sequence([
        Animated.timing(sallanAnim, { toValue: 20, duration: 200, useNativeDriver: true }),
        Animated.timing(sallanAnim, { toValue: -20, duration: 400, useNativeDriver: true }),
        Animated.timing(sallanAnim, { toValue: 0, duration: 200, useNativeDriver: true })
      ]).start(bitince);
    } else {
      Animated.sequence([
        Animated.timing(sallanAnim, { toValue: 15, duration: 100, useNativeDriver: true }),
        Animated.timing(sallanAnim, { toValue: -15, duration: 100, useNativeDriver: true }),
        Animated.timing(sallanAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(sallanAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(sallanAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start(bitince);
    }
  }

  function showXpFeedback(amount) {
    setXpFeedback(amount);
    fadeAnim.setValue(1);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true
    }).start(() => setXpFeedback(null));
  }

  function besle() {
    if (aksiyon || uykuModu) return;
    setAksiyon("yiyen");
    const timeout = tur === "Kaplumbağa" ? 1500 : 500;
    don(() => {
      setAclik((prev) => Math.max(0, prev - 10));
      setTemizlik((prev) => Math.max(0, prev - 5));
      setMutluluk((prev) => Math.min(100, prev + 5));
      setEnerji((prev) => Math.min(100, prev + 5));
      onAction?.("besle");
      showXpFeedback(10);
      setTimeout(() => setAksiyon(null), timeout);
    });
  }

  function oyna() {
    if (aksiyon || uykuModu) return;
    if (aclik >= 80 && tur !== "Balık") {
      setÖzelMesaj("Çok aç ve yorgun, önce beslemelisin.");
      setTimeout(() => setÖzelMesaj(null), 1800);
      return;
    }
    if (enerji <= 20) {
      setÖzelMesaj("Çok uykulu, önce biraz dinlenmeli.");
      setTimeout(() => setÖzelMesaj(null), 1800);
      return;
    }
    setAksiyon("mutlu");
    zipla(() => {
      setAclik((prev) => Math.min(100, prev + 10));
      setEnerji((prev) => Math.max(0, prev - 10));
      setMutluluk((prev) => Math.min(100, prev + 10));
      onAction?.("oyna");
      showXpFeedback(10);
      setTimeout(() => setAksiyon(null), 500);
    });
  }

  function getAclikRenk() {
    if (aclik <= 30) return "#10B981"; // Yeşil 
    if (aclik <= 70) return "#F59E0B"; // Turuncu 
    return "#EF4444"; // Kırmızı 
  }

  function getTemizlikRenk() {
    if (temizlik >= 70) return "#0EA5E9"; // Temiz
    if (temizlik >= 40) return "#FBBF24"; // Orta
    return "#6B21A8"; // Çok kirli
  }

  function getEnerjiRenk() {
    if (enerji >= 70) return "#22C55E";
    if (enerji >= 40) return "#F97316";
    return "#EA580C";
  }

  function uyut() {
    if (aksiyon && aksiyon !== "uyuyan") return;
    const yeniMod = !uykuModu;
    setUykuModu(yeniMod);
    if (yeniMod) {
      setAksiyon("uyuyan");
      setÖzelMesaj("Biraz kestiriyor...");
    } else {
      setAksiyon(null);
      setÖzelMesaj(null);
    }
    onAction?.("uyut");
  }

  function temizle() {
    if (aksiyon || uykuModu) return;
    setAksiyon("mutlu");
    setÖzelMesaj("Mis gibi oldu!");
    setTemizlik(() => 100);
    setMutluluk((prev) => Math.min(100, prev + 8));
    onAction?.("temizle");
    showXpFeedback(10);
    setTimeout(() => {
      setAksiyon(null);
      setÖzelMesaj(null);
    }, 2000);
  }

  const { stats } = usePets();

  // Çevre detayları
  function Environment() {
    if (previewOnly) return null;
    return null; // Tüm dekorasyonları kaldırdım
  }

  // Türlere özel UI metinleri
  const turIkon = "Dost";

  const oynaButonMetni = "Oyna";
  const besleButonMetni = "Besle";
  const yuruMetni = "Geziniyor...";

  return (
    <View style={[styles.kapsayici, previewOnly && styles.previewKapsayici]}>
      <Environment />
      <View style={[styles.ekran, previewOnly && styles.previewEkran]}>
        {!previewOnly && (
          <View style={styles.baslikKapsayici}>
            {allowRename ? (
              <>
                {isimDuzenModu ? (
                  <View style={styles.isimInputSatir}>
                    <TextInput
                      style={styles.isimInput}
                      value={yeniIsim}
                      onChangeText={setYeniIsim}
                      placeholder="İsim gir"
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity
                      style={styles.isimKaydetButon}
                      onPress={() => {
                        const temiz = yeniIsim.trim() || "İsimsiz";
                        setIsimDuzenModu(false);
                        onRename?.(temiz);
                      }}
                    >
                      <Text style={styles.isimKaydetYazi}>Kaydet</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.isimSatir}>
                    <Text style={styles.baslik}>{isim}</Text>
                    <TouchableOpacity onPress={() => setIsimDuzenModu(true)} style={styles.isimDuzenButon}>
                      <Text style={styles.isimDuzenMetin}>Düzenle</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.baslik}>{isim}</Text>
            )}
            <Text style={styles.altBaslik}>{tur} ({renk}) • {stage}</Text>
          </View>
        )}

        <Animated.View style={[styles.karakterKapsayici, previewOnly && styles.previewKarakterKapsayici, { transform: [{ translateY: bounceAnim }, { translateX: sallanAnim }, { translateX: yuruAnim }, { scale: aksiyon || yuruyorMu || tur === "Balık" ? 1 : solukAnim }] }]}>
          <View style={[styles.pikselBuyutucu, { transform: [{ scale: stage === "Bebek" ? 2.0 : stage === "Genç" ? 2.5 : stage === "Yetişkin" ? 3.0 : 3.2 }] }]}>
            {renderKarakter(getDurum())}
            {xpFeedback && (
              <Animated.View style={[styles.xpFeedback, { opacity: fadeAnim }]}>
                <Text style={styles.xpFeedbackText}>+ {xpFeedback} XP</Text>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {!previewOnly && (
          <>
            {/* Durum yazısı */}
            <View style={styles.durumKapsayici}>
              <Text style={styles.durumYazi}>
                {özelMesaj
                  ? özelMesaj
                  : enerji <= 20 && tur !== "Balık"
                    ? "Çok yoruldu, dinlenmek istiyor..."
                    : aclik >= 70
                      ? "Çok aç, hemen beslemelisin!"
                      : temizlik <= 30
                        ? "Çok kirli oldu, yıkama zamanı."
                        : mutluluk <= 30
                          ? "Kendini üzgün hissediyor..."
                          : aksiyon === "yiyen"
                            ? "Afiyetle yiyor..."
                            : aksiyon === "mutlu"
                              ? "Çok mutlu!"
                              : mutluluk >= 70 && yuruyorMu
                                ? yuruMetni
                                : "Sizi merakla izliyor..."}
              </Text>
            </View>

            {/* Stat barlar */}
            <View style={styles.statlar}>
              <View style={styles.statSatir}>
                <Text style={styles.statEtiket}>Açlık</Text>
                <View style={styles.barArkaplan}>
                  <View style={[styles.barDolgu, { width: `${aclik}%`, backgroundColor: getAclikRenk() }]} />
                </View>
                <Text style={styles.statDeger}>{aclik}%</Text>
              </View>

              <View style={styles.statSatir}>
                <Text style={styles.statEtiket}>Mutluluk</Text>
                <View style={styles.barArkaplan}>
                  <View style={[styles.barDolgu, { width: `${mutluluk}%`, backgroundColor: "#A855F7" }]} />
                </View>
                <Text style={styles.statDeger}>{mutluluk}%</Text>
              </View>

              <View style={styles.statSatir}>
                <Text style={styles.statEtiket}>Enerji</Text>
                <View style={styles.barArkaplan}>
                  <View style={[styles.barDolgu, { width: `${enerji}%`, backgroundColor: getEnerjiRenk() }]} />
                </View>
                <Text style={styles.statDeger}>{enerji}%</Text>
              </View>

              <View style={styles.statSatir}>
                <Text style={styles.statEtiket}>Temizlik</Text>
                <View style={styles.barArkaplan}>
                  <View style={[styles.barDolgu, { width: `${temizlik}%`, backgroundColor: getTemizlikRenk() }]} />
                </View>
                <Text style={styles.statDeger}>{temizlik}%</Text>
              </View>
            </View>

            {/* Butonlar */}
            <View style={styles.butonKapsayici}>
              <TouchableOpacity style={[styles.kucukButon, styles.besleButon, (aksiyon || uykuModu) && styles.butonDevre]} onPress={besle} disabled={!!aksiyon || uykuModu} activeOpacity={0.8}>
                <Text style={styles.kucukButonYazi}>{besleButonMetni}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.kucukButon, styles.oynaButon, (aksiyon || uykuModu) && styles.butonDevre]} onPress={oyna} disabled={!!aksiyon || uykuModu} activeOpacity={0.8}>
                <Text style={styles.kucukButonYazi}>{oynaButonMetni}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.kucukButon, uykuModu ? styles.uyaniButon : styles.uykuButon, aksiyon && !uykuModu && styles.butonDevre]} onPress={uyut} disabled={!!aksiyon && !uykuModu} activeOpacity={0.8}>
                <Text style={styles.kucukButonYazi}>{uykuModu ? "Uyandır" : "Uyut"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.kucukButon, styles.temizlikButon, (aksiyon || uykuModu) && styles.butonDevre]} onPress={temizle} disabled={!!aksiyon || uykuModu} activeOpacity={0.8}>
                <Text style={styles.kucukButonYazi}>Yıka</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kapsayici: {
    flex: 1,
    backgroundColor: "#FDF2F8",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  envContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  envCloud: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 99,
  },
  envGrass: {
    position: "absolute",
    width: 20,
    height: 4,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderRadius: 2,
  },
  flower: {
    position: "absolute",
    width: 20,
    height: 4,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderRadius: 2,
  },
  ekran: {
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    padding: 32,
    width: 340,
    alignItems: "center",
    shadowColor: "#F472B6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(252, 231, 243, 0.8)",
    zIndex: 1,
  },
  baslikKapsayici: { alignItems: "center", marginBottom: 8 },
  isimSatir: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  isimDuzenButon: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  isimDuzenIkon: {
    fontSize: 14,
  },
  isimInputSatir: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  isimInput: {
    minWidth: 140,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    fontSize: 14,
    color: "#111827",
  },
  isimKaydetButon: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#10B981",
  },
  isimKaydetYazi: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 12,
  },
  baslik: { fontSize: 28, fontWeight: "800", color: "#4B5563", letterSpacing: 0.5 },
  altBaslik: { fontSize: 14, fontWeight: "600", color: "#9CA3AF", marginTop: 4 },
  karakterKapsayici: { 
    marginVertical: 40, 
    alignItems: "center", 
    justifyContent: "center", 
    zIndex: 10,
    width: "100%",
    minHeight: 280, // Tavşan gibi uzun karakterlerin sığması için yükselttim
    padding: 10,
  },
  pikselBuyutucu: { 
    position: "relative",
    padding: 10,
  },
  durumKapsayici: { backgroundColor: "#F3F4F6", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, marginBottom: 24 },
  durumYazi: { fontSize: 13, color: "#6B7280", fontWeight: "600", letterSpacing: 0.2 },
  statlar: { width: "100%", gap: 16, marginBottom: 32, backgroundColor: "#F9FAFB", padding: 20, borderRadius: 24 },
  statSatir: { flexDirection: "row", alignItems: "center", gap: 12 },
  statEtiket: { fontSize: 13, fontWeight: "700", color: "#6B7280", width: 85 },
  barArkaplan: { flex: 1, height: 12, backgroundColor: "#E5E7EB", borderRadius: 99, overflow: "hidden" },
  barDolgu: { height: "100%", borderRadius: 99 },
  statDeger: { fontSize: 12, fontWeight: "700", color: "#9CA3AF", width: 35, textAlign: "right" },
  butonKapsayici: { flexDirection: "row", gap: 8, width: "100%", justifyContent: "center" },
  kucukButon: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 14, alignItems: "center", flex: 1 },
  besleButon: { backgroundColor: "#F472B6" },
  oynaButon: { backgroundColor: "#A855F7" },
  uykuButon: { backgroundColor: "#0EA5E9" },
  uyaniButon: { backgroundColor: "#F59E0B" },
  temizlikButon: { backgroundColor: "#10B981" },
  butonDevre: { opacity: 0.5 },
  kucukButonYazi: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  previewKapsayici: { backgroundColor: "transparent", padding: 0 },
  previewEkran: { backgroundColor: "transparent", padding: 0, borderWidth: 0, shadowOpacity: 0, elevation: 0, width: "auto" },
  previewKarakterKapsayici: { marginVertical: 0 },
});
