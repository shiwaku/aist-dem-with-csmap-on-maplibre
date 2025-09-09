// Protocolの設定
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

// マップの初期化
const map = new maplibregl.Map({
  container: "map",
  style: "./style/mono.json",
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

//ジオコーダー（国土地理院 地名検索API）
var geocoder_api = {
  forwardGeocode: async (config) => {
    const features = [];
    const Text_Prefix = config.query.substr(0, 3);
    try {
      let request =
        "https://msearch.gsi.go.jp/address-search/AddressSearch?q=" +
        config.query;
      const response = await fetch(request);
      const geojson = await response.json();

      for (var i = 0; i < geojson.length; i++) {
        if (geojson[i].properties.title.indexOf(Text_Prefix) !== -1) {
          let point = {
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
    return {
      features: features,
    };
  },
};
map.addControl(
  new MaplibreGeocoder(geocoder_api, { maplibregl: maplibregl }),
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

// スケール表示
map.addControl(
  new maplibregl.ScaleControl({
    maxWidth: 200,
    unit: "metric",
  })
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
    exaggeration: 1, // 標高を強調する倍率
  })
);

// TerraDraw
const draw = new MaplibreTerradrawControl.MaplibreTerradrawControl({
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

// CS立体図レイヤー名セット
const csLayerIds = [
  "nagano-cs",
  "nagano-05m-cs",
  "hiroshima-cs",
  "hiroshima-05m-cs",
  "hiroshima-1m-cs",
  "okayama-cs",
  "okayama-2024-cs",
  "ehime-cs",
  "kochi-cs",
  "fukushima-cs",
  "kumamoto-oita-cs",
  "hyogo-cs",
  "tochigi-cs",
  "shizuoka-cs",
  "gifu-cs",
  "osaka-cs",
  "nagaoka-cs",
  "noto-cs",
  "noto-cs-final",
  "saitama-cs",
  "tokyo-23ku-cs",
  "tokyo-tama-cs",
  "tokyo-shima-01-cs",
  "tokyo-shima-02-cs",
  "tokyo-shima-03-cs",
  "tokyo-shima-04-cs",
  "tokyo-shima-05-cs",
  "tokyo-shima-06-cs",
  "wakayama-cs",
  "kanagawa-cs",
  "tottori-cs",
  "tottori-2025-cs",
  "shiga-cs",
  "kyoto-cs",
  "yamanashi-cs",
  "toyama-cs",
  "miyagi-cs",
];

// その他レイヤー名セット
const otherlayerIds = ["fude-polygon", "fude-line", "plateau-bldg", "yamajiro"];

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

  // 産総研 シームレス標高タイルセット
  // map.setTerrain({ 'source': 'aist-dem-terrain-rgb', 'exaggeration': 1 });

  // 法務省地図ソース
  map.addSource("moj-xml", {
    type: "vector",
    // url: "pmtiles://https://data.source.coop/smartmaps/amx-2024-04/MojMap_amx_2024.pmtiles",
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
    layout: {
      visibility: "none",
    },
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
    layout: {
      visibility: "none",
    },
    paint: {
      "line-color": "#FF3232",
      "line-width": 1,
    },
  });

  // 3D都市モデルPLATEAU建築物モデルソース
  map.addSource("plateau-bldg", {
    type: "vector",
    // url: "pmtiles://https://shiworks.xsrv.jp/pmtiles-data/plateau/PLATEAU_2022_LOD1.pmtiles",
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
    layout: {
      visibility: "none",
    },
    paint: {
      "fill-extrusion-color": "#FFFFFF",
      "fill-extrusion-opacity": 0.7,
      "fill-extrusion-height": ["get", "measured_height"],
    },
  });

  // 山城攻城記ソース
  map.addSource("yamajiro", {
    type: "geojson",
    data: "https://shiwaku.github.io/yamajiro-geojson/castles-data.geojson",
    attribution: '<a href="https://gosenzo.net/yamajiro/">山城攻城記</a>',
  });

  /*
  // 山城攻城記レイヤ
  map.addLayer({
    id: "yamajiro",
    source: "yamajiro",
    type: "circle",
    paint: {
      "circle-radius": 10,
      "circle-color": "#0000ff",
      "circle-stroke-width": 1,
      "circle-stroke-color": "#ffffff"
    },
    "layout": {
      "visibility": "none",
    },
  });
  */

  // 山城アイコン読み込み
  const image = await map.loadImage("./PNG/shiro25x25r.png");
  map.addImage("yamajiro-icon", image.data);

  // 山城アイコンレイヤー
  map.addLayer({
    id: "yamajiro",
    type: "symbol",
    source: "yamajiro",
    layout: {
      "icon-image": "yamajiro-icon",
      // 'icon-size': 0.7,
      "icon-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        5,
        0.7,
        10,
        0.9,
        15,
        1.1,
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
      "text-font": ["NotoSansJP-Regular", "NotoSerifJP-Medium"],
      "text-anchor": "bottom",
      "text-offset": [0, -2],
      // 'text-allow-overlap': true,
      "text-allow-overlap": ["step", ["zoom"], false, 16, true],
      visibility: "none",
    },
    paint: {
      "text-color": "rgb(255,0,0)",
      "text-halo-color": "rgb(255,255,255)",
      "text-halo-width": 1.5,
    },
  });

  // スライダーでCS立体図の不透明度を制御
  const csSlider = document.getElementById("cs-slider-opacity");
  const csValueLabel = document.getElementById("cs-slider-opacity-value");

  csSlider.addEventListener("input", (e) => {
    const value = Number(e.target.value);
    const opacity = value / 100;
    csLayerIds.forEach((layerId) => {
      map.setPaintProperty(layerId, "raster-opacity", opacity);
    });

    csValueLabel.textContent = `${value}%`;
  });

  // Skyレイヤ
  map.setSky({
    "sky-color": "#199EF3",
    "sky-horizon-blend": 0.7,
    "horizon-color": "#f0f8ff",
    "horizon-fog-blend": 0.8,
    "fog-color": "#2c7fb8",
    "fog-ground-blend": 0.9,
    "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 12, 0],
  });

  // レイヤー切り替え
  setupLayerSwitches();

  // 初期座標を表示
  updateCoordsDisplay();

  // ポップアップ表示
  otherlayerIds.forEach(addPopupHandler);

  // map.showTileBoundaries = true; // タイル境界
});

// 地図の中心座標と標高を表示する関数
function updateCoordsDisplay() {
  let center = map.getCenter();
  let lat = center.lat.toFixed(5);
  let lng = center.lng.toFixed(5);
  let zoomLevel = Math.trunc(map.getZoom());
  // let elevTile = 'https://tiles.gsj.jp/tiles/elev/mixed/{z}/{y}/{x}.png'; // 統合DEM
  let elevTile = "https://tiles.gsj.jp/tiles/elev/land/{z}/{y}/{x}.png"; // 陸域統合DEM

  if (zoomLevel > 15) {
    document.getElementById("coords").innerHTML =
      "中心座標: " +
      lat +
      ", " +
      lng +
      "<br>" +
      "ズームレベル: " +
      map.getZoom().toFixed(2) +
      "<br>" +
      "標高(ZL15以下): 取得できません<br>" +
      '<a href="https://www.google.com/maps?q=' +
      lat +
      "," +
      lng +
      '&hl=ja" target="_blank">🌎GoogleMaps</a>' +
      " " +
      '<a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' +
      lat +
      "," +
      lng +
      '&hl=ja" target="_blank">📷StreetView</a>';
  } else {
    getNumericalValue(elevTile, lat, lng, zoomLevel, 0.01, 0, -(2 ** 23)).then(
      function (v) {
        document.getElementById("coords").innerHTML =
          "中心座標: " +
          lat +
          ", " +
          lng +
          "<br>" +
          "ズームレベル: " +
          map.getZoom().toFixed(2) +
          "<br>" +
          "標高(ZL15以下):" +
          (isNaN(v) ? "取得できません" : v.toFixed(2) + "m") +
          "<br>" +
          '<a href="https://www.google.com/maps?q=' +
          lat +
          "," +
          lng +
          '&hl=ja" target="_blank">🌎GoogleMaps</a>' +
          " " +
          '<a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' +
          lat +
          "," +
          lng +
          '&hl=ja" target="_blank">📷StreetView</a>';
      }
    );
  }
}

// 地図が移動したら中心の座標を更新
map.on("move", function () {
  updateCoordsDisplay(); // 座標を更新
});

// レイヤー切り替え
function setupLayerSwitches() {
  document.querySelectorAll(".layer-switch").forEach((input) => {
    input.addEventListener("change", () => {
      input.dataset.layer
        .split(",")
        .map((id) => id.trim())
        .forEach((layer) => {
          map.setLayoutProperty(
            layer,
            "visibility",
            input.checked ? "visible" : "none"
          );
        });
    });
  });
}

/*
// 地すべり地形分布図凡例

// イベントリスナーを追加
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("open-legend-landslide")
    .addEventListener("click", OpenLegendRoad);
});

function OpenLegendRoad() {
  // 凡例の内容を含むウェブページのURL
  var legendUrl = "./PNG/legend-landslide.png";

  // 新しいウィンドウを開く
  window.open(legendUrl, "Legend", "width=1800,height=1200");
}
*/

function addPopupHandler(layerId) {
  map.on("click", layerId, (e) => {
    const feature = e.features[0];
    const coords = [e.lngLat.lng, e.lngLat.lat]; // ← これだけで OK
    createPopup(coords, feature.properties);
  });
}

/**
プロパティからテーブルを生成し、Popup を表示
 */
function createPopup(coordinates, properties) {
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

/// ****************
// latLngToTile 緯度経度をタイル座標に変換する関数
//  latLng: 緯度経度オブジェクト（lat,lngフィールドを持ちます）
//  z: ズームレベル
//  戻り値: タイル座標オブジェクト（x, yフィールドを持ちます)
//    ※通常，地図ライブラリ内に同様の関数が用意されています．
/// ****************
function latLngToTile(lat, lng, z) {
  // ズームレベル z におけるタイルの総数
  const n = Math.pow(2, z);
  // 経度 lng → タイル X 座標
  const x = ((lng / 180 + 1) * n) / 2;
  // 緯度 lat → タイル Y 座標
  // (メルカトル投影による変換)
  const latRad = (lat * Math.PI) / 180; // 緯度をラジアンに変換
  const y =
    (n * (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI)) / 2;

  return { x, y };
}

/// ****************
// getNumericalValue タイルURL，座標，ズームレベルを指定して数値を取得する関数
//	url: タイル画像のURLテンプレート．
//		ズームレベル，X, Y座標をそれぞれ{z},{x},{y}として埋め込む
//	ll: 緯度経度オブジェクト（lat,lngフィールドを持ちます）
//  z:　ズームレベル
//  factor: 数値を求めるときに使用する係数，デフォルト1
//  offset: 数値を求めるときに使用するオフセット，デフォルト0
//  invalid: 追加無効値を相当する数値で指定．デフォルトは指定なし
//  戻り値: 成功時に数値を受け取るプロミス．無効値の場合はNaNを受け取ります
/// ****************
function getNumericalValue(
  url,
  lat,
  lng,
  z,
  factor = 1,
  offset = 0,
  invalid = undefined
) {
  console.log("z=" + z + " " + "lat=" + lat + " " + "lng=" + lng);
  return new Promise(function (resolve, reject) {
    const p = latLngToTile(lat, lng, z),
      x = Math.floor(p.x), // タイルX座標
      y = Math.floor(p.y), // タイルY座標
      i = (p.x - x) * 256, // タイル内i座標
      j = (p.y - y) * 256, // タイル内j座標
      img = new Image();

    console.log("タイルURL=" + url);
    // console.log("z=" + z + " " + "lat=" + lat + " " + "lng=" + lng);
    console.log("タイルX座標=" + x + " " + "タイルY座標=" + y);

    img.crossOrigin = "anonymous"; // 画像ファイルからデータを取り出すために必要です
    img.onload = function () {
      const canvas = document.createElement("canvas"),
        context = canvas.getContext("2d");
      let r2, v, data;

      canvas.width = 1;
      canvas.height = 1;
      context.drawImage(img, i, j, 1, 1, 0, 0, 1, 1);
      data = context.getImageData(0, 0, 1, 1).data;
      r2 = data[0] < 2 ** 7 ? data[0] : data[0] - 2 ** 8;
      v = r2 * 2 ** 16 + data[1] * 2 ** 8 + data[2];
      if (data[3] !== 255 || (invalid != undefined && v == invalid)) {
        v = NaN;
      }
      resolve(v * factor + offset);
    };
    img.onerror = function () {
      reject(null);
    };
    img.src = url.replace("{z}", z).replace("{y}", y).replace("{x}", x);
  });
}
