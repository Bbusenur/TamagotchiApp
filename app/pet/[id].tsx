import DigitalPet from "@/components/DigitalPet";
import { usePets } from "@/hooks/usePets";
import { router, useLocalSearchParams, Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";

const ACCESSORIES: { id: string; name: string }[] = [
  { id: "AKS_SAPKA_SIYAH", name: "Siyah Şapka" },
  { id: "AKS_SAPKA_KIRMIZI", name: "Kırmızı Şapka" },
  { id: "AKS_SAPKA_MAVI", name: "Mavi Şapka" },
  { id: "AKS_SAPKA_YESIL", name: "Yeşil Şapka" },
  { id: "AKS_SAPKA_SARI", name: "Sarı Şapka" },
];

const HAT_IDS = new Set(ACCESSORIES.map((a) => a.id));

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pets, stats, updatePet, removePet, addCoins, earnPetXp } = usePets();

  const pet = pets.find((p: any) => p.id === id);

  const turArkaPlan: Record<string, string> = {
    "Kedi": "#FEF2F2",
    "Köpek": "#ECFDF3",
    "Balık": "#EFF6FF",
    "Kaplumbağa": "#ECFEFF",
    "Kuş": "#FEF9C3",
  };

  const bgColor = pet ? turArkaPlan[pet.tur] ?? "#FDF2F8" : "#FDF2F8";

  const ownedAccessories = useMemo(() => {
    const inv = new Set((stats?.inventory ?? []) as string[]);
    return ACCESSORIES.filter((a) => inv.has(a.id));
  }, [stats?.inventory]);

  const equipped = new Set(((pet as any)?.aksesuarlar ?? []) as string[]);
  const [aksOpen, setAksOpen] = useState(false);

  if (!pet) {
    return (
      <View style={styles.bosKapsayici}>
        <Text style={styles.bosBaslik}>Bu dostu bulamadık</Text>
        <Text style={styles.bosYazi}>Belki de silinmiş ya da hiç kaydedilmemiş olabilir.</Text>
        <TouchableOpacity style={styles.geriButon} onPress={() => router.back()}>
          <Text style={styles.geriYazi}>← Bahçeye dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAction = (tip: string) => {
    if (tip === "besle" || tip === "oyna" || tip === "temizle" || tip === "uyut") {
      earnPetXp(pet.id, 10);
      addCoins(5);
    }
  };

  return (
    <ScrollView style={[styles.kapsayici, { backgroundColor: bgColor }]} contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }}>
      <View style={styles.ustBar}>
        <TouchableOpacity style={styles.ustGeriButon} onPress={() => router.back()}>
          <Text style={styles.ustGeriYazi}>Geri Dön</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ustSilButon}
          onPress={() => {
            Alert.alert(
              "Dostunla Vedalaş",
              "Bu dostunla vedalaşmak istediğine emin misin?",
              [
                { text: "Vazgeç", style: "cancel" },
                {
                  text: "Evet, Vedalaş",
                  style: "destructive",
                  onPress: async () => {
                    await removePet(pet.id);
                    router.back();
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.ustSilYazi}>Vedalaş</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bgCard}>
        <View style={styles.bgCardHeader}>
          <Text style={styles.bgTitle}>Aksesuarlar</Text>
          <TouchableOpacity style={styles.bgToggle} onPress={() => setAksOpen((v) => !v)} activeOpacity={0.85}>
            <Text style={styles.bgToggleText}>{aksOpen ? "Kapat" : "Tak / Çıkar"}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.bgSub}>
          Markette aldığın aksesuarları bu dosta takabilirsin.
        </Text>
        <Text style={styles.bgCurrent}>
          Takılı: {Array.from(equipped).length ? Array.from(equipped).map((id) => (ACCESSORIES.find((a) => a.id === id)?.name ?? id)).join(", ") : "Yok"}
        </Text>

        {aksOpen && (
          <View style={styles.bgList}>
            {ownedAccessories.length === 0 ? (
              <Text style={styles.bgSub}>Henüz aksesuarın yok. Markete göz at.</Text>
            ) : (
              ownedAccessories.map((a) => {
                const active = equipped.has(a.id);
                return (
                  <TouchableOpacity
                    key={a.id}
                    style={[styles.bgItem, active && styles.bgItemActive]}
                    onPress={() => {
                      const next = new Set(((pet as any)?.aksesuarlar ?? []) as string[]);
                      // tek şapka kuralı: yeni şapka takılacaksa diğer şapkaları çıkar
                      if (next.has(a.id)) {
                        next.delete(a.id);
                      } else {
                        for (const hid of Array.from(next)) {
                          if (HAT_IDS.has(hid)) next.delete(hid);
                        }
                        next.add(a.id);
                      }
                      updatePet(pet.id, { aksesuarlar: Array.from(next) });
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.bgItemText, active && styles.bgItemTextActive]}>
                      {a.name} {active ? "(Takılı)" : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </View>

      <DigitalPet
        id={pet.id}
        isim={pet.isim}
        tur={pet.tur}
        renk={pet.renk}
        aksesuarlar={(pet as any)?.aksesuarlar ?? []}
        aclik={pet.aclik ?? 30}
        mutluluk={pet.mutluluk ?? 80}
        enerji={pet.enerji ?? 80}
        temizlik={pet.temizlik ?? 80}
        stage={pet.stage ?? "Bebek"}
        allowRename
        onRename={(yeniIsim: string) => updatePet(pet.id, { isim: yeniIsim })}
        onAction={handleAction}
        onStatsChange={(degisim: { aclik?: number; mutluluk?: number; enerji?: number; temizlik?: number }) =>
          updatePet(pet.id, {
            ...(degisim.aclik !== undefined ? { aclik: degisim.aclik } : {}),
            ...(degisim.mutluluk !== undefined ? { mutluluk: degisim.mutluluk } : {}),
            ...(degisim.enerji !== undefined ? { enerji: degisim.enerji } : {}),
            ...(degisim.temizlik !== undefined ? { temizlik: degisim.temizlik } : {}),
          })
        }
      />

      <Stack.Screen options={{ headerShown: false }} />


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  kapsayici: {
    flex: 1,
  },
  bgCard: {
    marginTop: 14,
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(229,231,235,0.9)",
  },
  bgCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bgTitle: { fontSize: 14, fontWeight: "900", color: "#111827" },
  bgToggle: { backgroundColor: "#EEF2FF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  bgToggleText: { color: "#3730A3", fontWeight: "900" },
  bgSub: { marginTop: 6, fontSize: 12, color: "#6B7280", fontWeight: "700" },
  bgCurrent: { marginTop: 8, fontSize: 12, color: "#111827", fontWeight: "800" },
  bgList: { marginTop: 10, gap: 8 },
  bgItem: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bgItemActive: { backgroundColor: "#A855F7", borderColor: "#A855F7" },
  bgItemText: { fontSize: 13, fontWeight: "900", color: "#111827" },
  bgItemTextActive: { color: "#FFFFFF" },
  ustBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 52,
    paddingHorizontal: 20,
  },
  ustGeriButon: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  ustSilButon: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(249, 115, 115, 0.9)",
  },
  ustSilYazi: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  ustGeriYazi: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  bosKapsayici: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  bosBaslik: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4B5563",
    marginBottom: 8,
  },
  bosYazi: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  geriButon: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#F472B6",
  },
  geriYazi: {
    color: "#FFF",
    fontWeight: "700",
  },
});

