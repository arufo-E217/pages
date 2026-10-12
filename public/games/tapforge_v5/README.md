# TapForge — 開発・バランス調整ガイド

このREADMEは、ゲームバランスの調整場所と各値の意味をまとめたものです。
ゲーム本体は `index.html`、見た目は `style.css`、処理は `script.js` です。

## まず調整する場所

`script.js` の先頭にある `GAME_CONFIG` が、主要なゲームバランス設定の集約先です。価格や確率を変更するときは、処理の途中にある数値を直接探すのではなく、まずこの設定を変更してください。

| 設定 | 何を変えるか | 現在値 |
|---|---|---:|
| `gacha.pullCounts` | 連続ガチャで選択できる回数。ボタンもここから自動生成 | 1, 5, 10, 50, 100 |
| `gacha.itemBaseCost` | アイテムガチャの初回価格 | 100 |
| `gacha.itemCostGrowth` | アイテムガチャを1回引くごとの価格倍率 | 1.17 |
| `gacha.materialBaseCost` | 素材ガチャの初回価格 | 50 |
| `gacha.materialCostGrowth` | 素材ガチャを1回引くごとの価格倍率 | 1.14 |
| `gacha.costCap` | 各ガチャ価格の上限 | `1e300` |
| `gacha.pityPulls` | レア以上が出なかった場合の救済判定回数 | 20 |
| `gacha.pityEpicChance` | 救済時にエピックが出る割合。残りはレア | 0.20 |
| `materials.dustDropBelow` | 素材ガチャで粉になる乱数の境界 | 58 |
| `materials.gearDropBelow` | この値未満なら歯車、以上なら結晶 | 88 |
| `materials.dustPerDrop` | 粉を引いたときの獲得数 | 3 |
| `materials.gearPerDrop` | 歯車を引いたときの獲得数 | 2 |
| `materials.crystalPerDrop` | 結晶を引いたときの獲得数 | 1 |
| `item.incomePerLevelMultiplier` | アイテムLvによる基本収入の倍率 | 2 |
| `item.mergeValueEffectPerPoint` | 合成値1につき、アイテム効果が増える割合 | 0.10（10%） |
| `item.scoreLevelExponent` | 合成素材の必要量を見積もる際のレベル重み | 1.25 |
| `item.scoreEnchantWeight` | 価値計算で、改造スキル1つに加える重み | 2 |
| `item.scoreMergeValueWeight` | 価値計算で、合成値1につき加える重み | 1.5 |
| `item.enchantDecomposeMultiplier` | スキル書を分解したときの報酬倍率 | 1.5 |
| `upgrade.itemDustPerLevel` | アイテムLv強化に使う粉の必要数倍率 | 5 × 現在Lv |
| `upgrade.itemGearPerLevel` | アイテムLv強化に使う歯車の必要数倍率 | 2 × 現在Lv |
| `upgrade.tapBaseCost` | タップ強化の初回価格 | 75 |
| `upgrade.tapCostGrowth` | タップ強化の価格倍率 | 1.65 |
| `upgrade.tapGainRatio` | タップ強化で現在の基本獲得量に加算する割合 | 0.35（35%） |
| `upgrade.tapMinimumGain` | タップ強化1回あたりの最低加算量 | 1 |
| `fusion.materialScoreDivisor` | 対象と素材の価値から必要結晶数を計算する除数 | 2 |
| `fusion.noRiskGreatSuccessBase` | 対象の合成値が0で、最低量投入時の大成功率 | 50% |
| `fusion.noRiskGreatSuccessPerExtraRatio` | 追加投入による大成功率上昇の強さ | 10 |
| `fusion.failureBase` / `failurePerMergeValue` | 通常失敗率の基礎値と合成値ごとの増分 | 10 / 3 |
| `fusion.severeFailureBase` / `severeFailurePerMergeValue` | 大失敗・超大失敗率の基礎値と合成値ごとの増分 | 5 / 2 |
| `fusion.boostFailureReductionPerExtraRatio` | 追加投入によって失敗率を下げる強さ | 20 |
| `fusion.successMergeBonus` | 成功時に合成値へ追加する量 | +1 |
| `fusion.greatSuccessMergeBonus` | 大成功時に合成値へ追加する量 | +2 |
| `enchant.essenceCostPerPull` | スキル書1個の錬成に必要な星霊エッセンス | 5 |
| `enchant.modifyDustCost` | 改造に必要な粉 | 3 |
| `enchant.modifyGearCost` | 改造に必要な歯車 | 2 |
| `enchant.modifyCrystalCost` | 改造に必要な結晶 | 1 |
| `enchant.modifyDustCostPerDegree` | 改造済みスキル書1個ごとに増える粉コスト | 1 |
| `enchant.modifyGearCostPerDegree` | 改造済みスキル書1個ごとに増える歯車コスト | 1 |
| `enchant.modifyCrystalCostPerDegree` | 改造済みスキル書1個ごとに増える結晶コスト | 1 |
| `tap.bonusChanceCap` | タップ時ボーナスの発生確率上限 | 0.75（75%） |
| `tap.bonusMultiplier` | タップボーナス発生時の獲得倍率 | 2倍 |
| `controls.longPressMs` | アイテム詳細を開く長押し時間 | 480ms |
| `controls.longPressMoveTolerancePx` | 長押し判定中に許される移動距離 | 12px |
| `prestige.requirement` | 転生可能になる周回内累計獲得通貨 | 1,000,000 |
| `prestige.startingCurrencyPerLevel` | 永続初期通貨強化1レベルあたりの初期通貨 | 1,000 |
| `skill.*` | スキルツリーのポイント計算と各研究効果 | 項目コメント参照 |
| `effects.*` | 装備・改造効果の上限値 | 項目コメント参照 |
| `permanentUpgrades.*` | 永続強化の初期価格、価格加算、最大レベル | 項目コメント参照 |

## 合成の仕様

- 合成できるのは同じ種類の通常アイテム同士です。レベルと合成値は同じでなくても構いません。
- 対象アイテムが残り、素材アイテムは結果にかかわらず消費されます。ロック中のアイテムは使えません。素材アイテムが装備中の場合も使用できません。
- 成功・大成功の場合、対象のLvは2つのうち高い方、合成値は「対象の合成値 + 素材の合成値 + 成功ボーナス」になります。
- 失敗では星くず結晶を消費しませんが、素材アイテムは消滅します。大失敗と超大失敗では結晶を消費し、対象の合成値だけが1または2減少します。合成値は0未満にはなりません。
- 投入素材の最低量は対象・素材の価値スコアを基に計算されます。最低量を下回る設定はできず、余分に投入すると成功以上の確率が高くなります。
- `fusionProbabilities()` の確率モデルを変更したい場合は、`GAME_CONFIG.fusion` の各係数を変更します。`GAME_CONFIG.fusion.noRiskGreatSuccessBase` は合成値0・最低必要数の場合の大成功率で、成功率は残りの割合です。

## アイテム定義の変更

`ITEM_TYPES` は通常アイテムの名前・アイコン・レア度・基本収入・効果を定義します。`ENCHANT_TYPES` は錬成で得られるスキル書の名前・アイコン・レア度・効果を定義します。アイテム個別の能力値は、この2つの配列で変更してください。

`SKILL_DEFS` はスキル名・説明・最大レベル、`PERMANENT_DEFS` は永続強化の表示情報を定義します。効果の数値そのものは原則 `GAME_CONFIG.skill`、`GAME_CONFIG.permanentUpgrades` などの設定で調整します。

## 長押し詳細

所持一覧、強化・合成・分解・改造の選択カード、装備枠、合成の対象／素材ボックスで、アイテムを約480ms長押しすると詳細画面が開きます。長押し中に12pxを超えて移動すると、スクロールやドラッグ操作とみなして長押し判定を解除します。これらの値は `GAME_CONFIG.controls` で調整できます。

## ファイル構成

- `index.html`：各画面の構造。JavaScript は `script.js` を読み込みます。
- `style.css`：画面デザイン。
- `script.js`：ゲームロジック。バランス調整は先頭の `GAME_CONFIG` が第一候補です。
- `README.md`：このガイド。

変更後はブラウザを再読み込みして動作を確認してください。セーブデータが大切な場合は、ファイル置き換え前にバックアップを取ってください。

## 2026-10-12 修正・持ち物タブ

### 改造ボタンが押せない問題

改造対象とスキル書を選択した後に、改造プレビューと実行ボタンの `disabled` 状態を更新する処理が抜けていたため、素材が揃っていてもボタンが無効のままになる場合がありました。`renderCraftPreviews()` 内で対象・スキル書・ロック・重複付与の可否・改造度に応じた必要素材を毎回再評価するように修正しました。同じスキル書は重ねて付与できます。

必要素材の既定値は `GAME_CONFIG.enchant.modifyDustCost`（粉）、`modifyGearCost`（歯車）、`modifyCrystalCost`（結晶）です。同じスキル書の重複付与が可能です。改造度（付与済みスキル書数）が高いほど、次の改造に必要な素材が増えます。

### 持ち物タブ

ナビゲーションに「持ち物」を追加しました。表示順は以下です。

1. **通貨の詳細情報**：所持通貨、今回の累計獲得、自動収入/秒、タップ獲得量、転生回数
2. **素材ポーチ**：各種素材と星霊エッセンス
3. **アイテム一覧**：既存のフィルター付きアイテムカード。カードを選択すると詳細を開きます。

従来の「アイテム」画面は装備枠を管理する「装備」画面に変更しました。素材ポーチは合成・強化の画面にも残してあり、両方とも同じゲーム状態から更新されます。


## 2026-10-12 更新：改造効果の重複と数値表示

- 同じスキル書を同じ通常アイテムへ複数回付与できます。`item.enchantments` は書の種類インデックスの配列で、重複要素が付与回数を表します。ロード時・合成時にも重複を維持します。
- 改造コストは現在付与されているスキル書の個数（改造度）に応じて上がります。`GAME_CONFIG.enchant.modifyDustCostPerDegree`、`modifyGearCostPerDegree`、`modifyCrystalCostPerDegree` が、改造済みスキル書1個ごとの追加コストです。
- 詳細画面・改造プレビューでは基本スキル、各スキル書による変更、合算後の効果を別行で表示します。変更された行は緑色になります。ゲーム全体への適用後として、現在のタップ獲得量、自動収入、ガチャ割引も表示します。
- 通常の割合型スキルは、同じカテゴリの基本効果と書の効果を加算してから、異なるカテゴリの倍率を掛けます。例：基本タップ +25% とタップの書 +25% はタップ +50%。
- 固定値型スキルを追加する場合、`ITEM_TYPES` の定義に `valueMode: "flat"` を指定してください。例：`{ name: "超タップ装置", effect: "tap", value: 500, valueMode: "flat", ... }`。タップの書 +25% はその固定値を25%増幅するため、+500 は +625 になります。
- 「装備」タブにフィルター付きのアイテム欄を再設置しました。「持ち物」タブの一覧とは別表示ですが、同じ所持アイテムを参照します。
