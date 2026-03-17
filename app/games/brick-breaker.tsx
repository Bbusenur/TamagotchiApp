import { usePets } from "@/hooks/usePets";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, PanResponder, StyleSheet, Text, TouchableOpacity, View } from "react-native";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type Brick = { id: string; x: number; y: number; w: number; h: number; hp: number; color: string };

const COLORS = ["#EF4444", "#A855F7", "#22C55E", "#60A5FA", "#F59E0B"];

export default function BrickBreakerScreen() {
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
  const GAME_W = Math.min(width - 32, 420);
  const GAME_H = 520;

  const PADDLE_W = 92;
  const PADDLE_H = 14;
  const BALL_R = 7;

  const [running, setRunning] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);

  const paddleXRef = useRef((GAME_W - PADDLE_W) / 2);
  const [paddleXState, setPaddleXState] = useState(paddleXRef.current);

  const ball = useRef({ x: GAME_W / 2, y: GAME_H - 90, vx: 2.8, vy: -3.6 }).current;
  const [ballState, setBallState] = useState({ x: ball.x, y: ball.y });

  const bricksRef = useRef<Brick[]>([]);
  const [bricks, setBricks] = useState<Brick[]>([]);

  const rafRef = useRef<number | null>(null);
  const gameRef = useRef<View | null>(null);
  const gameLeftRef = useRef(0);

  const buildBricks = () => {
    const cols = 10;
    const rows = 6;
    const gap = 6;
    const pad = 10;
    const bw = (GAME_W - pad * 2 - gap * (cols - 1)) / cols;
    const bh = 18;

    const list: Brick[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const id = `br_${r}_${c}_${Date.now()}`;
        list.push({
          id,
          x: pad + c * (bw + gap),
          y: 16 + r * (bh + gap),
          w: bw,
          h: bh,
          hp: r < 2 ? 2 : 1,
          color: COLORS[r % COLORS.length],
        });
      }
    }
    bricksRef.current = list;
    setBricks(list);
  };

  const resetBallAndPaddle = () => {
    paddleXRef.current = (GAME_W - PADDLE_W) / 2;
    setPaddleXState(paddleXRef.current);
    ball.x = GAME_W / 2;
    ball.y = GAME_H - 90;
    ball.vx = 2.8 * (Math.random() < 0.5 ? -1 : 1);
    ball.vy = -3.6;
    setBallState({ x: ball.x, y: ball.y });
    setRunning(false);
  };

  const setPaddle = (x: number) => {
    const nx = clamp(x, 0, GAME_W - PADDLE_W);
    paddleXRef.current = nx;
    setPaddleXState(nx);
  };

  useEffect(() => {
    buildBricks();
    resetBallAndPaddle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopLoop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  useEffect(() => {
    if (!running) {
      stopLoop();
      return;
    }

    let last = Date.now();
    const tick = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      const step = dt / 16.67;

      ball.x += ball.vx * step;
      ball.y += ball.vy * step;

      // walls
      if (ball.x <= BALL_R) {
        ball.x = BALL_R;
        ball.vx *= -1;
      } else if (ball.x >= GAME_W - BALL_R) {
        ball.x = GAME_W - BALL_R;
        ball.vx *= -1;
      }
      if (ball.y <= BALL_R) {
        ball.y = BALL_R;
        ball.vy *= -1;
      }

      // paddle
      const px = paddleXRef.current;
      const py = GAME_H - 26;
      const withinX = ball.x >= px - BALL_R && ball.x <= px + PADDLE_W + BALL_R;
      const withinY = ball.y + BALL_R >= py && ball.y + BALL_R <= py + PADDLE_H + 2;
      if (withinX && withinY && ball.vy > 0) {
        ball.y = py - BALL_R;
        const hit = (ball.x - (px + PADDLE_W / 2)) / (PADDLE_W / 2); // -1..1
        ball.vx = clamp(ball.vx + hit * 1.8, -6, 6);
        ball.vy = -Math.abs(ball.vy);
      }

      // bricks
      let hitBrick: Brick | null = null;
      const nextBricks = bricksRef.current.map((b) => ({ ...b }));
      for (let i = 0; i < nextBricks.length; i++) {
        const b = nextBricks[i];
        const bx1 = b.x;
        const bx2 = b.x + b.w;
        const by1 = b.y;
        const by2 = b.y + b.h;
        const cx = ball.x;
        const cy = ball.y;
        const overlapX = cx + BALL_R >= bx1 && cx - BALL_R <= bx2;
        const overlapY = cy + BALL_R >= by1 && cy - BALL_R <= by2;
        if (overlapX && overlapY) {
          hitBrick = b;
          // reflect: choose axis by penetration
          const penL = Math.abs((cx + BALL_R) - bx1);
          const penR = Math.abs(bx2 - (cx - BALL_R));
          const penT = Math.abs((cy + BALL_R) - by1);
          const penB = Math.abs(by2 - (cy - BALL_R));
          const minPen = Math.min(penL, penR, penT, penB);
          if (minPen === penL || minPen === penR) ball.vx *= -1;
          else ball.vy *= -1;
          b.hp -= 1;
          break;
        }
      }

      if (hitBrick) {
        const remaining = nextBricks.filter((b) => b.hp > 0);
        bricksRef.current = remaining;
        setBricks(remaining);
        setScore((s) => s + 10);
        addPending(1, 2);
      }

      // bottom
      if (ball.y > GAME_H + 20) {
        setLives((lv) => {
          const next = lv - 1;
          if (next <= 0) {
            stopLoop();
            setRunning(false);
            setTimeout(() => finish("Oyun bitti!"), 50);
            return 0;
          }
          return next;
        });
        resetBallAndPaddle();
        return;
      }

      // win
      if (bricksRef.current.length === 0) {
        stopLoop();
        setRunning(false);
        addPending(25, 30);
        finish("Tebrikler! Tüm blokları kırdın.");
        buildBricks();
        resetBallAndPaddle();
        return;
      }

      setBallState({ x: ball.x, y: ball.y });
      rafRef.current = requestAnimationFrame(() => tick(Date.now()));
    };

    rafRef.current = requestAnimationFrame(() => tick(Date.now()));
    return () => stopLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const updateFromTouch = (pageX: number) => {
    const xIn = pageX - gameLeftRef.current;
    setPaddle(xIn - PADDLE_W / 2);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        gameRef.current?.measureInWindow((x) => {
          gameLeftRef.current = x;
          updateFromTouch(e.nativeEvent.pageX);
        });
        if (lives > 0 && !running) setRunning(true);
      },
      onPanResponderMove: (e) => {
        updateFromTouch(e.nativeEvent.pageX);
      },
    }),
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            stopLoop();
            setRunning(false);
            finish("Oyun kapandı.");
            router.back();
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Skor: {score} · Can: {lives} · Kazanç: +{pendingUi.coins}</Text>
        </View>
      </View>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>Blok Kırma</Text>
        <Text style={styles.subTitle}>
          {selectedPet ? `Oyun arkadaşı: ${selectedPet.isim}` : "Oyun arkadaşı seçilmedi"}
        </Text>
      </View>

      <View ref={gameRef} style={[styles.gameFrame, { width: GAME_W, height: GAME_H }]}>
        {/* bricks */}
        {bricks.map((b) => (
          <View key={b.id} style={[styles.brick, { left: b.x, top: b.y, width: b.w, height: b.h, backgroundColor: b.color, opacity: b.hp === 2 ? 1 : 0.85 }]} />
        ))}

        {/* ball */}
        <View
          style={[
            styles.ball,
            {
              left: ballState.x - BALL_R,
              top: ballState.y - BALL_R,
              width: BALL_R * 2,
              height: BALL_R * 2,
              borderRadius: BALL_R,
            },
          ]}
        />

        {/* paddle */}
        <View style={[styles.paddle, { left: paddleXState, top: GAME_H - 26, width: PADDLE_W, height: PADDLE_H }]} />

        {/* input overlay */}
        <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
          {!running && (
            <View style={styles.overlay}>
              <Text style={styles.overlayTitle}>Dokun: Başlat</Text>
              <Text style={styles.overlaySub}>Parmağınla platformu sağ-sol sürükle</Text>
              <Text style={styles.overlayHint}>Blok vurunca: +1 Coin, +2 XP</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.hint}>Hedef: tüm blokları kır. Top düşerse can gider.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1020", paddingTop: 56, alignItems: "center" },
  topBar: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  backBtn: { backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  backText: { color: "#111827", fontWeight: "900" },
  badge: { backgroundColor: "rgba(250,204,21,0.95)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  badgeText: { color: "#854D0E", fontWeight: "900", fontSize: 12 },
  titleWrap: { width: "100%", paddingHorizontal: 16, marginTop: 14, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "900", color: "#F8FAFC" },
  subTitle: { marginTop: 4, color: "rgba(248,250,252,0.8)", fontWeight: "700" },
  gameFrame: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "#3B1053",
    overflow: "hidden",
  },
  brick: { position: "absolute", borderRadius: 4 },
  paddle: {
    position: "absolute",
    borderRadius: 10,
    backgroundColor: "#E11D48",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  ball: { position: "absolute", backgroundColor: "#E5E7EB" },
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  overlayTitle: { color: "#F8FAFC", fontWeight: "900", fontSize: 20 },
  overlaySub: { marginTop: 6, color: "rgba(248,250,252,0.85)", fontWeight: "700" },
  overlayHint: { marginTop: 10, color: "rgba(250,204,21,0.95)", fontWeight: "900" },
  footer: { width: "100%", paddingHorizontal: 16, paddingVertical: 12 },
  hint: { color: "rgba(248,250,252,0.75)", fontWeight: "700", fontSize: 12 },
});

