import DigitalPet from "@/components/DigitalPet";
import { usePets } from "@/hooks/usePets";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { SHOP_ITEMS } from "../(tabs)/shop";

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pets, stats, updatePet, removePet, addCoins, spendCoins, earnPetXp } = usePets();

  const pet = pets.find((p: any) => p.id === id);

  const turArkaPlan: Record<string, string> = {
    "Kedi": "#FEF2F2",
    "Köpek": "#ECFDF3",
    "Balık": "#EFF6FF",
    "Kaplumbağa": "#ECFEFF",
    "Kuş": "#FEF9C3",
  };

  const bgColor = pet ? turArkaPlan[pet.tur] ?? "#FDF2F8" : "#FDF2F8";

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

      <DigitalPet
        id={pet.id}
        isim={pet.isim}
        tur={pet.tur}
        renk={pet.renk}
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

