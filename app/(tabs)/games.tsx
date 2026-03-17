import { usePets } from "@/hooks/usePets";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GamesScreen() {
  const { pets, stats } = usePets();

  const TUR_SIRASI = ["Kedi", "Köpek", "Balık", "Kaplumbağa", "Kuş", "Tavşan"] as const;
  type Tur = (typeof TUR_SIRASI)[number];

  const [turOpen, setTurOpen] = useState(false);
  const [isimOpen, setIsimOpen] = useState(false);

  const [selectedTur, setSelectedTur] = useState<Tur>(() => {
    const first = (pets?.[0]?.tur as Tur | undefined) ?? "Kedi";
    return TUR_SIRASI.includes(first) ? first : "Kedi";
  });

  const petsOfTur = useMemo(() => (pets || []).filter((p: any) => p.tur === selectedTur), [pets, selectedTur]);

  const [selectedPetId, setSelectedPetId] = useState<string | null>(() => {
    const first = (petsOfTur?.[0]?.id as string | undefined) ?? (pets?.[0]?.id as string | undefined) ?? null;
    return first;
  });

  const selectedPet = useMemo(() => (pets || []).find((p: any) => p.id === selectedPetId) ?? null, [pets, selectedPetId]);

  // tür değişince isim seçimi yoksa ilk pet'e düş
  useEffect(() => {
    if (petsOfTur.length === 0) return;
    const stillExists = petsOfTur.some((p: any) => p.id === selectedPetId);
    if (!stillExists) setSelectedPetId(petsOfTur[0].id);
  }, [petsOfTur, selectedPetId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Oyunlar</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinText}>{stats?.coins ?? 0} Coin</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Oyun Arkadaşı</Text>
        <Text style={styles.cardSub}>
          Kazandıkça Coin ve seçtiğin dosta XP verirsin.
        </Text>
        {(pets || []).length === 0 ? (
          <Text style={styles.muted}>Henüz dostun yok. Önce “Sahiplen”.</Text>
        ) : (
          <View style={styles.selectGrid}>
            <View style={styles.selectCol}>
              <Text style={styles.selectLabel}>Tür</Text>
              <TouchableOpacity
                style={styles.selectBtn}
                onPress={() => {
                  setTurOpen((v) => !v);
                  setIsimOpen(false);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.selectBtnText}>{selectedTur}</Text>
                <Text style={styles.selectChevron}>{turOpen ? "˄" : "˅"}</Text>
              </TouchableOpacity>
              {turOpen && (
                <View style={styles.dropdown}>
                  {TUR_SIRASI.map((t) => {
                    const active = t === selectedTur;
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[styles.dropItem, active && styles.dropItemActive]}
                        onPress={() => {
                          setSelectedTur(t);
                          setTurOpen(false);
                        }}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.dropItemText, active && styles.dropItemTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={styles.selectCol}>
              <Text style={styles.selectLabel}>İsim</Text>
              <TouchableOpacity
                style={styles.selectBtn}
                onPress={() => {
                  setIsimOpen((v) => !v);
                  setTurOpen(false);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.selectBtnText}>{selectedPet ? selectedPet.isim : "Seç"}</Text>
                <Text style={styles.selectChevron}>{isimOpen ? "˄" : "˅"}</Text>
              </TouchableOpacity>
              {isimOpen && (
                <View style={styles.dropdown}>
                  {petsOfTur.length === 0 ? (
                    <View style={styles.dropEmpty}>
                      <Text style={styles.dropEmptyText}>Bu türden dost yok.</Text>
                    </View>
                  ) : (
                    petsOfTur.map((p: any) => {
                      const active = p.id === selectedPetId;
                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[styles.dropItem, active && styles.dropItemActive]}
                          onPress={() => {
                            setSelectedPetId(p.id);
                            setIsimOpen(false);
                          }}
                          activeOpacity={0.85}
                        >
                          <Text style={[styles.dropItemText, active && styles.dropItemTextActive]} numberOfLines={1}>
                            {p.isim}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Oyun Seç</Text>
        <Text style={styles.muted}>Bir oyun seçince ayrı ekranda açılır.</Text>
        <View style={styles.gameList}>
          <TouchableOpacity
            style={styles.gameBtn}
            onPress={() => router.push({ pathname: "/games/brick-breaker", params: { petId: selectedPetId ?? "" } })}
            activeOpacity={0.85}
          >
            <Text style={styles.gameBtnTitle}>Blok Kırma</Text>
            <Text style={styles.gameBtnSub}>Resimdeki gibi: top + platform + renkli bloklar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameBtn}
            onPress={() => router.push({ pathname: "/games/jump-up", params: { petId: selectedPetId ?? "" } })}
            activeOpacity={0.85}
          >
            <Text style={styles.gameBtnTitle}>Zıpla Yüksel</Text>
            <Text style={styles.gameBtnSub}>Ekrana dokun: seçili hayvan zıplar, yukarı tırmanırsın</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameBtn}
            onPress={() => router.push({ pathname: "/games/balloons", params: { petId: selectedPetId ?? "" } })}
            activeOpacity={0.85}
          >
            <Text style={styles.gameBtnTitle}>Balon Patlatma</Text>
            <Text style={styles.gameBtnSub}>Yukarı çıkan balonlara bas, seri yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 60,
    backgroundColor: "#FDF2F8",
    gap: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: { fontSize: 24, fontWeight: "800", color: "#4B5563" },
  coinBadge: { backgroundColor: "#FEF08A", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  coinText: { fontSize: 16, fontWeight: "700", color: "#854D0E" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FCE7F3",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  cardSub: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
  muted: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  hint: { fontSize: 12, color: "#9CA3AF", fontWeight: "600" },
  row: { flexDirection: "row", gap: 10, alignItems: "center", flexWrap: "wrap" },
  selectGrid: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  selectCol: { flex: 1, gap: 6 },
  selectLabel: { fontSize: 12, fontWeight: "800", color: "#6B7280" },
  selectBtn: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  selectBtnText: { fontSize: 13, fontWeight: "900", color: "#111827", flex: 1 },
  selectChevron: { color: "#6B7280", fontWeight: "900" },
  dropdown: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    overflow: "hidden",
  },
  dropItem: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#FFFFFF" },
  dropItemActive: { backgroundColor: "#EEF2FF" },
  dropItemText: { fontSize: 13, fontWeight: "800", color: "#111827" },
  dropItemTextActive: { color: "#3730A3" },
  dropEmpty: { paddingHorizontal: 12, paddingVertical: 10 },
  dropEmptyText: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  gameList: { gap: 10, marginTop: 6 },
  gameBtn: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 14,
  },
  gameBtnTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  gameBtnSub: { fontSize: 12, color: "#6B7280", fontWeight: "600", marginTop: 4 },
});

