import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";
import "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css";
import { CS_LAYERS, CS_LAYER_IDS, OTHER_LAYERS, type LayerDef } from "./layers";
import { applyThemeAttr, initialTheme, type Theme } from "./theme";
import {
  applyBasemapTheme,
  applySky,
  captureBasemapColors,
  type BasemapColors,
} from "./basemap-theme";
import "./style.css";

const isMobile = window.matchMedia("(max-width: 640px)").matches;

// テーマは地図生成前に反映しておく（パネルの初期描画がちらつかないように）
let theme: Theme = initialTheme();
applyThemeAttr(theme);

// 背景地図のライト/ダーク配色の対応表（スタイル読み込み後に作る）
let basemapColors: BasemapColors = [];

// Protocolの設定
const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

// マップの初期化
const map = new maplibregl.Map({
  container: "map",
  style: `${import.meta.env.BASE_URL}style/pale.json`,
  zoom: 9.62,
  minZoom: 0,
  maxZoom: 23,
  pitch: 0,
  bearing: 0,
  maxPitch: 85,
  center: [139.1005, 36.0306],
  hash: true,
  attributionControl: false,
});

// 開発時のみコンソールから地図を触れるようにする（本番ビルドでは除去される）
if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__map = map;
}

// ジオコーダー（国土地理院 地名検索API）
const geocoderApi = {
  forwardGeocode: async (config: { query: string }) => {
    const features: object[] = [];
    const textPrefix = config.query.substring(0, 3);
    try {
      const request =
        "https://msearch.gsi.go.jp/address-search/AddressSearch?q=" +
        config.query;
      const response = await fetch(request);
      const geojson = await response.json();

      for (let i = 0; i < geojson.length; i++) {
        if (geojson[i].properties.title.indexOf(textPrefix) !== -1) {
          const point = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: geojson[i].geometry.coordinates,
            },
            place_name: geojson[i].properties.title,
            properties: geojson[i].properties,
            text: geojson[i].properties.title,
            place_type: ["place"],
            center: geojson[i].geometry.coordinates,
          };
          features.push(point);
        }
      }
    } catch (e) {
      console.error(`Failed to forwardGeocode with error: ${e}`);
    }
    return { features };
  },
};
map.addControl(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new MaplibreGeocoder(geocoderApi as any, { maplibregl }),
  "top-right"
);

// ズーム・回転
map.addControl(new maplibregl.NavigationControl());

// フルスクリーンモードのオンオフ
map.addControl(new maplibregl.FullscreenControl());

// 現在位置表示
map.addControl(
  new maplibregl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: false,
    },
    fitBoundsOptions: { maxZoom: 18 },
    trackUserLocation: true,
    showUserLocation: true,
  })
);

// スケール表示（左パネルが全高のため右下へ寄せる）
map.addControl(
  new maplibregl.ScaleControl({
    maxWidth: 200,
    unit: "metric",
  }),
  "bottom-right"
);

// Attributionを折りたたみ表示
map.addControl(
  new maplibregl.AttributionControl({
    compact: true,
    customAttribution:
      '（<a href="https://twitter.com/shi__works" target="_blank">X(旧Twitter)</a> | <a href="https://github.com/shiwaku/aist-dem-with-cs-map-on-maplibre" target="_blank">GitHub</a>） ',
  })
);

// 3D地形コントロール表示
map.addControl(
  new maplibregl.TerrainControl({
    source: "aist-dem-terrain-rgb",
    exaggeration: 1,
  })
);

// TerraDraw
const draw = new MaplibreTerradrawControl({
  modes: [
    "render",
    "point",
    "linestring",
    "polygon",
    "rectangle",
    "circle",
    "freehand",
    "angled-rectangle",
    "sensor",
    "sector",
    "select",
    "delete-selection",
    "delete",
    "download",
  ],
  open: false,
});
map.addControl(draw, "top-right");

// ポップアップ対象（属性を持つレイヤーのみ。ラベルレイヤーは除く）
const POPUP_LAYER_IDS: string[] = [
  "fude-polygon",
  "fude-line",
  "plateau-bldg",
  "yamajiro",
];

map.on("load", async () => {
  // 産総研 シームレス標高タイルソース
  map.addSource("aist-dem-terrain-rgb", {
    type: "raster-dem",
    tiles: [
      "https://gbank.gsj.jp/seamless/elev/terrainRGB/land/{z}/{y}/{x}.png",
    ],
    attribution:
      '<a href="https://tiles.gsj.jp/tiles/elev/tiles.html" target="_blank">産総研 シームレス標高タイル(陸域統合DEM)</a>',
    tileSize: 256,
  });

  // 法務省地図ソース
  map.addSource("moj-xml", {
    type: "vector",
    url: "pmtiles://https://pmtiles-data.s3.ap-northeast-1.amazonaws.com/moj-xml/MojMap_amx_2024.pmtiles",
    attribution:
      '<a href="https://github.com/amx-project">法務省地図XML（amx-project）</a>',
  });

  // 法務省地図レイヤー（ポリゴン）
  map.addLayer({
    id: "fude-polygon",
    source: "moj-xml",
    "source-layer": "fude",
    type: "fill",
    layout: { visibility: "none" },
    paint: {
      "fill-color": "#FFF2CC",
      "fill-opacity": 0.2,
    },
  });

  // 法務省地図レイヤー（ライン）
  map.addLayer({
    id: "fude-line",
    source: "moj-xml",
    "source-layer": "fude",
    type: "line",
    layout: { visibility: "none" },
    paint: {
      "line-color": "#FF3232",
      "line-width": 1,
    },
  });

  // 3D都市モデルPLATEAU建築物モデルソース
  map.addSource("plateau-bldg", {
    type: "vector",
    url: "pmtiles://https://pmtiles-data.s3.ap-northeast-1.amazonaws.com/plateau/PLATEAU_2023_LOD0.pmtiles",
    minzoom: 14,
    maxzoom: 16,
    attribution:
      '<a href="https://www.geospatial.jp/ckan/dataset/plateau">国土交通省3D都市モデルPLATEAU建築物</a>',
  });

  // 3D都市モデルPLATEAU建築物モデルレイヤ
  map.addLayer({
    id: "plateau-bldg",
    source: "plateau-bldg",
    "source-layer": "PLATEAU_2023_LOD0",
    minzoom: 14,
    maxzoom: 23,
    type: "fill-extrusion",
    layout: { visibility: "none" },
    paint: {
      "fill-extrusion-color": "#FFFFFF",
      "fill-extrusion-opacity": 0.7,
      "fill-extrusion-height": ["get", "measured_height"],
    },
  });

  // 山城攻城記ソース
  // 配信元の geojson には欠損値が標準外の裸 NaN リテラルとして出力されており、
  // 1個でもファイル全体が JSON.parse に失敗して全城が表示されなくなる。
  // MapLibre に URL を渡さず、取得後に null へ置換してから読み込む。
  // 取得はパネル構築を待たせない（失敗してもUI全体を巻き込まないよう後から setData する）
  map.addSource("yamajiro", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
    attribution: '<a href="https://gosenzo.net/yamajiro/">山城攻城記</a>',
  });
  void fetchYamajiro()
    .then((data) => {
      (map.getSource("yamajiro") as maplibregl.GeoJSONSource).setData(data);
    })
    .catch((e) => {
      console.error("山城レイヤーを読み込めませんでした", e);
    });

  // 山城アイコン読み込み
  const image = await map.loadImage(
    `${import.meta.env.BASE_URL}PNG/shiro25x25r.png`
  );
  map.addImage("yamajiro-icon", image.data);

  // 山城アイコンレイヤー
  map.addLayer({
    id: "yamajiro",
    type: "symbol",
    source: "yamajiro",
    layout: {
      "icon-image": "yamajiro-icon",
      "icon-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        5, 0.7,
        10, 0.9,
        15, 1.1,
      ],
      "icon-allow-overlap": true,
      "icon-anchor": "bottom",
      visibility: "none",
    },
  });

  // 山城ラベルレイヤー
  map.addLayer({
    id: "yamajiro-label",
    source: "yamajiro",
    type: "symbol",
    minzoom: 12,
    layout: {
      "text-field": ["get", "城名"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 14, 12, 16, 14],
      // 合成フォントスタック（"A,B"）は地理院グリフサーバが404を返し、
      // 同一ソースの yamajiro アイコンごとシンボル配置が落ちるため単一指定にする
      "text-font": ["NotoSansJP-Regular"],
      "text-anchor": "bottom",
      "text-offset": [0, -2],
      "text-allow-overlap": ["step", ["zoom"], false, 16, true],
      visibility: "none",
    },
    paint: {
      "text-color": "rgb(255,0,0)",
      "text-halo-color": "rgb(255,255,255)",
      "text-halo-width": 1.5,
    },
  });

  // 背景地図の配色対応表を作る。CS立体図など重ねものを追加した後に走査しても
  // ベースマップ層（source "v" と background）だけが対象になる。
  basemapColors = captureBasemapColors(map);
  applyBasemapTheme(map, basemapColors, theme);
  applySky(map, theme);

  // パネル（レイヤートグル・不透明度・開閉・テーマ）を組み立てる
  setupPanel();

  // 初期座標を表示
  updateCoordsDisplay();

  // ポップアップ表示
  POPUP_LAYER_IDS.forEach(addPopupHandler);
});

// 山城攻城記の geojson を取得する関数
// 値の位置に現れる裸の NaN のみを null に置換する（"NaN県" のような文字列は壊さない）
const YAMAJIRO_URL =
  "https://shiwaku.github.io/yamajiro-geojson/castles-data.geojson";

async function fetchYamajiro(): Promise<GeoJSON.FeatureCollection> {
  const res = await fetch(YAMAJIRO_URL);
  if (!res.ok) throw new Error(`山城geojsonの取得に失敗: HTTP ${res.status}`);
  const text = await res.text();
  const sanitized = text.replace(/([:,[]\s*)NaN(?=\s*[,\]}])/g, "$1null");
  return JSON.parse(sanitized) as GeoJSON.FeatureCollection;
}

// 地図の中心座標と標高を表示する関数
function updateCoordsDisplay(): void {
  const center = map.getCenter();
  const lat = center.lat.toFixed(4);
  const lng = center.lng.toFixed(4);
  const zoomLevel = Math.trunc(map.getZoom());
  const elevTile = "https://tiles.gsj.jp/tiles/elev/land/{z}/{y}/{x}.png";

  const coordsEl = document.getElementById("coords")!;

  if (zoomLevel > 15) {
    coordsEl.innerHTML =
      `中心座標: ${lat}, ${lng}<br>` +
      `ズームレベル: ${map.getZoom().toFixed(2)}<br>` +
      `標高(ZL15以下): 取得できません<br>` +
      `<a href="https://www.google.com/maps?q=${lat},${lng}&hl=ja" target="_blank">🌎GoogleMaps</a> ` +
      `<a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}&hl=ja" target="_blank">📷StreetView</a>`;
  } else {
    getNumericalValue(elevTile, Number(lat), Number(lng), zoomLevel, 0.01, 0, -(2 ** 23)).then(
      (v) => {
        coordsEl.innerHTML =
          `中心座標: ${lat}, ${lng}<br>` +
          `ズームレベル: ${map.getZoom().toFixed(2)}<br>` +
          `標高(ZL15以下): ${isNaN(v) ? "取得できません" : v.toFixed(2) + "m"}<br>` +
          `<a href="https://www.google.com/maps?q=${lat},${lng}&hl=ja" target="_blank">🌎GoogleMaps</a> ` +
          `<a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}&hl=ja" target="_blank">📷StreetView</a>`;
      }
    );
  }
}

// 地図が移動したら中心の座標を更新
map.on("move", () => {
  updateCoordsDisplay();
});

// =============================================
// パネル
// =============================================
function setLayerVisible(def: LayerDef, on: boolean): void {
  def.on = on;
  for (const id of def.ids) {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, "visibility", on ? "visible" : "none");
    }
  }
}

/** レイヤー定義から丸トグルの行を作って container に並べる。 */
function buildToggles(container: HTMLElement, defs: LayerDef[]): void {
  for (const def of defs) {
    const label = document.createElement("label");
    label.className = "toggle";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = def.on === true;
    input.addEventListener("change", () => setLayerVisible(def, input.checked));

    const sw = document.createElement("span");
    sw.className = "switch";

    const text = document.createElement("span");
    text.className = "t-label";
    text.textContent = def.name;

    // input → .switch → .t-label の順序は CSS の兄弟セレクタが前提にしている
    label.append(input, sw, text);
    container.append(label);

    // style JSON 側の初期 visibility と定義を必ず一致させる
    setLayerVisible(def, input.checked);
  }
}

function setAll(container: HTMLElement, defs: LayerDef[], on: boolean): void {
  const inputs = container.querySelectorAll<HTMLInputElement>("input");
  defs.forEach((def, i) => {
    const input = inputs[i];
    if (input) input.checked = on;
    setLayerVisible(def, on);
  });
}

function setupPanel(): void {
  const csBox = document.getElementById("cs-layers")!;
  const otherBox = document.getElementById("other-layers")!;
  buildToggles(csBox, CS_LAYERS);
  buildToggles(otherBox, OTHER_LAYERS);

  document
    .getElementById("cs-all-on")!
    .addEventListener("click", () => setAll(csBox, CS_LAYERS, true));
  document
    .getElementById("cs-all-off")!
    .addEventListener("click", () => setAll(csBox, CS_LAYERS, false));
  document
    .getElementById("other-all-on")!
    .addEventListener("click", () => setAll(otherBox, OTHER_LAYERS, true));
  document
    .getElementById("other-all-off")!
    .addEventListener("click", () => setAll(otherBox, OTHER_LAYERS, false));

  // CS立体図の不透明度（各県のタイルは地域が重ならないので一括制御でよい）
  const slider = document.getElementById("cs-opacity") as HTMLInputElement;
  const sliderValue = document.getElementById("cs-opacity-value")!;
  slider.addEventListener("input", () => {
    const value = Number(slider.value);
    sliderValue.textContent = `${value}%`;
    for (const id of CS_LAYER_IDS) {
      if (map.getLayer(id)) {
        map.setPaintProperty(id, "raster-opacity", value / 100);
      }
    }
  });

  // パネル開閉
  const panel = document.getElementById("panel")!;
  const collapseBtn = document.getElementById("collapse-btn")!;
  const renderCollapseBtn = (): void => {
    collapseBtn.textContent = panel.classList.contains("collapsed") ? "▾" : "▴";
  };
  collapseBtn.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    renderCollapseBtn();
  });
  if (isMobile) panel.classList.add("collapsed");
  renderCollapseBtn();

  // テーマ切替（パネル・ポップアップ・コントロール・背景地図の配色が追従する）
  const themeBtn = document.getElementById("theme-btn")!;
  const renderThemeBtn = (): void => {
    themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  };
  themeBtn.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    applyThemeAttr(theme);
    renderThemeBtn();
    applyBasemapTheme(map, basemapColors, theme);
    applySky(map, theme);
  });
  renderThemeBtn();
}

function addPopupHandler(layerId: string): void {
  map.on("click", layerId, (e) => {
    const feature = e.features![0];
    const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    createPopup(coords, feature.properties as Record<string, unknown>);
  });
}

function createPopup(
  coordinates: [number, number],
  properties: Record<string, unknown>
): void {
  const table = document.createElement("table");
  table.className = "popup-table";
  table.innerHTML =
    "<tr><th>属性</th><th>値</th></tr>" +
    Object.entries(properties)
      .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
      .join("");

  new maplibregl.Popup({ maxWidth: "300px" })
    .setLngLat(coordinates)
    .setDOMContent(table)
    .addTo(map);
}

// 緯度経度をタイル座標に変換する関数
function latLngToTile(
  lat: number,
  lng: number,
  z: number
): { x: number; y: number } {
  const n = Math.pow(2, z);
  const x = ((lng / 180 + 1) * n) / 2;
  const latRad = (lat * Math.PI) / 180;
  const y =
    (n * (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI)) /
    2;
  return { x, y };
}

// タイルURL・座標・ズームレベルから数値を取得する関数
function getNumericalValue(
  url: string,
  lat: number,
  lng: number,
  z: number,
  factor = 1,
  offset = 0,
  invalid: number | undefined = undefined
): Promise<number> {
  return new Promise((resolve, reject) => {
    const p = latLngToTile(lat, lng, z);
    const x = Math.floor(p.x);
    const y = Math.floor(p.y);
    const i = (p.x - x) * 256;
    const j = (p.y - y) * 256;
    const img = new Image();

    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.width = 1;
      canvas.height = 1;
      context.drawImage(img, i, j, 1, 1, 0, 0, 1, 1);
      const data = context.getImageData(0, 0, 1, 1).data;
      const r2 = data[0] < 2 ** 7 ? data[0] : data[0] - 2 ** 8;
      let v = r2 * 2 ** 16 + data[1] * 2 ** 8 + data[2];
      if (data[3] !== 255 || (invalid !== undefined && v === invalid)) {
        v = NaN;
      }
      resolve(v * factor + offset);
    };
    img.onerror = () => {
      reject(null);
    };
    img.src = url
      .replace("{z}", String(z))
      .replace("{y}", String(y))
      .replace("{x}", String(x));
  });
}
