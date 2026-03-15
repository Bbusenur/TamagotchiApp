import { usePets } from "@/hooks/usePets";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const ACHIEVEMENT_BADGES: { id: string; title: string; description: string; icon: string }[] = [
  {
    id: "İlk Dostunu Sahiplendin",
    title: "İlk Dostunu Sahiplendin",
    description: "İlk evcil hayvanını sahiplendin.",
    icon: "Yıldız",
  },
  {
    id: "Küçük Sürü Sahibi",
    title: "Küçük Sürü Sahibi",
    description: "En az 3 dost sahiplendin.",
    icon: "Pati",
  },
  {
    id: "Gerçek Hayvansever",
    title: "Gerçek Hayvansever",
    description: "En az 5 dost sahiplendin.",
    icon: "Kupa",
  },
];

export default function AchievementsScreen() {
  const { stats } = usePets();
  const kazanilan = new Set(stats?.achievements ?? []);

  const uzunVadeliGorevler = [
    {
      id: "task_adopt_1",
      title: "İlk Dostunu Sahiplen",
      description: "En az 1 dost sahiplendiğinde tamamlanır.",
      target: 1,
      current: stats?.adoptedCount ?? 0,
      xpReward: 50,
    },
    {
      id: "task_adopt_3",
      title: "Küçük Sürü Kur",
      description: "En az 3 dost sahiplendiğinde tamamlanır.",
      target: 3,
      current: stats?.adoptedCount ?? 0,
      xpReward: 100,
    },
    {
      id: "task_adopt_5",
      title: "Gerçek Hayvansever",
      description: "En az 5 dost sahiplendiğinde tamamlanır.",
      target: 5,
      current: stats?.adoptedCount ?? 0,
      xpReward: 150,
    },
  ];

  const bugun = stats?.daily?.date ?? null;
  const adoptedToday = stats?.daily?.adoptedToday ?? 0;

  const gunlukGorevler = [
    {
      id: "daily_adopt_1",
      title: "Bugün Yeni Bir Dost Sahiplen",
      description: bugun
        ? "Bugün en az 1 kez sahiplen."
        : "Bugün ilk görev günün, yeni bir dost sahiplen.",
      target: 1,
      current: adoptedToday,
      xpReward: 30,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.kapsayici}>
      <View style={styles.seviyeKart}>
        <Text style={styles.baslik}>Eğitmen Profili</Text>
        <Text style={styles.seviye}>Seviye {stats?.level ?? 1}</Text>
        <View style={styles.xpBarArka}>
          <View
            style={[
              styles.xpBarDolgu,
              { width: `${Math.min(100, ((stats?.xp ?? 0) % 100))}%` },
            ]}
          />
        </View>
        <Text style={styles.xpYazi}>
          {stats?.xp ?? 0} XP · {stats?.adoptedCount ?? 0} sahiplenilen dost
        </Text>
        {bugun && (
          <Text style={styles.gunlukOzet}>
            Bugün: {adoptedToday} kez sahiplenme yaptın
          </Text>
        )}
      </View>

      <View style={styles.bolum}>
        <Text style={styles.bolumBaslik}>Rozetler</Text>
        {ACHIEVEMENT_BADGES.map((a) => {
          const aktif = kazanilan.has(a.id);
          return (
            <View
              key={a.id}
              style={[styles.rozetSatir, !aktif && styles.rozetPasif]}
            >
              <View style={styles.rozetIkonKutu}>
                <Text style={styles.rozetIkon}>{a.icon}</Text>
              </View>
              <View style={styles.rozetMetin}>
                <Text style={styles.rozetBaslik}>{a.title}</Text>
                <Text style={styles.rozetAciklama}>{a.description}</Text>
              </View>
              <Text style={[styles.rozetDurum, !aktif && styles.rozetDurumPasif]}>
                {aktif ? "Açık" : "Kilitli"}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.bolum}>
        <Text style={styles.bolumBaslik}>Uzun Vadeli Görevler</Text>
        {uzunVadeliGorevler.map((task) => {
          const oran = Math.min(1, task.current / task.target);
          const tamamlandi = oran >= 1;
          return (
            <View
              key={task.id}
              style={[styles.rozetSatir, tamamlandi && styles.gorevTamamlandi]}
            >
              <View style={styles.rozetIkonKutu}>
                <Text style={styles.rozetIkon}>{tamamlandi ? "OK" : ".."}</Text>
              </View>
              <View style={styles.rozetMetin}>
                <Text style={styles.rozetBaslik}>{task.title}</Text>
                <Text style={styles.rozetAciklama}>{task.description}</Text>
                <View style={styles.gorevProgressBarArka}>
                  <View
                    style={[
                      styles.gorevProgressBarDolgu,
                      { width: `${oran * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.gorevDurumYazi}>
                  {task.current}/{task.target} · Ödül: {task.xpReward} XP
                </Text>
              </View>
              <Text
                style={[
                  styles.rozetDurum,
                  !tamamlandi && styles.rozetDurumPasif,
                ]}
              >
                {tamamlandi ? "Tamamlandı" : "Devam ediyor"}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.bolum}>
        <Text style={styles.bolumBaslik}>Günlük Görevler</Text>
        {gunlukGorevler.map((task) => {
          const oran = Math.min(1, task.current / task.target);
          const tamamlandi = oran >= 1;
          return (
            <View
              key={task.id}
              style={[styles.rozetSatir, tamamlandi && styles.gorevTamamlandi]}
            >
              <View style={styles.rozetIkonKutu}>
                <Text style={styles.rozetIkon}>{tamamlandi ? "V" : ">"}</Text>
              </View>
              <View style={styles.rozetMetin}>
                <Text style={styles.rozetBaslik}>{task.title}</Text>
                <Text style={styles.rozetAciklama}>{task.description}</Text>
                <View style={styles.gorevProgressBarArka}>
                  <View
                    style={[
                      styles.gorevProgressBarDolguGunluk,
                      { width: `${oran * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.gorevDurumYazi}>
                  {task.current}/{task.target} · Ödül: {task.xpReward} XP
                </Text>
              </View>
              <Text
                style={[
                  styles.rozetDurum,
                  !tamamlandi && styles.rozetDurumPasif,
                ]}
              >
                {tamamlandi ? "Tamamlandı" : "Bugün dene"}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  kapsayici: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#F9FAFB",
    gap: 24,
  },
  seviyeKart: {
    backgroundColor: "#EEF2FF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  baslik: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#4C1D95",
    marginBottom: 4,
  },
  seviye: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 10,
  },
  xpBarArka: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E0E7FF",
    overflow: "hidden",
    marginBottom: 6,
  },
  xpBarDolgu: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 999,
  },
  xpYazi: {
    fontSize: 12,
    color: "#4C1D95",
    fontWeight: "600",
  },
  gunlukOzet: {
    marginTop: 4,
    fontSize: 12,
    color: "#4B5563",
  },
  bolum: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bolumBaslik: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  rozetSatir: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 16,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  rozetPasif: {
    opacity: 0.5,
  },
  rozetIkonKutu: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rozetIkon: {
    fontSize: 10,
    fontWeight: "700",
    color: "#B45309",
  },
  rozetMetin: {
    flex: 1,
  },
  rozetBaslik: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  rozetAciklama: {
    fontSize: 12,
    color: "#6B7280",
  },
  rozetDurum: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
  },
  rozetDurumPasif: {
    color: "#9CA3AF",
  },
  gorevTamamlandi: {
    backgroundColor: "#ECFDF3",
  },
  gorevProgressBarArka: {
    marginTop: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  gorevProgressBarDolgu: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 999,
  },
  gorevProgressBarDolguGunluk: {
    height: "100%",
    backgroundColor: "#F97316",
    borderRadius: 999,
  },
  gorevDurumYazi: {
    marginTop: 4,
    fontSize: 11,
    color: "#6B7280",
  },
});

