import type maplibregl from "maplibre-gl";
import type { Theme } from "./theme";

/** ベースマップ（地理院 最適化ベクトルタイル）のソースID。 */
const BASE_SOURCE = "v";

// ---- 色ユーティリティ（明度反転でダーク化するため） ----

function parseColor(str: string): [number, number, number, number] | null {
  const s = str.trim();
  const rgba =
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(
      s
    );
  if (rgba) {
    return [
      +rgba[1],
      +rgba[2],
      +rgba[3],
      rgba[4] !== undefined ? +rgba[4] : 1,
    ];
  }
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) {
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return [r, g, b, a];
  }
  return null;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [
    Math.round(hue(h + 1 / 3) * 255),
    Math.round(hue(h) * 255),
    Math.round(hue(h - 1 / 3) * 255),
  ];
}

/** 明度を反転して暗色に変換（色相は保持、彩度は少し抑える）。 */
function darkenColor(str: string): string {
  const c = parseColor(str);
  if (!c) return str;
  const [r, g, b, a] = c;
  const [h, s, l] = rgbToHsl(r, g, b);
  const nl = Math.min(0.9, Math.max(0.05, 1 - l));
  const [nr, ng, nb] = hslToRgb(h, s * 0.85, nl);
  return `rgba(${nr},${ng},${nb},${a})`;
}

/** paint 値（色文字列 or 式配列）の中の色文字列だけを再帰的に変換する。 */
function transformValue(v: unknown): unknown {
  if (typeof v === "string") return parseColor(v) ? darkenColor(v) : v;
  if (Array.isArray(v)) return v.map(transformValue);
  return v;
}

/** レイヤーごとの色 paint プロパティのライト値とダーク値の対応。 */
export type BasemapColors = Array<{
  id: string;
  key: string;
  light: unknown;
  dark: unknown;
}>;

/**
 * ベースマップ層の色 paint プロパティを走査して、ライト/ダーク両方の値を作っておく。
 * setStyle でスタイルを差し替えるとランタイム追加のレイヤーや CS立体図 の表示状態・
 * 不透明度が失われるため、色だけを後から差し替えられるようにこの表を持つ。
 * 対象はベースマップ（source "v" と background）だけで、CS立体図や法務省地図などの
 * 重ねものは元の色を保つ。
 */
export function captureBasemapColors(map: maplibregl.Map): BasemapColors {
  const out: BasemapColors = [];
  for (const layer of map.getStyle().layers) {
    const src = (layer as { source?: string }).source;
    if (layer.type !== "background" && src !== BASE_SOURCE) continue;
    const paint = (layer as { paint?: Record<string, unknown> }).paint;
    if (!paint) continue;
    for (const key of Object.keys(paint)) {
      if (!key.includes("color")) continue;
      out.push({
        id: layer.id,
        key,
        light: paint[key],
        dark: transformValue(paint[key]),
      });
    }
  }
  return out;
}

/** 走査済みの対応表を使って背景地図の配色を切り替える。 */
export function applyBasemapTheme(
  map: maplibregl.Map,
  colors: BasemapColors,
  theme: Theme
): void {
  for (const c of colors) {
    if (!map.getLayer(c.id)) continue;
    map.setPaintProperty(c.id, c.key, theme === "dark" ? c.dark : c.light);
  }
}

/** 空・霧もテーマに合わせる（3D地形表示時に効く）。 */
export function applySky(map: maplibregl.Map, theme: Theme): void {
  if (theme === "dark") {
    map.setSky({
      "sky-color": "#0b1220",
      "sky-horizon-blend": 0.7,
      "horizon-color": "#1b2436",
      "horizon-fog-blend": 0.8,
      "fog-color": "#0e1626",
      "fog-ground-blend": 0.9,
      "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 12, 0],
    });
    return;
  }
  map.setSky({
    "sky-color": "#199EF3",
    "sky-horizon-blend": 0.7,
    "horizon-color": "#f0f8ff",
    "horizon-fog-blend": 0.8,
    "fog-color": "#2c7fb8",
    "fog-ground-blend": 0.9,
    "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 12, 0],
  });
}
