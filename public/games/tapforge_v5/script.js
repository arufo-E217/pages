(() => {
  "use strict";
  const SAVE_KEY = "tapforge_save_v1";

  // ============================================================
  // GAME_CONFIG: ゲームバランスの調整値は、まずここを編集してください。
  // README.md に各項目の意味と影響範囲をまとめています。
  // ============================================================
  const GAME_CONFIG = {
    gacha: {
      pullCounts: [1, 5, 10, 50, 100],       // 選べる連続ガチャ回数
      itemBaseCost: 100,                    // アイテムガチャの初回価格
      itemCostGrowth: 1.08,                 // 1回引くごとに次の価格へ掛ける倍率
      materialBaseCost: 50,                 // 素材ガチャの初回価格
      materialCostGrowth: 1.07,             // 素材ガチャ価格の上昇倍率
      costCap: 1e300,                       // ガチャ価格の上限
      pityPulls: 20,                         // この回数までにレア以上が出ない場合の救済
      pityEpicChance: 0.20,                  // 救済時にエピックになる確率
      rarityCommonLimit: 60,                 // 幸運効果適用前のコモン境界(%)
      rarityUncommonLimit: 85,               // 幸運効果適用前のアンコモン境界(%)
      rarityRareLimit: 97,                   // 幸運効果適用前のレア境界(%)
      luckCommonPerPoint: 2,                 // 幸運値1あたり減らすコモン境界
      luckUncommonPerPoint: 1.4,             // 幸運値1あたり減らすアンコモン境界
      luckRarePerPoint: 0.5,                 // 幸運値1あたり減らすレア境界
      minCommonLimit: 20,                   // コモン境界の下限
      minUncommonGap: 8,                    // コモン境界とアンコモン境界の最低間隔
      minRareGap: 3                          // アンコモン境界とレア境界の最低間隔
    },
    materials: {
      dustDropBelow: 58,                    // 0～100の乱数がこの値未満なら粉
      gearDropBelow: 88,                    // 上記以上、ここ未満なら歯車
      dustPerDrop: 3,                       // 粉1回の獲得個数
      gearPerDrop: 2,                       // 歯車1回の獲得個数
      crystalPerDrop: 3                     // 結晶1回の獲得個数
    },
    item: {
      incomePerLevelMultiplier: 2,           // アイテムLvが1増えたときの基本収入倍率
      mergeValueEffectPerPoint: 0.10,        // 合成値1あたりのスキル・収入増加率(10%)
      scoreLevelExponent: 1.25,              // 素材必要数計算で使うレベルの重み
      scoreEnchantWeight: 2,                 // 付与済みスキル1個あたりの価値スコア
      scoreMergeValueWeight: 1.5,            // 合成値1あたりの価値スコア
      enchantDecomposeMultiplier: 1.5,       // スキル書を分解したときの報酬倍率
      maxLevel: 10000                        // セーブデータ読み込み時のLv上限
    },
    upgrade: {
      itemDustPerLevel: 5,                   // アイテムLvを1上げる粉の必要数倍率
      itemGearPerLevel: 2,                   // アイテムLvを1上げる歯車の必要数倍率
      tapBaseCost: 75,                       // タップ強化の初回価格
      tapCostGrowth: 1.65,                   // タップ強化の価格上昇倍率
      tapGainRatio: 0.35,                    // 1回のタップ強化で現在の基本獲得量に加算する割合
      tapMinimumGain: 1                      // タップ強化1回で保証する最低加算量
    },
    fusion: {
      minimumCrystal: 1,                     // 合成に必要な結晶の絶対最低数
      materialScoreDivisor: 2,               // 対象と素材の価値スコアから必要数を求める除数
      noRiskGreatSuccessBase: 50,             // 対象の合成値0・最低投入時の大成功率(%)
      noRiskGreatSuccessPerExtraRatio: 10,    // 最低必要数に対する追加投入比率ごとの大成功率上昇
      noRiskGreatSuccessCap: 95,              // 合成値0の大成功率上限(%)
      failureBase: 10,                       // 合成値があるときの通常失敗率の基礎値(%)
      failurePerMergeValue: 3,               // 合成値1ごとの通常失敗率の増分
      failureCap: 40,                        // 通常失敗率上限(%)
      severeFailureBase: 5,                  // 大失敗・超大失敗の基礎確率(%)
      severeFailurePerMergeValue: 2,         // 合成値1ごとの大失敗・超大失敗の増分
      severeFailureCap: 25,                  // 大失敗・超大失敗のそれぞれの上限(%)
      combinedFailureCap: 90,                // 失敗3種類の合計確率上限(%)
      boostFailureReductionPerExtraRatio: 20,// 追加投入で減らせる失敗確率(追加比率1.0あたり)
      successMergeBonus: 1,                  // 成功時に追加する合成値
      greatSuccessMergeBonus: 2,             // 大成功時に追加する合成値
      investmentDefault: 1                   // 素材投入量の初期値(選択時は最低必要数に補正)
    },
    effects: {
      tapEffectCap: 4,                       // 装備効果「タップ」の合計上限
      globalEffectCap: 5,                    // 装備効果「全体」の合計上限
      productionEffectCap: 8,                // 装備効果「自動生産」の合計上限
      discountEffectCap: 0.5,                // 装備による割引率の上限
      bonusEffectCap: 0.5,                   // 装備によるボーナス率の上限
      enchantedEffectCap: 1000000,           // 改造効果の合計上限（同じスキル書を重ねられるよう高く設定）
      discountTotalCap: 0.85                 // あらゆる割引の合計上限
    },
    permanentUpgrades: {
      income: { baseCost: 2, stepCost: 3, max: 20 },         // 永続収入強化: 初期価格、レベル毎の加算、最大Lv
      startingFunds: { baseCost: 1, stepCost: 2, max: 10 }, // 初期通貨強化
      luck: { baseCost: 3, stepCost: 4, max: 10 },          // 永続幸運強化
      incomeBonusPerLevel: 0.25                             // 永続収入強化1レベルの収入・タップ増加率
    },
    reward: {
      prestigeBase: 1,                       // 転生報酬の最低加算値
      prestigeLogMultiplier: 2,              // 転生報酬の増加係数
      prestigeMinimum: 1                     // 転生報酬の最低ポイント
    },
    enchant: {
      essenceCostPerPull: 5,                 // スキル書1つの錬成に必要な星霊エッセンス
      modifyDustCost: 3,                     // 改造1回目の粉コスト
      modifyGearCost: 2,                     // 改造1回目の歯車コスト
      modifyCrystalCost: 1,                   // 改造1回目の結晶コスト
      modifyDustCostPerDegree: 1,             // 既に付いたスキル書1個ごとに追加する粉
      modifyGearCostPerDegree: 1,             // 既に付いたスキル書1個ごとに追加する歯車
      modifyCrystalCostPerDegree: 1           // 既に付いたスキル書1個ごとに追加する結晶
    },
    tap: {
      bonusChanceCap: 0.75,                  // タップボーナス発生率の上限
      bonusMultiplier: 2                     // ボーナス発生時の獲得倍率
    },
    controls: {
      longPressMs: 480,                      // アイテム詳細を開くまで長押しする時間
      longPressMoveTolerancePx: 12           // この距離以上指・マウスが動くと長押し判定を解除
    },
    prestige: {
      requirement: 1e6,                      // 転生できる今回累計獲得通貨
      startingCurrencyPerLevel: 1000,        // 永続・再出発資金1レベルの初期通貨
      startingCurrencyCap: 1e12              // 転生後の初期通貨上限
    },
    skill: {
      pointsLogDivisor: 2,                   // 累計通貨からスキルポイントを計算する対数の除数
      tapBonusPerLevel: 0.5,                 // タップ研究1レベルの増加率
      productionBonusPerLevel: 0.5,          // 生産研究1レベルの増加率
      alchemyDiscountPerLevel: 0.08,         // 錬金研究1レベルの割引率
      luckBonusPerSkillLevel: 2,             // 幸運研究1レベルの幸運値
      luckBonusPerPermanentLevel: 2          // 永続幸運1レベルの幸運値
    }
  };

  const MAX = Number.MAX_VALUE;
  const $ = id => document.getElementById(id);
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const safe = n => Number.isFinite(n) ? clamp(n, 0, MAX) : MAX;
  const add = (a, b) => {
    a = safe(a);
    b = safe(b);
    if (b >= MAX - a) return MAX;
    return safe(a + b);
  };
  function fmt(n, digits = 2) {
    if (!Number.isFinite(n) || n >= MAX) return "1.797693e+308";
    if (n === 0) return "0";
    if (n < 1000) {
      return new Intl.NumberFormat("ja-JP", {
        maximumFractionDigits: digits
      }).format(n);
    }
    if (n < 1e9) {
      return new Intl.NumberFormat("ja-JP", {
        maximumFractionDigits: 1
      }).format(n);
    }
    return n.toExponential(3).replace("e+", "e");
  }
  // 既存9種類の順番を維持し、セーブデータとの互換性を確保
  const ITEM_TYPES = [
    { name: "まめランタン", icon: "🏮", rarity: "コモン", color: "common", income: 0.8, effect: "income" },
    { name: "おしゃべりロボ", icon: "🤖", rarity: "コモン", color: "common", income: 1.5, effect: "income" },
    { name: "ミニ風車", icon: "🌬️", rarity: "コモン", color: "common", income: 2.5, effect: "income" },
    { name: "星の植木鉢", icon: "🪴", rarity: "アンコモン", color: "uncommon", income: 6, effect: "income" },
    { name: "月うさぎ時計", icon: "🐇", rarity: "アンコモン", color: "uncommon", income: 10, effect: "income" },
    { name: "虹色ドローン", icon: "🛸", rarity: "レア", color: "rare", income: 28, effect: "income" },
    { name: "銀河コンパス", icon: "🧭", rarity: "レア", color: "rare", income: 45, effect: "income" },
    { name: "ほしふり水晶", icon: "🔮", rarity: "エピック", color: "epic", income: 140, effect: "income" },
    { name: "宇宙ねこ神殿", icon: "🐈‍⬛", rarity: "エピック", color: "epic", income: 300, effect: "income" },
    { name: "ぽかぽかマグ", icon: "☕", rarity: "コモン", color: "common", income: 0, effect: "tap", value: 0.08 },
    { name: "クリックハムスター", icon: "🐹", rarity: "コモン", color: "common", income: 0, effect: "tap", value: 0.12 },
    { name: "おこづかい箱", icon: "🐷", rarity: "アンコモン", color: "uncommon", income: 1, effect: "tap", value: 0.2 },
    { name: "風読みフクロウ", icon: "🦉", rarity: "アンコモン", color: "uncommon", income: 2, effect: "production", value: 0.12 },
    { name: "ミラクル電池", icon: "🔋", rarity: "レア", color: "rare", income: 5, effect: "global", value: 0.06 },
    { name: "星屑のレジスター", icon: "🧾", rarity: "レア", color: "rare", income: 4, effect: "discount", value: 0.04 },
    { name: "ラッキー彗星", icon: "☄️", rarity: "レア", color: "rare", income: 8, effect: "bonus", value: 0.08 },
    { name: "銀河発電機", icon: "⚡", rarity: "エピック", color: "epic", income: 35, effect: "production", value: 0.25 },
    { name: "願い星の王冠", icon: "👑", rarity: "エピック", color: "epic", income: 25, effect: "global", value: 0.12 },
    { name: "時空のそろばん", icon: "🧮", rarity: "エピック", color: "epic", income: 20, effect: "tap", value: 0.4 }
  ];
  // 転生で追加アイテム系統を段階解放。既に所持しているアイテムはロックされない。
  ITEM_TYPES.forEach((type, index) => {
    type.minPrestige = index >= 18 ? 3 : index >= 15 ? 2 : index >= 12 ? 1 : 0;
  });
  const ENCHANT_TYPES = [
    { name: "タップの書", icon: "📘", rarity: "コモン", color: "common", effect: "tap", value: 0.25, desc: "装備中のアイテムがタップ獲得量を25%増幅" },
    { name: "生産の書", icon: "📗", rarity: "アンコモン", color: "uncommon", effect: "production", value: 0.30, desc: "装備中のアイテムが自動収入を30%増幅" },
    { name: "全能の書", icon: "📙", rarity: "レア", color: "rare", effect: "global", value: 0.15, desc: "装備中のアイテムがタップ・自動収入を15%増幅" },
    { name: "錬金の書", icon: "📕", rarity: "レア", color: "rare", effect: "discount", value: 0.08, desc: "装備中のアイテムがガチャ価格を8%割引" },
    { name: "幸運の書", icon: "📓", rarity: "エピック", color: "epic", effect: "bonus", value: 0.05, desc: "装備中のアイテムがタップボーナス発生率を5%増幅" }
  ];

  const MATERIALS = [
    { id: "dust", name: "きらきら粉", icon: "✨", desc: "基本素材" },
    { id: "gear", name: "ちいさな歯車", icon: "⚙️", desc: "強化素材" },
    { id: "crystal", name: "星くず結晶", icon: "💎", desc: "合成素材" },
    { id: "essence", name: "星霊エッセンス", icon: "🌌", desc: "分解でのみ獲得。スキル書の錬成に使う" }
  ];

  const RARITY_ORDER = {
    "コモン": 0,
    "アンコモン": 1,
    "レア": 2,
    "エピック": 3
  };
  const state = {
    currency: 0,
    totalEarned: 0,
    tapPower: 1,
    tapLevel: 0,
    taps: 0,
    pulls: 0,
    itemPity: 0,
    materialPity: 0,
    nextId: 1,
    items: [],
    slots: [null, null, null],
    materials: { dust: 0, gear: 0, crystal: 0, essence: 0 },
    highestRarity: "—",
    prestigePoints: 0,
    totalPrestigePoints: 0,
    totalPrestiges: 0,
    skills: { tap: 0, production: 0, alchemy: 0, luck: 0 },
    permanentUpgrades: { income: 0, startingFunds: 0, luck: 0 },
    startedAt: Date.now(),
    lastSaved: Date.now()
  };
  let toastTimer = null;
  let lastFrame = performance.now();
  let saveAccumulator = 0;
  let lastWalletRender = 0;
  let lastProgressRender = 0;
  // スキルツリーと転生
  const SKILL_DEFS = [
    { id: "tap", name: "タップ研究", icon: "👆", desc: "タップ獲得量 +50% / レベル", max: 3, branch: "手動特化" },
    { id: "production", name: "生産研究", icon: "⚙️", desc: "自動収入 +50% / レベル", max: 3, branch: "放置特化" },
    { id: "alchemy", name: "錬金研究", icon: "🧪", desc: "ガチャ価格 -8% / レベル", max: 3, branch: "錬金・経済" },
    { id: "luck", name: "幸運研究", icon: "☄️", desc: "高レア出現率を上げる / レベル", max: 2, branch: "錬金・経済" }
  ];
  const PRESTIGE_REQUIREMENT = GAME_CONFIG.prestige.requirement;
  const PERMANENT_DEFS = [
    { id: "income", name: "永続の炉心", icon: "🔥", desc: "タップ・自動収入 +25% / レベル", ...GAME_CONFIG.permanentUpgrades.income },
    { id: "startingFunds", name: "再出発の資金", icon: "🪙", desc: "転生後の初期通貨が増加", ...GAME_CONFIG.permanentUpgrades.startingFunds },
    { id: "luck", name: "運命の導き", icon: "🍀", desc: "高レアアイテムが出やすくなる", ...GAME_CONFIG.permanentUpgrades.luck }
  ];
  function skillPointsEarned() {
    return Math.max(0, Math.floor(Math.log10(Math.max(1, state.totalEarned)) / GAME_CONFIG.skill.pointsLogDivisor));
  }
  function skillPointsSpent() {
    return SKILL_DEFS.reduce((sum, skill) => sum + (state.skills[skill.id] || 0), 0);
  }
  function skillPointsAvailable() {
    return Math.max(0, skillPointsEarned() - skillPointsSpent());
  }
  function prestigeReward() {
    if (state.totalEarned < PRESTIGE_REQUIREMENT) return 0;
    return Math.max(GAME_CONFIG.reward.prestigeMinimum, Math.floor(GAME_CONFIG.reward.prestigeBase + GAME_CONFIG.reward.prestigeLogMultiplier * Math.log10(state.totalEarned / PRESTIGE_REQUIREMENT)));
  }
  function permanentCost(def) {
    return def.baseCost + (state.permanentUpgrades[def.id] || 0) * def.stepCost;
  }
  function startingFunds() {
    return Math.min(GAME_CONFIG.prestige.startingCurrencyCap, (state.permanentUpgrades.startingFunds || 0) * GAME_CONFIG.prestige.startingCurrencyPerLevel);
  }
  function unlockedTypeCount() {
    return ITEM_TYPES.filter(type => (type.minPrestige || 0) <= state.totalPrestiges).length;
  }
  function tryBuySkill(id) {
    const def = SKILL_DEFS.find(skill => skill.id === id);
    if (!def) return;
    const level = state.skills[id] || 0;
    if (level >= def.max) return toast("このスキルは最大レベルです。");
    if (skillPointsAvailable() < 1) return toast("スキルポイントが足りません！");
    state.skills[id] = level + 1;
    render(); save();
    toast(`${def.name} Lv.${state.skills[id]} を習得！`);
  }
  function tryBuyPermanent(id) {
    const def = PERMANENT_DEFS.find(upgrade => upgrade.id === id);
    if (!def) return;
    const level = state.permanentUpgrades[id] || 0;
    if (level >= def.max) return toast("この永続研究は最大レベルです。");
    const cost = permanentCost(def);
    if (state.prestigePoints < cost) return toast("転生ポイントが足りません！");
    state.prestigePoints -= cost;
    state.permanentUpgrades[id] = level + 1;
    render(); save();
    toast(`${def.name} を Lv.${level + 1} に強化！`);
  }
  function doPrestige() {
    const reward = prestigeReward();
    if (reward <= 0) return toast("転生条件を満たしていません。");
    if (!window.confirm(`転生して ${reward} ポイントを獲得します。通貨・タップ強化・素材・スキルはリセットされますが、アイテムと装備は残ります。実行しますか？`)) return;
    state.prestigePoints = Math.min(Number.MAX_SAFE_INTEGER, state.prestigePoints + reward);
    state.totalPrestigePoints = Math.min(Number.MAX_SAFE_INTEGER, state.totalPrestigePoints + reward);
    state.totalPrestiges++;
    state.currency = startingFunds();
    state.totalEarned = 0;
    state.tapPower = 1; state.tapLevel = 0; state.taps = 0;
    state.pulls = 0; state.itemPity = 0; state.materialPity = 0;
    state.materials = { dust: 0, gear: 0, crystal: 0, essence: 0 };
    state.skills = { tap: 0, production: 0, alchemy: 0, luck: 0 };
    state.highestRarity = state.items.reduce((highest, item) => {
      const rarity = itemBase(item).rarity;
      return (RARITY_ORDER[rarity] ?? -1) > (RARITY_ORDER[highest] ?? -1) ? rarity : highest;
    }, "—");
    state.startedAt = Date.now(); state.lastSaved = Date.now();
    $("gacha-result").classList.add("hidden");
    render(); save();
    showModal("✦", "転生成功！", `${reward} 転生ポイントを獲得！ アイテムはすべてそのままです。転生回数：${state.totalPrestiges} 回`);
  }
  // 通貨・アイテム計算
  function earn(amount) {
    amount = safe(amount);
    const actual = Math.min(amount, MAX - state.currency);
    state.currency = add(state.currency, actual);
    state.totalEarned = add(state.totalEarned, actual);
  }
  function spend(amount) {
    if (!Number.isFinite(amount) || amount < 0 || state.currency < amount) {
      return false;
    }
    state.currency -= amount;
    if (state.currency < 0) state.currency = 0;
    return true;
  }
  function getItem(id) {
    if (id === "" || id == null) return null;
    return state.items.find(item => item.id === Number(id)) || null;
  }
  function isEnchant(item) {
    return Boolean(item && item.kind === "enchant");
  }

  function itemBase(item) {
    if (isEnchant(item)) return ENCHANT_TYPES[item.enchantTypeIndex] || ENCHANT_TYPES[0];
    return ITEM_TYPES[item.typeIndex] || ITEM_TYPES[0];
  }

  function itemTypeKey(item) {
    return isEnchant(item) ? `enchant:${item.enchantTypeIndex}` : `normal:${item.typeIndex}`;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  // 許可するのは b/strong/i/em/u と span の color 属性だけ。
  // その他のHTML要素は装飾なしのテキストにし、実行可能な属性は引き継がない。
  function sanitizeNameHtml(input) {
    const parsed = new DOMParser().parseFromString(String(input ?? ""), "text/html");
    const allowed = new Set(["B", "STRONG", "I", "EM", "U", "SPAN"]);
    function copyNode(node) {
      if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.nodeValue || "");
      if (node.nodeType !== Node.ELEMENT_NODE) return document.createDocumentFragment();
      if (!allowed.has(node.tagName)) {
        const fragment = document.createDocumentFragment();
        node.childNodes.forEach(child => fragment.appendChild(copyNode(child)));
        return fragment;
      }
      const safe = document.createElement(node.tagName.toLowerCase());
      if (node.tagName === "SPAN") {
        const color = (node.style?.color || "").trim();
        if (/^(#[0-9a-f]{3,8}|[a-z]{3,20}|rgba?\([0-9.,%\s]+\)|hsla?\([0-9.,%\s]+\))$/i.test(color)) safe.style.color = color;
      }
      node.childNodes.forEach(child => safe.appendChild(copyNode(child)));
      return safe;
    }
    const fragment = document.createDocumentFragment();
    parsed.body.childNodes.forEach(node => fragment.appendChild(copyNode(node)));
    const holder = document.createElement("div");
    holder.appendChild(fragment);
    return holder.innerHTML.slice(0, 800);
  }

  function stripNameTags(html) {
    const holder = document.createElement("div");
    holder.innerHTML = sanitizeNameHtml(html);
    return (holder.textContent || "").trim();
  }

  function defaultItemName(item) {
    const baseName = itemBase(item).name;
    if (item.modified && !item.nameCustomized) {
      const visibleName = stripNameTags(item.nameHtml || baseName);
      const suffix = visibleName.includes("改造済み") ? "" : " (改造済み)";
      return `<span style="color:#249b61">${escapeHtml(visibleName)}${suffix}</span>`;
    }
    return escapeHtml(baseName);
  }

  function itemNameHtml(item) {
    return sanitizeNameHtml(item && item.nameHtml ? item.nameHtml : defaultItemName(item));
  }

  function itemPlainName(item) {
    return stripNameTags(itemNameHtml(item));
  }

  function mergeValue(item) {
    return Math.max(0, Math.floor(Number(item?.mergeValue) || 0));
  }
  function levelDisplay(item) {
    const value = mergeValue(item);
    return `Lv.${item.level}${value > 0 ? `<span class="item-card-merge-value">/+${fmt(value, 0)}</span>` : ""}`;
  }
  function fusionLevelText(item) {
    const value = mergeValue(item);
    return `Lv.${item.level}${value > 0 ? `/+${fmt(value, 0)}` : ""}`;
  }
  function itemScore(item) {
    const rarity = (RARITY_ORDER[itemBase(item).rarity] ?? 0) + 1;
    return Math.max(1, Math.floor(rarity * Math.pow(Math.max(1, item.level || 1), GAME_CONFIG.item.scoreLevelExponent) + ((item.enchantments || []).length * GAME_CONFIG.item.scoreEnchantWeight) + mergeValue(item) * GAME_CONFIG.item.scoreMergeValueWeight));
  }

  function decomposeYield(item) {
    return Math.max(1, Math.floor(itemScore(item) * (isEnchant(item) ? GAME_CONFIG.item.enchantDecomposeMultiplier : 1)));
  }

  function isFlatSkillItem(item) {
    // 追加予定の固定値型スキルは ITEM_TYPES に valueMode: "flat" を指定します。
    return Boolean(item && !isEnchant(item) && itemBase(item).valueMode === "flat");
  }

  function enchantValueForItem(item, enchantIndex) {
    const enchant = ENCHANT_TYPES[enchantIndex];
    if (!item || !enchant) return 0;
    const synthesisMultiplier = 1 + mergeValue(item) * GAME_CONFIG.item.mergeValueEffectPerPoint;
    return enchant.value * Math.max(1, item.level) * synthesisMultiplier;
  }

  function enchantSumForItem(item, effect, extraEnchantIndex = null) {
    const indices = [...(item?.enchantments || [])];
    if (extraEnchantIndex !== null && extraEnchantIndex !== undefined) indices.push(extraEnchantIndex);
    return indices.reduce((sum, index) => {
      const enchant = ENCHANT_TYPES[index];
      return sum + (enchant && enchant.effect === effect ? enchantValueForItem(item, index) : 0);
    }, 0);
  }

  function enchantedEffect(effect) {
    let value = 0;
    for (const id of state.slots) {
      const item = getItem(id);
      if (!item || isEnchant(item)) continue;
      const type = itemBase(item);
      for (const enchantIndex of (item.enchantments || [])) {
        const enchant = ENCHANT_TYPES[enchantIndex];
        if (!enchant || enchant.effect !== effect) continue;
        // 固定値型の基本スキルと同じ効果の書は、割合を固定値へ換算する別処理で反映します。
        if (type.effect === effect && isFlatSkillItem(item)) continue;
        value += enchantValueForItem(item, enchantIndex);
      }
    }
    if (effect === "discount") return Math.min(value, GAME_CONFIG.effects.discountEffectCap);
    if (effect === "bonus") return Math.min(value, GAME_CONFIG.effects.bonusEffectCap);
    return Math.min(value, GAME_CONFIG.effects.enchantedEffectCap);
  }

  function equippedFlatEffect(effect) {
    let value = 0;
    for (const id of state.slots) {
      const item = getItem(id);
      if (!item || isEnchant(item)) continue;
      const type = itemBase(item);
      if (type.effect !== effect || !isFlatSkillItem(item)) continue;
      const baseValue = (type.value || 0) * item.level * (1 + mergeValue(item) * GAME_CONFIG.item.mergeValueEffectPerPoint);
      // 固定値 +500 にタップの書 +25% が付くと、固定値スキルは +625 になります。
      value += baseValue * (1 + enchantSumForItem(item, effect));
    }
    return safe(value);
  }

  function effectiveDiscount() {
    return clamp(equippedEffect("discount") + enchantedEffect("discount") + (state.skills.alchemy || 0) * GAME_CONFIG.skill.alchemyDiscountPerLevel, 0, GAME_CONFIG.effects.discountTotalCap);
  }

  function itemIncome(item) {
    if (!item || isEnchant(item)) return 0;
    const type = itemBase(item);
    // 合成値1ごとに、そのアイテム自身の基本収入が10%ずつ上昇する。
    return safe((type.income || 0) * Math.pow(GAME_CONFIG.item.incomePerLevelMultiplier, item.level - 1) * (1 + mergeValue(item) * GAME_CONFIG.item.mergeValueEffectPerPoint));
  }

  // 装備中アイテムの基本割合スキルを集計。書の効果は enchantedEffect() で別途足し合わせます。
  function equippedEffect(effect) {
    let value = 0;
    for (const id of state.slots) {
      const item = getItem(id);
      if (!item || isEnchant(item)) continue;
      const type = itemBase(item);
      if (type.effect === effect && !isFlatSkillItem(item)) {
        value += (type.value || 0) * item.level * (1 + mergeValue(item) * GAME_CONFIG.item.mergeValueEffectPerPoint);
      }
    }
    if (effect === "tap") return Math.min(value, GAME_CONFIG.effects.tapEffectCap);
    if (effect === "global") return Math.min(value, GAME_CONFIG.effects.globalEffectCap);
    if (effect === "production") return Math.min(value, GAME_CONFIG.effects.productionEffectCap);
    if (effect === "discount") return Math.min(value, GAME_CONFIG.effects.discountEffectCap);
    if (effect === "bonus") return Math.min(value, GAME_CONFIG.effects.bonusEffectCap);
    return value;
  }

  function effectLabel(effect) {
    return ({
      income: "自動収入",
      tap: "タップ",
      global: "タップ・自動収入",
      production: "自動収入",
      discount: "ガチャ価格",
      bonus: "追加ボーナス発生率"
    })[effect] || effect;
  }

  function effectValueText(effect, value, flat = false) {
    if (effect === "income") return `+${fmt(value)} / 秒`;
    if (flat) return `+${fmt(value)}`;
    if (effect === "discount") return `-${fmt(value * 100, 1)}%`;
    if (effect === "bonus") return `+${fmt(value * 100, 1)}%`;
    return `+${fmt(value * 100, 1)}%`;
  }

  function itemEffectBreakdownHtml(item, extraEnchantIndex = null, includeCurrentApplied = false) {
    if (!item) return "";
    const type = itemBase(item);
    if (isEnchant(item)) {
      return `<div class="item-effect-breakdown"><div class="item-effect-line"><span>スキル書の効果</span><strong>${escapeHtml(type.desc)}</strong></div></div>`;
    }

    const indices = [...(item.enchantments || [])];
    if (extraEnchantIndex !== null && extraEnchantIndex !== undefined) indices.push(extraEnchantIndex);
    const modified = indices.length > 0;
    const mergeMultiplier = 1 + mergeValue(item) * GAME_CONFIG.item.mergeValueEffectPerPoint;
    const baseValue = type.effect === "income"
      ? itemIncome(item)
      : (type.value || 0) * item.level * mergeMultiplier;
    const flat = isFlatSkillItem(item);
    const rows = [];

    if (type.effect === "income") {
      rows.push(`<div class="item-effect-line"><span>基本スキル</span><strong>自動収入 ${effectValueText("income", baseValue, true)}</strong></div>`);
    } else {
      rows.push(`<div class="item-effect-line"><span>基本スキル（改造前）</span><strong>${effectLabel(type.effect)} ${effectValueText(type.effect, baseValue, flat)}</strong></div>`);
    }

    for (const index of indices) {
      const enchant = ENCHANT_TYPES[index];
      if (!enchant) continue;
      const amount = enchantValueForItem(item, index);
      const valueText = effectValueText(enchant.effect, amount, false);
      rows.push(`<div class="item-effect-line item-effect-modified"><span>${escapeHtml(enchant.name)}による ${escapeHtml(effectLabel(enchant.effect))}</span><strong>${valueText}</strong></div>`);
    }

    const effects = [...new Set([...(type.effect && type.effect !== "income" ? [type.effect] : []), ...indices.map(index => ENCHANT_TYPES[index]?.effect).filter(Boolean)])];
    for (const effect of effects) {
      const bookSum = indices.reduce((sum, index) => {
        const enchant = ENCHANT_TYPES[index];
        return sum + (enchant && enchant.effect === effect ? enchantValueForItem(item, index) : 0);
      }, 0);
      if (type.effect === effect) {
        const combined = flat ? baseValue * (1 + bookSum) : baseValue + bookSum;
        if (bookSum > 0) {
          rows.push(`<div class="item-effect-line item-effect-modified item-effect-total"><span>合算後：${escapeHtml(effectLabel(effect))}</span><strong>${effectValueText(effect, combined, flat)}</strong></div>`);
        }
      } else if (bookSum > 0) {
        rows.push(`<div class="item-effect-line item-effect-modified item-effect-total"><span>合算後：${escapeHtml(effectLabel(effect))}</span><strong>${effectValueText(effect, bookSum, false)}</strong></div>`);
      }
    }

    if (type.effect === "income" && indices.length) {
      const localGlobal = enchantSumForItem(item, "global", extraEnchantIndex);
      const localProduction = enchantSumForItem(item, "production", extraEnchantIndex);
      const projectedIncome = baseValue * (1 + localGlobal) * (1 + localProduction);
      if (projectedIncome !== baseValue) {
        rows.push(`<div class="item-effect-line item-effect-modified item-effect-total"><span>改造込みのこのアイテムの収入目安</span><strong>${effectValueText("income", projectedIncome, true)}</strong></div>`);
      }
    }

    let currentApplied = "";
    if (includeCurrentApplied) {
      currentApplied = `<div class="item-effect-applied"><strong>ゲーム全体への適用後（現在）</strong><div>タップ獲得量：<strong>${fmt(effectiveTapPower())} / 回</strong></div><div>自動収入：<strong>${fmt(totalRate())} / 秒</strong></div><div>ガチャ割引：<strong>${fmt(effectiveDiscount() * 100, 1)}%</strong></div><small>現在の装備構成・スキル・永続強化を反映した値です。このアイテムが未装備の場合、その効果はまだ含まれません。</small></div>`;
    }
    return `<div class="item-effect-breakdown">${rows.join("")}${modified ? `<p class="item-effect-modified-note">緑色の数値は、改造によって付与または変更された効果です。</p>` : ""}${currentApplied}</div>`;
  }

  function effectDescription(item) {
    const type = itemBase(item);
    if (isEnchant(item)) return `スキル書：${type.desc}`;
    const level = item.level;
    let description;
    const raw = (type.value || 0) * level * (1 + mergeValue(item) * GAME_CONFIG.item.mergeValueEffectPerPoint);
    const sameBooks = enchantSumForItem(item, type.effect);
    const merged = type.effect === "income" ? itemIncome(item) : (isFlatSkillItem(item) ? raw * (1 + sameBooks) : raw + sameBooks);
    switch (type.effect) {
      case "tap": description = isFlatSkillItem(item) ? `タップ +${fmt(merged)}` : `タップ獲得量 +${fmt(merged * 100, 1)}%`; break;
      case "global": description = `タップ・自動収入 +${fmt(merged * 100, 1)}%`; break;
      case "production": description = `自動収入 +${fmt(merged * 100, 1)}%`; break;
      case "discount": description = `ガチャ価格 -${fmt(merged * 100, 1)}%`; break;
      case "bonus": description = `タップ時 ${fmt(Math.min(merged, GAME_CONFIG.effects.bonusEffectCap) * 100, 1)}%で追加ボーナス`; break;
      default: description = `自動収入 +${fmt(itemIncome(item))} / 秒`;
    }
    const enchants = (item.enchantments || []).map(index => ENCHANT_TYPES[index]).filter(Boolean);
    const multiplier = mergeValue(item) > 0 ? ` · 合成値倍率 ×${(1 + mergeValue(item) * GAME_CONFIG.item.mergeValueEffectPerPoint).toFixed(1)}` : "";
    const modifiedText = enchants.length ? ` · 改造：${enchants.map(enchant => enchant.name).join("、")}` : "";
    return `${description}${multiplier}${modifiedText}`;
  }

  function totalRate() {
    let base = 0;
    for (const id of state.slots) {
      const item = getItem(id);
      if (item && !isEnchant(item)) base = add(base, itemIncome(item));
    }
    const permanentIncome = 1 + (state.permanentUpgrades.income || 0) * GAME_CONFIG.permanentUpgrades.incomeBonusPerLevel;
    const skillProduction = 1 + (state.skills.production || 0) * GAME_CONFIG.skill.productionBonusPerLevel;
    // 同じ効果の基本スキルとスキル書は加算してから、異なるカテゴリの倍率を適用します。
    return safe(base * (1 + equippedEffect("global") + enchantedEffect("global")) *
      (1 + equippedEffect("production") + enchantedEffect("production")) * permanentIncome * skillProduction);
  }

  function effectiveTapPower() {
    const tapFlat = equippedFlatEffect("tap");
    return safe((state.tapPower + tapFlat) *
      (1 + equippedEffect("tap") + enchantedEffect("tap")) *
      (1 + equippedEffect("global") + enchantedEffect("global")) *
      (1 + (state.skills.tap || 0) * GAME_CONFIG.skill.tapBonusPerLevel) *
      (1 + (state.permanentUpgrades.income || 0) * GAME_CONFIG.permanentUpgrades.incomeBonusPerLevel));
  }

  function itemCost() {
    return Math.min(
      GAME_CONFIG.gacha.costCap,
      GAME_CONFIG.gacha.itemBaseCost * Math.pow(GAME_CONFIG.gacha.itemCostGrowth, state.pulls) * (1 - effectiveDiscount())
    );
  }
  function materialCost() {
    return Math.min(
      GAME_CONFIG.gacha.costCap,
      GAME_CONFIG.gacha.materialBaseCost * Math.pow(GAME_CONFIG.gacha.materialCostGrowth, state.materialPity) * (1 - effectiveDiscount())
    );
  }
  // タップ強化コストと増加量は GAME_CONFIG.upgrade に集約。
  function tapCost() {
    // 実際の増加量は購入処理側で、現在の基本獲得量 × tapGainRatio（最低 tapMinimumGain）。
    return Math.min(GAME_CONFIG.gacha.costCap, GAME_CONFIG.upgrade.tapBaseCost * Math.pow(GAME_CONFIG.upgrade.tapCostGrowth, state.tapLevel));
  }
  function materialTotal() {
    return Object.values(state.materials).reduce((a, b) => a + b, 0);
  }
  // UI補助
  function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove("show");
    }, 2100);
  }
  function showModal(icon, title, description) {
    $("modal-icon").textContent = icon;    $("modal-title").textContent = title;
    $("modal-description").textContent = description;
    $("modal-backdrop").classList.remove("hidden");
  }
  function hideModal() {
    $("modal-backdrop").classList.add("hidden");
  }
  function setTab(tab) {
    document.querySelectorAll(".tab").forEach(button => {
      button.classList.toggle("active", button.dataset.tab === tab);
    });
    document.querySelectorAll(".page").forEach(page => {
      page.classList.toggle("active", page.id === `page-${tab}`);
    });
    window.scrollTo({
      top: 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth"
    });
  }
  // ガチャ
  function rollRarity() {
    const luck = (state.skills.luck || 0) * GAME_CONFIG.skill.luckBonusPerSkillLevel + (state.permanentUpgrades.luck || 0) * GAME_CONFIG.skill.luckBonusPerPermanentLevel + enchantedEffect("luck");
    const n = Math.random() * 100;
    const commonLimit = clamp(GAME_CONFIG.gacha.rarityCommonLimit - luck * GAME_CONFIG.gacha.luckCommonPerPoint, GAME_CONFIG.gacha.minCommonLimit, GAME_CONFIG.gacha.rarityCommonLimit);
    const uncommonLimit = clamp(GAME_CONFIG.gacha.rarityUncommonLimit - luck * GAME_CONFIG.gacha.luckUncommonPerPoint, commonLimit + GAME_CONFIG.gacha.minUncommonGap, GAME_CONFIG.gacha.rarityUncommonLimit);
    const rareLimit = clamp(GAME_CONFIG.gacha.rarityRareLimit - luck * GAME_CONFIG.gacha.luckRarePerPoint, uncommonLimit + GAME_CONFIG.gacha.minRareGap, GAME_CONFIG.gacha.rarityRareLimit);
    if (n < commonLimit) return "コモン";
    if (n < uncommonLimit) return "アンコモン";
    if (n < rareLimit) return "レア";
    return "エピック";
  }

  function createItem(typeIndex, level = 1) {
    const type = ITEM_TYPES[typeIndex];
    const item = { id: state.nextId++, typeIndex, level, mergeValue: 0, equipped: false, locked: false,
      kind: "normal", enchantments: [], modified: false, nameCustomized: false, nameHtml: "" };
    state.items.push(item);
    if ((RARITY_ORDER[type.rarity] ?? -1) > (RARITY_ORDER[state.highestRarity] ?? -1)) state.highestRarity = type.rarity;
    return item;
  }

  function createEnchantItem(enchantTypeIndex, level = 1) {
    const item = { id: state.nextId++, kind: "enchant", enchantTypeIndex, level, mergeValue: 0, equipped: false,
      locked: false, enchantments: [], modified: false, nameCustomized: false, nameHtml: "" };
    state.items.push(item);
    const rarity = itemBase(item).rarity;
    if ((RARITY_ORDER[rarity] ?? -1) > (RARITY_ORDER[state.highestRarity] ?? -1)) state.highestRarity = rarity;
    return item;
  }

  function randomItem() {
    let rarity = rollRarity();
    if (state.itemPity >= GAME_CONFIG.gacha.pityPulls - 1 && RARITY_ORDER[rarity] < 2) rarity = Math.random() < 1 - GAME_CONFIG.gacha.pityEpicChance ? "レア" : "エピック";
    const choices = ITEM_TYPES.map((type, index) => ({ type, index }))
      .filter(entry => entry.type.rarity === rarity && (entry.type.minPrestige || 0) <= state.totalPrestiges);
    if (!choices.length) return createItem(0);
    return createItem(choices[Math.floor(Math.random() * choices.length)].index);
  }

  function randomEnchantItem() {
    const rarity = rollRarity();
    let choices = ENCHANT_TYPES.map((type, index) => ({ type, index })).filter(entry => entry.type.rarity === rarity);
    if (!choices.length) choices = ENCHANT_TYPES.map((type, index) => ({ type, index }));
    return createEnchantItem(choices[Math.floor(Math.random() * choices.length)].index);
  }

  function randomMaterial() {
    const n = Math.random() * 100;
    let id;
    if (n < GAME_CONFIG.materials.dustDropBelow) {
      id = "dust";
    } else if (n < GAME_CONFIG.materials.gearDropBelow) {
      id = "gear";
    } else {
      id = "crystal";
    }
    const amount = id === "dust" ? GAME_CONFIG.materials.dustPerDrop : id === "gear" ? GAME_CONFIG.materials.gearPerDrop : GAME_CONFIG.materials.crystalPerDrop;
    state.materials[id] = Math.min(
      Number.MAX_SAFE_INTEGER,
      state.materials[id] + amount
    );
    return MATERIALS.find(material => material.id === id);
  }
  // 装備管理
  function equip(itemId, slotIndex) {
    const item = getItem(itemId);
    if (!item || slotIndex < 0 || slotIndex >= state.slots.length) {
      return;
    }
    if (state.slots[slotIndex] === item.id) {
      state.slots[slotIndex] = null;
      item.equipped = false;
    } else {
      const oldId = state.slots[slotIndex];
      const oldItem = getItem(oldId);
      if (oldItem) oldItem.equipped = false;
      // 同じアイテムを複数枠にセットしない
      state.slots = state.slots.map(id => id === item.id ? null : id);
      state.slots[slotIndex] = item.id;
      item.equipped = true;
    }
    render();
    save();
  }
  function unequip(slotIndex) {
    const id = state.slots[slotIndex];
    state.slots[slotIndex] = null;
    const item = getItem(id);
    if (item) item.equipped = false;
    render();
    save();
  }
  const gachaCounts = { item: 1, material: 1, enchant: 1 };
  let fusionMaterialAmount = GAME_CONFIG.fusion.investmentDefault;

  function unitGachaCost(kind, offset = 0) {
    if (kind === "item") return Math.min(GAME_CONFIG.gacha.costCap, GAME_CONFIG.gacha.itemBaseCost * Math.pow(GAME_CONFIG.gacha.itemCostGrowth, state.pulls + offset) * (1 - effectiveDiscount()));
    if (kind === "material") return Math.min(GAME_CONFIG.gacha.costCap, GAME_CONFIG.gacha.materialBaseCost * Math.pow(GAME_CONFIG.gacha.materialCostGrowth, state.materialPity + offset) * (1 - effectiveDiscount()));
    return GAME_CONFIG.enchant.essenceCostPerPull;
  }
  function batchGachaCost(kind, count = gachaCounts[kind] || 1) {
    let total = 0;
    for (let i = 0; i < count; i++) total = add(total, unitGachaCost(kind, i));
    return total;
  }
  function renderGachaControls() {
    for (const kind of ["item", "material", "enchant"]) {
      const group = document.querySelector(`[data-gacha-count-group="${kind}"]`);
      // ボタン群自体も GAME_CONFIG から生成し、連数の定義が二重管理にならないようにする。
      if (group && group.dataset.configured !== "true") {
        group.innerHTML = GAME_CONFIG.gacha.pullCounts.map(count =>
          `<button type="button" class="pull-count-button" data-pull-count="${kind}" data-count="${count}">x${count}</button>`
        ).join("");
        group.dataset.configured = "true";
      }
      const count = gachaCounts[kind] || 1;
      document.querySelectorAll(`[data-gacha-count-group="${kind}"] [data-pull-count]`).forEach(button => {
        button.classList.toggle("active", Number(button.dataset.count) === count);
        button.setAttribute("aria-pressed", String(Number(button.dataset.count) === count));
      });
      const cost = batchGachaCost(kind, count);
      const totalId = kind === "item" ? "item-gacha-total-cost" : kind === "material" ? "material-gacha-total-cost" : "enchant-gacha-total-cost";
      if ($(totalId)) $(totalId).textContent = kind === "enchant" ? `合計 ${fmt(cost, 0)} エッセンス` : `合計 ${fmt(cost, 0)} 通貨`;
      const buttonId = kind === "item" ? "pull-item" : kind === "material" ? "pull-material" : "pull-enchant";
      if ($(buttonId)) {
        $(buttonId).textContent = kind === "enchant" ? `x${count}で錬成` : `x${count}で引く`;
        $(buttonId).disabled = kind === "enchant" ? (state.materials.essence || 0) < cost : state.currency < cost;
      }
    }
    if ($("item-gacha-cost")) $("item-gacha-cost").textContent = fmt(unitGachaCost("item"), 0);
    if ($("material-gacha-cost")) $("material-gacha-cost").textContent = fmt(unitGachaCost("material"), 0);
  }

  function fusionMaterialRequirement(target, source) {
    if (!target || !source) return GAME_CONFIG.fusion.minimumCrystal;
    // レア度・レベル・合成値・付与スキルが強いアイテムほど、必要結晶が増える。
    return Math.max(GAME_CONFIG.fusion.minimumCrystal, Math.ceil((itemScore(target) + itemScore(source)) / GAME_CONFIG.fusion.materialScoreDivisor));
  }

  function fusionProbabilities(target, required, invested) {
    const value = mergeValue(target);
    const extraRatio = required > 0 ? Math.max(0, invested - required) / required : 0;
    if (value === 0) {
      const great = GAME_CONFIG.fusion.noRiskGreatSuccessBase + Math.min(GAME_CONFIG.fusion.noRiskGreatSuccessCap - GAME_CONFIG.fusion.noRiskGreatSuccessBase, extraRatio * GAME_CONFIG.fusion.noRiskGreatSuccessPerExtraRatio);
      return { greatSuccess: great, success: 100 - great, failure: 0, greatFailure: 0, superFailure: 0 };
    }
    let failure = Math.min(GAME_CONFIG.fusion.failureCap, GAME_CONFIG.fusion.failureBase + value * GAME_CONFIG.fusion.failurePerMergeValue);
    let greatFailure = Math.min(GAME_CONFIG.fusion.severeFailureCap, GAME_CONFIG.fusion.severeFailureBase + value * GAME_CONFIG.fusion.severeFailurePerMergeValue);
    let superFailure = Math.min(GAME_CONFIG.fusion.severeFailureCap, GAME_CONFIG.fusion.severeFailureBase + value * GAME_CONFIG.fusion.severeFailurePerMergeValue);
    const totalFailure = failure + greatFailure + superFailure;
    const scale = totalFailure > GAME_CONFIG.fusion.combinedFailureCap ? GAME_CONFIG.fusion.combinedFailureCap / totalFailure : 1;
    failure *= scale; greatFailure *= scale; superFailure *= scale;
    const scaledTotal = failure + greatFailure + superFailure;
    const boost = Math.min(scaledTotal, extraRatio * GAME_CONFIG.fusion.boostFailureReductionPerExtraRatio);
    const remainingScale = scaledTotal > 0 ? (scaledTotal - boost) / scaledTotal : 0;
    failure *= remainingScale; greatFailure *= remainingScale; superFailure *= remainingScale;
    const positives = 100 - failure - greatFailure - superFailure;
    return { greatSuccess: positives / 2, success: positives / 2, failure, greatFailure, superFailure };
  }

  function showFusionProbabilities(probabilities) {
    const names = [
      ["greatSuccess", "大成功", "fusion-outcome-great"],
      ["success", "成功", "fusion-outcome-success"],
      ["failure", "失敗", "fusion-outcome-failure"],
      ["greatFailure", "大失敗", "fusion-outcome-great-failure"],
      ["superFailure", "超大失敗", "fusion-outcome-super-failure"]
    ];
    return `<div class="fusion-probability-grid">${names.map(([key, label, cls]) => `<div class="fusion-probability ${cls}"><span>${label}</span><strong>${probabilities[key].toFixed(1)}%</strong></div>`).filter((html, index) => {
      const key = names[index][0];
      return probabilities[key] > 0.001;
    }).join("")}</div>`;
  }

  function rollFusionOutcome(probabilities) {
    const roll = Math.random() * 100;
    let total = 0;
    const order = ["greatSuccess", "success", "failure", "greatFailure", "superFailure"];
    for (const key of order) {
      total += probabilities[key];
      if (roll < total) return key;
    }
    return "success";
  }

  function mergeResultLevelHtml(item, value) {
    return `${itemBase(item).icon}<br><strong>${itemNameHtml(item)}</strong><br><span class="fusion-level-main">Lv.${item.level}</span>${value > 0 ? `<span class="fusion-merge-value">/+${fmt(value, 0)}</span>` : ""}`;
  }

  // ヘッダー・ホーム表示
  function renderWallet() {
    $("currency").textContent = fmt(state.currency);
    $("rate").textContent = fmt(totalRate());
    $("home-rate").textContent = fmt(totalRate()) + " / 秒";
    $("tap-power").textContent = `+${fmt(effectiveTapPower())} 通貨`;
    $("tap-power-label").textContent = `+${fmt(effectiveTapPower())} / tap`;
    $("tap-upgrade-cost").textContent = fmt(tapCost(), 0);
    $("tap-upgrade").disabled = state.currency < tapCost();
    $("slot-summary").textContent =
      `${state.slots.filter(id => id !== null).length} / ${state.slots.length}`;
    $("item-count").textContent = `${state.items.length} 個`;
    renderGachaControls();
    $("gacha-pity").textContent = state.pulls;

    // 持ち物タブに表示する通貨の詳細情報も、同じゲーム状態から更新する。
    if ($("holdings-currency")) $("holdings-currency").textContent = fmt(state.currency);
    if ($("holdings-earned")) $("holdings-earned").textContent = fmt(state.totalEarned);
    if ($("holdings-rate")) $("holdings-rate").textContent = `${fmt(totalRate())} / 秒`;
    if ($("holdings-tap-power")) $("holdings-tap-power").textContent = `${fmt(effectiveTapPower())} / 回`;
    if ($("holdings-prestige-count")) $("holdings-prestige-count").textContent = `${fmt(state.totalPrestiges, 0)} 回`;
    if ($("holdings-inventory-count")) $("holdings-inventory-count").textContent = `${state.items.length} 個`;
    if ($("collection-count-holdings")) $("collection-count-holdings").textContent = state.items.length;
    if ($("equipment-inventory-count")) $("equipment-inventory-count").textContent = `${state.items.length} 個`;
  }
  // アイテム一覧・カード選択・フィルター
  const pickerPrefixes = ["inventory", "equipment-inventory", "upgrade", "merge", "decompose", "modify-target", "modify-enchant"];
  let selectedUpgradeId = null;
  let selectedMergeIds = [null, null];
  let activeMergeSlot = 0;
  let selectedModifyTargetId = null;
  let selectedModifyEnchantId = null;
  let selectedDecomposeIds = new Set();
  let activeDetailItemId = null;

  function renderFilterControls(prefix) {
    const el = $(`${prefix}-filters`);
    if (!el) return;
    const previous = Object.fromEntries(["type", "rarity", "min", "max", "lock", "search"].map(key => [key, $(`${prefix}-filter-${key}`)?.value ?? ""]));
    const currentType = previous.type || "all";
    const typeOptions = [
      `<option value="all">すべて</option>`,
      `<option value="normal">通常アイテム全種</option>`,
      `<option value="enchant">スキル書全種</option>`,
      ...ITEM_TYPES.map((t, index) => `<option value="normal:${index}">${escapeHtml(t.name)}</option>`),
      ...ENCHANT_TYPES.map((t, index) => `<option value="enchant:${index}">${escapeHtml(t.name)}</option>`)
    ].join("");
    el.innerHTML = `
      <label class="filter-search">名前で検索<input class="item-filter-control" data-filter-prefix="${prefix}" id="${prefix}-filter-search" type="search" placeholder="アイテム名" value="${escapeHtml($(`${prefix}-filter-search`)?.value || "")}"></label>      <label>種類<select class="item-filter-control" data-filter-prefix="${prefix}" id="${prefix}-filter-type">${typeOptions}</select></label>
      <label>レア度<select class="item-filter-control" data-filter-prefix="${prefix}" id="${prefix}-filter-rarity"><option value="all">すべて</option><option>コモン</option><option>アンコモン</option><option>レア</option><option>エピック</option></select></label>
      <label>Lv.下限<input class="item-filter-control" data-filter-prefix="${prefix}" id="${prefix}-filter-min" type="number" min="1" placeholder="1"></label>
      <label>Lv.上限<input class="item-filter-control" data-filter-prefix="${prefix}" id="${prefix}-filter-max" type="number" min="1" placeholder="上限なし"></label>
      <label>ロック<select class="item-filter-control" data-filter-prefix="${prefix}" id="${prefix}-filter-lock"><option value="all">すべて</option><option value="unlocked">ロックなし</option><option value="locked">ロック中</option></select></label>`;
    const typeEl = $(`${prefix}-filter-type`); if (typeEl) typeEl.value = [...typeEl.options].some(o => o.value === currentType) ? currentType : "all";
    for (const key of ["rarity", "min", "max", "lock", "search"]) {
      const control = $(`${prefix}-filter-${key}`);
      if (control && previous[key] !== "") control.value = previous[key];
    }
  }

  function itemMatchesFilters(item, prefix) {
    const typeFilter = $(`${prefix}-filter-type`)?.value || "all";
    const rarityFilter = $(`${prefix}-filter-rarity`)?.value || "all";
    const min = Number($(`${prefix}-filter-min`)?.value || 1);
    const max = Number($(`${prefix}-filter-max`)?.value || 0);
    const locked = $(`${prefix}-filter-lock`)?.value || "all";
    const search = ($(`${prefix}-filter-search`)?.value || "").trim().toLocaleLowerCase();
    if (typeFilter === "normal" && isEnchant(item)) return false;
    if (typeFilter === "enchant" && !isEnchant(item)) return false;
    if (typeFilter.startsWith("normal:") && (!(!isEnchant(item) && item.typeIndex === Number(typeFilter.split(":")[1])))) return false;
    if (typeFilter.startsWith("enchant:") && (!(isEnchant(item) && item.enchantTypeIndex === Number(typeFilter.split(":")[1])))) return false;
    if (rarityFilter !== "all" && itemBase(item).rarity !== rarityFilter) return false;
    if (item.level < min || (max > 0 && item.level > max)) return false;
    if (locked === "unlocked" && item.locked) return false;
    if (locked === "locked" && !item.locked) return false;
    if (search && !itemPlainName(item).toLocaleLowerCase().includes(search)) return false;
    return true;
  }

  function renderPicker(prefix) {
    const grid = prefix === "inventory" ? $("inventory") : ($(`${prefix}-item-grid`) || $(`${prefix}-grid`));
    if (!grid) return;
    const eligible = state.items.filter(item => {
      if (!itemMatchesFilters(item, prefix)) return false;
      if (prefix === "inventory" || prefix === "equipment-inventory") return true;
      if (prefix === "upgrade") return !item.locked && !isEnchant(item);
      if (prefix === "merge") return !item.locked && !isEnchant(item);
      if (prefix === "decompose") return true;
      if (prefix === "modify-target") return !item.locked && !isEnchant(item);
      if (prefix === "modify-enchant") return !item.locked && isEnchant(item);
      return true;
    }).sort((a, b) => (RARITY_ORDER[itemBase(b).rarity] - RARITY_ORDER[itemBase(a).rarity]) || b.level - a.level || a.id - b.id);
    if (!eligible.length) {
      grid.innerHTML = prefix === "inventory" && state.items.length === 0
        ? `<div class="empty-state"><div style="font-size:30px">🎒</div><strong>まだアイテムがないよ</strong><span>ガチャで最初の相棒を見つけよう！</span><br><button class="secondary-button" data-goto="gacha">ガチャへ →</button></div>`
        : `<div class="item-filter-empty">条件に一致するアイテムがありません。</div>`;
      return;
    }
    grid.innerHTML = eligible.map(item => {
      const selected = (prefix === "inventory" || prefix === "equipment-inventory") ? false
        : prefix === "upgrade" ? selectedUpgradeId === item.id
        : prefix === "merge" ? selectedMergeIds.includes(item.id)
        : prefix === "decompose" ? selectedDecomposeIds.has(item.id)
        : prefix === "modify-target" ? selectedModifyTargetId === item.id
        : selectedModifyEnchantId === item.id;
      const equipped = state.slots.includes(item.id);
      const otherMergeItem = prefix === "merge" ? getItem(selectedMergeIds[1 - activeMergeSlot]) : null;
      const incompatibleMergeType = prefix === "merge" && otherMergeItem && selectedMergeIds[activeMergeSlot] !== item.id && (isEnchant(item) || item.typeIndex !== otherMergeItem.typeIndex);
      // 選択できないカードもdisabled属性にはしない。長押し詳細表示は常に使えるようにする。
      const blocked = (prefix === "decompose" && (item.locked || equipped)) || (prefix === "merge" && (item.locked || isEnchant(item) || (activeMergeSlot === 1 && equipped)));
      const visuallyBlocked = blocked || incompatibleMergeType;
      const flag = `${item.locked ? "🔒" : ""}${equipped ? "⚙️" : ""}`;
      const actionAttributes = (prefix === "inventory" || prefix === "equipment-inventory") ? `data-open-item="${item.id}"` : `data-picker-item="${item.id}" data-picker-prefix="${prefix}"`;
      return `<button class="item-card ${selected ? "selected" : ""} ${item.locked ? "locked" : ""} ${equipped ? "equipped" : ""} ${visuallyBlocked ? "unavailable" : ""}" data-item-detail-id="${item.id}" ${actionAttributes} aria-disabled="${visuallyBlocked}" aria-pressed="${selected}">
        <span class="item-card-level">${levelDisplay(item)}</span><span class="item-card-flags">${flag}</span>
        <span class="item-card-icon">${itemBase(item).icon}</span><span class="item-card-name"><span class="name-display">${itemNameHtml(item)}</span></span>
        <span class="item-card-meta">${itemBase(item).rarity}${isEnchant(item) ? " · スキル書" : ""}</span>
        ${prefix === "decompose" && !blocked ? `<span class="item-card-meta">🌌 +${decomposeYield(item)}</span>` : ""}
        ${selected ? `<span class="item-card-check">✓</span>` : ""}
      </button>`;
    }).join("");
  }

  function renderSlots() {
    $("slot-label").textContent = `${state.slots.filter(id => id !== null).length} / ${state.slots.length} 装備中`;
    $("slots").innerHTML = state.slots.map((id, index) => {
      const item = getItem(id);
      if (!item || isEnchant(item)) return `<div class="slot"><span class="slot-icon">＋</span><strong>空きスロット ${index + 1}</strong><small>アイテムをセット</small></div>`;
      const type = itemBase(item);
      return `<div class="slot filled" data-item-detail-id="${item.id}"><span class="slot-icon">${type.icon}</span><strong>${itemNameHtml(item)}</strong><small>${levelDisplay(item)} · ${effectDescription(item)}</small><button data-open-item="${item.id}">詳細</button><button data-unequip="${index}">はずす</button></div>`;
    }).join("");
  }

  function renderItems() {
    $("collection-count").textContent = state.items.length;
    renderSlots();
    renderCraftSelectors();
    renderDecomposePage();
    renderAlchemyPage();
  }

  function renderCraftSelectors() {
    for (const prefix of pickerPrefixes) renderFilterControls(prefix);
    renderPicker("inventory"); renderPicker("equipment-inventory"); renderPicker("upgrade"); renderPicker("merge"); renderPicker("modify-target"); renderPicker("modify-enchant");
    renderCraftPreviews();
  }

  function modificationCost(target) {
    const degree = Math.max(0, target && Array.isArray(target.enchantments) ? target.enchantments.length : 0);
    return {
      dust: GAME_CONFIG.enchant.modifyDustCost + degree * GAME_CONFIG.enchant.modifyDustCostPerDegree,
      gear: GAME_CONFIG.enchant.modifyGearCost + degree * GAME_CONFIG.enchant.modifyGearCostPerDegree,
      crystal: GAME_CONFIG.enchant.modifyCrystalCost + degree * GAME_CONFIG.enchant.modifyCrystalCostPerDegree,
      degree
    };
  }

  function renderCraftPreviews() {
    const item = getItem(selectedUpgradeId);
    const dustCost = item ? GAME_CONFIG.upgrade.itemDustPerLevel * item.level : 0;
    const gearCost = item ? GAME_CONFIG.upgrade.itemGearPerLevel * item.level : 0;
    $("upgrade-preview").innerHTML = item
      ? `<div><strong>${itemBase(item).icon} ${itemNameHtml(item)} ${levelDisplay(item)} → Lv.${item.level + 1}${mergeValue(item) > 0 ? `<span class="item-card-merge-value">/+${mergeValue(item)}</span>` : ""}</strong><br>必要素材：✨ きらきら粉 <strong>${dustCost}</strong>、⚙️ ちいさな歯車 <strong>${gearCost}</strong><br>${effectDescription(item)} → ${effectDescription({ ...item, level: item.level + 1 })}</div>`
      : "上のカードから強化するアイテムを選んでください。";
    $("upgrade-item").disabled = !item || item.locked || isEnchant(item) || state.materials.dust < dustCost || state.materials.gear < gearCost;

    const target = getItem(selectedMergeIds[0]);
    const source = getItem(selectedMergeIds[1]);
    const validPair = target && source && target.id !== source.id && !isEnchant(target) && !isEnchant(source) && target.typeIndex === source.typeIndex && !target.locked && !source.locked && !state.slots.includes(source.id);
    const targetBox = $("merge-target-box");
    const sourceBox = $("merge-material-box");
    const resultBox = $("merge-result-box");
    targetBox.classList.toggle("empty", !target);
    sourceBox.classList.toggle("empty", !source);
    if (target) targetBox.dataset.itemDetailId = String(target.id); else delete targetBox.dataset.itemDetailId;
    if (source) sourceBox.dataset.itemDetailId = String(source.id); else delete sourceBox.dataset.itemDetailId;
    targetBox.innerHTML = target ? `${itemBase(target).icon}<br><strong>${itemNameHtml(target)}</strong><br><span class="fusion-level-main">${fusionLevelText(target).split("/+")[0]}</span>${mergeValue(target) > 0 ? `<span class="fusion-merge-value">/+${fmt(mergeValue(target), 0)}</span>` : ""}` : "対象アイテムを選択";
    sourceBox.innerHTML = source ? `${itemBase(source).icon}<br><strong>${itemNameHtml(source)}</strong><br><span class="fusion-level-main">${fusionLevelText(source).split("/+")[0]}</span>${mergeValue(source) > 0 ? `<span class="fusion-merge-value">/+${fmt(mergeValue(source), 0)}</span>` : ""}` : "素材アイテムを選択";
    $("merge-selected-label").textContent = `対象：${target ? `${itemPlainName(target)} ${fusionLevelText(target)}` : "未選択"} ／ 素材：${source ? `${itemPlainName(source)} ${fusionLevelText(source)}` : "未選択"}`;
    $("merge-slot-0").classList.toggle("active", activeMergeSlot === 0);
    $("merge-slot-1").classList.toggle("active", activeMergeSlot === 1);

    const required = validPair ? fusionMaterialRequirement(target, source) : GAME_CONFIG.fusion.minimumCrystal;
    const owned = state.materials.crystal || 0;
    const maxAmount = Math.max(required, owned);
    if (!validPair || fusionMaterialAmount < required || fusionMaterialAmount > maxAmount) fusionMaterialAmount = required;
    const range = $("fusion-material-range");
    const number = $("fusion-material-number");
    range.min = String(required); range.max = String(maxAmount); range.value = String(fusionMaterialAmount);
    number.min = String(required); number.max = String(maxAmount); number.value = String(fusionMaterialAmount);
    const enough = owned >= required;
    range.disabled = !validPair || !enough || maxAmount <= required;
    number.disabled = !validPair || !enough;
    $("fusion-crystal-owned").textContent = `所持 ${fmt(owned, 0)} 個`;
    $("fusion-material-requirement").textContent = validPair
      ? `最低必要数：${fmt(required, 0)} 個（対象と素材の価値から計算）${enough ? "" : ` · あと ${fmt(required - owned, 0)} 個必要`}`
      : "対象と素材を選ぶと最低必要数が表示されます。";
    $("fusion-material-investment").textContent = validPair ? `投入：${fmt(fusionMaterialAmount, 0)} / ${fmt(owned, 0)} 個` : "投入：—";

    if (validPair) {
      const probabilities = fusionProbabilities(target, required, fusionMaterialAmount);
      $("fusion-probabilities").innerHTML = showFusionProbabilities(probabilities) + `<p class="fusion-probability-note">対象の現在の合成値：${mergeValue(target)} · 追加投入によって成功以上の確率が上がります。</p>`;
      const resultLevel = Math.max(target.level, source.level);
      const resultValue = mergeValue(target) + mergeValue(source) + GAME_CONFIG.fusion.successMergeBonus;
      resultBox.classList.remove("empty");
      resultBox.innerHTML = `${itemBase(target).icon}<br><strong>${itemNameHtml(target)}</strong><br><span class="fusion-level-main">Lv.${resultLevel}</span><span class="fusion-merge-value">/+${fmt(resultValue, 0)}</span><small>成功時（+1）</small>`;
      $("merge-preview").innerHTML = `<strong>成功した場合</strong><br>${itemNameHtml(target)}：${fusionLevelText(target)} ＋ ${itemNameHtml(source)}：${fusionLevelText(source)}<br>→ <strong>${itemNameHtml(target)} Lv.${resultLevel}<span class="fusion-merge-value">/+${fmt(resultValue, 0)}</span></strong><br>成功・大成功時は素材アイテムのレベルと合成値を取り込みます。失敗時は対象だけが結果に応じて変化します。`;
      $("merge-item").disabled = !enough;
    } else {
      resultBox.classList.add("empty"); resultBox.textContent = "成功時の結果プレビュー";
      $("fusion-probabilities").innerHTML = `<p class="muted">対象と素材を選ぶと、結果ごとの確率がここに表示されます。</p>`;
      $("merge-preview").textContent = "同じ種類の通常アイテムを対象と素材に選んでください。レベルと合成値は異なっていても構いません。ロック中のアイテムは選べません。";
      $("merge-item").disabled = true;
    }

    // 改造プレビューと実行ボタンを、対象・スキル書の選択のたびに更新する。
    // 以前はこの更新が欠けており、必要素材が足りていてもボタンが disabled のままだった。
    const modifyTarget = getItem(selectedModifyTargetId);
    const modifyBook = getItem(selectedModifyEnchantId);
    // 同じ種類のスキル書を何度でも付与できます。改造度に応じて素材コストが上昇します。
    const modifyValid = Boolean(modifyTarget && modifyBook &&
      !isEnchant(modifyTarget) && isEnchant(modifyBook) &&
      !modifyTarget.locked && !modifyBook.locked &&
      modifyTarget.id !== modifyBook.id);
    const modifyCost = modificationCost(modifyTarget);
    const modDust = modifyCost.dust;
    const modGear = modifyCost.gear;
    const modCrystal = modifyCost.crystal;
    // 対象選択のたびに、画面下部の素材コスト表示も更新する。
    if ($("modify-dust-cost")) $("modify-dust-cost").textContent = modDust;
    if ($("modify-gear-cost")) $("modify-gear-cost").textContent = modGear;
    if ($("modify-crystal-cost")) $("modify-crystal-cost").textContent = modCrystal;
    const enoughModifyMaterials = state.materials.dust >= modDust &&
      state.materials.gear >= modGear && state.materials.crystal >= modCrystal;
    if (modifyValid) {
      const hasSuffix = itemPlainName(modifyTarget).includes("改造済み");
      const resultingName = modifyTarget.modified && !modifyTarget.nameCustomized
        ? itemNameHtml(modifyTarget)
        : `<span style="color:#249b61">${escapeHtml(itemPlainName(modifyTarget))}${hasSuffix ? "" : " (改造済み)"}</span>`;
      $("modify-preview").innerHTML = `<div class="modify-preview-equation"><div class="modify-preview-item"><span>${itemBase(modifyTarget).icon}</span><strong>${itemNameHtml(modifyTarget)}</strong><small>${fusionLevelText(modifyTarget)}</small></div><span class="modify-preview-plus">＋</span><div class="modify-preview-item"><span>${itemBase(modifyBook).icon}</span><strong>${itemNameHtml(modifyBook)}</strong><small>スキル書</small></div><span class="modify-preview-arrow">→</span><div class="modify-preview-item modify-preview-result"><span>${itemBase(modifyTarget).icon}</span><strong>${resultingName}</strong><small>改造度 ${modifyCost.degree + 1}</small></div></div><p>${escapeHtml(itemBase(modifyBook).desc)}</p><p class="muted small">必要素材：✨ ${modDust}（所持 ${state.materials.dust}） · ⚙️ ${modGear}（所持 ${state.materials.gear}） · 💎 ${modCrystal}（所持 ${state.materials.crystal}）<br>同じ効果も重ねて付与できます。改造回数が増えるほど必要素材が増加します。</p><div class="modify-effect-preview"><strong>改造後の効果内訳（緑色は改造による変更）</strong>${itemEffectBreakdownHtml(modifyTarget, modifyBook.enchantTypeIndex, false)}</div>`;
    } else {
      $("modify-preview").textContent = "通常アイテムと、付与したいスキル書をそれぞれ選択してください。ロック中のアイテムは選べません。";
    }
    $("modify-item").disabled = !modifyValid || !enoughModifyMaterials;
  }

  function renderDecomposePage() {
    if ($("essence-count")) $("essence-count").textContent = fmt(state.materials.essence || 0, 0);
    if ($("decompose-selected-count")) $("decompose-selected-count").textContent = `${selectedDecomposeIds.size} 個選択`;
    if ($("decompose-bulk")) $("decompose-bulk").disabled = selectedDecomposeIds.size === 0;
    renderPicker("decompose");
  }

  function renderAlchemyPage() {
    if ($("alchemy-cost")) $("alchemy-cost").textContent = GAME_CONFIG.enchant.essenceCostPerPull;
    const currentModifyCost = modificationCost(getItem(selectedModifyTargetId));
    if ($("modify-dust-cost")) $("modify-dust-cost").textContent = currentModifyCost.dust;
    if ($("modify-gear-cost")) $("modify-gear-cost").textContent = currentModifyCost.gear;
    if ($("modify-crystal-cost")) $("modify-crystal-cost").textContent = currentModifyCost.crystal;
    if ($("alchemy-essence-count")) $("alchemy-essence-count").textContent = fmt(state.materials.essence || 0, 0);
    if ($("pull-enchant")) $("pull-enchant").disabled = (state.materials.essence || 0) < GAME_CONFIG.enchant.essenceCostPerPull * gachaCounts.enchant;
    const books = state.items.filter(isEnchant).sort((a,b) => (RARITY_ORDER[itemBase(b).rarity] - RARITY_ORDER[itemBase(a).rarity]) || b.level-a.level);
    $("enchant-count").textContent = `${books.length} 個`;
    $("enchant-inventory").innerHTML = books.length ? books.map(item => `<button class="item-card ${item.locked ? "locked" : ""}" data-item-detail-id="${item.id}" data-open-item="${item.id}"><span class="item-card-level">Lv.${item.level}</span><span class="item-card-flags">${item.locked ? "🔒" : ""}</span><span class="item-card-icon">${itemBase(item).icon}</span><span class="item-card-name"><span class="name-display">${itemNameHtml(item)}</span></span><span class="item-card-meta">${itemBase(item).rarity}</span></button>`).join("") : `<div class="item-filter-empty">まだスキル書がありません。星霊エッセンスで錬成しよう。</div>`;
  }

  // 素材画面
  function renderMaterials() {
    const totalText = `合計 ${materialTotal()} 個`;
    const markup = MATERIALS.map(material => `
      <div class="material">
        <span>${material.icon}</span>
        <strong>${material.name}</strong>
        <small>${fmt(state.materials[material.id] || 0, 0)} 個</small>
      </div>
    `).join("");
    if ($("material-total")) $("material-total").textContent = totalText;
    if ($("materials")) $("materials").innerHTML = markup;
    if ($("holdings-material-total")) $("holdings-material-total").textContent = totalText;
    if ($("holdings-materials")) $("holdings-materials").innerHTML = markup;
  }
  // 記録・目標
  function renderStats() {
    $("stat-earned").textContent = fmt(state.totalEarned);
    $("stat-taps").textContent = fmt(state.taps, 0);
    $("stat-pulls").textContent = fmt(state.pulls + state.materialPity, 0);
    $("stat-rarity").textContent = state.highestRarity;
    const log = Math.log10(Math.max(1, state.currency));
    const percent = clamp(log / Math.log10(MAX) * 100, 0, 100);
    $("limit-progress").style.width = `${percent}%`;
    $("limit-percent").textContent = `${percent.toFixed(2)}%`;
    $("limit-status").textContent = state.currency >= MAX
      ? "数値の限界に到達！"
      : `10の${Math.floor(log)}乗あたりまで到達`;
  }
  function renderGoal() {
    const hasItem = state.items.length > 0;
    const hasEquipped = state.slots.some(id => id !== null);
    const goals = [
      {
        done: state.taps >= 10,
        title: "まずは10回タップ！",
        desc: "採掘ボタンを10回タップしよう。",
        badge: "STEP 1",
        p: state.taps / 10
      },
      {
        done: hasItem,
        title: "最初のアイテムを手に入れよう！",
        desc: "アイテムガチャを引いてみよう。",
        badge: "STEP 2",
        p: hasItem ? 1 : state.currency / itemCost()
      },
      {
        done: hasEquipped,
        title: "アイテムをセットしよう！",
        desc: "アイテムタブで効果発揮枠にセット。",
        badge: "STEP 3",
        p: hasEquipped ? 1 : 0
      },
      {
        done: totalRate() >= 100,
        title: "自動収入 100 / 秒！",
        desc: "アイテムを集めて自動収入を増やそう。",
        badge: "STEP 4",
        p: totalRate() / 100
      }
    ];
    const goal = goals.find(entry => !entry.done) || {
      title: "もっと大きく！",
      desc: "強化と合成を続けて、限界を目指そう。",
      badge: "ENDLESS",
      p: state.currency > 0 ? Math.log10(state.currency + 1) / 308 : 0
    };
    $("goal-title").textContent = goal.title;
    $("goal-description").textContent = goal.desc;
    $("goal-badge").textContent = goal.badge;
    const p = clamp(goal.p * 100, 0, 100);
    $("goal-progress").style.width = `${p}%`;
    $("goal-percent").textContent = `${Math.floor(p)}%`;
  }
  function renderSkillTree() {
    const earned = skillPointsEarned();
    const available = skillPointsAvailable();
    $("skill-points").textContent = available;
    $("skill-earned-label").textContent = `獲得 ${earned} pt`;
    $("skill-summary-text").textContent = `今回の累計獲得通貨 ${fmt(state.totalEarned)} → スキルポイント ${earned} pt。使用済み ${skillPointsSpent()} pt。転生回数 ${state.totalPrestiges} 回。`;
    $("skill-tree").innerHTML = SKILL_DEFS.map(skill => {
      const level = state.skills[skill.id] || 0;
      const maxed = level >= skill.max;
      return `<article class="skill-node ${level > 0 ? "learned" : ""}">
        <div class="skill-node-top"><span class="skill-icon">${skill.icon}</span><span class="pill">${skill.branch}</span></div>
        <h2>${skill.name}</h2><p>${skill.desc}</p>
        <div class="skill-level"><span>レベル</span><strong>${level} / ${skill.max}</strong></div>
        <div class="skill-level-track"><div style="width:${level / skill.max * 100}%"></div></div>
        <button class="primary-button full" data-skill="${skill.id}" ${available > 0 && !maxed ? "" : "disabled"}>${maxed ? "最大レベル" : "1 pt 使って習得"}</button>
      </article>`;
    }).join("");
  }
  function renderPrestige() {
    const reward = prestigeReward();
    const progress = clamp(state.totalEarned / PRESTIGE_REQUIREMENT * 100, 0, 100);
    $("prestige-count").textContent = state.totalPrestiges;
    $("prestige-reward").textContent = reward;
    $("prestige-status").textContent = reward > 0 ? "転生可能" : "育成中";
    $("prestige-requirement").textContent = reward > 0
      ? `転生すると ${reward} ポイントを獲得できます。`
      : `あと ${fmt(Math.max(0, PRESTIGE_REQUIREMENT - state.totalEarned))} 通貨の累計獲得で転生できます。`;
    $("prestige-progress").style.width = `${progress}%`;
    $("prestige-progress-label").textContent = `${fmt(state.totalEarned, 0)} / ${fmt(PRESTIGE_REQUIREMENT, 0)}`;
    $("prestige-progress-percent").textContent = `${progress.toFixed(1)}%`;
    $("prestige-button").disabled = reward <= 0;
    $("prestige-points-label").textContent = `${fmt(state.prestigePoints, 0)} pt 所持`;
    $("permanent-upgrades").innerHTML = PERMANENT_DEFS.map(def => {
      const level = state.permanentUpgrades[def.id] || 0;
      const cost = permanentCost(def);
      const maxed = level >= def.max;
      return `<div class="permanent-upgrade"><div class="permanent-icon">${def.icon}</div>
        <div class="permanent-info"><strong>${def.name}</strong><p>${def.desc}</p><small>Lv.${level} / ${def.max}</small></div>
        <button class="secondary-button" data-permanent="${def.id}" ${maxed || state.prestigePoints < cost ? "disabled" : ""}>${maxed ? "最大" : `強化 ${cost} pt`}</button></div>`;
    }).join("");
    const milestones = [
      { count: 0, name: "基本アイテム", desc: "開始時から利用可能" },
      { count: 1, name: "研究用アイテム", desc: "新しい効果を持つアイテム系統を解放" },
      { count: 2, name: "上位アイテム", desc: "さらに強力なアイテム系統を解放" },
      { count: 3, name: "宇宙級アイテム", desc: "最上位のアイテム系統を解放" }
    ];
    $("unlock-count").textContent = `${unlockedTypeCount()} / ${ITEM_TYPES.length} 系統解放`;
    $("prestige-unlocks").innerHTML = milestones.map(m => `<div class="unlock-row ${state.totalPrestiges >= m.count ? "unlocked" : ""}">
      <span>${state.totalPrestiges >= m.count ? "🔓" : "🔒"}</span><div><strong>${m.name}</strong><small>${m.count === 0 ? m.desc : `転生 ${m.count} 回で解放 · ${m.desc}`}</small></div>
      <span class="unlock-state">${state.totalPrestiges >= m.count ? "解放済み" : `転生 ${m.count} 回`}</span></div>`).join("");
  }
  function render() {
    renderWallet();
    renderItems();
    renderMaterials();
    renderStats();
    renderGoal();
    renderSkillTree();
    renderPrestige();
  }
  // セーブ・ロード
  function save(showMessage = false) {
    try {
      state.lastSaved = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      if (showMessage) toast("セーブしました！");
      return true;
    } catch (error) {
      console.error("Save failed:", error);
      toast("保存できませんでした。保存容量を確認してください。");
      return false;
    }
  }
    function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const numericKeys = [
        "currency", "totalEarned", "tapPower", "tapLevel",
        "taps", "pulls", "itemPity", "materialPity",
        "nextId", "startedAt", "lastSaved", "prestigePoints",
        "totalPrestigePoints", "totalPrestiges"
      ];
      for (const key of numericKeys) {
        if (data[key] !== undefined) state[key] = data[key];
      }
      state.currency = safe(Number(state.currency));
      state.totalEarned = safe(Number(state.totalEarned));
      state.items = Array.isArray(data.items)
        ? data.items.filter(item => {
            if (!item || !Number.isSafeInteger(item.id) || item.id <= 0) return false;
            if (item.kind === "enchant") return Number.isInteger(item.enchantTypeIndex) && ENCHANT_TYPES[item.enchantTypeIndex];
            return Number.isInteger(item.typeIndex) && ITEM_TYPES[item.typeIndex];
          }).map(item => {
            const copy = { ...item };
            copy.kind = copy.kind === "enchant" ? "enchant" : "normal";
            copy.level = clamp(Math.floor(Number(copy.level) || 1), 1, GAME_CONFIG.item.maxLevel);
            // 旧セーブには合成値がないため0で初期化する。
            copy.mergeValue = clamp(Math.floor(Number(copy.mergeValue) || 0), 0, Number.MAX_SAFE_INTEGER);
            copy.equipped = false;
            copy.locked = Boolean(copy.locked);
            // 同じ種類の書を複数付与できるため、重複するインデックスも保持します。
            copy.enchantments = Array.isArray(copy.enchantments) ? copy.enchantments.filter(n => Number.isInteger(n) && ENCHANT_TYPES[n]) : [];
            copy.modified = Boolean(copy.modified);
            copy.nameCustomized = Boolean(copy.nameCustomized);
            copy.nameHtml = copy.nameHtml ? sanitizeNameHtml(copy.nameHtml) : "";
            return copy;
          })
        : [];
      state.slots = Array.isArray(data.slots)
        ? data.slots.slice(0, 3).map(id =>
            state.items.some(item => item.id === id && !isEnchant(item)) ? id : null
          )
        : [null, null, null];
      while (state.slots.length < 3) state.slots.push(null);
      const seen = new Set();
      state.slots = state.slots.map(id => {
        if (id === null || seen.has(id)) return null;
        seen.add(id);
        return id;
      });
      state.prestigePoints = Math.max(0, Math.floor(Number(data.prestigePoints) || 0));
      state.totalPrestigePoints = Math.max(state.prestigePoints, Math.floor(Number(data.totalPrestigePoints) || 0));
      state.totalPrestiges = Math.max(0, Math.floor(Number(data.totalPrestiges) || 0));
      state.skills = { tap: 0, production: 0, alchemy: 0, luck: 0, ...(data.skills || {}) };
      state.skills.tap = clamp(Math.floor(Number(state.skills.tap) || 0), 0, 3);
      state.skills.production = clamp(Math.floor(Number(state.skills.production) || 0), 0, 3);
      state.skills.alchemy = clamp(Math.floor(Number(state.skills.alchemy) || 0), 0, 3);
      state.skills.luck = clamp(Math.floor(Number(state.skills.luck) || 0), 0, 2);
      state.permanentUpgrades = { income: 0, startingFunds: 0, luck: 0, ...(data.permanentUpgrades || {}) };
      state.permanentUpgrades.income = clamp(Math.floor(Number(state.permanentUpgrades.income) || 0), 0, 20);
      state.permanentUpgrades.startingFunds = clamp(Math.floor(Number(state.permanentUpgrades.startingFunds) || 0), 0, 10);
      state.permanentUpgrades.luck = clamp(Math.floor(Number(state.permanentUpgrades.luck) || 0), 0, 10);
      state.materials = {
        dust: 0,
        gear: 0,
        crystal: 0,
        essence: 0,
        ...(data.materials || {})
      };
      for (const key of Object.keys(state.materials)) {
        state.materials[key] = clamp(
          Math.floor(Number(state.materials[key]) || 0),
          0,
          Number.MAX_SAFE_INTEGER
        );
      }
      state.tapPower = clamp(Number(state.tapPower) || 1, 1, MAX);
      state.tapLevel = clamp(Math.floor(Number(state.tapLevel) || 0), 0, 1000);
      state.taps = Math.max(0, Math.floor(Number(state.taps) || 0));
      state.pulls = Math.max(0, Math.floor(Number(state.pulls) || 0));
      state.itemPity = Math.max(0, Math.floor(Number(state.itemPity) || 0));
      state.materialPity = Math.max(0, Math.floor(Number(state.materialPity) || 0));
      const maxId = state.items.reduce((max, item) => Math.max(max, item.id), 0);
      state.nextId = Math.max(
        maxId + 1,
        Math.floor(Number(state.nextId) || 1)
      );
      state.highestRarity = state.items.reduce((highest, item) => {
        const rarity = itemBase(item).rarity;
        return (RARITY_ORDER[rarity] ?? -1) >
          (RARITY_ORDER[highest] ?? -1)
          ? rarity
          : highest;
      }, "—");
      state.items.forEach(item => {
        item.equipped = state.slots.includes(item.id);
      });
      // オフライン収入は最大8時間
      const elapsed = clamp(
        (Date.now() - (Number(state.lastSaved) || Date.now())) / 1000,
        0,
        8 * 3600      );
      const gain = totalRate() * elapsed;
      if (Number.isFinite(gain) && gain > 0) {
        earn(gain);
        if (elapsed >= 60) {
          toast(`おかえり！ オフライン収入 +${fmt(gain)}`);
        }
      }
    } catch (error) {
      console.error("Load failed:", error);
      toast("セーブデータを読み込めませんでした。");
    }
  }
  // タップ採掘
  $("tap-button").addEventListener("pointerdown", event => {
    event.preventDefault();
    const tapGain = effectiveTapPower();
    const bonus = Math.random() < Math.min(GAME_CONFIG.tap.bonusChanceCap, equippedEffect("bonus") + enchantedEffect("bonus"));
    const actualGain = bonus ? safe(tapGain * GAME_CONFIG.tap.bonusMultiplier) : tapGain;
    earn(actualGain);
    state.taps++;
    const button = $("tap-button");
    const rect = button.getBoundingClientRect();
    const pop = document.createElement("span");
    pop.className = "tap-pop";
    pop.textContent = `${bonus ? "BONUS! " : "+"}${fmt(actualGain)}`;
    pop.style.left = `${clamp(event.clientX - rect.left, 20, rect.width - 20)}px`;
    pop.style.top = `${clamp(event.clientY - rect.top, 20, rect.height - 20)}px`;
    button.appendChild(pop);
    setTimeout(() => pop.remove(), 650);
    renderWallet();
    renderStats();
    renderGoal();
    saveAccumulator += 0.15;
  });
  $("tap-upgrade").addEventListener("click", () => {
    const cost = tapCost();
    if (!spend(cost)) return;
    state.tapLevel++;
    state.tapPower = safe(state.tapPower + Math.max(GAME_CONFIG.upgrade.tapMinimumGain, state.tapPower * GAME_CONFIG.upgrade.tapGainRatio));
    render();
    save();
    toast(`タップ獲得量が ${fmt(effectiveTapPower())} にアップ！`);
  });
  // ガチャ連数の切り替え。ボタンは設定から動的生成されるので委譲イベントにする。
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-pull-count]");
    if (!button) return;
    const kind = button.dataset.pullCount;
    const count = Number(button.dataset.count);
    if (!(kind in gachaCounts) || !GAME_CONFIG.gacha.pullCounts.includes(count)) return;
    gachaCounts[kind] = count;
    renderGachaControls();
  });

  function summarizeCounts(counts) {
    return Object.entries(counts).map(([name, count]) => `${name} ×${count}`).join("、");
  }
  // アイテムガチャ：合計価格を先に確認してから一括で引く
  $("pull-item").addEventListener("click", () => {
    const count = gachaCounts.item;
    const totalCost = batchGachaCost("item", count);
    if (!spend(totalCost)) return toast("通貨が足りません！");
    const names = {};
    const rarityCounts = { "コモン": 0, "アンコモン": 0, "レア": 0, "エピック": 0 };
    const found = [];
    for (let i = 0; i < count; i++) {
      const item = randomItem();
      const rarity = itemBase(item).rarity;
      rarityCounts[rarity] = (rarityCounts[rarity] || 0) + 1;
      names[itemBase(item).name] = (names[itemBase(item).name] || 0) + 1;
      found.push(item);
      state.itemPity = RARITY_ORDER[rarity] >= 2 ? 0 : state.itemPity + 1;
      state.pulls++;
    }
    const summary = Object.entries(names).map(([name, number]) => `${name} ×${number}`).join("、");
    $("gacha-result").classList.remove("hidden");
    $("gacha-result").textContent = `${count}連結果：${summary}`;
    const raritySummary = Object.entries(rarityCounts).filter(([, number]) => number > 0).map(([rarity, number]) => `${rarity} ${number}`).join(" / ");
    showModal("🎁", `${count}連ガチャ結果`, `${raritySummary}
合計費用：${fmt(totalCost, 0)} 通貨
${summary}`);
    render(); save();
  });
  // 素材ガチャ：連数分の価格を計算して一括購入
  $("pull-material").addEventListener("click", () => {
    const count = gachaCounts.material;
    const totalCost = batchGachaCost("material", count);
    if (!spend(totalCost)) return toast("通貨が足りません！");
    const counts = {};
    const icons = {};
    for (let i = 0; i < count; i++) {
      const material = randomMaterial();
      counts[material.name] = (counts[material.name] || 0) + (material.id === "dust" ? GAME_CONFIG.materials.dustPerDrop : material.id === "gear" ? GAME_CONFIG.materials.gearPerDrop : GAME_CONFIG.materials.crystalPerDrop);
      icons[material.name] = material.icon;
      state.materialPity++;
    }
    const summary = Object.entries(counts).map(([name, number]) => `${icons[name]} ${name} +${number}`).join("\n");
    $("gacha-result").classList.remove("hidden");
    $("gacha-result").textContent = `${count}連・素材の獲得
${summary}`;
    showModal("💎", `${count}連・素材ガチャ`, `合計費用：${fmt(totalCost, 0)} 通貨
${summary}`);
    render(); save();
  });

  // アイテム強化
  $("upgrade-item").addEventListener("click", () => {
    const item = getItem(selectedUpgradeId);
    if (!item || item.locked || isEnchant(item)) return toast("強化できる通常アイテムを選択してください。");
    const dust = GAME_CONFIG.upgrade.itemDustPerLevel * item.level; const gear = GAME_CONFIG.upgrade.itemGearPerLevel * item.level;
    if (state.materials.dust < dust || state.materials.gear < gear) return toast("素材が足りません！");
    state.materials.dust -= dust; state.materials.gear -= gear; item.level++;
    render(); save(); toast(`${itemPlainName(item)} を Lv.${item.level} に強化！`);
  });

  // 合成値の合成：対象は残り、素材アイテムは成功・失敗を問わず消滅
  $("merge-item").addEventListener("click", () => {
    const target = getItem(selectedMergeIds[0]);
    const source = getItem(selectedMergeIds[1]);
    if (!target || !source || target.id === source.id) return toast("対象と素材アイテムを2つ選んでください。");
    if (isEnchant(target) || isEnchant(source)) return toast("合成には通常アイテムを選んでください。");
    if (target.typeIndex !== source.typeIndex) return toast("合成は同じ種類のアイテム同士でのみ行えます。レベルと合成値は問いません。");
    if (target.locked || source.locked) return toast("ロック中のアイテムは合成に使えません。");
    if (state.slots.includes(source.id)) return toast("素材アイテムが装備中です。先にはずしてください。");
    const required = fusionMaterialRequirement(target, source);
    const invested = Math.max(required, Math.floor(Number($("fusion-material-number").value) || required));
    if (state.materials.crystal < required) return toast(`星くず結晶が足りません。最低 ${required} 個必要です。`);
    if (invested > state.materials.crystal) return toast("所持数を超える素材は投入できません。");
    const probabilities = fusionProbabilities(target, required, invested);
    if (!window.confirm(
      `この内容で合成しますか？

対象：${itemPlainName(target)} ${fusionLevelText(target)}
素材：${itemPlainName(source)} ${fusionLevelText(source)}
星くず結晶：${invested} 個

${[
        ["大成功", probabilities.greatSuccess], ["成功", probabilities.success], ["失敗", probabilities.failure], ["大失敗", probabilities.greatFailure], ["超大失敗", probabilities.superFailure]
      ].filter(([, chance]) => chance > 0.001).map(([name, chance]) => `${name} ${chance.toFixed(1)}%`).join("\n")}

素材アイテムは結果に関係なく消滅します。`
    )) return;
    // 確認後にも状態・ロック・所持数を再確認する
    if (getItem(target.id) !== target || getItem(source.id) !== source || target.locked || source.locked || state.slots.includes(source.id) || state.materials.crystal < required || invested > state.materials.crystal) {
      return toast("安全確認に失敗しました。選択したアイテムと素材数を確認してください。");
    }
    const outcome = rollFusionOutcome(probabilities);
    const baseTargetValue = mergeValue(target);
    const sourceValue = mergeValue(source);
    let message = "";
    if (outcome === "greatSuccess" || outcome === "success") {
      const bonus = outcome === "greatSuccess" ? GAME_CONFIG.fusion.greatSuccessMergeBonus : GAME_CONFIG.fusion.successMergeBonus;
      target.level = Math.max(target.level, source.level);
      target.mergeValue = Math.min(Number.MAX_SAFE_INTEGER, baseTargetValue + sourceValue + bonus);
      // 成功以上なら、従来どおり素材アイテムの改造効果も対象へ引き継ぐ。
      const targetWasModified = Boolean(target.modified);
      // 合成で引き継ぐ改造効果も重複を保持して累積させます。
      target.enchantments = [...(target.enchantments || []), ...(source.enchantments || [])];
      if (source.modified) target.modified = true;
      if (!targetWasModified && target.modified && !stripNameTags(target.nameHtml || itemBase(target).name).includes("改造済み")) {
        target.nameHtml = `<span style="color:#249b61">${escapeHtml(stripNameTags(target.nameHtml || itemBase(target).name))} (改造済み)</span>`;
        target.nameCustomized = false;
      }
      state.materials.crystal -= invested;
      message = outcome === "greatSuccess"
        ? `大成功！合成値 +2 のボーナス！結果：${fusionLevelText(target)}`
        : `成功！合成値 +1。結果：${fusionLevelText(target)}`;
    } else if (outcome === "failure") {
      // 失敗は結晶を消費しないが、素材アイテムは失われる。
      message = "失敗……対象のレベル・合成値は変化しませんでした。星くず結晶は返却されました。";
    } else if (outcome === "greatFailure") {
      target.mergeValue = Math.max(0, baseTargetValue - 1);
      state.materials.crystal -= invested;
      message = `大失敗……対象の合成値が -1 され、${mergeValue(target)} になりました。`;
    } else {
      target.mergeValue = Math.max(0, baseTargetValue - 2);
      state.materials.crystal -= invested;
      message = `超大失敗……対象の合成値が -2 され、${mergeValue(target)} になりました。`;
    }
    state.items = state.items.filter(item => item.id !== source.id);
    selectedMergeIds = [null, null];
    activeMergeSlot = 0;
    fusionMaterialAmount = GAME_CONFIG.fusion.investmentDefault;
    selectedUpgradeId = selectedUpgradeId === source.id ? null : selectedUpgradeId;
    selectedModifyTargetId = selectedModifyTargetId === source.id ? null : selectedModifyTargetId;
    selectedModifyEnchantId = selectedModifyEnchantId === source.id ? null : selectedModifyEnchantId;
    selectedDecomposeIds.delete(source.id);
    render(); save();
    showModal(outcome === "greatSuccess" ? "🌟" : outcome === "success" ? "✨" : outcome === "failure" ? "🫧" : outcome === "greatFailure" ? "💥" : "☄️", outcome === "greatSuccess" ? "大成功！" : outcome === "success" ? "成功！" : outcome === "failure" ? "失敗" : outcome === "greatFailure" ? "大失敗" : "超大失敗", `${message}
素材アイテム「${itemPlainName(source)}」は消滅しました。`);
  });

  function setFusionMaterialAmount(value) {
    const target = getItem(selectedMergeIds[0]); const source = getItem(selectedMergeIds[1]);
    if (!target || !source || isEnchant(target) || isEnchant(source)) return;
    const min = fusionMaterialRequirement(target, source);
    fusionMaterialAmount = clamp(Math.floor(Number(value) || min), min, Math.max(min, state.materials.crystal || 0));
    renderCraftPreviews();
  }
  $("fusion-material-range").addEventListener("input", event => setFusionMaterialAmount(event.target.value));
  $("fusion-material-number").addEventListener("change", event => setFusionMaterialAmount(event.target.value));

  function closeFusionHelp() { $("fusion-help-backdrop").classList.add("hidden"); }
  $("fusion-help-open").addEventListener("click", () => $("fusion-help-backdrop").classList.remove("hidden"));
  $("fusion-help-close").addEventListener("click", closeFusionHelp);
  $("fusion-help-close-bottom").addEventListener("click", closeFusionHelp);
  $("fusion-help-backdrop").addEventListener("click", event => { if (event.target === $("fusion-help-backdrop")) closeFusionHelp(); });

  // 分解：単体・一括ともに実行直前にロック/装備状態を再確認する
  function decomposeItems(ids) {
    const uniqueIds = [...new Set(ids.map(Number))];
    if (!uniqueIds.length) return toast("分解するアイテムを選んでください。");
    const targets = uniqueIds.map(id => getItem(id));
    if (targets.some(item => !item)) return toast("対象アイテムが見つかりません。画面を更新して再選択してください。");
    if (targets.some(item => item.locked)) return toast("ロック中のアイテムが含まれています。ロックを解除してから分解してください。");
    if (targets.some(item => state.slots.includes(item.id))) return toast("装備中のアイテムが含まれています。先にはずしてから分解してください。");
    const yieldTotal = targets.reduce((sum, item) => sum + decomposeYield(item), 0);
    const preview = targets.slice(0, 5).map(item => `${itemPlainName(item)} Lv.${item.level}`).join("、");
    const suffix = targets.length > 5 ? `、ほか ${targets.length - 5} 個` : "";
    if (!window.confirm(`${targets.length} 個のアイテムを分解しますか？
${preview}${suffix}
獲得：🌌 星霊エッセンス ${yieldTotal} 個
この操作は取り消せません。`)) return;
    // confirm後にもう一度最新状態を確認
    const current = uniqueIds.map(id => getItem(id));
    if (current.some(item => !item || item.locked || state.slots.includes(item.id))) return toast("安全確認に失敗しました。ロックまたは装備状態を確認してください。");
    state.materials.essence = Math.min(Number.MAX_SAFE_INTEGER, (state.materials.essence || 0) + yieldTotal);
    const idSet = new Set(uniqueIds);
    state.items = state.items.filter(item => !idSet.has(item.id));
    uniqueIds.forEach(id => selectedDecomposeIds.delete(id));
    if (activeDetailItemId && idSet.has(activeDetailItemId)) closeItemDetail();
    selectedUpgradeId = idSet.has(selectedUpgradeId) ? null : selectedUpgradeId;
    selectedMergeIds = selectedMergeIds.map(id => idSet.has(id) ? null : id);
    selectedModifyTargetId = idSet.has(selectedModifyTargetId) ? null : selectedModifyTargetId;
    selectedModifyEnchantId = idSet.has(selectedModifyEnchantId) ? null : selectedModifyEnchantId;
    state.highestRarity = state.items.reduce((highest, item) => (RARITY_ORDER[itemBase(item).rarity] ?? -1) > (RARITY_ORDER[highest] ?? -1) ? itemBase(item).rarity : highest, "—");
    render(); save(); toast(`分解完了！ 星霊エッセンス +${yieldTotal}`);
  }
  $("decompose-bulk").addEventListener("click", () => decomposeItems([...selectedDecomposeIds]));
  $("decompose-clear").addEventListener("click", () => { selectedDecomposeIds.clear(); renderDecomposePage(); });
  $("decompose-select-visible").addEventListener("click", () => {
    const visible = state.items.filter(item => itemMatchesFilters(item, "decompose") && !item.locked && !state.slots.includes(item.id));
    visible.forEach(item => selectedDecomposeIds.add(item.id)); renderDecomposePage();
  });
  // スキル書錬成も x1/x5/x10/x50/x100 に対応
  $("pull-enchant").addEventListener("click", () => {
    const count = gachaCounts.enchant;
    const cost = GAME_CONFIG.enchant.essenceCostPerPull * count;
    if ((state.materials.essence || 0) < cost) return toast(`星霊エッセンスが足りません。${cost} 個必要です。`);
    state.materials.essence -= cost;
    const found = {};
    for (let i = 0; i < count; i++) {
      const item = randomEnchantItem();
      found[itemBase(item).name] = (found[itemBase(item).name] || 0) + 1;
    }
    const summary = Object.entries(found).map(([name, number]) => `${name} ×${number}`).join("、");
    $("enchant-result").classList.remove("hidden");
    $("enchant-result").textContent = `${count}連錬成：${summary}`;
    render(); save();
    showModal("🧪", `${count}連・スキル書錬成`, `消費：🌌 星霊エッセンス ${cost} 個
${summary}`);
    toast(`${count}個のスキル書を錬成しました！`);
  });

  // 改造：スキル書の効果を通常アイテムに付与する
  $("modify-item").addEventListener("click", () => {
    const target = getItem(selectedModifyTargetId);
    const enchant = getItem(selectedModifyEnchantId);

    if (!target || !enchant || isEnchant(target) || !isEnchant(enchant)) {
      return toast("通常アイテムとスキル書を選んでください。");
    }

    if (target.locked || enchant.locked) {
      return toast("ロック中のアイテムは改造に使用できません。");
    }

    if (state.slots.includes(enchant.id)) {
      return toast("スキル書は装備できません。");
    }

    const cost = modificationCost(target);
    if (state.materials.dust < cost.dust ||
        state.materials.gear < cost.gear ||
        state.materials.crystal < cost.crystal) {
      return toast(`改造素材が足りません。必要：粉 ${cost.dust}、歯車 ${cost.gear}、結晶 ${cost.crystal}`);
    }

    if (!window.confirm(
      `${itemPlainName(target)} に ${itemBase(enchant).name} を付与しますか？\n` +
      `改造度：${cost.degree} → ${cost.degree + 1}\n` +
      `必要素材：粉 ${cost.dust}、歯車 ${cost.gear}、結晶 ${cost.crystal}\n` +
      "同じ効果も重複して付与できます。スキル書は消費され、元には戻せません。"
    )) {
      return;
    }

    // 実行直前にもう一度確認し、改造度から必要数を再計算します。
    const currentTarget = getItem(target.id);
    const currentBook = getItem(enchant.id);
    const currentCost = modificationCost(currentTarget);
    if (currentTarget !== target || currentBook !== enchant || target.locked || enchant.locked ||
        state.materials.dust < currentCost.dust || state.materials.gear < currentCost.gear || state.materials.crystal < currentCost.crystal) {
      return toast("安全確認に失敗しました。選択アイテムと素材数を確認してください。");
    }

    state.materials.dust -= currentCost.dust;
    state.materials.gear -= currentCost.gear;
    state.materials.crystal -= currentCost.crystal;

    const wasModified = Boolean(target.modified);
    // 同じスキル書を複数付与できるよう、重複を除去せず追加します。
    target.enchantments = [...(target.enchantments || []), enchant.enchantTypeIndex];

    if (!wasModified &&
        !stripNameTags(target.nameHtml || itemBase(target).name).includes("改造済み")) {
      target.nameHtml =
        `<span style="color:#249b61">${escapeHtml(stripNameTags(target.nameHtml || itemBase(target).name))} (改造済み)</span>`;
      target.nameCustomized = false;
    }

    target.modified = true;

    // 使用したスキル書を消費
    state.items = state.items.filter(item => item.id !== enchant.id);

    selectedModifyEnchantId = null;
    selectedModifyTargetId = target.id;

    render();
    save();
    openItemDetail(target.id);
    toast("改造完了！スキル書の効果が付与されました。");
  });

  // どの一覧画面でも、アイテムを長押しすると詳細を開く。
  // 長押し後に発生する通常clickは抑止して、選択などの誤操作を防ぐ。
  let itemLongPressTimer = null;
  let itemLongPressPointer = null;
  let suppressItemClickId = null;
  let suppressItemClickUntil = 0;

  function clearItemLongPress() {
    if (itemLongPressTimer !== null) clearTimeout(itemLongPressTimer);
    itemLongPressTimer = null;
    itemLongPressPointer = null;
  }

  document.addEventListener("pointerdown", event => {
    const card = event.target.closest("[data-item-detail-id], [data-open-item], [data-picker-item]");
    if (!card || event.button !== 0) return;
    const id = Number(card.dataset.itemDetailId ?? card.dataset.openItem ?? card.dataset.pickerItem);
    if (!Number.isFinite(id) || id <= 0 || !getItem(id)) return;
    clearItemLongPress();
    itemLongPressPointer = { id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, triggered: false };
    itemLongPressTimer = setTimeout(() => {
      const current = getItem(id);
      if (!current) return;
      itemLongPressPointer.triggered = true;
      suppressItemClickId = id;
      suppressItemClickUntil = Date.now() + 1200;
      openItemDetail(id);
      if (navigator.vibrate) navigator.vibrate(20);
    }, GAME_CONFIG.controls.longPressMs);
  }, { capture: true });

  document.addEventListener("pointermove", event => {
    if (!itemLongPressPointer || event.pointerId !== itemLongPressPointer.pointerId) return;
    const dx = event.clientX - itemLongPressPointer.x;
    const dy = event.clientY - itemLongPressPointer.y;
    if (Math.hypot(dx, dy) > GAME_CONFIG.controls.longPressMoveTolerancePx) clearItemLongPress();
  }, { capture: true, passive: true });

  document.addEventListener("pointerup", event => {
    if (itemLongPressPointer && event.pointerId === itemLongPressPointer.pointerId) {
      clearItemLongPress();
    }
  }, { capture: true });
  document.addEventListener("pointercancel", clearItemLongPress, { capture: true });

  document.addEventListener("click", event => {
    if (suppressItemClickId === null) return;
    const itemTrigger = event.target.closest("[data-item-detail-id], [data-open-item], [data-picker-item]");
    const clickedId = itemTrigger ? Number(itemTrigger.dataset.itemDetailId ?? itemTrigger.dataset.openItem ?? itemTrigger.dataset.pickerItem) : null;
    const shouldSuppress = Date.now() < suppressItemClickUntil && clickedId === suppressItemClickId;
    // 違う場所のクリックを巻き込まないよう、次のclickイベントで抑止状態を必ず解除。
    suppressItemClickId = null;
    suppressItemClickUntil = 0;
    if (shouldSuppress) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, { capture: true });

  // メニュー・アイテム操作
  document.addEventListener("click", event => {
    const target = event.target.closest("[data-tab], [data-goto], [data-equip], [data-unequip], [data-skill], [data-permanent], [data-open-item], [data-picker-item], [data-merge-slot]");
    if (!target) return;
    if (target.dataset.tab || target.dataset.goto) { setTab(target.dataset.tab || target.dataset.goto); return; }
    if (target.dataset.equip !== undefined) { equip(target.dataset.equip, Number(target.dataset.slot)); return; }
    if (target.dataset.unequip !== undefined) { unequip(Number(target.dataset.unequip)); return; }
    if (target.dataset.skill) { tryBuySkill(target.dataset.skill); return; }
    if (target.dataset.permanent) { tryBuyPermanent(target.dataset.permanent); return; }
    if (target.dataset.openItem !== undefined) { openItemDetail(Number(target.dataset.openItem)); return; }
    if (target.dataset.mergeSlot !== undefined) { activeMergeSlot = Number(target.dataset.mergeSlot); renderPicker("merge"); renderCraftPreviews(); return; }
    if (target.dataset.pickerItem !== undefined) {
      const id = Number(target.dataset.pickerItem); const prefix = target.dataset.pickerPrefix; const item = getItem(id);
      if (!item) return;
      if (prefix === "upgrade") {
        if (item.locked || isEnchant(item)) return toast("ロック中またはスキル書は強化できません。");
        selectedUpgradeId = id;
      }
      else if (prefix === "merge") {
        if (item.locked || isEnchant(item)) return toast("ロック中のアイテムやスキル書は合成に使えません。");
        if (activeMergeSlot === 1 && state.slots.includes(id)) return toast("素材アイテムが装備中です。先にはずしてください。");
        const otherMergeItem = getItem(selectedMergeIds[1 - activeMergeSlot]);
        if (selectedMergeIds[activeMergeSlot] !== id && otherMergeItem && item.typeIndex !== otherMergeItem.typeIndex) {
          return toast("合成は同じ種類のアイテム同士でのみ行えます。レベルと合成値は異なっていても大丈夫です。");
        }
        if (selectedMergeIds[activeMergeSlot] === id) selectedMergeIds[activeMergeSlot] = null;
        else selectedMergeIds[activeMergeSlot] = id;
        if (selectedMergeIds[0] && selectedMergeIds[0] === selectedMergeIds[1]) selectedMergeIds[1 - activeMergeSlot] = null;
        activeMergeSlot = selectedMergeIds[0] && selectedMergeIds[1] ? activeMergeSlot : 1 - activeMergeSlot;
        fusionMaterialAmount = GAME_CONFIG.fusion.investmentDefault;
      } else if (prefix === "decompose") {
        if (item.locked) return toast("ロック中のアイテムは分解できません。");
        if (state.slots.includes(id)) return toast("装備中のアイテムは分解できません。先にはずしてください。");
        if (selectedDecomposeIds.has(id)) selectedDecomposeIds.delete(id); else selectedDecomposeIds.add(id);
      } else if (prefix === "modify-target") { if (item.locked) return toast("ロック中のアイテムは改造できません。"); selectedModifyTargetId = id; }
      else if (prefix === "modify-enchant") { if (item.locked) return toast("ロック中のスキル書は使用できません。"); selectedModifyEnchantId = id; }
      renderPicker(prefix); renderCraftPreviews(); renderDecomposePage(); return;
    }
  });
  document.addEventListener("input", event => {
    const control = event.target.closest(".item-filter-control");
    if (!control) return;
    const prefix = control.dataset.filterPrefix;
    renderPicker(prefix);
  });
  document.addEventListener("change", event => {
    const control = event.target.closest(".item-filter-control");
    if (!control) return;
    renderPicker(control.dataset.filterPrefix);
  });

  // アイテム詳細
  function openItemDetail(id) {
    const item = getItem(id); if (!item) return;
    activeDetailItemId = item.id;
    $("item-detail-icon").textContent = itemBase(item).icon;
    $("item-detail-rarity").textContent = `${itemBase(item).rarity}${isEnchant(item) ? " · スキル書" : ""}`;
    $("item-detail-title").innerHTML = itemNameHtml(item);
    $("item-detail-subtitle").innerHTML = `${levelDisplay(item)} · ID ${item.id}${item.locked ? " · 🔒 ロック中" : ""}`;
    $("item-detail-description").innerHTML = `${itemEffectBreakdownHtml(item, null, true)}${isEnchant(item) ? "<br>通常アイテムに改造で付与すると効果を発揮します。効果発揮枠には直接セットできません。" : (itemBase(item).effect === "income" ? `<br>基本収入：${fmt(itemIncome(item))} / 秒` : "")}${state.slots.includes(item.id) ? "<br><strong>現在、効果発揮枠に装備中です。</strong>" : ""}${item.locked ? "<br><span class='item-locked-note'>ロック中：分解・合成・改造素材としての使用を防止しています。</span>" : ""}`;
    $("item-name-editor").value = item.nameHtml || defaultItemName(item);
    $("item-detail-lock").textContent = item.locked ? "🔓 ロックを解除" : "🔒 ロックする";
    const equipped = state.slots.includes(item.id);
    $("item-detail-equip").textContent = isEnchant(item) ? "スキル書は装備不可" : equipped ? "装備をはずす" : "装備する";
    $("item-detail-equip").disabled = isEnchant(item);
    $("item-detail-decompose").disabled = item.locked || equipped;
    $("item-detail-decompose").textContent = item.locked ? "ロック解除が必要" : equipped ? "先に装備をはずす" : `分解する（🌌 +${decomposeYield(item)}）`;
    $("item-detail-extra").textContent = `分解報酬：星霊エッセンス ${decomposeYield(item)} 個。ロック中や装備中のアイテムは分解できません。`;
    $("item-detail-backdrop").classList.remove("hidden");
  }
  function closeItemDetail() { $("item-detail-backdrop").classList.add("hidden"); activeDetailItemId = null; }
  $("item-detail-close").addEventListener("click", closeItemDetail);
  $("item-detail-backdrop").addEventListener("click", event => { if (event.target === $("item-detail-backdrop")) closeItemDetail(); });
  $("item-name-save").addEventListener("click", () => {
    const item = getItem(activeDetailItemId); if (!item) return;
    item.nameHtml = sanitizeNameHtml($("item-name-editor").value);
    item.nameCustomized = true;
    render(); save(); openItemDetail(item.id); toast("アイテム名を保存しました。");
  });
  $("item-detail-lock").addEventListener("click", () => {
    const item = getItem(activeDetailItemId); if (!item) return;
    item.locked = !item.locked; render(); save(); openItemDetail(item.id);
    toast(item.locked ? "アイテムをロックしました。" : "ロックを解除しました。");
  });
  $("item-detail-equip").addEventListener("click", () => {
    const item = getItem(activeDetailItemId); if (!item || isEnchant(item)) return;
    const slot = state.slots.indexOf(item.id);
    if (slot >= 0) unequip(slot);
    else {
      const free = state.slots.findIndex(id => id === null);
      if (free < 0) return toast("効果発揮枠がいっぱいです。先に1つはずしてください。");
      equip(item.id, free);
    }
    openItemDetail(item.id);
  });
  $("item-detail-decompose").addEventListener("click", () => {
    const item = getItem(activeDetailItemId); if (!item) return;
    decomposeItems([item.id]);
  });

  // セーブ・リセット
  $("prestige-button").addEventListener("click", doPrestige);
  $("save-now").addEventListener("click", () => {
    save(true);
  });
  $("reset-game").addEventListener("click", () => {
    if (!window.confirm("すべての進行状況を削除して最初から遊びますか？")) {
      return;
    }
    localStorage.removeItem(SAVE_KEY);
    Object.assign(state, {
      currency: 0,
      totalEarned: 0,
      tapPower: 1,
      tapLevel: 0,
      taps: 0,
      pulls: 0,
      itemPity: 0,
      materialPity: 0,
      nextId: 1,
      items: [],
      slots: [null, null, null],
      materials: { dust: 0, gear: 0, crystal: 0, essence: 0 },
      highestRarity: "—",
      prestigePoints: 0,
      totalPrestigePoints: 0,
      totalPrestiges: 0,
      skills: { tap: 0, production: 0, alchemy: 0, luck: 0 },
      permanentUpgrades: { income: 0, startingFunds: 0, luck: 0 },
      startedAt: Date.now(),
      lastSaved: Date.now()
    });
    selectedUpgradeId = null;
    selectedMergeIds = [null, null];
    selectedModifyTargetId = null;
    selectedModifyEnchantId = null;
    selectedDecomposeIds.clear();
    closeItemDetail();
    $("gacha-result").classList.add("hidden");
    render();
    save();
    toast("データをリセットしました。");
  });
  $("modal-close").addEventListener("click", hideModal);
  $("modal-backdrop").addEventListener("click", event => {
    if (event.target === $("modal-backdrop")) {
      hideModal();
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") { hideModal(); closeItemDetail(); closeFusionHelp(); }
  });
  // ブラウザの誤操作対策
  document.addEventListener(
    "gesturestart",
    event => event.preventDefault(),
    { passive: false }
  );
  document.addEventListener(
    "dblclick",
    event => {
      if (event.target.closest("button")) {
        event.preventDefault();
      }
    },
    { passive: false }
  );
  document.addEventListener("contextmenu", event => {
    if (event.target.closest("button")) {
      event.preventDefault();
    }
  });
  document.addEventListener("selectstart", event => {
    if (!event.target.closest("select, input, textarea")) {
      event.preventDefault();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) save();
  });
  window.addEventListener("pagehide", () => save());
  // メインループ
  load();
  render();
  function loop(now) {
    const dt = Math.min((now - lastFrame) / 1000, 1);
    lastFrame = now;
    const rate = totalRate();
    if (rate > 0 && dt > 0) {
      const gain = rate * dt;
      if (Number.isFinite(gain) && gain > 0) {
        earn(gain);
      }
    }
    saveAccumulator += dt;
    // 5秒ごとに保存
    if (saveAccumulator >= 5) {
      saveAccumulator = 0;
      save();
    }
    // ヘッダーは約10回/秒更新
    if (now - lastWalletRender >= 100) {
      renderWallet();
      lastWalletRender = now;
    }
    // 放置収入だけでも、スキルポイントや転生条件が画面に反映される
    if (now - lastProgressRender >= 500) {
      if ($("page-skills").classList.contains("active")) renderSkillTree();
      if ($("page-prestige").classList.contains("active")) renderPrestige();
      if ($("page-decompose").classList.contains("active")) renderDecomposePage();
      if ($("page-alchemy").classList.contains("active")) renderAlchemyPage();
      lastProgressRender = now;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
