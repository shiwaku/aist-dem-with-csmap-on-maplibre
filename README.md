# aist-dem-with-csmap-on-maplibre

産総研シームレス標高タイルをベースに、各都道府県が公開している **CS立体図** をオーバーレイ表示する Web 地図アプリケーションです。

## デモ

🌐 **https://shiwaku.github.io/aist-dem-with-csmap-on-maplibre/**

## 機能

- 30 以上の都道府県 CS 立体図レイヤーの表示切り替え
- CS 立体図の不透明度スライダー
- 3D 地形表示（産総研シームレス標高タイル）
- 地名検索（国土地理院 地名検索 API）
- 描画ツール（TerraDraw）
- 3D 都市モデル建築物（PLATEAU 2023）
- 法務省地図 XML（筆ポリゴン）
- 山城データ（山城攻城記）
- 中心座標・標高・ズームレベルの表示

## 使用技術

| パッケージ | バージョン |
|---|---|
| [MapLibre GL JS](https://maplibre.org/) | ^5.2.0 |
| [PMTiles](https://protomaps.com/docs/pmtiles) | ^3.2.0 |
| [@maplibre/maplibre-gl-geocoder](https://github.com/maplibre/maplibre-gl-geocoder) | ^1.2.0 |
| [@watergis/maplibre-gl-terradraw](https://github.com/watergis/maplibre-gl-terradraw) | ^1.3.14 |
| [Vite](https://vitejs.dev/) | ^6.0.0 |
| TypeScript | ^5.0.0 |

## 開発

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動（http://localhost:5173）
npm run dev

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

## デプロイ

`main` ブランチへの push で GitHub Actions が自動的にビルド・GitHub Pages へデプロイします。

## データソース

### CS 立体図

> **注意（shi-works 作成データ）：** 試験公開中のため、予告なく変更または公開を中止する場合があります。

#### 長野県林業総合センター

| レイヤー | 解像度 | 出典 | ライセンス |
|---|---|---|---|
| 長野県 CS 立体図 | 1m | [G空間情報センター](https://www.geospatial.jp/ckan/dataset/nagano-csmap) | - |

#### 森林総合研究所

林野庁取得の LiDAR データをもとに森林総合研究所が作成した CS 立体図です。

| レイヤー | 取得年度 | 解像度 | 出典 | ライセンス |
|---|---|---|---|---|
| 広島県（林野庁） | 2018–2019 | 0.5m | [森林土壌デジタルマップ](https://www2.ffpri.go.jp/soilmap/data-src.html) | [利用規約](https://www2.ffpri.go.jp/soilmap/#)参照 |
| 岡山県（林野庁） | 2018–2019 | 0.5m | 同上 | 同上 |
| 福島県（林野庁） | H23–H25 | 1m | 同上 | 同上 |
| 熊本県・大分県（林野庁） | H28 | 0.5m | 同上 | 同上 |
| 能登（石川県） | 2020–2023 | 0.5m | 同上 | 同上 |

#### 林野庁

| レイヤー | 概要 | 出典 | ライセンス |
|---|---|---|---|
| 栃木県 | 令和 3〜4 年度 航空レーザ測量 | [G空間情報センター](https://www.geospatial.jp/ckan/dataset/csmap_tochigi) | [利用規約](https://www.geospatial.jp/ckan/dataset/csmap_tochigi/resource/4dffe2ac-511f-49eb-87c4-29c936ed2cb7)参照 |
| 兵庫県 | 令和 2〜3 年度 航空レーザ測量 | [G空間情報センター](https://www.geospatial.jp/ckan/dataset/csmap_hyogo) | [利用規約](https://www.geospatial.jp/ckan/dataset/csmap_hyogo/resource/ab5fab0d-99a1-4638-9807-a09eb53e14b7)参照 |
| 高知県 | 平成 30 年度 林野庁 航空レーザ測量 | [G空間情報センター](https://www.geospatial.jp/ckan/dataset/csmap_kochi) | [利用規約](https://www.geospatial.jp/ckan/dataset/csmap_kochi/resource/86bbb203-3025-4c58-b130-b8fe692f9c09)参照 |
| 能登地域（速報） | 令和 6 年能登半島地震 発災後 航空レーザ測量 速報成果 | [G空間情報センター](https://www.geospatial.jp/ckan/dataset/2024noto_rinya) | CC BY 4.0 互換 |
| 能登地域（最終） | 同上 最終成果（手動フィルタリング済） | [G空間情報センター](https://www.geospatial.jp/ckan/dataset/2024noto_dem) | CC BY 4.0 互換 |
| 長岡地域 | 令和 6 年能登半島地震 発災後 航空レーザ測量 | [G空間情報センター](https://www.geospatial.jp/ckan/dataset/rinya-csmap-nagaoka2024) | [PDL1.0](https://www.digital.go.jp/resources/open_data/public_data_license_v1.0) |
| 滋賀県 | 滋賀県森林政策課 航空レーザ測量成果 | [G空間情報センター](https://www.geospatial.jp/ckan/dataset/rinya-shiga-maptiles) | [PDL1.0](https://www.digital.go.jp/resources/open_data/public_data_license_v1.0) |

#### 愛媛県

| レイヤー | 解像度 | 出典 | ライセンス |
|---|---|---|---|
| 愛媛県 | 0.5m | [G空間情報センター](https://www.geospatial.jp/ckan/dataset/csmap_ehime) | [利用規約](https://www.geospatial.jp/ckan/dataset/csmap_ehime/resource/fe9620ab-debd-4e0f-9a7c-af86b2e52053)参照 |

#### 鳥取県

| レイヤー | 解像度 | 出典 | ライセンス |
|---|---|---|---|
| 鳥取県 | - | [G空間情報センター](https://www.geospatial.jp/ckan/dataset/csmap_tottori) | [PDL1.0](https://www.digital.go.jp/resources/open_data/public_data_license_v1.0) |
| 鳥取県（2025 年） | 0.5m | [G空間情報センター](https://www.geospatial.jp/ckan/dataset/dem05_tottori) | [PDL1.0](https://www.digital.go.jp/resources/open_data/public_data_license_v1.0) |

#### [open-hinata](https://kenzkenz.xsrv.jp/open-hinata/open-hinata.html)（[@kenzkenz](https://twitter.com/kenzkenz) 様作成）

| レイヤー | 原初データ | ライセンス |
|---|---|---|
| 岐阜県 | [岐阜県 CS 立体図 2019](https://www.geospatial.jp/ckan/dataset/cs-2019-geotiff) | - |

#### [shi-works](https://twitter.com/shi__works) 作成

各都道府県が公開する 3 次元点群・DEM 等のオープンデータをもとに作成しています。

**作成フロー：**

1. オープンデータ（3 次元点群／DEM）を取得
2. 3 次元点群（グリッドデータ）の場合は [GMT（Generic Mapping Tools）](https://www.generic-mapping-tools.org/) の [triangulate](https://docs.generic-mapping-tools.org/dev/triangulate.html) で DEM（GeoTIFF）を生成（テキスト形式 DEM は GeoTIFF 変換、必要に応じて NoData 処理）
3. 前処理後の DEM を CS 立体図作成ツール [csmap-py](https://github.com/MIERUNE/csmap-py)（[MIERUNE](https://github.com/MIERUNE) 開発）で CS 立体図化
4. Web メルカトル（EPSG:3857）に再投影
5. [gdal2tiles](https://gdal.org/programs/gdal2tiles.html) でラスタータイル化

| レイヤー | 解像度 | ZL | タイル URL | 原初データ | ライセンス |
|---|---|---|---|---|---|
| 大阪府 | - | 4–18 | `https://xs489works.xsrv.jp/raster-tiles/pref-osaka/osaka-cs-tiles/{z}/{x}/{y}.png` | [大阪府 微地形地図](https://www.geospatial.jp/ckan/dataset/cs) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 静岡県 | 0.5m | 4–18 | `https://shiworks.xsrv.jp/raster-tiles/pref-shizuoka/shizuoka-cs-tiles/{z}/{x}/{y}.png` | [VIRTUAL SHIZUOKA 静岡県 CS 立体図](https://www.geospatial.jp/ckan/dataset/shizuoka-2023-csmap) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 東京都（区部） | 0.25m | 4–19 | `https://shiworks.xsrv.jp/raster-tiles/tokyo-digitaltwin/tokyopc-23ku-2024-cs-tiles/{z}/{x}/{y}.png` | [東京都デジタルツイン 区部点群データ](https://www.geospatial.jp/ckan/dataset/tokyopc-23ku-2024) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 東京都（多摩地域） | 0.25m | 4–19 | `https://shiworks.xsrv.jp/raster-tiles/tokyo-digitaltwin/tokyopc-tama-2023-cs-tiles/{z}/{x}/{y}.png` | [東京都デジタルツイン 多摩地域点群データ](https://www.geospatial.jp/ckan/dataset/tokyopc-tama-2023) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 東京都（島しょ地域） | 0.25m | 4–19 | ※下記参照 | [東京都デジタルツイン 島しょ地域点群データ](https://www.geospatial.jp/ckan/dataset/tokyopc-shima-2023) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 和歌山県 | 1m | 4–17 | `https://xs489works.xsrv.jp/raster-tiles/pref-wakayama/wakayamapc-cs-tiles/{z}/{x}/{y}.png` | [和歌山県 3 次元点群データ](https://www.pref.wakayama.lg.jp/prefg/012100/d00213012.html) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 神奈川県 | 0.5m | 4–18 | `https://shiworks.xsrv.jp/raster-tiles/pref-kanagawa/kanagawapc-cs-tiles/{z}/{x}/{y}.png` | [神奈川県 3 次元点群データ](https://www.geospatial.jp/ckan/dataset?q=%E7%A5%9E%E5%A5%88%E5%B7%9D%E7%9C%8C+%E7%82%B9%E7%BE%A4) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 能登地域（最終） | 0.5m | 4–18 | `https://shiworks.xsrv.jp/raster-tiles/rinya/noto-2024-csmap-tiles/{z}/{x}/{y}.png` | [林野庁 能登地域 0.5mDEM(発災後)](https://www.geospatial.jp/ckan/dataset/2024noto_dem) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 広島県（広島県 0.5m） | 0.5m | 4–18 | `https://shiworks.xsrv.jp/raster-tiles/pref-hiroshima/hiroshimapc-2022-cs-tiles/{z}/{x}/{y}.png` | [広島県 3 次元点群データ](https://hiroshima-dobox.jp/index2) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 広島県（広島県 1m） | 1m | 4–17 | `https://xs489works.xsrv.jp/raster-tiles/pref-hiroshima/hiroshimapc-cs-tiles/{z}/{x}/{y}.png` | [広島県 3 次元点群データ](https://hiroshima-dobox.jp/index2) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 京都府 | 0.5m | 4–18 | `https://shiworks2.xsrv.jp/raster-tiles/pref-kyoto/kyoto-csmap-tiles/{z}/{x}/{y}.png` | [京都府 数値標高モデル（DEM）](https://www.geospatial.jp/ckan/dataset/dem05_kyoto) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 山梨県 | 0.5m | 4–18 | `https://shiworks2.xsrv.jp/raster-tiles/pref-yamanashi/yamanashi-csmap-tiles/{z}/{x}/{y}.png` | [山梨県点群データ グリッドデータ DEM](https://www.geospatial.jp/ckan/dataset/yamanashi-pointcloud-2024) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 富山県 | 0.5m | 4–18 | `https://shiworks2.xsrv.jp/raster-tiles/pref-toyama/toyama-csmap-tiles/{z}/{x}/{y}.png` | [富山県 数値標高モデル（DEM）](https://www.geospatial.jp/ckan/dataset/dem) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 長野県（0.5m） | 0.5m | 4–18 | `https://shiworks2.xsrv.jp/raster-tiles/pref-nagano/nagano-csmap-tiles/{z}/{x}/{y}.png` | [長野県 R3・4 計測 50cmDEM](https://www.geospatial.jp/ckan/dataset/r3-4-50cmdem) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)（承認番号：7 森政第 51-3 号） |
| 宮城県 | 1m | 4–17 | `https://shiworks2.xsrv.jp/raster-tiles/pref-miyagi/miyagi-csmap-tiles/{z}/{x}/{y}.png` | [宮城県 3 次元点群データ](https://miyagi.dataeye.jp/resources/1523) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 岡山県（岡山県 0.5m） | 0.5m | 4–18 | `https://shiworks2.xsrv.jp/raster-tiles/pref-okayama/okayama-csmap-tiles/{z}/{x}/{y}.png` | [岡山県 3 次元点群データ](https://i-box.pref.okayama.jp/datasets/251) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 埼玉県 | 0.5m | 4–18 | `https://shiworks.xsrv.jp/raster-tiles/pref-saitama/saitama-csmap-tiles/{z}/{x}/{y}.png` | [埼玉県 3 次元点群データ](https://portal-pref-saitama.hub.arcgis.com/) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |

**※ 東京都（島しょ地域）タイル URL**

| 島 | タイル URL |
|---|---|
| 伊豆大島 | `https://xs489works.xsrv.jp/raster-tiles/tokyo-digitaltwin/tokyopc-shima-01-2023-cs-tiles/{z}/{x}/{y}.png` |
| 利島・新島・式根島・神津島 | `https://xs489works.xsrv.jp/raster-tiles/tokyo-digitaltwin/tokyopc-shima-02-2023-cs-tiles/{z}/{x}/{y}.png` |
| 三宅島 | `https://xs489works.xsrv.jp/raster-tiles/tokyo-digitaltwin/tokyopc-shima-03-2023-cs-tiles/{z}/{x}/{y}.png` |
| 御蔵島 | `https://xs489works.xsrv.jp/raster-tiles/tokyo-digitaltwin/tokyopc-shima-04-2023-cs-tiles/{z}/{x}/{y}.png` |
| 八丈島 | `https://xs489works.xsrv.jp/raster-tiles/tokyo-digitaltwin/tokyopc-shima-05-2023-cs-tiles/{z}/{x}/{y}.png` |
| 青ヶ島 | `https://xs489works.xsrv.jp/raster-tiles/tokyo-digitaltwin/tokyopc-shima-06-2023-cs-tiles/{z}/{x}/{y}.png` |

### 各種レイヤー

| レイヤー | 提供元 | ライセンス |
|---|---|---|
| 法務省地図 XML（筆ポリゴン） | [amx-project](https://github.com/amx-project) | - |
| 3D 都市モデル建築物（PLATEAU 2023） | [国土交通省 Project PLATEAU](https://www.geospatial.jp/ckan/dataset/plateau) | CC BY 4.0 等（[詳細](https://www.mlit.go.jp/plateau/site-policy/)） |
| 山城（山城攻城記） | [山城攻城記](https://gosenzo.net/yamajiro/) | 2次利用は[山城攻城記様](https://x.com/yamajirokoujyou)の許可が必要 |

### 背景地図・標高タイル

| データ | 提供元 | ライセンス |
|---|---|---|
| 最適化ベクトルタイル | [国土地理院](https://github.com/gsi-cyberjapan/optimal_bvmap) | [国土地理院コンテンツ利用規約](https://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html) |
| 地理院タイル（陰影起伏図） | [国土地理院](https://maps.gsi.go.jp/development/ichiran.html#hillshademap) | 同上 |
| シームレス標高タイル（陸域統合 DEM） | [産業技術総合研究所](https://tiles.gsj.jp/tiles/elev/tiles.html) | [産総研利用規約](https://www.gsj.jp/license/license.html)（CC BY 4.0 互換） |
| 全国最新写真（シームレス） | [国土地理院](https://maps.gsi.go.jp/development/ichiran.html) | [国土地理院コンテンツ利用規約](https://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html) |

## 免責事項

利用者がデータを用いて行う一切の行為について、作成者は何ら責任を負いません。
