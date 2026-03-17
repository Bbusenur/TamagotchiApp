import { usePets } from "@/hooks/usePets";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const SHOP_ITEMS: any[] = [
    { id: "AKS_SAPKA_SIYAH", ad: "Siyah Şapka", tip: "aksesuar", fiyat: 60, icon: "🎩" },
    { id: "AKS_SAPKA_KIRMIZI", ad: "Kırmızı Şapka", tip: "aksesuar", fiyat: 65, icon: "🎩" },
    { id: "AKS_SAPKA_MAVI", ad: "Mavi Şapka", tip: "aksesuar", fiyat: 65, icon: "🎩" },
    { id: "AKS_SAPKA_YESIL", ad: "Yeşil Şapka", tip: "aksesuar", fiyat: 65, icon: "🎩" },
    { id: "AKS_SAPKA_SARI", ad: "Sarı Şapka", tip: "aksesuar", fiyat: 70, icon: "🎩" },
];

export default function ShopScreen() {
    const { stats, buyItem } = usePets();

    const handleBuy = (item: any) => {
        if ((stats.inventory || []).includes(item.id)) {
            return;
        }
        const basarili = buyItem(item.id, item.fiyat);
        if (basarili) {
            alert(`Satın alındı: ${item.ad}`);
        } else {
            alert("Yeterli Coin yok! Evcil hayvanınla ilgilenerek coin kazanabilirsin.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Sanal Market</Text>
                <View style={styles.coinBadge}>
                    <Text style={styles.coinText}>{stats.coins || 0} Coin</Text>
                </View>
            </View>


            <ScrollView contentContainerStyle={styles.list}>
                {SHOP_ITEMS.map((item) => {
                    const alindiMi = (stats.inventory || []).includes(item.id);
                    return (
                        <View key={item.id} style={styles.card}>
                            <Text style={styles.icon}>{item.icon}</Text>
                            <View style={styles.info}>
                                <Text style={styles.ad}>{item.ad} <Text style={styles.tipText}>(Aksesuar)</Text></Text>
                                <Text style={styles.fiyat}>{item.fiyat > 0 ? `${item.fiyat} Coin` : "Ücretsiz"}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.buyBtn, alindiMi && styles.boughtBtn, { backgroundColor: alindiMi ? "#9CA3AF" : "#10B981" }]}
                                onPress={() => handleBuy(item)}
                            >
                                <Text style={styles.buyBtnText}>
                                    {alindiMi ? "Alındı" : "Satın Al"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FDF2F8", paddingTop: 60 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 20 },
    title: { fontSize: 24, fontWeight: "800", color: "#4B5563" },
    coinBadge: { backgroundColor: "#FEF08A", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
    coinText: { fontSize: 16, fontWeight: "700", color: "#854D0E" },
    list: { padding: 20, paddingBottom: 60, gap: 12 },
    card: { flexDirection: "row", backgroundColor: "#FFF", padding: 16, borderRadius: 16, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    icon: { fontSize: 32, marginRight: 16 },
    info: { flex: 1 },
    ad: { fontSize: 16, fontWeight: "700", color: "#374151" },
    tipText: { fontSize: 12, fontWeight: "500", color: "#9CA3AF" },
    fiyat: { fontSize: 14, color: "#6B7280", marginTop: 4, fontWeight: "600" },
    buyBtn: { backgroundColor: "#10B981", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
    boughtBtn: { backgroundColor: "#D1D5DB" },
    buyBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
});
