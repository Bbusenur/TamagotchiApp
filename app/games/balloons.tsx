import { usePets } from "@/hooks/usePets";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type StaticBalloon = { id: string; leftPct: number; topPct: number; color: string };

export default function BalloonsGameScreen() {
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const { pets, addCoins, earnPetXp } = usePets();

  const selectedPet = useMemo(() => (pets || []).find((p: any) => p.id === petId) ?? null, [pets, petId]);

  const pendingRef = useRef({ coins: 0, xp: 0 });
  const [pendingUi, setPendingUi] = useState({ coins: 0, xp: 0 });

  const addPending = (coins: number, xp: number) => {
    pendingRef.current.coins += coins;
    pendingRef.current.xp += xp;
    setPendingUi({ coins: pendingRef.current.coins, xp: pendingRef.current.xp });
  };

  const finish = (reason: string) => {
    const { coins, xp } = pendingRef.current;
    if (coins > 0) addCoins(coins);
    if (selectedPet?.id && xp > 0) earnPetXp(selectedPet.id, xp);
    if (coins > 0 || xp > 0) {
      alert(`${reason}\nKazanç: +${coins} Coin${selectedPet?.id ? ` · +${xp} XP (${selectedPet.isim})` : ""}`);
    } else {
      alert(reason);
    }
    pendingRef.current = { coins: 0, xp: 0 };
    setPendingUi({ coins: 0, xp: 0 });
  };

  const [balloons, setBalloons] = useState<StaticBalloon[]>([]);
  const [popped, setPopped] = useState(0);
  const [streak, setStreak] = useState(0);
  const [missed, setMissed] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeIdsRef = useRef(new Set<string>());
  const timeoutsRef = useRef(new Map<string, NodeJS.Timeout>());
  const finishedRef = useRef(false);

  const spawnBalloonRef = useRef<() => void>(() => {});

  const stopGame = (reason: string) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    for (const t of timeoutsRef.current.values()) clearTimeout(t);
    timeoutsRef.current.clear();
    finish(reason);
  };

  const spawnBalloon = () => {
    if (gameOver) return;
    const id = `bl_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    if (activeIdsRef.current.has(id)) return;
    activeIdsRef.current.add(id);

    const b: StaticBalloon = {
      id,
      leftPct: randInt(0, 86),
      topPct: randInt(0, 78),
      color: ["#60A5FA", "#F472B6", "#34D399", "#FBBF24", "#A78BFA"][randInt(0, 4)],
    };

    setBalloons((prev) => (prev.length >= 8 ? prev : [...prev, b]));

    const t = setTimeout(() => {
      activeIdsRef.current.delete(id);
      timeoutsRef.current.delete(id);
      setBalloons((prev) => prev.filter((x) => x.id !== id));
      setStreak(0);
      setMissed((m) => {
        const next = m + 1;
        if (next >= 3) {
          setGameOver(true);
          stopGame("3 balon kaçırdın. Oyun bitti!");
        }
        return next;
      });
    }, randInt(1700, 2600));
    timeoutsRef.current.set(id, t);
  };

  spawnBalloonRef.current = spawnBalloon;

  useEffect(() => {
    const activeIds = activeIdsRef.current;
    const timeouts = timeoutsRef.current;
    timerRef.current = setInterval(() => spawnBalloonRef.current(), 850);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      activeIds.clear();
      for (const t of timeouts.values()) clearTimeout(t);
      timeouts.clear();
    };
  }, []);

  const popBalloon = (id: string) => {
    if (gameOver) return;
    activeIdsRef.current.delete(id);
    const tt = timeoutsRef.current.get(id);
    if (tt) clearTimeout(tt);
    timeoutsRef.current.delete(id);
    setBalloons((prev) => prev.filter((b) => b.id !== id));
    setPopped((p) => p + 1);
    setStreak((s) => {
      const next = s + 1;
      if (next % 5 === 0) addPending(10, 18);
      else addPending(1, 2);
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            stopGame("Oyun kapandı.");
            router.back();
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Can: {Math.max(0, 3 - missed)} · Patlatılan: {popped} · Seri: {streak} · +{pendingUi.coins}</Text>
        </View>
      </View>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>Balon Patlatma</Text>
        <Text style={styles.subTitle}>
          {selectedPet ? `Oyun arkadaşı: ${selectedPet.isim}` : "Oyun arkadaşı seçilmedi"}
        </Text>
      </View>

      <View style={styles.area}>
        {balloons.map((b) => (
          <View
            key={b.id}
            style={[
              styles.balloon,
              {
                left: `${b.leftPct}%`,
                backgroundColor: b.color,
                top: `${b.topPct}%`,
              },
            ]}
          >
            <TouchableOpacity style={styles.balloonTouch} activeOpacity={0.8} onPress={() => popBalloon(b.id)}>
              <Text style={styles.balloonText}>PATLAT</Text>
            </TouchableOpacity>
          </View>
        ))}
        {gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>Oyun bitti</Text>
            <Text style={styles.overlaySub}>3 balon kaçırdın.</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                finishedRef.current = false;
                setGameOver(false);
                setMissed(0);
                setPopped(0);
                setStreak(0);
                setBalloons([]);
                pendingRef.current = { coins: 0, xp: 0 };
                setPendingUi({ coins: 0, xp: 0 });
                for (const t of timeoutsRef.current.values()) clearTimeout(t);
                timeoutsRef.current.clear();
                if (timerRef.current) clearInterval(timerRef.current);
                timerRef.current = setInterval(spawnBalloon, 850);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.retryText}>Tekrar Oyna</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.hint}>Her balon: +1 Coin, +2 XP · Her 5 seri: bonus</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDF2F8", paddingTop: 56 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  backBtn: { backgroundColor: "#FFFFFF", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  backText: { color: "#374151", fontWeight: "800" },
  badge: { backgroundColor: "#FEF08A", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  badgeText: { color: "#854D0E", fontWeight: "900", fontSize: 12 },
  titleWrap: { paddingHorizontal: 16, marginTop: 14, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "900", color: "#111827" },
  subTitle: { marginTop: 4, color: "#6B7280", fontWeight: "700" },
  area: {
    marginHorizontal: 16,
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#EFF6FF",
    overflow: "hidden",
    position: "relative",
  },
  balloon: {
    position: "absolute",
    width: 72,
    height: 92,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  balloonTouch: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  balloonText: { color: "#111827", fontWeight: "900", fontSize: 12, opacity: 0.85 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 20,
  },
  overlayTitle: { color: "#111827", fontWeight: "900", fontSize: 22, backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  overlaySub: { marginTop: 8, color: "#111827", fontWeight: "800", backgroundColor: "rgba(255,255,255,0.85)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  retryBtn: { marginTop: 12, backgroundColor: "#F472B6", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 },
  retryText: { color: "#FFFFFF", fontWeight: "900" },
  footer: { paddingHorizontal: 16, paddingVertical: 12 },
  hint: { color: "#9CA3AF", fontWeight: "700", fontSize: 12 },
});

