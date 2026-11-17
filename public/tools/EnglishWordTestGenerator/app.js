(() => {
  'use strict';

  const DATA_KEY = 'word-test-generator:data:v1';
  const SETTINGS_KEY = 'word-test-generator:settings:v1';
  const LEGACY_THEME_KEY = 'word-test-generator:theme:v1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const DEFAULT_SECTIONS = [
  {
    "name": "Part1",
    "entries": [
      {
        "ja": "洗う",
        "en": "wash"
      },
      {
        "ja": "手",
        "en": "hand"
      },
      {
        "ja": "シャワーを浴びる",
        "en": "take a shower"
      },
      {
        "ja": "気づいていない",
        "en": "unaware"
      },
      {
        "ja": "貴重な",
        "en": "precious"
      },
      {
        "ja": "水",
        "en": "water"
      },
      {
        "ja": "その一方で",
        "en": "meanwhile"
      },
      {
        "ja": "国々",
        "en": "countries"
      },
      {
        "ja": "直面する",
        "en": "face"
      },
      {
        "ja": "深刻な",
        "en": "serious"
      },
      {
        "ja": "水不足",
        "en": "water shortage"
      },
      {
        "ja": "10億",
        "en": "billion"
      },
      {
        "ja": "苦しむ",
        "en": "suffer"
      },
      {
        "ja": "アフリカの",
        "en": "African"
      },
      {
        "ja": "～しなければならない",
        "en": "have to"
      },
      {
        "ja": "歩く",
        "en": "walk"
      },
      {
        "ja": "川",
        "en": "river"
      },
      {
        "ja": "井戸",
        "en": "well"
      },
      {
        "ja": "数キロメートル",
        "en": "several kilometers"
      },
      {
        "ja": "手に入れる",
        "en": "get"
      },
      {
        "ja": "悲しいことに",
        "en": "sadly"
      },
      {
        "ja": "千",
        "en": "thousand"
      },
      {
        "ja": "子ども",
        "en": "child"
      },
      {
        "ja": "世界中",
        "en": "around the world"
      },
      {
        "ja": "～の不足のために",
        "en": "because of a lack of"
      },
      {
        "ja": "清潔な",
        "en": "clean"
      },
      {
        "ja": "～で覆われている",
        "en": "be covered with"
      },
      {
        "ja": "塩水",
        "en": "salt water"
      },
      {
        "ja": "利用できる",
        "en": "available"
      },
      {
        "ja": "生き物",
        "en": "living things"
      }
    ]
  },
  {
    "name": "Part2",
    "entries": [
      {
        "ja": "水危機",
        "en": "water crisis"
      },
      {
        "ja": "世界中の",
        "en": "around the world"
      },
      {
        "ja": "ますます",
        "en": "more and more"
      },
      {
        "ja": "深刻な",
        "en": "severe"
      },
      {
        "ja": "～を引き起こす",
        "en": "bring about"
      },
      {
        "ja": "原因",
        "en": "cause"
      },
      {
        "ja": "人口",
        "en": "population"
      },
      {
        "ja": "増加",
        "en": "growth"
      },
      {
        "ja": "世界の",
        "en": "world"
      },
      {
        "ja": "必要とする",
        "en": "need"
      },
      {
        "ja": "～するとともに",
        "en": "as"
      },
      {
        "ja": "～に達する",
        "en": "reach"
      },
      {
        "ja": "10億",
        "en": "billion"
      },
      {
        "ja": "半分",
        "en": "half"
      },
      {
        "ja": "～しそうである",
        "en": "be likely to"
      },
      {
        "ja": "2番目の",
        "en": "secondly"
      },
      {
        "ja": "世界的な",
        "en": "worldwide"
      },
      {
        "ja": "改善",
        "en": "improvement"
      },
      {
        "ja": "生活水準",
        "en": "living standard"
      },
      {
        "ja": "最近",
        "en": "recently"
      },
      {
        "ja": "増加している",
        "en": "increase"
      },
      {
        "ja": "需要",
        "en": "demand"
      },
      {
        "ja": "発展途上国",
        "en": "developing country"
      },
      {
        "ja": "大量の",
        "en": "a great deal of"
      },
      {
        "ja": "工業製品",
        "en": "industrial products"
      },
      {
        "ja": "地球温暖化",
        "en": "global warming"
      },
      {
        "ja": "影響",
        "en": "influence"
      },
      {
        "ja": "降雨量",
        "en": "rainfall"
      },
      {
        "ja": "干ばつ",
        "en": "drought"
      },
      {
        "ja": "洪水",
        "en": "flood"
      }
    ]
  }
];

  let data = loadData();
  let settings = loadSettings();
  let activeSectionId = data.sections[0]?.id ?? null;
  let toastTimer;
  const PAGES_KEY = 'word-test-generator:pages:v1';
  let pages = [{ id: uid(), name: '1ページ目', settings: null, selectedSectionIds: [], questionSet: [], questionSetKey: '' }];
  let activePageId = pages[0].id;

  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const encodeField = value => String(value).replace(/\\/g, '\\\\').replace(/\t/g, '\\t').replace(/\r?\n/g, '\\n');
  const decodeField = value => value.replace(/\\([\\tn])/g, (_, char) => ({ '\\': '\\', t: '\t', n: '\n' })[char]);

  function loadData() {
    try {
      const savedText = localStorage.getItem(DATA_KEY);
      if (savedText !== null) {
        const parsed = JSON.parse(savedText);
        if (parsed?.version === 1 && Array.isArray(parsed.sections)) {
          parsed.sections = parsed.sections
            .filter(section => section && typeof section.name === 'string' && Array.isArray(section.entries))
            .map(section => ({
              id: String(section.id || uid()),
              name: section.name,
              entries: section.entries
                .filter(entry => entry && typeof entry.ja === 'string' && typeof entry.en === 'string')
                .map(entry => ({ id: String(entry.id || uid()), ja: entry.ja, en: entry.en }))
            }));
          // 保存データが存在する場合は、語句が0件でもデフォルトデータで上書きしない。
          return parsed;
        }
      }
    } catch (error) {
      console.warn('語句データを読み込めませんでした。初期データを使用します。', error);
    }

    // 初回起動時（保存データが存在しない場合）だけ、添付の単語リストを初期データにする。
    const initialData = {
      version: 1,
      sections: DEFAULT_SECTIONS.map(section => ({
        id: uid(),
        name: section.name,
        entries: section.entries.map(entry => ({ id: uid(), ja: entry.ja, en: entry.en }))
      }))
    };

    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(initialData));
    } catch (error) {
      console.warn('初期語句データを保存できませんでした。', error);
    }
    return initialData;
  }

  function loadSettings() {
    const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY);
    const defaults = { theme: ['system', 'light', 'dark'].includes(legacyTheme) ? legacyTheme : 'system', title: '単語テスト', questionCount: '30', subtitle: '', columns: '1', fontMode: 'auto', manualFontSize: '12', includeNameLine: false, nameFormat: 'year-class-number-name' };
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
      if (!saved || typeof saved !== 'object') return defaults;
      return {
        theme: ['system', 'light', 'dark'].includes(saved.theme) ? saved.theme : defaults.theme,
        title: typeof saved.title === 'string' ? saved.title : defaults.title,
        questionCount: String(saved.questionCount ?? defaults.questionCount),
        subtitle: typeof saved.subtitle === 'string' ? saved.subtitle : defaults.subtitle,
        columns: ['1', '2'].includes(String(saved.columns)) ? String(saved.columns) : defaults.columns,
        fontMode: ['auto', 'manual'].includes(saved.fontMode) ? saved.fontMode : defaults.fontMode,
        manualFontSize: String(saved.manualFontSize ?? defaults.manualFontSize),
        includeNameLine: Boolean(saved.includeNameLine),
        nameFormat: ['year-class-number-name', 'class-number-name', 'name-only'].includes(saved.nameFormat) ? saved.nameFormat : defaults.nameFormat
      };
    } catch { return defaults; }
  }

  function applySavedSettings() {
    $('#worksheet-title').value = settings.title;
    $('#question-count').value = settings.questionCount;
    $('#worksheet-subtitle').value = settings.subtitle;
    $('#column-count').value = settings.columns;
    $('#font-size-mode').value = settings.fontMode;
    $('#manual-font-size').value = settings.manualFontSize;
    $('#manual-size-wrap').hidden = settings.fontMode !== 'manual';
    $('#include-name-line').checked = settings.includeNameLine;
    $('#name-format').value = settings.nameFormat;
    $('#name-format-wrap').hidden = !settings.includeNameLine;
  }

  function saveSettings() {
    settings = {
      theme: $('#theme-select').value,
      title: $('#worksheet-title').value,
      questionCount: $('#question-count').value,
      subtitle: $('#worksheet-subtitle').value,
      columns: $('#column-count').value,
      fontMode: $('#font-size-mode').value,
      manualFontSize: $('#manual-font-size').value,
      includeNameLine: $('#include-name-line').checked,
      nameFormat: $('#name-format').value
    };
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
    catch { showToast('設定を保存できませんでした'); }
    if (typeof pages !== 'undefined' && pages.length) savePageState();
  }

  function readPageSettings() {
    return {
      title: $('#worksheet-title').value,
      questionCount: $('#question-count').value,
      subtitle: $('#worksheet-subtitle').value,
      columns: $('#column-count').value,
      fontMode: $('#font-size-mode').value,
      manualFontSize: $('#manual-font-size').value,
      includeNameLine: $('#include-name-line').checked,
      nameFormat: $('#name-format').value
    };
  }

  function savePageState() {
    const page = pages.find(item => item.id === activePageId);
    if (!page) return;
    page.settings = readPageSettings();
    page.selectedSectionIds = $$('#generator-sections input:checked').map(input => input.value);
    page.questionSet = currentQuestionSet.map(entry => ({ ...entry }));
    page.questionSetKey = currentQuestionSetKey;
    try { localStorage.setItem(PAGES_KEY, JSON.stringify(pages)); }
    catch { showToast('ページ設定を保存できませんでした'); }
  }

  function restorePageState(page) {
    const pageSettings = page.settings || readPageSettings();
    $('#worksheet-title').value = pageSettings.title ?? '単語テスト';
    $('#question-count').value = pageSettings.questionCount ?? '30';
    $('#worksheet-subtitle').value = pageSettings.subtitle ?? '';
    $('#column-count').value = pageSettings.columns ?? '1';
    $('#font-size-mode').value = pageSettings.fontMode ?? 'auto';
    $('#manual-font-size').value = pageSettings.manualFontSize ?? '12';
    $('#manual-size-wrap').hidden = $('#font-size-mode').value !== 'manual';
    $('#include-name-line').checked = Boolean(pageSettings.includeNameLine);
    $('#name-format').value = pageSettings.nameFormat ?? 'year-class-number-name';
    $('#name-format-wrap').hidden = !$('#include-name-line').checked;
    settings = { ...settings, ...pageSettings };
    currentQuestionSet = (page.questionSet || []).map(entry => ({ ...entry }));
    currentQuestionSetKey = page.questionSetKey || '';
    renderGenerator();
    $$('#generator-sections input').forEach(input => {
      input.checked = (page.selectedSectionIds || []).includes(input.value);
    });
    updateAvailableCount();
    if (!$('#panel-generator').hidden) updatePreview();
  }

  function renderPageTabs() {
    const container = $('#page-tabs');
    if (!container) return;
    container.replaceChildren();

    pages.forEach((page, index) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = `page-tab${page.id === activePageId ? ' is-active' : ''}`;
      tab.textContent = page.name || `${index + 1}ページ目`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(page.id === activePageId));
      tab.setAttribute('aria-pressed', String(page.id === activePageId));
      tab.addEventListener('click', () => switchPage(page.id));
      container.append(tab);
    });

    const deleteButton = $('#delete-page-button');
    if (deleteButton) deleteButton.disabled = pages.length <= 1;
  }

  function deletePage(pageId) {
    if (pages.length <= 1) {
      showToast('最後の1ページは削除できません。');
      return;
    }
    const target = pages.find(page => page.id === pageId);
    if (!target) return;
    if (!confirm(`「${target.name}」を削除しますか？\nこのページの設定と問題順も削除されます。`)) return;

    if (pageId === activePageId) savePageState();
    const removedIndex = pages.findIndex(page => page.id === pageId);
    pages = pages.filter(page => page.id !== pageId);
    pages.forEach((page, index) => { page.name = `${index + 1}ページ目`; });

    if (activePageId === pageId) {
      const nextPage = pages[Math.min(removedIndex, pages.length - 1)];
      activePageId = nextPage.id;
      restorePageState(nextPage);
    }

    try { localStorage.setItem(PAGES_KEY, JSON.stringify(pages)); }
    catch { showToast('ページ設定を保存できませんでした'); }
    renderPageTabs();
    showToast(`${target.name}を削除しました。`);
  }

  function switchPage(pageId) {
    if (pageId === activePageId) return;
    savePageState();
    const next = pages.find(item => item.id === pageId);
    if (!next) return;
    activePageId = pageId;
    restorePageState(next);
    renderPageTabs();
  }

  function addPage() {
    savePageState();
    const number = pages.length + 1;
    const page = {
      id: uid(),
      name: `${number}ページ目`,
      settings: readPageSettings(),
      selectedSectionIds: $$('#generator-sections input:checked').map(input => input.value),
      questionSet: [],
      questionSetKey: ''
    };
    pages.push(page);
    activePageId = page.id;
    restorePageState(page);
    renderPageTabs();
    showToast(`${number}ページ目を追加しました。`);
  }

  function loadPages() {
    try {
      const saved = JSON.parse(localStorage.getItem(PAGES_KEY) || 'null');
      if (Array.isArray(saved) && saved.length) {
        pages = saved.filter(page => page && typeof page.id === 'string').map((page, index) => ({
          id: page.id,
          name: typeof page.name === 'string' ? page.name : `${index + 1}ページ目`,
          settings: page.settings && typeof page.settings === 'object' ? page.settings : null,
          selectedSectionIds: Array.isArray(page.selectedSectionIds) ? page.selectedSectionIds : [],
          questionSet: Array.isArray(page.questionSet) ? page.questionSet : [],
          questionSetKey: typeof page.questionSetKey === 'string' ? page.questionSetKey : ''
        }));
        if (!pages.length) pages = [{ id: uid(), name: '1ページ目', settings: null, selectedSectionIds: [], questionSet: [], questionSetKey: '' }];
      }
    } catch (error) { console.warn('ページ設定を読み込めませんでした。', error); }
    activePageId = pages[0].id;
  }

  applySavedSettings();
  loadPages();

  function saveData() {
    try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); }
    catch { showToast('保存できませんでした。ブラウザーの保存容量を確認してください。'); }
  }

  function showToast(message) {
    const toast = $('#toast'); toast.textContent = message; toast.classList.add('is-visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function renderDefinitions() {
    const list = $('#section-list'); list.replaceChildren();
    data.sections.forEach(section => {
      const li = document.createElement('li');
      const select = document.createElement('button'); select.type = 'button'; select.className = `section-select${section.id === activeSectionId ? ' is-selected' : ''}`;
      select.innerHTML = `<span>${escapeHtml(section.name)}</span><span class="section-size">${section.entries.length}</span>`;
      select.addEventListener('click', () => { activeSectionId = section.id; renderDefinitions(); });
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'icon-button'; remove.setAttribute('aria-label', `${section.name}を削除`); remove.title = 'セクションを削除'; remove.textContent = '×';
      remove.addEventListener('click', () => {
        if (!confirm(`「${section.name}」と登録語句を削除しますか？`)) return;
        data.sections = data.sections.filter(item => item.id !== section.id);
        if (activeSectionId === section.id) activeSectionId = data.sections[0]?.id ?? null;
        saveData(); renderAll();
      });
      li.append(select, remove); list.append(li);
    });
    $('#section-count').textContent = data.sections.length;
    const active = data.sections.find(section => section.id === activeSectionId);
    $('#entries-title').textContent = active ? `${active.name} の語句` : '語句を登録';
    $('#entry-count').textContent = `${active?.entries.length ?? 0} 件`;
    $('#entries-empty').hidden = !!active?.entries.length;
    $('#entry-table-wrap').hidden = !active?.entries.length;
    const tbody = $('#entry-table-body'); tbody.replaceChildren();
    active?.entries.forEach(entry => {
      const tr = document.createElement('tr');
      const ja = document.createElement('td'); ja.textContent = entry.ja;
      const en = document.createElement('td'); en.textContent = entry.en;
      const actions = document.createElement('td'); const remove = document.createElement('button'); remove.className = 'icon-button'; remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', `${entry.ja}を削除`); remove.addEventListener('click', () => { active.entries = active.entries.filter(item => item.id !== entry.id); saveData(); renderAll(); });
      actions.append(remove); tr.append(ja, en, actions); tbody.append(tr);
    });
  }

  function renderGenerator() {
    const container = $('#generator-sections');
    const page = pages.find(item => item.id === activePageId);
    const previouslySelected = new Set(page ? page.selectedSectionIds : $$('input:checked', container).map(input => input.value));
    container.replaceChildren();
    data.sections.forEach(section => {
      const label = document.createElement('label'); label.className = 'checkbox-item';
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.value = section.id; checkbox.checked = previouslySelected.has(section.id); checkbox.addEventListener('change', () => { updateAvailableCount(); updatePreview(); savePageState(); });
      const text = document.createElement('span'); text.textContent = `${section.name} (${section.entries.length})`;
      label.append(checkbox, text); container.append(label);
    });
    $('#available-count').textContent = `語句：${getSelectedEntries().length}件`;
    if (!data.sections.length) container.innerHTML = '<p class="muted">セクションなし</p>';
  }

  function renderAll() { renderDefinitions(); renderGenerator(); if (!$('#panel-generator').hidden) updatePreview(); }
  function getSelectedEntries() {
    const ids = new Set($$('#generator-sections input:checked').map(input => input.value));
    return data.sections.filter(section => ids.has(section.id)).flatMap(section => section.entries.map(entry => ({ ...entry, section: section.name })));
  }
  function updateAvailableCount() { $('#available-count').textContent = `語句：${getSelectedEntries().length}件`; }

  function renderQuestionOrder() {
    const list = $('#question-order-list');
    list.replaceChildren();
    currentQuestionSet.forEach((entry, index) => {
      const row = document.createElement('li'); row.className = 'question-order-item'; row.dataset.entryId = entry.id;
      const number = document.createElement('span'); number.className = 'order-number'; number.textContent = String(index + 1);
      const tile = document.createElement('div'); tile.className = 'order-tile'; tile.draggable = true; tile.dataset.entryId = entry.id; tile.tabIndex = 0;
      tile.setAttribute('aria-label', `問題 ${index + 1}。ドラッグして並べ替え`);
      const section = document.createElement('span'); section.className = 'order-section'; section.textContent = entry.section;
      const japanese = document.createElement('span'); japanese.className = 'order-japanese'; japanese.textContent = entry.ja;
      const english = document.createElement('span'); english.className = 'order-english'; english.textContent = entry.en;
      tile.append(section, japanese, english); row.append(number, tile); list.append(row);
    });
    $('#problem-settings').hidden = currentQuestionSet.length === 0;
  }

  $('#section-form').addEventListener('submit', event => {
    event.preventDefault(); const input = $('#new-section-name'); const name = input.value.trim(); if (!name) return;
    const section = { id: uid(), name, entries: [] }; data.sections.push(section); activeSectionId = section.id; input.value = ''; saveData(); renderAll(); input.focus();
  });

  $('#entry-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!activeSectionId) { showToast('先にセクションを追加してください。'); $('#new-section-name').focus(); return; }
    const jaInput = $('#japanese-input'); const enInput = $('#english-input'); const ja = jaInput.value.trim(); const en = enInput.value.trim();
    if (!ja || !en) return;
    const section = data.sections.find(item => item.id === activeSectionId);
    section.entries.push({ id: uid(), ja, en }); jaInput.value = ''; enInput.value = ''; saveData(); renderAll(); jaInput.focus();
  });

  $('#add-page-button').addEventListener('click', addPage);
  $('#delete-page-button').addEventListener('click', () => deletePage(activePageId));

  $$('.tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.tab').forEach(item => { const selected = item === tab; item.classList.toggle('is-active', selected); item.setAttribute('aria-selected', String(selected)); });
    $$('.tab-panel').forEach(panel => { panel.hidden = panel.id !== `panel-${tab.dataset.tab}`; });
    if (tab.dataset.tab === 'generator') { restorePageState(pages.find(page => page.id === activePageId)); updatePreview(); }
  }));

  const helpDialog = $('#help-dialog');
  const helpTopics = {
    definitions: {
      title: '語句の定義',
      items: ['セクション名を入力し、「＋」で追加します。', 'セクションを選び、日本語と英単語・英熟語を登録します。', '熟語は単語の間をスペースで区切ります。', '語句ファイルの読み込みは、現在の語句を置き換えます。']
    },
    generator: {
      title: 'プリント設定',
      items: ['出題範囲を選び、タイトルと問題数を設定します。', '詳細設定で列数、文字サイズ、名前欄と形式を設定できます。', 'プレビューは設定に合わせて更新されます。', '「PDFをダウンロード」で保存します。']
    }
  };
  function openHelp(topic) {
    const content = helpTopics[topic];
    $('#help-title').textContent = content.title;
    const list = $('#help-content'); list.replaceChildren();
    content.items.forEach(text => { const item = document.createElement('li'); item.textContent = text; list.append(item); });
    helpDialog.showModal();
  }
  $('#help-definitions').addEventListener('click', () => openHelp('definitions'));
  $('#help-generator').addEventListener('click', () => openHelp('generator'));
  $('#close-help').addEventListener('click', () => helpDialog.close());
  $('#close-help-button').addEventListener('click', () => helpDialog.close());
  helpDialog.addEventListener('click', event => { if (event.target === helpDialog) helpDialog.close(); });

  $('#select-all').addEventListener('click', () => { $$('#generator-sections input').forEach(input => { input.checked = true; }); updateAvailableCount(); updatePreview(); savePageState(); });
  $('#select-none').addEventListener('click', () => { $$('#generator-sections input').forEach(input => { input.checked = false; }); updateAvailableCount(); updatePreview(); savePageState(); });
  $('#font-size-mode').addEventListener('change', () => {
    $('#manual-size-wrap').hidden = $('#font-size-mode').value !== 'manual';
    saveSettings();
    updatePreview();
  });
  $('#include-name-line').addEventListener('change', () => {
    $('#name-format-wrap').hidden = !$('#include-name-line').checked;
    saveSettings();
    updatePreview();
  });
  $('#name-format').addEventListener('change', () => { saveSettings(); updatePreview(); });
  ['worksheet-title', 'worksheet-subtitle', 'question-count', 'column-count', 'manual-font-size'].forEach(id => {
    const field = $(`#${id}`);
    field.addEventListener('input', () => { saveSettings(); updatePreview(); });
    field.addEventListener('change', () => { saveSettings(); updatePreview(); });
  });

  function worksheetWord(word) {
    const chars = Array.from(word);
    if (!chars.length) return '';
    if (chars.length === 1) return `<span class="answer-single">${escapeHtml(chars[0])}</span>`;
    return `<span class="blank-word">(${escapeHtml(chars[0])}${chars.slice(1).map(() => ' _').join('')} )</span>`;
  }

  function shuffle(items) {
    for (let index = items.length - 1; index > 0; index--) { const target = Math.floor(Math.random() * (index + 1)); [items[index], items[target]] = [items[target], items[index]]; }
    return items;
  }

  const mmToPx = mm => mm * 96 / 25.4;
  const ptToPx = pt => pt * 96 / 72;
  let pdfGenerating = false;

  function measureWorksheetFit(paper = $('#worksheet-paper')) {
    const questions = $$('.paper-questions li', paper);
    const rightMargin = mmToPx(3);
    const horizontalFit = questions.every(question => {
      const bounds = question.getBoundingClientRect();
      const contentRight = Math.max(bounds.left, ...[...question.querySelectorAll('*')].map(child => child.getBoundingClientRect().right));
      return question.scrollWidth <= question.clientWidth + 1 && contentRight <= bounds.right - rightMargin + 0.5;
    });
    const paperRect = paper.getBoundingClientRect();
    const paddingBottom = parseFloat(getComputedStyle(paper).paddingBottom) || 0;
    const contentBottom = paperRect.bottom - paddingBottom - mmToPx(3);
    const lastQuestionBottom = questions.reduce((bottom, question) => Math.max(bottom, question.getBoundingClientRect().bottom), 0);
    return { horizontal: horizontalFit, vertical: !questions.length || lastQuestionBottom <= contentBottom + 0.5 };
  }

  function recommendFontSize(paper = $('#worksheet-paper')) {
    const minimum = 5;
    const maximum = 16;
    const setSize = points => { paper.style.fontSize = `${ptToPx(points)}px`; };
    const maxPassing = (upper, predicate) => {
      let low = minimum; let high = upper;
      for (let pass = 0; pass < 25; pass++) {
        const middle = (low + high) / 2;
        setSize(middle);
        if (predicate(measureWorksheetFit(paper))) low = middle; else high = middle;
      }
      return low;
    };
    const horizontalMaximum = maxPassing(maximum, result => result.horizontal);
    let horizontalRecommended = Math.floor(horizontalMaximum * 2) / 2;
    setSize(horizontalRecommended);
    while (horizontalRecommended > minimum && !measureWorksheetFit(paper).horizontal) {
      horizontalRecommended = Math.max(minimum, horizontalRecommended - 0.5);
      setSize(horizontalRecommended);
    }
    const horizontalFit = measureWorksheetFit(paper).horizontal;
    let recommended = horizontalRecommended;
    if (!measureWorksheetFit(paper).vertical) {
      recommended = Math.floor(maxPassing(horizontalRecommended, result => result.horizontal && result.vertical) * 2) / 2;
      setSize(recommended);
      while (recommended > minimum && !measureWorksheetFit(paper).vertical) {
        recommended = Math.max(minimum, recommended - 0.5);
        setSize(recommended);
      }
    }
    setSize(recommended);
    return { points: recommended, fit: measureWorksheetFit(paper), horizontalPossible: horizontalFit };
  }

  function applyWorksheetFontSize(paper = $('#worksheet-paper'), updateStatus = true) {
    const mode = $('#font-size-mode').value;
    const automatic = recommendFontSize(paper);
    let points = automatic.points;
    let fit = automatic.fit;
    if (mode === 'manual') {
      points = Number($('#manual-font-size').value);
      if (!Number.isFinite(points) || points <= 0) points = 12;
      paper.style.fontSize = `${ptToPx(points)}px`;
      fit = measureWorksheetFit(paper);
    }
    if (!updateStatus) return { points, fit };
    const status = $('#fit-status');
    const shownSize = `${Number(points.toFixed(1))}pt`;
    const details = [];
    if (!fit.horizontal) details.push('横幅超過');
    if (!fit.vertical) details.push('1ページ超過');
    status.classList.toggle('is-warning', details.length > 0 || (mode === 'auto' && (!automatic.horizontalPossible || !automatic.fit.horizontal || !automatic.fit.vertical)));
    if (mode === 'auto') {
      const recommendationFailed = !automatic.horizontalPossible || !automatic.fit.horizontal || !automatic.fit.vertical;
      status.textContent = recommendationFailed ? `自動：${shownSize} / 収まりません` : `自動：${shownSize}`;
    } else {
      status.textContent = details.length ? `指定：${shownSize} / ${details.join('・')}` : `指定：${shownSize}`;
    }
  }

  let currentQuestionSetKey = '';
  let currentQuestionSet = [];
  const nameFormats = {
    'year-class-number-name': '年　組　  番 名前' + '\u3000'.repeat(7),
    'class-number-name': '　組　  番 名前' + '\u3000'.repeat(7),
    'name-only': '名前' + '\u3000'.repeat(8)
  };

  function buildPaperMarkup(answerMode = false) {
    const title = $('#worksheet-title').value.trim() || '単語テスト';
    const subtitle = $('#worksheet-subtitle').value.trim();
    const nameLine = $('#include-name-line').checked ? `<div class="paper-name-line">${nameFormats[$('#name-format').value]}</div>` : '';
    const questions = currentQuestionSet.map((entry, index) => {
      const english = answerMode ? escapeHtml(entry.en.trim().replace(/\s+/gu, ' ')) : entry.en.trim().split(/\s+/u).map(worksheetWord).join(' ');
      return `<li><span class="paper-number">${index + 1}</span><span class="paper-japanese">${escapeHtml(entry.ja)}</span><span class="paper-answer">${english}</span></li>`;
    }).join('');
    return `${nameLine}<header class="paper-header"><div class="paper-title-row"><div class="paper-title">${escapeHtml(title)}</div><div class="paper-meta">${subtitle ? `${escapeHtml(subtitle)}　` : ''}${currentQuestionSet.length}問</div></div><p class="paper-instruction">日本語を見て、英単語を書こう！頭文字だけヒントにしてあります。</p></header><ol class="paper-questions">${questions}</ol>`;
  }

  function showPreviewError(reason) {
    $('#preview-error-reason').textContent = reason;
    $('#preview-error').hidden = false;
    $('#worksheet-paper').hidden = true;
    $('#fit-status').textContent = '';
    $('#download-pdf-button').disabled = true;
    $('#download-answer-pdf-button').disabled = true;
  }

  function updatePreview({ renderOrder = true } = {}) {
    if ($('#panel-generator').hidden) return;
    const entries = getSelectedEntries();
    const selectedSections = $$('#generator-sections input:checked').length;
    const rawCount = $('#question-count').value;
    const count = Number(rawCount);
    if (!selectedSections) { showPreviewError('出題範囲が選択されていません'); return; }
    if (!entries.length) { showPreviewError('選択したセクションに語句がありません'); return; }
    if (!rawCount || !Number.isInteger(count) || count < 1 || count > 500) { showPreviewError('問題数は1〜500の整数で指定してください'); return; }
    if (count > entries.length) { showPreviewError(`語句が不足しています（選択範囲：${entries.length}件）`); return; }
    if ($('#font-size-mode').value === 'manual' && (!Number.isFinite(Number($('#manual-font-size').value)) || Number($('#manual-font-size').value) <= 0)) { showPreviewError('文字サイズを指定してください'); return; }

    const sourceKey = JSON.stringify(entries.map(({ id, ja, en, section }) => [id, ja, en, section]));
    const questionSetKey = `${sourceKey}:${count}`;
    if (questionSetKey !== currentQuestionSetKey) {
      currentQuestionSet = shuffle([...entries]).slice(0, count);
      currentQuestionSetKey = questionSetKey;
    }
    const paper = $('#worksheet-paper');
    paper.dataset.columns = $('#column-count').value;
    paper.dataset.answerMode = 'false';
    paper.innerHTML = buildPaperMarkup(false);
    $('#preview-error').hidden = true;
    paper.hidden = false;
    applyWorksheetFontSize();
    if (renderOrder) renderQuestionOrder();
    savePageState();
    $('#download-pdf-button').disabled = pdfGenerating;
    $('#download-answer-pdf-button').disabled = pdfGenerating;
  }

  const questionOrderList = $('#question-order-list');
  let draggedEntryId = null;
  questionOrderList.addEventListener('dragstart', event => {
    const tile = event.target.closest('.order-tile');
    if (!tile) return;
    draggedEntryId = tile.dataset.entryId;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedEntryId);
    tile.closest('.question-order-item').classList.add('is-dragging');
  });
  questionOrderList.addEventListener('dragend', () => {
    draggedEntryId = null;
    $$('.question-order-item', questionOrderList).forEach(row => row.classList.remove('is-dragging', 'drop-before', 'drop-after'));
  });
  questionOrderList.addEventListener('dragover', event => {
    event.preventDefault();
    const target = event.target.closest('.question-order-item');
    $$('.question-order-item', questionOrderList).forEach(row => row.classList.remove('drop-before', 'drop-after'));
    if (!target || target.dataset.entryId === draggedEntryId) return;
    target.classList.add(event.clientY < target.getBoundingClientRect().top + target.offsetHeight / 2 ? 'drop-before' : 'drop-after');
  });
  questionOrderList.addEventListener('drop', event => {
    event.preventDefault();
    const movingId = event.dataTransfer.getData('text/plain') || draggedEntryId;
    const sourceRow = [...questionOrderList.children].find(row => row.dataset.entryId === movingId);
    if (!sourceRow) return;
    const target = event.target.closest('.question-order-item');
    if (target && target !== sourceRow) {
      const placeBefore = event.clientY < target.getBoundingClientRect().top + target.offsetHeight / 2;
      if (placeBefore) target.before(sourceRow); else target.after(sourceRow);
    } else if (!target) {
      questionOrderList.append(sourceRow);
    }
    const scrollTop = window.scrollY;
    const entryById = new Map(currentQuestionSet.map(entry => [entry.id, entry]));
    currentQuestionSet = [...questionOrderList.children].map(row => entryById.get(row.dataset.entryId)).filter(Boolean);
    [...questionOrderList.children].forEach((row, index) => {
      $('.order-number', row).textContent = String(index + 1);
      $('.order-tile', row).setAttribute('aria-label', `問題 ${index + 1}。ドラッグして並べ替え`);
    });
    updatePreview({ renderOrder: false });
    window.scrollTo(0, scrollTop);
  });
  function drawWorksheetText(context, element, paperRect) {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const text = element.textContent;
    if (!text) return;
    const fontSize = parseFloat(style.fontSize) || 12;
    context.font = `${style.fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
    context.fillStyle = style.color;
    context.textBaseline = 'alphabetic';
    context.textAlign = element.classList.contains('paper-number') || element.classList.contains('paper-name-line') ? 'right' : 'left';
    if ('letterSpacing' in context) context.letterSpacing = style.letterSpacing;
    const metrics = context.measureText(text);
    const glyphHeight = (metrics.actualBoundingBoxAscent || fontSize * 0.8) + (metrics.actualBoundingBoxDescent || fontSize * 0.2);
    const baseline = rect.top - paperRect.top + (rect.height - glyphHeight) / 2 + (metrics.actualBoundingBoxAscent || fontSize * 0.8);
    const x = (context.textAlign === 'right' ? rect.right : rect.left) - paperRect.left;
    context.fillText(text, x, baseline);
    if ('letterSpacing' in context) context.letterSpacing = '0px';
  }

  async function renderWorksheetJpeg(paper = $('#worksheet-paper')) {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const rect = paper.getBoundingClientRect();
    const pixelWidth = 2480; const pixelHeight = 3508;
    const canvas = document.createElement('canvas'); canvas.width = pixelWidth; canvas.height = pixelHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('PDF作成に必要な機能が利用できません。');
    context.scale(pixelWidth / rect.width, pixelHeight / rect.height);
    context.fillStyle = '#fff'; context.fillRect(0, 0, rect.width, rect.height);

    const header = $('.paper-header', paper);
    const headerRect = header.getBoundingClientRect(); const headerStyle = getComputedStyle(header);
    context.beginPath(); context.strokeStyle = headerStyle.borderBottomColor; context.lineWidth = parseFloat(headerStyle.borderBottomWidth) || 1;
    context.moveTo(headerRect.left - rect.left, headerRect.bottom - rect.top - context.lineWidth / 2);
    context.lineTo(headerRect.right - rect.left, headerRect.bottom - rect.top - context.lineWidth / 2); context.stroke();

    const answerSelector = paper.dataset.answerMode === 'true' ? '.paper-answer' : '.blank-word, .answer-single';
    const textElements = paper.querySelectorAll(`.paper-name-line, .paper-title, .paper-meta, .paper-instruction, .paper-number, .paper-japanese, ${answerSelector}`);
    textElements.forEach(element => drawWorksheetText(context, element, rect));
    const jpeg = await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PDF用画像の作成に失敗しました。')), 'image/jpeg', 0.96));
    return new Uint8Array(await jpeg.arrayBuffer());
  }

  function makeMultiPagePdf(jpegPages) {
    if (!jpegPages.length) throw new Error('PDFにするページがありません。');
    const encoder = new TextEncoder();
    const parts = [];
    let byteLength = 0;
    const offsets = [0];
    const append = value => {
      const bytes = typeof value === 'string' ? encoder.encode(value) : value;
      parts.push(bytes);
      byteLength += bytes.length;
    };
    append('%PDF-1.4\n');

    const pageObjectIds = [];
    const pageCount = jpegPages.length;
    const firstPageObjectId = 3;
    const objectCount = 2 + pageCount * 3;

    const object = (number, body) => {
      offsets[number] = byteLength;
      append(`${number} 0 obj\n${body}\nendobj\n`);
    };

    object(1, '<< /Type /Catalog /Pages 2 0 R >>');
    const kids = jpegPages.map((_, index) => `${firstPageObjectId + index * 3} 0 R`).join(' ');
    object(2, `<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`);

    jpegPages.forEach((jpegBytes, index) => {
      const pageId = firstPageObjectId + index * 3;
      const imageId = pageId + 1;
      const contentId = pageId + 2;
      pageObjectIds.push(pageId);

      object(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);

      offsets[imageId] = byteLength;
      append(`${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width 2480 /Height 3508 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
      append(jpegBytes);
      append('\nendstream\nendobj\n');

      const content = encoder.encode('q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n');
      offsets[contentId] = byteLength;
      append(`${contentId} 0 obj\n<< /Length ${content.length} >>\nstream\n`);
      append(content);
      append('endstream\nendobj\n');
    });

    const xrefOffset = byteLength;
    append(`xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`);
    for (let index = 1; index <= objectCount; index++) {
      append(`${String(offsets[index]).padStart(10, '0')} 00000 n \n`);
    }
    append(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
    return new Blob(parts, { type: 'application/pdf' });
  }

  function createStagingPaper(answerMode) {
    const paper = $('#worksheet-paper').cloneNode(true);
    paper.hidden = false;
    paper.dataset.answerMode = String(answerMode);
    paper.style.position = 'fixed'; paper.style.left = '-10000px'; paper.style.top = '0'; paper.style.visibility = 'hidden';
    if (answerMode) {
      $$('.paper-answer', paper).forEach((answer, index) => {
        answer.textContent = currentQuestionSet[index].en.trim().replace(/\s+/gu, ' ');
      });
    }
    document.body.append(paper);
    return paper;
  }

  async function downloadWorksheetPdf(answerMode) {
    if (pdfGenerating || $('#worksheet-paper').hidden) return;
    pdfGenerating = true;
    const problemButton = $('#download-pdf-button');
    const answerButton = $('#download-answer-pdf-button');
    problemButton.disabled = true;
    answerButton.disabled = true;

    const originalPageId = activePageId;
    const originalPanelHidden = $('#panel-generator').hidden;
    const jpegPages = [];
    let stagingPaper;

    try {
      savePageState();
      $('#panel-generator').hidden = false;

      for (const page of pages) {
        activePageId = page.id;
        restorePageState(page);
        if ($('#worksheet-paper').hidden) {
          throw new Error(`${page.name}のプレビューを作成できません。出題範囲や問題数を確認してください。`);
        }
        stagingPaper = createStagingPaper(answerMode);
        const jpegBytes = await renderWorksheetJpeg(stagingPaper);
        jpegPages.push(jpegBytes);
        stagingPaper.remove();
        stagingPaper = null;
      }

      const pdf = makeMultiPagePdf(jpegPages);
      const url = URL.createObjectURL(pdf);
      const anchor = document.createElement('a');
      const safeTitle = ($('#worksheet-title').value.trim() || '単語テスト').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 80);
      anchor.href = url;
      anchor.download = `${safeTitle}${answerMode ? '_解答' : ''}.pdf`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      showToast(`${answerMode ? '解答' : '問題用紙'}PDF（${jpegPages.length}ページ）をダウンロードしました。`);
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'PDFを作成できませんでした。');
    } finally {
      stagingPaper?.remove();
      activePageId = originalPageId;
      const originalPage = pages.find(page => page.id === originalPageId);
      if (originalPage) restorePageState(originalPage);
      $('#panel-generator').hidden = originalPanelHidden;
      renderPageTabs();
      pdfGenerating = false;
      if (!$('#worksheet-paper').hidden) {
        problemButton.disabled = false;
        answerButton.disabled = false;
      }
    }
  }

  $('#download-pdf-button').addEventListener('click', () => downloadWorksheetPdf(false));
  $('#download-answer-pdf-button').addEventListener('click', () => downloadWorksheetPdf(true));

  $('#export-button').addEventListener('click', () => {
    if (!data.sections.length) { showToast('書き出すセクションがありません。'); return; }
    const lines = ['# 単語テスト生成ツール — 語句データ v1', ''];
    data.sections.forEach(section => { lines.push(`# ${encodeField(section.name)}`); section.entries.forEach(entry => lines.push(`${encodeField(entry.ja)}\t${encodeField(entry.en)}`)); lines.push(''); });
    const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = '単語リスト.txt'; anchor.click(); URL.revokeObjectURL(url); showToast('語句データを書き出しました。');
  });

  $('#import-button').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', async event => {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    try {
      const content = (await file.text()).replace(/^\uFEFF/, ''); const sections = []; let current = null; let skipped = 0;
      for (const rawLine of content.split(/\r?\n/u)) {
        const line = rawLine.trimEnd(); if (!line.trim()) continue;
        if (line.startsWith('# ')) {
          const name = decodeField(line.slice(2)).trim();
          if (name === '単語テスト生成ツール — 語句データ v1') continue;
          if (name) { current = { id: uid(), name, entries: [] }; sections.push(current); }
          continue;
        }
        const separator = line.indexOf('\t');
        if (!current || separator < 0) { skipped++; continue; }
        const ja = decodeField(line.slice(0, separator)).trim(); const en = decodeField(line.slice(separator + 1)).trim();
        if (ja && en) current.entries.push({ id: uid(), ja, en }); else skipped++;
      }
      if (!sections.length) { showToast('読み込めるセクションがありません。TXT形式を確認してください。'); return; }
      if (!confirm(`${sections.length} セクション、${sections.reduce((sum, section) => sum + section.entries.length, 0)} 件の語句を読み込みます。現在の語句データを置き換えますか？`)) return;
      data = { version: 1, sections }; activeSectionId = sections[0]?.id ?? null; saveData(); renderAll(); showToast(skipped ? `読み込みました。形式不明の${skipped}行は読み飛ばしました。` : '語句データを読み込みました。');
    } catch { showToast('ファイルを読み込めませんでした。'); }
  });

  const themeSelect = $('#theme-select');
  function applyTheme(value) {
    const preference = value === 'system' ? 'system' : value;
    const resolved = preference === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = resolved; themeSelect.value = preference;
  }
  applyTheme(settings.theme);
  themeSelect.addEventListener('change', () => { saveSettings(); applyTheme(themeSelect.value); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (themeSelect.value === 'system') applyTheme('system'); });

  renderAll();
  restorePageState(pages.find(page => page.id === activePageId));
  renderPageTabs();
})();
