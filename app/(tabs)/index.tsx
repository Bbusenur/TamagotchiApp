import DigitalPet from "@/components/DigitalPet";
import { usePets } from "@/hooks/usePets";
import { useState } from "react";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const TURLER = ["Kedi", "Köpek", "Balık", "Kaplumbağa", "Kuş", "Tavşan"];
const RENK_SECENEKLERI = {
  "Kedi": ["Turuncu", "Siyah", "Gri", "Beyaz"],
  "Köpek": ["Kahverengi", "Siyah", "Sari"],
  "Balık": ["Turuncu", "Mavi", "Kirmizi", "Gumus"],
  "Kaplumbağa": ["Yesil", "Kahverengi"],
  "Kuş": ["Sari", "Mavi", "Yesil", "Kahverengi"],
  "Tavşan": ["Gri", "Beyaz", "Kahverengi", "Siyah"],
};

export default function App() {
  const { addPet, stats } = usePets();

  const [isim, setIsim] = useState("");
  const [tur, setTur] = useState<keyof typeof RENK_SECENEKLERI>("Kedi");
  const [renk, setRenk] = useState("Turuncu");

  const seviye = stats?.level ?? 1;

  function getUnlockedSpecies(level: number) {
    return ["Kedi", "Köpek", "Balık", "Kaplumbağa", "Kuş", "Tavşan"];
  }

  const acikTurler = getUnlockedSpecies(seviye) as (keyof typeof RENK_SECENEKLERI)[];

  const handleSahiplen = async () => {
    if (!isim.trim()) {
      alert("Lütfen bir isim ver!");
      return;
    }
    try {
      await addPet({ isim: isim.trim(), tur, renk });
      alert(`Hoş geldin ${isim.trim()}! Yeni dostun bahçeye yerleşti.`);
      router.replace("/garden");
    } catch (e) {
      alert("Sahiplenme sırasında bir hata oluştu.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.secimKapsayici}>
      <View style={styles.decorContainer}>
        {/* Bulut 1 */}
        <View style={[styles.cloud, { top: 60, left: 30 }]}>
          <View style={[styles.cloudBlock, { width: 40, height: 20 }]} />
          <View style={[styles.cloudBlock, { top: -8, left: 10, width: 25, height: 15 }]} />
        </View>
        {/* Bulut 2 */}
        <View style={[styles.cloud, { top: 120, right: 40 }]}>
          <View style={[styles.cloudBlock, { width: 60, height: 30 }]} />
          <View style={[styles.cloudBlock, { top: -10, left: 15, width: 35, height: 20 }]} />
        </View>
        {/* Bulut 3 */}
        <View style={[styles.cloud, { bottom: 120, left: 40 }]}>
          <View style={[styles.cloudBlock, { width: 50, height: 25 }]} />
          <View style={[styles.cloudBlock, { top: -5, left: 10, width: 30, height: 15 }]} />
        </View>
      </View>

      <View style={styles.secimKarti}>
        <View style={styles.previewKart}>
          <Text style={styles.previewBaslik}>Yeni Dostun</Text>
          <View style={styles.previewAlan}>
            <DigitalPet
              tur={tur as any}
              renk={renk}
              id="preview-only"
              onAction={() => { }}
              onStatsChange={() => { }}
              onRename={() => { }}
              stage="Bebek"
              previewOnly={true}
              enerji={100}
              aclik={0}
              mutluluk={100}
              temizlik={100}
            />
          </View>
        </View>
        <Text style={styles.baslik}>Yeni Dostunu Seç</Text>
        <Text style={styles.altBaslik}>Önce ona güzel bir isim ver ve özelliklerini belirle.</Text>

        <View style={styles.inputGrubu}>
          <Text style={styles.etiket}>İsim</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Pamuk"
            value={isim}
            onChangeText={setIsim}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGrubu}>
          <Text style={styles.etiket}>Tür</Text>
          <View style={styles.butonGrubu}>
            {TURLER.map((t) => {
              const acik = acikTurler.includes(t as keyof typeof RENK_SECENEKLERI);
              return (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.secimButonu,
                    acik ? styles.secimButonuAcik : styles.secimButonuKilitli,
                    tur === t && acik && styles.secimButonuAktif,
                  ]}
                  disabled={!acik}
                  onPress={() => {
                    const secilenTur = t as keyof typeof RENK_SECENEKLERI;
                    setTur(secilenTur);
                    setRenk(RENK_SECENEKLERI[secilenTur][0]);
                  }}
                >
                  <Text
                    style={[
                      styles.secimYazi,
                      !acik && styles.secimYaziKilitli,
                      tur === t && acik && styles.secimYaziAktif,
                    ]}
                  >
                    {acik ? t : `Kilitli: ${t}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.inputGrubu}>
          <Text style={styles.etiket}>Renk</Text>
          <View style={styles.colorGrubu}>
            {RENK_SECENEKLERI[tur].map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.colorDaire,
                  { backgroundColor: getColorHex(r) },
                  renk === r && styles.colorDaireAktif
                ]}
                onPress={() => setRenk(r)}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.sahiplenButonu} onPress={handleSahiplen} activeOpacity={0.8}>
          <Text style={styles.sahiplenYazi}>Sahiplen</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const getColorHex = (renk: string) => {
  const map: Record<string, string> = {
    Turuncu: "#FB923C",
    Siyah: "#111827",
    Gri: "#9CA3AF",
    Beyaz: "#FFFFFF",
    Kahverengi: "#78350F",
    Sari: "#FACC15",
    Mavi: "#3B82F6",
    Kirmizi: "#EF4444",
    Gumus: "#D1D5DB",
    Yesil: "#22C55E",
  };
  return map[renk] || "#000";
};

const styles = StyleSheet.create({
  secimKapsayici: {
    flexGrow: 1,
    backgroundColor: "#FDF2F8",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  decorContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  cloud: {
    position: "absolute",
    zIndex: 0,
  },
  cloudBlock: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    opacity: 0.5,
  },
  secimKarti: {
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#F472B6",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(252, 231, 243, 0.8)",
    zIndex: 1,
  },
  previewKart: {
    backgroundColor: "#F0FDF4",
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
  },
  previewBaslik: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  previewAlan: {
    height: 180,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 16,
  },
  baslik: {
    fontSize: 26,
    fontWeight: "800",
    color: "#4B5563",
    marginBottom: 8,
    textAlign: "center",
  },
  altBaslik: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  inputGrubu: {
    marginBottom: 24,
  },
  etiket: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  colorGrubu: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  colorDaire: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "transparent",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  colorDaireAktif: {
    borderColor: "#F472B6",
    transform: [{ scale: 1.1 }],
  },
  butonGrubu: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  secimButonu: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "transparent",
  },
  secimButonuAcik: {
    backgroundColor: "#F3F4F6",
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "transparent",
  },
  secimButonuKilitli: {
    backgroundColor: "#E5E7EB",
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    opacity: 0.6,
  },
  secimButonuAktif: {
    backgroundColor: "#F472B6",
    borderColor: "#F472B6",
    shadowColor: "#F472B6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  secimButonuAktifRenk: {
    backgroundColor: "#A855F7",
    borderColor: "#A855F7",
    shadowColor: "#A855F7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  secimYazi: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  secimYaziAktif: {
    color: "#FFFFFF",
  },
  secimYaziKilitli: {
    color: "#9CA3AF",
  },
  sahiplenButonu: {
    backgroundColor: "#10B981",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  sahiplenYazi: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  geriButon: {
    position: "absolute",
    top: 60,
    left: 24,
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 99,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  geriButonYazi: {
    color: "#4B5563",
    fontWeight: "600",
    fontSize: 14,
  }
});
