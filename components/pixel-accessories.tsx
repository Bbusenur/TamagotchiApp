import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

type Pixel = 0 | 1 | 2 | 3;

function PixelArt({
  pixels,
  size = 4,
  palette,
  style,
}: {
  pixels: Pixel[][];
  size?: number;
  palette: Record<number, string>;
  style?: any;
}) {
  const h = pixels.length;
  const w = pixels[0]?.length ?? 0;
  return (
    <View style={[{ width: w * size, height: h * size }, style]}>
      {pixels.map((row, y) => (
        <View key={`r_${y}`} style={{ flexDirection: "row" }}>
          {row.map((p, x) => (
            <View
              key={`p_${y}_${x}`}
              style={{
                width: size,
                height: size,
                backgroundColor: palette[p] ?? "transparent",
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const ART = {
  hatBlack: {
    pixels: [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 2, 2, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as Pixel[][],
    palette: { 0: "transparent", 1: "#0B1020", 2: "#374151" },
  },
  hatRed: {
    pixels: [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 2, 2, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as Pixel[][],
    palette: { 0: "transparent", 1: "#7F1D1D", 2: "#EF4444" },
  },
  hatBlue: {
    pixels: [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 2, 2, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as Pixel[][],
    palette: { 0: "transparent", 1: "#1E3A8A", 2: "#3B82F6" },
  },
  hatGreen: {
    pixels: [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 2, 2, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as Pixel[][],
    palette: { 0: "transparent", 1: "#14532D", 2: "#22C55E" },
  },
  hatYellow: {
    pixels: [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 2, 2, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ] as Pixel[][],
    palette: { 0: "transparent", 1: "#92400E", 2: "#F59E0B" },
  },
};

type AccKey =
  | "AKS_SAPKA_SIYAH"
  | "AKS_SAPKA_KIRMIZI"
  | "AKS_SAPKA_MAVI"
  | "AKS_SAPKA_YESIL"
  | "AKS_SAPKA_SARI";

const KARE_BY_TUR: Record<string, number> = {
  Balık: 6,
};

// Her türde şapka biraz daha küçük dursun
const HAT_SCALE_BY_TUR: Record<string, number> = {
  Kedi: 0.58,
  Köpek: 0.7,
  Kaplumbağa: 0.4,
  Kuş: 0.55,
  Tavşan: 0.7,
  Balık: 0.32,
};

const BLOCK = 4; // 1 piksel-blok = 4px (aksesuar çizim birimi)

function hatOffsets(deltaRightBlocks: number, deltaDownBlocks: number = 0) {
  // base şapka konumunun üstüne ek kaydırma
  const dx = deltaRightBlocks * BLOCK;
  const dy = deltaDownBlocks * BLOCK;
  return {
    AKS_SAPKA_SIYAH: { left: 12 + dx, top: -8 + dy },
    AKS_SAPKA_KIRMIZI: { left: 12 + dx, top: -8 + dy },
    AKS_SAPKA_MAVI: { left: 12 + dx, top: -8 + dy },
    AKS_SAPKA_YESIL: { left: 12 + dx, top: -8 + dy },
    AKS_SAPKA_SARI: { left: 12 + dx, top: -8 + dy },
  } satisfies Partial<Record<AccKey, { top: number; left: number }>>;
}

const OFFSETS: Record<string, Partial<Record<AccKey, { top: number; left: number }>>> = {
  Kedi: hatOffsets(1.5, 4.2),
  Köpek: hatOffsets(1, 2.1),
  Kaplumbağa: hatOffsets(7, 1.5),
  Kuş: hatOffsets(2.4, 1.5),
  Tavşan: hatOffsets(4.5, 7.2),
  Balık: hatOffsets(2, 2.8),
};

function getOffset(tur: string, key: AccKey) {
  const base: Record<AccKey, { top: number; left: number }> = {
    AKS_SAPKA_SIYAH: { top: -8, left: 12 },
    AKS_SAPKA_KIRMIZI: { top: -8, left: 12 },
    AKS_SAPKA_MAVI: { top: -8, left: 12 },
    AKS_SAPKA_YESIL: { top: -8, left: 12 },
    AKS_SAPKA_SARI: { top: -8, left: 12 },
  };
  return OFFSETS[tur]?.[key] ?? base[key];
}

export function AccessoryLayer({ tur, aksesuarlar }: { tur: string; aksesuarlar: string[] }) {
  const baseScale = (KARE_BY_TUR[tur] ?? 4) / 4;
  const scale = baseScale * (HAT_SCALE_BY_TUR[tur] ?? 0.82);
  const list = useMemo(() => (aksesuarlar || []) as AccKey[], [aksesuarlar]);

  const hatKey =
    (list.includes("AKS_SAPKA_SIYAH") && "AKS_SAPKA_SIYAH") ||
    (list.includes("AKS_SAPKA_KIRMIZI") && "AKS_SAPKA_KIRMIZI") ||
    (list.includes("AKS_SAPKA_MAVI") && "AKS_SAPKA_MAVI") ||
    (list.includes("AKS_SAPKA_YESIL") && "AKS_SAPKA_YESIL") ||
    (list.includes("AKS_SAPKA_SARI") && "AKS_SAPKA_SARI") ||
    null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {hatKey && (
        <View style={[styles.item, getOffset(tur, hatKey), { transform: [{ scale }] }]}>
          <PixelArt
            pixels={
              hatKey === "AKS_SAPKA_SIYAH"
                ? ART.hatBlack.pixels
                : hatKey === "AKS_SAPKA_KIRMIZI"
                  ? ART.hatRed.pixels
                  : hatKey === "AKS_SAPKA_MAVI"
                    ? ART.hatBlue.pixels
                    : hatKey === "AKS_SAPKA_YESIL"
                      ? ART.hatGreen.pixels
                      : ART.hatYellow.pixels
            }
            palette={
              hatKey === "AKS_SAPKA_SIYAH"
                ? ART.hatBlack.palette
                : hatKey === "AKS_SAPKA_KIRMIZI"
                  ? ART.hatRed.palette
                  : hatKey === "AKS_SAPKA_MAVI"
                    ? ART.hatBlue.palette
                    : hatKey === "AKS_SAPKA_YESIL"
                      ? ART.hatGreen.palette
                      : ART.hatYellow.palette
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    position: "absolute",
  },
});

