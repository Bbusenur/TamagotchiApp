import PikselBalik from "@/components/PikselBalik";
import PikselKaplumbaga from "@/components/PikselKaplumbaga";
import PikselKedi from "@/components/PikselKedi";
import PikselKopek from "@/components/PikselKopek";
import PikselKus from "@/components/PikselKus";
import PikselTavsan from "@/components/PikselTavsan";
import { usePets } from "@/hooks/usePets";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Accelerometer } from "expo-sensors";
import { Dimensions, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type GamePlatform = { id: string; x: number; y: number; w: number; h: number };

function PetSprite({ tur, renk }: { tur: string; renk: string }) {
  const durum = "mutlu";
  switch (tur) {
    case "Köpek":
      return <PikselKopek durum={durum} renk={renk} />;
    case "Balık":
      return <PikselBalik durum={durum} renk={renk} />;
    case "Kaplumbağa":
      return <PikselKaplumbaga durum={durum} renk={renk} />;
    case "Kuş":
      return <PikselKus durum={durum} renk={renk} />;
    case "Tavşan":
      return <PikselTavsan durum={durum} renk={renk} />;
    case "Kedi":
    default:
      return <PikselKedi durum={durum} renk={renk} />;
  }
}

export default function JumpUpScreen() {
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

  const { width } = Dimensions.get("window");
  const W = Math.min(width - 32, 420);
  const H = 560;

  const PET_SIZE = 44;
  const PLATFORM_H = 12;

  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const stateRef = useRef({
    x: W / 2 - PET_SIZE / 2,
    y: H - 120,
    vy: 0,
    cam: 0,
    canJump: true,
  });
  const tiltRef = useRef({ x: 0, avail: false });

  const [petPos, setPetPos] = useState({ x: stateRef.current.x, y: stateRef.current.y });
  const [platforms, setPlatforms] = useState<GamePlatform[]>([]);
  const platformsRef = useRef<GamePlatform[]>([]);

  const reset = () => {
    setRunning(false);
    setGameOver(false);
    setScore(0);
    stateRef.current = { x: W / 2 - PET_SIZE / 2, y: H - 120, vy: 0, cam: 0, canJump: true };
    setPetPos({ x: stateRef.current.x, y: stateRef.current.y });
    const start: GamePlatform[] = [
      { id: "p0", x: W / 2 - 60, y: H - 60, w: 120, h: PLATFORM_H },
      { id: "p1", x: randInt(10, W - 110), y: H - 160, w: 110, h: PLATFORM_H },
      { id: "p2", x: randInt(10, W - 110), y: H - 260, w: 110, h: PLATFORM_H },
      { id: "p3", x: randInt(10, W - 110), y: H - 360, w: 110, h: PLATFORM_H },
    ];
    platformsRef.current = start;
    setPlatforms(start);
  };

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensurePlatforms = () => {
    const p = platformsRef.current.slice();
    // world coordinates; we want platforms above current camera
    const highestY = Math.min(...p.map((x) => x.y));
    while (highestY > stateRef.current.cam - 1600 && p.length < 22) {
      // (no-op, just safety)
      break;
    }
    // generate upward as we climb
    while (Math.min(...p.map((x) => x.y)) > stateRef.current.cam - 800) {
      const top = Math.min(...p.map((x) => x.y));
      const ny = top - randInt(90, 150);
      const nw = randInt(88, 140);
      const nx = randInt(10, Math.max(10, Math.floor(W - nw - 10)));
      p.push({ id: `p_${Date.now()}_${Math.random().toString(16).slice(2)}`, x: nx, y: ny, w: nw, h: PLATFORM_H });
      // keep list size
      if (p.length > 24) {
        p.sort((a, b) => a.y - b.y);
        p.splice(20);
      }
    }
    platformsRef.current = p;
    setPlatforms(p);
  };

  const jump = () => {
    if (gameOver) return;
    if (!running) setRunning(true);
    if (!stateRef.current.canJump) return;
    stateRef.current.vy = -10.8;
    stateRef.current.canJump = false;
  };

  useEffect(() => {
    let sub: any = null;
    let cancelled = false;

    (async () => {
      try {
        const avail = await Accelerometer.isAvailableAsync();
        if (cancelled) return;
        tiltRef.current.avail = !!avail;
        if (!avail) return;
        Accelerometer.setUpdateInterval(50);
        sub = Accelerometer.addListener((data) => {
          // iOS/Android eksenleri farklı hissedebilir, ama x genel olarak sağ/sol tilt için uygun.
          // Low-pass filter ile titremeyi azalt.
          const rawX = data?.x ?? 0;
          tiltRef.current.x = tiltRef.current.x * 0.85 + rawX * 0.15;
        });
      } catch {
        tiltRef.current.avail = false;
      }
    })();

    return () => {
      cancelled = true;
      sub?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (!running || gameOver) return;
    let raf: number | null = null;
    let last = Date.now();

    const tick = () => {
      const now = Date.now();
      const dt = Math.min(32, now - last);
      last = now;
      const step = dt / 16.67;

      const s = stateRef.current;
      // gravity
      s.vy += 0.55 * step;
      s.y += s.vy * 4.2 * step;

      // yatay hareket: telefonu sağa/sola eğ
      // Android'de çoğu cihazda yön ters hissedebilir; kullanıcı deneyimi için ters çeviriyoruz.
      const dir = Platform.OS === "android" ? -1 : 1;
      const tilt = tiltRef.current.x * dir; // yaklaşık -1..1
      const speed = 6.0; // px/frame@60fps
      s.x = clamp(s.x + tilt * speed * step, 0, W - PET_SIZE);

      // camera follows upward movement
      const targetCam = Math.min(s.cam, s.y - (H * 0.45));
      s.cam = targetCam;

      // collision only when falling
      if (s.vy > 0) {
        const petBottom = s.y + PET_SIZE;
        for (const pl of platformsRef.current) {
          // Kamera dışında kalan (özellikle alttaki) platformları algılama
          const plScreenTop = pl.y - s.cam;
          if (plScreenTop > H + 40 || plScreenTop < -120) continue;
          const withinX = s.x + PET_SIZE * 0.8 >= pl.x && s.x + PET_SIZE * 0.2 <= pl.x + pl.w;
          const withinY = petBottom >= pl.y && petBottom <= pl.y + pl.h + 8;
          if (withinX && withinY) {
            s.y = pl.y - PET_SIZE;
            s.vy = 0;
            s.canJump = true;
            break;
          }
        }
      }

      // score: how high (camera)
      const newScore = Math.max(score, Math.floor((-s.cam) / 10));
      if (newScore !== score) {
        setScore(newScore);
        if (newScore > 0 && newScore % 50 === 0) addPending(10, 20);
        else addPending(0, 1);
      }

      // game over: alt çizginin altına inince
      if (s.y - s.cam > H + 8) {
        setGameOver(true);
        setRunning(false);
        setTimeout(() => finish("Düştün!"), 50);
      }

      ensurePlatforms();
      setPetPos({ x: s.x, y: s.y });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, gameOver, score]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            finish("Oyun kapandı.");
            router.back();
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Yükseklik: {score} · +{pendingUi.coins}</Text>
        </View>
      </View>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>Zıpla Yüksel</Text>
        <Text style={styles.subTitle}>
          {selectedPet ? `Oyun arkadaşı: ${selectedPet.isim}` : "Oyun arkadaşı seçilmedi"}
        </Text>
      </View>

      <Pressable style={[styles.frame, { width: W, height: H }]} onPress={jump}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#111827" }]} />
        {/* platforms */}
        {platforms.map((pl) => (
          <View
            key={pl.id}
            style={[
              styles.platform,
              {
                left: pl.x,
                top: pl.y - stateRef.current.cam,
                width: pl.w,
                height: pl.h,
              },
            ]}
          />
        ))}

        {/* pet */}
        <View
          style={[
            styles.petWrap,
            {
              left: petPos.x,
              top: petPos.y - stateRef.current.cam,
              width: PET_SIZE,
              height: PET_SIZE,
            },
          ]}
        >
          <View style={{ transform: [{ scale: 1.25 }] }}>
            <PetSprite tur={selectedPet?.tur ?? "Kedi"} renk={selectedPet?.renk ?? "Turuncu"} />
          </View>
        </View>

        {!running && !gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>Dokun: Zıpla</Text>
            <Text style={styles.overlaySub}>Sağa/sola eğ: yürü · Platforma inince tekrar zıpla</Text>
          </View>
        )}
        {gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>Düştün!</Text>
            <Text style={styles.overlaySub}>Yükseklik: {score}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={reset} activeOpacity={0.85}>
              <Text style={styles.retryText}>Tekrar Oyna</Text>
            </TouchableOpacity>
          </View>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.hint}>Dokunarak zıpla. Yükseklik artınca XP/bonus kazanırsın.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDF2F8", paddingTop: 56, alignItems: "center" },
  topBar: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  backBtn: { backgroundColor: "#FFFFFF", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  backText: { color: "#374151", fontWeight: "900" },
  badge: { backgroundColor: "#FEF08A", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  badgeText: { color: "#854D0E", fontWeight: "900", fontSize: 12 },
  titleWrap: { width: "100%", paddingHorizontal: 16, marginTop: 14, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "900", color: "#111827" },
  subTitle: { marginTop: 4, color: "#6B7280", fontWeight: "700" },
  frame: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#111827",
    overflow: "hidden",
  },
  platform: {
    position: "absolute",
    borderRadius: 10,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
  },
  petWrap: { position: "absolute", alignItems: "center", justifyContent: "center" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  overlayTitle: { color: "#F8FAFC", fontWeight: "900", fontSize: 22 },
  overlaySub: { marginTop: 6, color: "rgba(248,250,252,0.85)", fontWeight: "800", textAlign: "center" },
  retryBtn: { marginTop: 14, backgroundColor: "#F472B6", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 },
  retryText: { color: "#FFFFFF", fontWeight: "900" },
  footer: { width: "100%", paddingHorizontal: 16, paddingVertical: 12 },
  hint: { color: "#9CA3AF", fontWeight: "700", fontSize: 12 },
});

