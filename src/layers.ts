/** パネルに並べるレイヤー1項目。ids は同時に切り替える MapLibre レイヤーID。 */
export type LayerDef = {
  /** 表示名 */
  name: string;
  /** 一括で表示/非表示を切り替える MapLibre レイヤーID */
  ids: string[];
  /** 初期表示 ON か（style JSON 側の visibility と一致させる） */
  on?: boolean;
};

/** CS立体図（各県公開のラスタタイル）。地域はほぼ重ならないため全ONでも実用になる。 */
export const CS_LAYERS: LayerDef[] = [
  { ids: ["miyagi-cs"], name: "宮城県CS立体図" },
  { ids: ["fukushima-cs"], name: "福島県CS立体図" },
  { ids: ["tochigi-cs"], name: "栃木県CS立体図" },
  { ids: ["saitama-cs"], name: "埼玉県CS立体図", on: true },
  { ids: ["tokyo-23ku-cs"], name: "東京都(区部)CS立体図" },
  { ids: ["tokyo-tama-cs"], name: "東京都(多摩地域)CS立体図" },
  {
    ids: [
      "tokyo-shima-01-cs",
      "tokyo-shima-02-cs",
      "tokyo-shima-03-cs",
      "tokyo-shima-04-cs",
      "tokyo-shima-05-cs",
      "tokyo-shima-06-cs",
    ],
    name: "東京都(島しょ地域)CS立体図",
  },
  { ids: ["kanagawa-cs"], name: "神奈川県CS立体図" },
  { ids: ["nagaoka-cs"], name: "長岡地域CS立体図" },
  { ids: ["toyama-cs"], name: "富山県CS立体図" },
  { ids: ["noto-cs"], name: "能登CS立体図(速報成果)" },
  { ids: ["noto-cs-final"], name: "能登CS立体図(最終成果)" },
  { ids: ["yamanashi-cs"], name: "山梨県CS立体図" },
  { ids: ["nagano-cs"], name: "長野県CS立体図(1m)" },
  { ids: ["nagano-05m-cs"], name: "長野県CS立体図(0.5m)" },
  { ids: ["gifu-cs"], name: "岐阜県CS立体図" },
  { ids: ["shizuoka-cs"], name: "静岡県CS立体図" },
  { ids: ["shiga-cs"], name: "滋賀県CS立体図" },
  { ids: ["kyoto-cs"], name: "京都府CS立体図" },
  { ids: ["osaka-cs"], name: "大阪府CS立体図" },
  { ids: ["hyogo-cs"], name: "兵庫県CS立体図" },
  { ids: ["wakayama-cs"], name: "和歌山県CS立体図" },
  { ids: ["tottori-cs"], name: "鳥取県CS立体図" },
  { ids: ["tottori-2025-cs"], name: "鳥取県CS立体図(2025年)" },
  { ids: ["okayama-cs"], name: "岡山県CS立体図(林野庁0.5m)" },
  { ids: ["okayama-2024-cs"], name: "岡山県CS立体図(岡山県0.5m)" },
  { ids: ["hiroshima-cs"], name: "広島県CS立体図(林野庁0.5m)" },
  { ids: ["hiroshima-05m-cs"], name: "広島県CS立体図(広島県0.5m)" },
  { ids: ["hiroshima-1m-cs"], name: "広島県CS立体図(広島県1m)" },
  { ids: ["ehime-cs"], name: "愛媛県CS立体図" },
  { ids: ["kochi-cs"], name: "高知県CS立体図" },
  { ids: ["kumamoto-oita-cs"], name: "熊本県・大分県CS立体図" },
];

/** CS立体図以外の重ねもの。 */
export const OTHER_LAYERS: LayerDef[] = [
  { ids: ["fude-polygon", "fude-line"], name: "法務省地図(2024年)" },
  { ids: ["plateau-bldg"], name: "3D都市モデル建築物(2023年)" },
  { ids: ["seamlessphoto"], name: "全国最新写真（シームレス）" },
  { ids: ["yamajiro", "yamajiro-label"], name: "山城（山城攻城記）" },
];

/** 不透明度スライダーが対象にする CS立体図の全レイヤーID。 */
export const CS_LAYER_IDS: string[] = CS_LAYERS.flatMap((d) => d.ids);
