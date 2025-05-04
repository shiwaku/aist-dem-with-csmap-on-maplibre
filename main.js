// Protocolの設定
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

// マップの初期化
const map = new maplibregl.Map({
  container: "map",
  style: "./style/mono.json",
  zoom: 9.39,
  minZoom: 0,
  maxZoom: 23,
  pitch: 0,
  bearing: 0,
  maxPitch: 85,
  center: [137.2426, 36.6161],
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
    source: 'aist-dem-terrain-rgb',
    exaggeration: 1 // 標高を強調する倍率
  })
);

map.on("load", () => {
  // 産総研 シームレス標高タイルソース
  map.addSource("aist-dem-terrain-rgb", {
    type: 'raster-dem',
    tiles: ["https://gbank.gsj.jp/seamless/elev/terrainRGB/land/{z}/{y}/{x}.png"],
    attribution: '<a href="https://tiles.gsj.jp/tiles/elev/tiles.html" target="_blank">産総研 シームレス標高タイル(陸域統合DEM)</a>',
    tileSize: 256
  });

  // 産総研 シームレス標高タイルセット
  // map.setTerrain({ 'source': 'aist-dem-terrain-rgb', 'exaggeration': 1 });

  // 法務省地図XML（PMTiles）ソース
  map.addSource("moj-xml", {
    type: "vector",
    url: "pmtiles://https://data.source.coop/smartmaps/amx-2024-04/MojMap_amx_2024.pmtiles",
    // url: "pmtiles://https://pmtiles-data.s3.ap-northeast-1.amazonaws.com/moj-xml/MojMap_amx_2024.pmtiles",
    attribution: '<a href="https://github.com/amx-project">法務省地図XML（amx-project）</a>'
  });

  // 筆レイヤ（ポリゴン）
  map.addLayer({
    "id": "fude-polygon",
    "source": "moj-xml",
    "source-layer": "fude",
    "type": "fill",
    "layout": {
      "visibility": "none",
    },
    "paint": {
      'fill-color': '#FFF2CC',
      'fill-opacity': 0.2
    }
  });

  // 筆レイヤ（ライン）
  map.addLayer({
    "id": "fude-line",
    "source": "moj-xml",
    "source-layer": "fude",
    "type": "line",
    "layout": {
      "visibility": "none",
    },
    "paint": {
      'line-color': '#FF3232',
      'line-width': 1
    }
  });

  // 3D都市モデルPLATEAU建築物モデル（PMTiles）ソース
  map.addSource("plateau-lod1", {
    type: "vector",
    url: "pmtiles://https://shiworks.xsrv.jp/pmtiles-data/plateau/PLATEAU_2022_LOD1.pmtiles",
    // url: "pmtiles://https://pmtiles-data.s3.ap-northeast-1.amazonaws.com/plateau/PLATEAU_2022_LOD1.pmtiles",
    minzoom: 16,
    maxzoom: 16,
    attribution:
      '<a href="https://www.geospatial.jp/ckan/dataset/plateau">国土交通省 3D都市モデルPLATEAU（建築物LOD1）</a>',
  });

  // 3D都市モデルPLATEAU建築物モデル（PMTiles）レイヤ
  map.addLayer({
    id: "plateau-lod1",
    source: "plateau-lod1",
    "source-layer": "PLATEAU",
    minzoom: 14,
    maxzoom: 23,
    type: "fill-extrusion",
    layout: {
      visibility: "none",
    },
    paint: {
      "fill-extrusion-color": "#FFFFFF",
      "fill-extrusion-opacity": 0.7,
      "fill-extrusion-height": ["get", "measuredHeight"],
    },
  });

  const csLayerIds = [
    "nagano-cs",
    "hiroshima-cs",
    "hiroshima-05m-cs",
    "hiroshima-1m-cs",
    "okayama-cs",
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
    "kyoto-cs",
    "yamanashi-cs",
    "toyama-cs",
  ];

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

  // スライダーで陰影起伏図の不透明度を制御
  const hillshade_sliderOpactiy = document.getElementById(
    "hillshade-slider-opacity"
  );
  const hillshade_sliderOpactiyValue = document.getElementById(
    "hillshade-slider-opacity-value"
  );

  hillshade_sliderOpactiy.addEventListener("input", (e) => {
    map.setPaintProperty(
      "hillshade",
      "raster-opacity",
      parseInt(e.target.value, 10) / 100
    );
    hillshade_sliderOpactiyValue.textContent = e.target.value + "%";
  });

  // Skyレイヤ
  map.setSky({
    "sky-color": "#199EF3",
    "sky-horizon-blend": 0.7,
    "horizon-color": "#f0f8ff",
    "horizon-fog-blend": 0.8,
    "fog-color": "#2c7fb8",
    "fog-ground-blend": 0.9,
    "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 12, 0]
  });

  updateCoordsDisplay(); // 初期座標を表示

  // map.showTileBoundaries = true; // タイル境界

});

// 地図の中心座標と標高を表示する関数
/*
function updateCoordsDisplay() {
  let center = map.getCenter();
  let lat = center.lat.toFixed(5);
  let lng = center.lng.toFixed(5);
  // let elevTile = 'https://tiles.gsj.jp/tiles/elev/mixed/{z}/{y}/{x}.png' // 統合DEM
  let elevTile = 'https://tiles.gsj.jp/tiles/elev/land/{z}/{y}/{x}.png' // 陸域統合DEM
  getNumericalValue(elevTile, lat, lng, Math.trunc(map.getZoom()), 0.01, 0, -(2 ** 23)).then(function (v) {
    document.getElementById("coords").innerHTML =
      "中心座標: " + lat + ", " + lng + "<br>" +
      "標高(ZL=15以下): " + ((isNaN(v)) ? '取得できません' : v.toFixed(2) + 'm') + "<br>" +
      '<a href="https://www.google.com/maps?q=' + lat + "," + lng + '&hl=ja" target="_blank">🌎GoogleMaps</a>' +
      " " + '<a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' + lat + "," + lng + '&hl=ja" target="_blank">📷StreetView</a>';
  });
}
*/

function updateCoordsDisplay() {
  let center = map.getCenter();
  let lat = center.lat.toFixed(5);
  let lng = center.lng.toFixed(5);
  let zoomLevel = Math.trunc(map.getZoom());
  // let elevTile = 'https://tiles.gsj.jp/tiles/elev/mixed/{z}/{y}/{x}.png'; // 統合DEM
  let elevTile = 'https://tiles.gsj.jp/tiles/elev/land/{z}/{y}/{x}.png'; // 陸域統合DEM

  if (zoomLevel > 15) {
    document.getElementById("coords").innerHTML =
      "中心座標: " + lat + ", " + lng + "<br>" +
      "ズームレベル: " + map.getZoom().toFixed(2) + "<br>" +
      "標高(ZL15以下): 取得できません<br>" +
      '<a href="https://www.google.com/maps?q=' + lat + "," + lng + '&hl=ja" target="_blank">🌎GoogleMaps</a>' +
      " " + '<a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' + lat + "," + lng + '&hl=ja" target="_blank">📷StreetView</a>';
  } else {
    getNumericalValue(elevTile, lat, lng, zoomLevel, 0.01, 0, -(2 ** 23)).then(function (v) {
      document.getElementById("coords").innerHTML =
        "中心座標: " + lat + ", " + lng + "<br>" +
        "ズームレベル: " + map.getZoom().toFixed(2) + "<br>" +
        "標高(ZL15以下):" + ((isNaN(v)) ? '取得できません' : v.toFixed(2) + 'm') + "<br>" +
        '<a href="https://www.google.com/maps?q=' + lat + "," + lng + '&hl=ja" target="_blank">🌎GoogleMaps</a>' +
        " " + '<a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' + lat + "," + lng + '&hl=ja" target="_blank">📷StreetView</a>';
    });
  }
}


// 地図が移動したら中心の座標を更新
map.on("move", function () {
  updateCoordsDisplay(); // 座標を更新
});

// ============================== レイヤの表示・非表示切り替え制御 ==============================

// レイヤ表示・非表示切り替え関数
function toggleMapLayerVisibility(checkboxId, layerId) {

  // 特殊な処理が必要なチェックボックスIDを配列で定義
  const specialCheckboxIds = ["tokyo-shima-cs", "moj-xml"];

  if (!specialCheckboxIds.includes(checkboxId)) {
    // 通常の処理
    document
      .getElementById(checkboxId)
      .addEventListener("change", function (e) {
        map.setLayoutProperty(
          layerId,
          "visibility",
          e.target.checked ? "visible" : "none"
        );
      });
  } else {
    // 特殊な処理
    document
      .getElementById(checkboxId)
      .addEventListener("change", function (e) {
        let relatedLayers = [];

        // チェックボックスIDに応じて関連レイヤーを設定
        if (checkboxId === "tokyo-shima-cs") {
          relatedLayers = [
            "tokyo-shima-01-cs",
            "tokyo-shima-02-cs",
            "tokyo-shima-03-cs",
            "tokyo-shima-04-cs",
            "tokyo-shima-05-cs",
            "tokyo-shima-06-cs"
          ];
        } else if (checkboxId === "moj-xml") {
          relatedLayers = ["fude-line", "fude-polygon"];
        }

        // すべての関連レイヤーの visibility を設定
        relatedLayers.forEach(layer => {
          map.setLayoutProperty(
            layer,
            "visibility",
            e.target.checked ? "visible" : "none"
          );
        });
      });
  }
}

// レイヤ表示・非表示切り替え制御
// CS立体図
toggleMapLayerVisibility("fukushima-cs", "fukushima-cs");
toggleMapLayerVisibility("tochigi-cs", "tochigi-cs");
toggleMapLayerVisibility("tokyo-23ku-cs", "tokyo-23ku-cs");
toggleMapLayerVisibility("tokyo-tama-cs", "tokyo-tama-cs");
toggleMapLayerVisibility("tokyo-shima-cs", "tokyo-shima-cs");
toggleMapLayerVisibility("kanagawa-cs", "kanagawa-cs");
toggleMapLayerVisibility("nagaoka-cs", "nagaoka-cs");
toggleMapLayerVisibility("toyama-cs", "toyama-cs");
toggleMapLayerVisibility("noto-cs", "noto-cs");
toggleMapLayerVisibility("noto-cs-final", "noto-cs-final");
toggleMapLayerVisibility("yamanashi-cs", "yamanashi-cs");
toggleMapLayerVisibility("nagano-cs", "nagano-cs");
toggleMapLayerVisibility("gifu-cs", "gifu-cs");
toggleMapLayerVisibility("shizuoka-cs", "shizuoka-cs");
toggleMapLayerVisibility("kyoto-cs", "kyoto-cs");
toggleMapLayerVisibility("osaka-cs", "osaka-cs");
toggleMapLayerVisibility("hyogo-cs", "hyogo-cs");
toggleMapLayerVisibility("wakayama-cs", "wakayama-cs");
toggleMapLayerVisibility("tottori-cs", "tottori-cs");
toggleMapLayerVisibility("okayama-cs", "okayama-cs");
toggleMapLayerVisibility("hiroshima-cs", "hiroshima-cs");
toggleMapLayerVisibility("hiroshima-05m-cs", "hiroshima-05m-cs");
toggleMapLayerVisibility("hiroshima-1m-cs", "hiroshima-1m-cs");
toggleMapLayerVisibility("ehime-cs", "ehime-cs");
toggleMapLayerVisibility("kochi-cs", "kochi-cs");
toggleMapLayerVisibility("kumamoto-oita-cs", "kumamoto-oita-cs");

// CS立体図以外
toggleMapLayerVisibility("plateau-lod1", "plateau-lod1");
toggleMapLayerVisibility("moj-xml", "moj-xml");
toggleMapLayerVisibility("landslide", "landslide");

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

// クリック時にポップアップ表示
map.on('click', (e) => {
  const features = map.queryRenderedFeatures(e.point); // クリック地点のフィーチャを取得

  if (features.length === 0) return; // フィーチャがなければ何もしない

  let popupContent = '';
  const uniqueLayers = []; // 処理済みレイヤーIDを記録

  features.forEach((feature) => {
    const layerId = feature.layer ? feature.layer.id : null; // レイヤーIDを取得

    if (!layerId) {
      console.warn('レイヤーIDが見つかりません:', feature);
      return; // レイヤーIDがない場合はスキップ
    }

    if (!uniqueLayers.includes(layerId)) {
      uniqueLayers.push(layerId); // 処理済みレイヤーを記録

      // レイヤーごとのポップアップ内容を追加
      const properties = feature.properties; // フィーチャのプロパティを取得
      if (layerId === 'plateau-lod1') {
        popupContent += `
          <div><strong>建築物モデルLOD1:</strong></div>
          <div>id: ${properties['id']}</div>
          <div>source: ${properties['source']}</div>
          <div>type: ${properties['type']}</div>
          <div>lod: ${properties['lod']}</div>
          <div>measuredHeight: ${properties['measuredHeight']}</div>
          <div>address: ${properties['address']}</div>
          <div>buildingID: ${properties['buildingID']}</div>
          <div>prefecture: ${properties['prefecture']}</div>
          <div>city: ${properties['city']}</div>
          <div>lod1HeightType: ${properties['lod1HeightType']}</div>
          <br>
        `;
      } else if (layerId === 'fude-polygon') {
        popupContent += `
          <div><strong>法務省地図XML:</strong></div>
          <div>座標系: ${properties['座標系']}</div>
          <div>測地系判別: ${properties['測地系判別']}</div>
          <div>地図名: ${properties['地図名']}</div>
          <div>縮尺分母: ${properties['縮尺分母']}</div>
          <div>地番区域: ${properties['地番区域']}</div>
          <div>地番: ${properties['地番']}</div>
          <div>座標値種別: ${properties['座標値種別']}</div>
          <br>
        `;
      }
    }
  });

  // ポップアップを作成して表示
  if (popupContent) {
    new maplibregl.Popup()
      .setLngLat(e.lngLat) // クリック位置にポップアップを設定
      .setHTML(popupContent.trim()) // ポップアップの内容を設定
      .addTo(map); // ポップアップを地図に追加
  }
});

/// ****************
// latLngToTile 緯度経度をタイル座標に変換する関数
//  latLng: 緯度経度オブジェクト（lat,lngフィールドを持ちます）
//  z: ズームレベル
//  戻り値: タイル座標オブジェクト（x, yフィールドを持ちます)
//    ※通常，地図ライブラリ内に同様の関数が用意されています．
/// ****************
/*
function latLngToTile(lat, lng, z) {
  console.log("z=" + z + " " + "lat=" + lat + " " + "lng=" + lng);
  const
    w = Math.pow(2, (z === undefined) ? 0 : z) / 2,		// 世界全体のピクセル幅
    yrad = Math.log(Math.tan(Math.PI * (90 + lat) / 360));

  return { x: (lng / 180 + 1) * w, y: (1 - yrad / Math.PI) * w };
};
*/

function latLngToTile(lat, lng, z) {
  // ズームレベル z におけるタイルの総数
  const n = Math.pow(2, z);
  // 経度 lng → タイル X 座標
  const x = ((lng / 180 + 1) * n) / 2;
  // 緯度 lat → タイル Y 座標
  // (メルカトル投影による変換)
  const latRad = lat * Math.PI / 180;  // 緯度をラジアンに変換
  const y = n * (
    1 - Math.log(
      Math.tan(latRad) + 1 / Math.cos(latRad)
    ) / Math.PI
  ) / 2;

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
function getNumericalValue(url, lat, lng, z, factor = 1, offset = 0, invalid = undefined) {
  console.log("z=" + z + " " + "lat=" + lat + " " + "lng=" + lng);
  return new Promise(function (resolve, reject) {
    const
      p = latLngToTile(lat, lng, z),
      x = Math.floor(p.x),			// タイルX座標
      y = Math.floor(p.y),			// タイルY座標
      i = (p.x - x) * 256,			// タイル内i座標
      j = (p.y - y) * 256,			// タイル内j座標
      img = new Image();

    console.log("タイルURL=" + url);
    // console.log("z=" + z + " " + "lat=" + lat + " " + "lng=" + lng);
    console.log("タイルX座標=" + x + " " + "タイルY座標=" + y);

    img.crossOrigin = 'anonymous';	// 画像ファイルからデータを取り出すために必要です
    img.onload = function () {
      const
        canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');
      let
        r2,
        v,
        data;

      canvas.width = 1;
      canvas.height = 1;
      context.drawImage(img, i, j, 1, 1, 0, 0, 1, 1);
      data = context.getImageData(0, 0, 1, 1).data;
      r2 = (data[0] < 2 ** 7) ? data[0] : data[0] - 2 ** 8;
      v = r2 * 2 ** 16 + data[1] * 2 ** 8 + data[2];
      if (data[3] !== 255 || (invalid != undefined && v == invalid)) {
        v = NaN;
      }
      resolve(v * factor + offset);
    }
    img.onerror = function () {
      reject(null);
    }
    img.src = url.replace('{z}', z).replace('{y}', y).replace('{x}', x);
  });
};