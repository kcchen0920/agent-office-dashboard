// Real-time Agent Office Dashboard Controller (3D Voxel Sim Edition)

const AGENTS = {
  manager: {
    name: 'Antigravity',
    role: 'Manager / 主代理',
    avatar: 'PM',
    prompt: `你扮演專案的 Manager (主代理)。
職責：
1. 接收使用者的最高指示，拆解開發任務。
2. 撰寫「實作計畫 (Implementation Plan)」與任務分工。
3. 建立並協調子代理 (Research, Developer, QA) 完成工作。
4. 進行最後的代碼整合、整合測試，並向使用者提交 Walkthrough 成果報告。`,
    tools: ['define_subagent', 'invoke_subagent', 'send_message', 'manage_subagents', 'run_command', 'write_to_file', 'replace_file_content'],
    color: 'var(--neon-purple)'
  },
  researcher: {
    name: 'research',
    role: 'Researcher / 研究代理',
    avatar: 'RE',
    prompt: `你扮演專案的 Researcher (研究代理)。
職責：
1. 深入研究程式碼庫，尋找現有的類別、組件或 API。
2. 進行外部網路搜尋，尋找第三方庫的安裝與使用文檔。
3. 為開發代理提供前置的技術背景分析。
注意：你是唯讀代理，無權修改任何程式碼檔案。`,
    tools: ['search_web', 'read_url_content', 'grep_search', 'list_dir', 'view_file'],
    color: 'var(--neon-cyan)'
  },
  developer: {
    name: 'self',
    role: 'Developer / 開發代理',
    avatar: 'DV',
    prompt: `你扮演專案的 Developer (開發代理)。
職責：
1. 根據 Manager 分配的任務與規格，進行程式碼編寫與修改。
2. 遵循專案的設計規範，使用 Vanilla CSS / HTML / React 等技術。
3. 完成變更後，回報給 Manager 並提請程式碼審查。`,
    tools: ['write_to_file', 'replace_file_content', 'multi_replace_file_content', 'run_command', 'view_file'],
    color: 'var(--neon-emerald)'
  },
  qa: {
    name: 'qa_agent',
    role: 'QA Tester / 測試代理',
    avatar: 'QA',
    prompt: `你扮演專案的 QA Tester (測試代理)。
職責：
1. 針對 Developer 新增的程式碼編寫單元測試或集成測試。
2. 執行建置（Build）與測試指令，確保系統無語法或邏輯錯誤。
3. 如果發現錯誤，收集 log 記錄並回報給 Manager 重新修改。`,
    tools: ['run_command', 'view_file', 'grep_search'],
    color: 'var(--neon-rose)'
  }
};

// Office Simulator Coordinates
const LOCATIONS = {
  manager: {
    desk: { x: 300, y: 45 },      // PM Desk
    meeting: { x: 300, y: 60 },   // Meeting table
    lounge: { x: 110, y: 235 },   // Coffee table
    random: [
      { x: 300, y: 45 },
      { x: 300, y: 60 },
      { x: 110, y: 235 }
    ]
  },
  researcher: {
    desk: { x: 115, y: 70 },      // Reading Desk
    bookcase: { x: 45, y: 55 },   // Bookcases
    lounge: { x: 50, y: 235 },    // Lounge sofa
    random: [
      { x: 115, y: 70 },
      { x: 45, y: 55 },
      { x: 50, y: 235 }
    ]
  },
  developer: {
    desk1: { x: 470, y: 65 },     // Dev desk 1
    desk2: { x: 550, y: 65 },     // Dev desk 2
    lounge: { x: 110, y: 215 },   // Coffee Lounge
    random: [
      { x: 470, y: 65 },
      { x: 550, y: 65 },
      { x: 110, y: 215 }
    ]
  },
  qa: {
    desk: { x: 330, y: 220 },     // QA desk
    server: { x: 265, y: 220 },   // QA Server rack
    lounge: { x: 50, y: 245 },    // Lounge sofa
    random: [
      { x: 330, y: 220 },
      { x: 265, y: 220 },
      { x: 50, y: 245 }
    ]
  }
};

const TRANSLATIONS = {
  zh: {
    'logo-title': 'AI AGENT OFFICE',
    'limit-label': '警報閾值:',
    'strategy-label': 'Token 優化策略:',
    'lang-label': '語言 / Lang:',
    'notify-btn-text': '🔔 啟用瀏覽器桌面通知',
    'connection-status-text': '🔴 未連線',
    'sidebar-members-title': '辦公室成員',
    'agent-count': '4 名',
    'role-manager': 'Manager / 主代理',
    'role-researcher': 'Researcher / 研究代理',
    'role-developer': 'Developer / 開發代理',
    'role-qa': 'QA Tester / 測試代理',
    'stats-calls': '呼叫次數',
    'stats-tokens': 'Tokens 消耗',
    'savings-title': 'Token 優化效益',
    'savings-raw': '原始消耗:',
    'savings-optimized': '優化實際:',
    'savings-saved': '節省 Tokens:',
    'savings-cost': '預估節省金額:',
    'simulator-title': '虛擬方塊辦公模擬器 (Voxel Office Simulator)',
    'room-meeting': '會議室 / 經理席',
    'room-research': '資料庫與研究',
    'room-dev': '程式開發區',
    'room-qa': '測試與除錯中心',
    'room-lounge': '休閒茶水間',
    'kanban-title': '任務分配看板 (Kanban)',
    'kanban-todo': '待處理 (To Do)',
    'kanban-progress': '進行中 (In Progress)',
    'kanban-done': '已完成 (Done)',
    'chat-title': '內部對話頻道 (Chat Room)',
    'modal-instructions-title': '系統提示詞 (System Instructions)',
    'modal-tools-title': '授權工具範圍 (Authorized Tool Permissions)',
    
    // Select options
    'opt-none': '⛔ 原始歷史 (Full History)',
    'opt-window': '✂️ 滑動窗口 (Sliding Window)',
    'opt-prune': '🧹 工具輸出裁減 (Tool Pruning)',
    'opt-summarize': '📝 記憶摘要化 (Summarization)',
    'opt-cache': '⚡ Gemini 脈絡快取 (Context Cache)',

    // Connection states
    'conn-connected': '實時連線中',
    'conn-connecting': '連線中...',
    'conn-disconnected': '未連線',

    // Agent status display names
    'status-idle': 'Idle / 空閒',
    'status-thinking': 'Meeting / 會議中',
    'status-working': 'Coding / 開發中',
    'status-researching': 'Research / 研究中',
    'status-waiting': 'Waiting / 等待中',
    'status-coffee': 'Coffee / 喝咖啡',

    // Alert
    'token-alert': '警告：Token 消耗即將達到上限！',

    // Dynamic prompts
    'agent-manager-role': 'Manager / 主代理',
    'agent-manager-prompt': `你扮演專案的 Manager (主代理)。\n職責：\n1. 接收使用者的最高指示，拆解開發任務。\n2. 撰寫「實作計畫 (Implementation Plan)」與任務分工。\n3. 建立並協調子代理 (Research, Developer, QA) 完成工作。\n4. 進行最後的代碼整合、整合測試，並向使用者提交 Walkthrough 成果報告。`,
    
    'agent-researcher-role': 'Researcher / 研究代理',
    'agent-researcher-prompt': `你扮演專案的 Researcher (研究代理)。\n職責：\n1. 深入研究程式碼庫，尋找現有的類別、組件或 API。\n2. 進行外部網路搜尋，尋找第三方庫的安裝與使用文檔。\n3. 為開發代理提供前置的技術背景分析。\n注意：你是唯讀代理，無權修改任何程式碼檔案。`,
    
    'agent-developer-role': 'Developer / 開發代理',
    'agent-developer-prompt': `你扮演專案的 Developer (開發代理)。\n職責：\n1. 根據 Manager 分配的任務與規格，進行程式碼編寫與修改。\n2. 遵循專案的設計規範，使用 Vanilla CSS / HTML / React 等技術。\n3. 完成變更後，回報給 Manager 並提請程式碼審查。`,
    
    'agent-qa-role': 'QA Tester / 測試代理',
    'agent-qa-prompt': `你扮演專案的 QA Tester (測試代理)。\n職責：\n1. 針對 Developer 新增的程式碼編寫單元測試或集成測試。\n2. 執行建置（Build）與測試指令，確保系統無語法或邏輯錯誤。\n3. 如果發現錯誤，收集 log 記錄並回報給 Manager 重新修改。`
  },
  en: {
    'logo-title': 'AI AGENT OFFICE',
    'limit-label': 'Alert Threshold:',
    'strategy-label': 'Token Optimization:',
    'lang-label': 'Language / Lang:',
    'notify-btn-text': '🔔 Enable Desktop Notifications',
    'connection-status-text': '🔴 Disconnected',
    'sidebar-members-title': 'Office Members',
    'agent-count': '4 Members',
    'role-manager': 'Manager / Lead Agent',
    'role-researcher': 'Researcher / Search Agent',
    'role-developer': 'Developer / Code Agent',
    'role-qa': 'QA Tester / Verification Agent',
    'stats-calls': 'Total Calls',
    'stats-tokens': 'Tokens Used',
    'savings-title': 'Token Optimization Efficiency',
    'savings-raw': 'Original Cost:',
    'savings-optimized': 'Actual Cost:',
    'savings-saved': 'Saved Tokens:',
    'savings-cost': 'Est. Cost Saved:',
    'simulator-title': 'Voxel Office Simulator',
    'room-meeting': 'Meeting Room / Manager Seat',
    'room-research': 'Database & Research Lab',
    'room-dev': 'Software Development Area',
    'room-qa': 'Testing & Debugging Center',
    'room-lounge': 'Cozy Breakroom',
    'kanban-title': 'Task Kanban Board',
    'kanban-todo': 'To Do',
    'kanban-progress': 'In Progress',
    'kanban-done': 'Done',
    'chat-title': 'Internal Chat Channel',
    'modal-instructions-title': 'System Instructions',
    'modal-tools-title': 'Authorized Tool Permissions',

    // Select options
    'opt-none': '⛔ Full History (none)',
    'opt-window': '✂️ Sliding Window (window)',
    'opt-prune': '🧹 Tool Pruning (prune)',
    'opt-summarize': '📝 Memorized Summary (summarize)',
    'opt-cache': '⚡ Context Cache (cache)',

    // Connection states
    'conn-connected': 'Live Connected',
    'conn-connecting': 'Connecting...',
    'conn-disconnected': 'Disconnected',

    // Agent status display names
    'status-idle': 'Idle',
    'status-thinking': 'Meeting',
    'status-working': 'Coding',
    'status-researching': 'Research',
    'status-waiting': 'Waiting',
    'status-coffee': 'Coffee Break',

    // Alert
    'token-alert': 'Warning: Token usage is reaching the limit!',

    // Dynamic prompts
    'agent-manager-role': 'Manager / Lead Agent',
    'agent-manager-prompt': `You play the role of the project's Manager (Lead Agent).\nResponsibilities:\n1. Receive user high-level instructions, decompose into development tasks.\n2. Write the "Implementation Plan" and assign tasks.\n3. Define and coordinate sub-agents (Research, Developer, QA) to complete work.\n4. Perform final code integration, integration testing, and submit Walkthrough reports to the user.`,
    
    'agent-researcher-role': 'Researcher / Search Agent',
    'agent-researcher-prompt': `You play the role of the project's Researcher (Search Agent).\nResponsibilities:\n1. Research the codebase in depth to search for existing classes, components, or APIs.\n2. Run web searches to find installation and usage docs for third-party libraries.\n3. Provide developer agents with technical background analysis.\nNote: You are a read-only agent and cannot modify any source files.`,
    
    'agent-developer-role': 'Developer / Code Agent',
    'agent-developer-prompt': `You play the role of the project's Developer (Code Agent).\nResponsibilities:\n1. Write and modify code based on specifications and tasks assigned by the Manager.\n2. Follow project design rules, using Vanilla CSS / HTML / React, etc.\n3. Report back to the Manager for code review once changes are completed.`,
    
    'agent-qa-role': 'QA Tester / Verification Agent',
    'agent-qa-prompt': `You play the role of the project's QA Tester (Verification Agent).\nResponsibilities:\n1. Write unit or integration tests for the code added by the Developer.\n2. Run build and test commands to verify no syntax or logical errors exist.\n3. Collect logs and report to the Manager for fixing if errors are found.`
  },
  ja: {
    'logo-title': 'AI AGENT OFFICE',
    'limit-label': '警告しきい値:',
    'strategy-label': 'Token 最適化方法:',
    'lang-label': '言語 / Lang:',
    'notify-btn-text': '🔔 デスクトップ通知を有効化',
    'connection-status-text': '🔴 未接続',
    'sidebar-members-title': 'オフィスメニュー',
    'agent-count': '4 名',
    'role-manager': 'Manager / 主エージェント',
    'role-researcher': 'Researcher / 研究エージェント',
    'role-developer': 'Developer / 開発エージェント',
    'role-qa': 'QA Tester / テストエージェント',
    'stats-calls': 'コール数',
    'stats-tokens': '消費トークン',
    'savings-title': 'Token 最適化の効果',
    'savings-raw': '元の消費量:',
    'savings-optimized': '実際の消費量:',
    'savings-saved': '節約トークン:',
    'savings-cost': '推定節約額:',
    'simulator-title': 'ボクセルオフィスシミュレーター',
    'room-meeting': '会議室 / マネージャー席',
    'room-research': 'データベース・研究室',
    'room-dev': 'プログラム開発エリア',
    'room-qa': '検証・デバッグセンター',
    'room-lounge': 'リラックス休憩室',
    'kanban-title': 'タスクカンバンボード',
    'kanban-todo': '未対応',
    'kanban-progress': '進行中',
    'kanban-done': '完了',
    'chat-title': '社内チャットチャンネル',
    'modal-instructions-title': 'システムプロンプト (指示)',
    'modal-tools-title': '許可されたツール権限',

    // Select options
    'opt-none': '⛔ 元の履歴 (Full History)',
    'opt-window': '✂️ スライディングウィンドウ (Sliding Window)',
    'opt-prune': '🧹 ツール出力削減 (Tool Pruning)',
    'opt-summarize': '📝 記憶要約化 (Summarization)',
    'opt-cache': '⚡ Gemini コンテキストキャッシュ',

    // Connection states
    'conn-connected': 'リアルタイム接続中',
    'conn-connecting': '接続中...',
    'conn-disconnected': '未接続',

    // Agent status display names
    'status-idle': 'Idle / 待機中',
    'status-thinking': 'Meeting / 会議中',
    'status-working': 'Coding / 開発中',
    'status-researching': 'Research / 調査中',
    'status-waiting': 'Waiting / 承認待ち',
    'status-coffee': 'Coffee / 休憩中',

    // Alert
    'token-alert': '警告：トークン消費量が上限に達しつつあります！',

    // Dynamic prompts
    'agent-manager-role': 'Manager / 主エージェント',
    'agent-manager-prompt': `あなたはプロジェクトの Manager (主エージェント) です。\n職務：\n1. ユーザーからの高レベルの指示を受信し、開発タスクを分解します。\n2. 「実装計画 (Implementation Plan)」とタスクアサインを作成します。\n3. サブエージェント（Research, Developer, QA）を生成・調整し作業を推進します。\n4. 最終的なコード統合、結合テストを行い、ユーザーに成果報告（Walkthrough）を提出します。`,
    
    'agent-researcher-role': 'Researcher / 調査エージェント',
    'agent-researcher-prompt': `あなたはプロジェクトの Researcher (調査エージェント) です。\n職務：\n1. 調査対象のコードベースを詳しく分析し、既存のクラスやモジュール、APIを見つけます。\n2. 外部ウェブ検索を行って、サードパーティ製ライブラリの使い方や仕様書を見つけます。\n3. 開発エージェントに対して必要な前提技術情報を提供します。\n注意：あなたは読込専用（Read-only）エージェントであり、ソースファイルを変更する権限はありません。`,
    
    'agent-developer-role': 'Developer / 開発エージェント',
    'agent-developer-prompt': `あなたはプロジェクトの Developer (開発エージェント) です。\n職務：\n1. マネージャーから割り当てられたタスクと仕様に基づいてコードを記述・修正します。\n2. プロジェクトのデザイン規約に従い、Vanilla CSS / HTML / React などの技術を使用します。\n3. 変更が完了したら、マネージャーにコードレビューを申請します。`,
    
    'agent-qa-role': 'QA Tester / テストエージェント',
    'agent-qa-prompt': `あなたはプロジェクトの QA Tester (テストエージェント) です。\n職務：\n1. 開発エージェントが追加したコードに対して単体テストまたは結合テストを記述します。\n2. ビルドおよびテストコマンドを実行し、シンタックスエラーや論理エラーがないことを確認します。\n3. エラーが検出された場合はログを収集し、修正のためマネージャーに報告します。`
  }
};

let currentLanguage = 'zh';
let lastConnectionStatus = 'disconnected';

// Track which agents are currently active so we don't wrongly reset them
const agentActiveStatus = {
  manager: 'idle',
  researcher: 'idle',
  developer: 'idle',
  qa: 'idle'
};

const statusDisplayNames = {
  idle: 'Idle',
  thinking: 'Meeting',
  working: 'Coding',
  researching: 'Research',
  waiting: 'Waiting'
};

// UI State
let kanbanTasks = [];
const stats = {
  manager: { calls: 0, tokens: 0 },
  researcher: { calls: 0, tokens: 0 },
  developer: { calls: 0, tokens: 0 },
  qa: { calls: 0, tokens: 0 }
};

let lastTokenAlertLogged = null;
let notificationThrottles = {};
let allReceivedSteps = [];
let processedStepIndices = new Set();
let currentStrategy = 'none';
let eventSource = null;

// DOM Cache
const DOM = {
  chatContainer: document.getElementById('chat-messages-container'),
  detailsOverlay: document.getElementById('details-overlay'),
  modalClose: document.getElementById('modal-close'),
  connBadge: document.getElementById('conn-badge'),
  connDot: document.getElementById('connection-dot'),
  connStatusText: document.getElementById('connection-status-text'),
  strategySelect: document.getElementById('strategy-select'),
  limitSelect: document.getElementById('limit-select'),
  alertBanner: document.getElementById('token-alert-banner'),
  alertText: document.getElementById('token-alert-text'),
  alertCloseBtn: document.getElementById('token-alert-close'),
  savingsRate: document.getElementById('savings-rate'),
  statsRawTokens: document.getElementById('stats-raw-tokens'),
  statsOptimizedTokens: document.getElementById('stats-optimized-tokens'),
  statsSavedTokens: document.getElementById('stats-saved-tokens'),
  statsSavedCost: document.getElementById('stats-saved-cost'),
  notifyBtn: document.getElementById('notify-btn'),
  notifyBtnText: document.getElementById('notify-btn-text'),
  
  agents: {
    manager: {
      calls: document.getElementById('stats-calls-manager'),
      tokens: document.getElementById('stats-tokens-manager'),
      status: document.getElementById('status-manager'),
      text: document.getElementById('text-manager'),
      card: document.querySelector('.agent-card.manager')
    },
    researcher: {
      calls: document.getElementById('stats-calls-researcher'),
      tokens: document.getElementById('stats-tokens-researcher'),
      status: document.getElementById('status-researcher'),
      text: document.getElementById('text-researcher'),
      card: document.querySelector('.agent-card.researcher')
    },
    developer: {
      calls: document.getElementById('stats-calls-developer'),
      tokens: document.getElementById('stats-tokens-developer'),
      status: document.getElementById('status-developer'),
      text: document.getElementById('text-developer'),
      card: document.querySelector('.agent-card.developer')
    },
    qa: {
      calls: document.getElementById('stats-calls-qa'),
      tokens: document.getElementById('stats-tokens-qa'),
      status: document.getElementById('status-qa'),
      text: document.getElementById('text-qa'),
      card: document.querySelector('.agent-card.qa')
    }
  }
};

// Update connection status UI
function updateConnectionStatus(status) {
  lastConnectionStatus = status;
  const tKey = 'conn-' + status;
  const localizedText = TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][tKey] || status;

  const configs = {
    connected: { border: 'rgba(0, 255, 133, 0.3)', bg: 'rgba(0, 255, 133, 0.05)', className: 'status-dot working', text: '🟢 ' + localizedText, color: 'var(--neon-emerald)', animation: 'pulse-emerald 1.5s infinite' },
    connecting: { border: 'rgba(255, 170, 0, 0.3)', bg: 'rgba(255, 170, 0, 0.05)', className: 'status-dot waiting', text: '🟡 ' + localizedText, color: 'var(--neon-amber)', animation: 'pulse-amber 1.5s infinite' },
    disconnected: { border: 'rgba(255, 0, 122, 0.3)', bg: 'rgba(255, 0, 122, 0.05)', className: 'status-dot idle', text: '🔴 ' + localizedText, color: 'var(--text-secondary)', animation: 'none' }
  };
  
  const cfg = configs[status] || configs.disconnected;
  DOM.connBadge.style.borderColor = cfg.border;
  DOM.connBadge.style.background = cfg.bg;
  DOM.connDot.className = cfg.className;
  DOM.connDot.style.background = cfg.color;
  DOM.connDot.style.animation = cfg.animation;
  DOM.connStatusText.innerText = cfg.text;
  DOM.connStatusText.style.color = cfg.color;
}

// Translate the page labels and components dynamically
function applyLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('agent_office_lang', lang);

  // 1. Translation for static nodes tagged with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
      if (el.tagName === 'OPTION') {
        el.text = TRANSLATIONS[lang][key];
      } else {
        el.textContent = TRANSLATIONS[lang][key];
      }
    }
  });

  // 2. Document Title
  document.title = lang === 'en' ? 'AI Agent Office - 3D Voxel Office Simulator' :
                   lang === 'ja' ? 'AI Agent Office - ボクセルオフィスシミュレーター' :
                   'AI Agent Office - 3D 體素辦公模擬器';

  // 3. Update active states/status texts
  updateConnectionStatus(lastConnectionStatus);
  setupNotificationButton();

  // 4. Map display names for SVG characters
  statusDisplayNames.idle = lang === 'en' ? 'Idle' : lang === 'ja' ? '待機中' : 'Idle';
  statusDisplayNames.thinking = lang === 'en' ? 'Meeting' : lang === 'ja' ? '会議中' : '會議中';
  statusDisplayNames.working = lang === 'en' ? 'Coding' : lang === 'ja' ? '開発中' : '開發中';
  statusDisplayNames.researching = lang === 'en' ? 'Research' : lang === 'ja' ? '調査中' : '研究中';
  statusDisplayNames.waiting = lang === 'en' ? 'Waiting' : lang === 'ja' ? '承認待ち' : '等待中';

  // Update simulator characters status tags if idle
  Object.keys(AGENTS).forEach(k => {
    const tagEl = document.getElementById(`tag-${k}`);
    if (tagEl) {
      const isIdle = DOM.agents[k] && DOM.agents[k].status.classList.contains('idle');
      if (isIdle) {
        tagEl.innerText = statusDisplayNames.idle;
      }
    }
  });

  // Update dynamically mapped instructions in AGENTS mapping
  Object.keys(AGENTS).forEach(k => {
    if (TRANSLATIONS[lang]) {
      AGENTS[k].role = TRANSLATIONS[lang][`agent-${k}-role`] || AGENTS[k].role;
      AGENTS[k].prompt = TRANSLATIONS[lang][`agent-${k}-prompt`] || AGENTS[k].prompt;
    }
  });
}

// Move character in SVG office simulator
function walkTo(agentKey, x, y) {
  const charEl = document.getElementById(`char-${agentKey}`);
  if (charEl) {
    charEl.style.transform = `translate(${x}px, ${y}px)`;
  }
}

// Update Agent working status and trigger simulator movements
function updateAgentStatus(agentKey, status) {
  const ui = DOM.agents[agentKey];
  if (!ui) return;

  agentActiveStatus[agentKey] = status;
  ui.status.className = `status-dot ${status}`;
  ui.text.innerText = status.charAt(0).toUpperCase() + status.slice(1);

  // Update simulator character status tag
  const tagEl = document.getElementById(`tag-${agentKey}`);
  if (tagEl) {
    tagEl.innerText = statusDisplayNames[status] || status.toUpperCase();
    tagEl.className = `char-status-tag ${status}`;
  }

  const charEl = document.getElementById(`char-${agentKey}`);

  if (status !== 'idle') {
    ui.card.classList.add('active-selection');
    if (charEl) charEl.classList.add('active-work');
    
    // Move to designated work areas
    if (status === 'thinking') {
      walkTo('manager', LOCATIONS.manager.meeting.x, LOCATIONS.manager.meeting.y);
    } else if (status === 'working' || status === 'researching') {
      if (agentKey === 'developer') {
        walkTo('developer', LOCATIONS.developer.desk1.x, LOCATIONS.developer.desk1.y);
      } else if (agentKey === 'researcher') {
        walkTo('researcher', LOCATIONS.researcher.bookcase.x, LOCATIONS.researcher.bookcase.y);
      } else if (agentKey === 'qa') {
        walkTo('qa', LOCATIONS.qa.server.x, LOCATIONS.qa.server.y);
      }
    }
  } else {
    ui.card.classList.remove('active-selection');
    if (charEl) charEl.classList.remove('active-work');
    
    // Return to desks/idle locations
    if (agentKey === 'manager') {
      walkTo('manager', LOCATIONS.manager.desk.x, LOCATIONS.manager.desk.y);
    } else if (agentKey === 'researcher') {
      walkTo('researcher', LOCATIONS.researcher.desk.x, LOCATIONS.researcher.desk.y);
    } else if (agentKey === 'developer') {
      walkTo('developer', LOCATIONS.developer.desk2.x, LOCATIONS.developer.desk2.y);
    } else if (agentKey === 'qa') {
      walkTo('qa', LOCATIONS.qa.desk.x, LOCATIONS.qa.desk.y);
    }
  }
}

// Setup random wandering for idle agents
function initWandering() {
  setInterval(() => {
    Object.keys(AGENTS).forEach(k => {
      const ui = DOM.agents[k];
      // Only wander if currently idle
      if (ui && ui.status.classList.contains('idle')) {
        if (Math.random() < 0.35) {
          const charLocs = LOCATIONS[k].random;
          const target = charLocs[Math.floor(Math.random() * charLocs.length)];
          walkTo(k, target.x, target.y);
          
          const tagEl = document.getElementById(`tag-${k}`);
          if (tagEl) {
            tagEl.innerText = (target.y > 185 && target.x < 180) ? 'Coffee' : 'Idle';
          }
        }
      }
    });
  }, 12000);
}

// Append bubble to chat container
function appendChat(sender, type, content, role) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${type === 'sent' ? 'sent' : 'received'} ${role}`;
  bubble.innerHTML = `
    <span class="bubble-sender">${sender}</span>
    <div class="bubble-content">${escapeHTML(content)}</div>
  `;
  
  DOM.chatContainer.appendChild(bubble);
  while (DOM.chatContainer.children.length > 100) {
    DOM.chatContainer.removeChild(DOM.chatContainer.firstChild);
  }
  DOM.chatContainer.scrollTop = DOM.chatContainer.scrollHeight;
}

function escapeHTML(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// Kanban Task Management
function addOrUpdateKanban(id, title, assignee, status) {
  const existing = kanbanTasks.find(t => t.id === id);
  if (existing) {
    existing.status = status;
  } else {
    kanbanTasks.push({ id, title, assignee, status });
  }
  renderKanban();
}

let kanbanPending = false;
function renderKanban() {
  if (kanbanPending) return;
  kanbanPending = true;
  requestAnimationFrame(() => {
    const colTodo = document.getElementById('col-todo');
    const colProgress = document.getElementById('col-progress');
    const colDone = document.getElementById('col-done');
    if (!colTodo || !colProgress || !colDone) {
      kanbanPending = false;
      return;
    }

    Array.from(colTodo.children).slice(1).forEach(el => el.remove());
    Array.from(colProgress.children).slice(1).forEach(el => el.remove());
    Array.from(colDone.children).slice(1).forEach(el => el.remove());

    let counts = { todo: 0, progress: 0, done: 0 };

    kanbanTasks.forEach(task => {
      counts[task.status]++;
      const card = document.createElement('div');
      card.className = `kanban-card ${task.status === 'progress' ? 'active-work' : ''}`;
      card.style.borderLeft = `3px solid ${AGENTS[task.assignee]?.color || 'var(--text-secondary)'}`;
      card.innerHTML = `
        <div class="card-title">${task.title}</div>
        <div class="card-meta">
          <span class="card-assignee ${task.assignee}">${AGENTS[task.assignee]?.name || task.assignee}</span>
        </div>
      `;
      
      if (task.status === 'todo') colTodo.appendChild(card);
      else if (task.status === 'progress') colProgress.appendChild(card);
      else if (task.status === 'done') colDone.appendChild(card);
    });

    document.getElementById('count-todo').innerText = counts.todo;
    document.getElementById('count-progress').innerText = counts.progress;
    document.getElementById('count-done').innerText = counts.done;
    kanbanPending = false;
  });
}

// Parsing structures mapping
const stepHandlers = {
  USER_INPUT: (step) => {
    let cleanText = (step.content || '').replace(/<USER_REQUEST>|<\/USER_REQUEST>/g, '').trim();
    appendChat('User', 'received', cleanText, 'user');
    updateAgentStatus('manager', 'thinking');
    addOrUpdateKanban(step.step_index.toString(), '處理使用者指令', 'manager', 'progress');
  },
  
  PLANNER_RESPONSE: (step) => {
    if (step.content) {
      appendChat('Antigravity (Manager)', 'sent', step.content, 'manager');
    }
    updateAgentStatus('manager', 'thinking');
    
    if (step.tool_calls && step.tool_calls.length > 0) {
      step.tool_calls.forEach(toolCall => {
        const toolName = toolCall.name;
        const args = toolCall.args || {};
        
        if (toolName === 'invoke_subagent' && args.Subagents) {
          args.Subagents.forEach(sub => {
            const type = sub.TypeName;
            const mapping = { research: 'researcher', self: 'developer', qa_agent: 'qa' };
            const statusKey = mapping[type];
            if (statusKey) {
              updateAgentStatus(statusKey, type === 'research' ? 'researching' : 'working');
              addOrUpdateKanban(step.step_index + '-sub', `${type === 'research' ? '研究' : type === 'self' ? '開發' : 'QA 驗證'}: ${sub.Prompt.slice(0, 30)}...`, statusKey, 'progress');
            }
          });
        }
        
        if (['write_to_file', 'replace_file_content', 'multi_replace_file_content'].includes(toolName)) {
          updateAgentStatus('developer', 'working');
          const filename = args.TargetFile ? args.TargetFile.split(/[/\\]/).pop() : '檔案';
          addOrUpdateKanban(step.step_index + '-edit', `編寫/修改 ${filename}`, 'developer', 'progress');
        }

        if (toolName === 'run_command') {
          const cmd = args.CommandLine || '';
          if (cmd.includes('test') || cmd.includes('lint') || cmd.includes('check')) {
            updateAgentStatus('qa', 'working');
            addOrUpdateKanban(step.step_index + '-test', `測試指令: ${cmd.slice(0, 20)}`, 'qa', 'progress');
          }
        }
      });
    }
  }
};

const toolTypes = ['CODE_ACTION', 'RUN_COMMAND', 'GENERATE_IMAGE', 'LIST_DIRECTORY', 'VIEW_FILE', 'GREP_SEARCH'];

function handleToolResponse(step) {
  const typeMap = { GREP_SEARCH: 'researcher', LIST_DIRECTORY: 'researcher', VIEW_FILE: 'researcher', CODE_ACTION: 'developer' };
  const targetAgent = typeMap[step.type];
  if (targetAgent) {
    updateAgentStatus(targetAgent, 'idle');
    kanbanTasks.forEach(t => {
      if (t.assignee === targetAgent && t.status === 'progress') t.status = 'done';
    });
  } else if (step.type === 'RUN_COMMAND') {
    updateAgentStatus('qa', 'idle');
    updateAgentStatus('developer', 'idle');
    kanbanTasks.forEach(t => {
      if (['qa', 'developer'].includes(t.assignee) && t.status === 'progress') t.status = 'done';
    });
  }
  renderKanban();
}

function processStep(step) {
  if (!step || !step.type) return;

  allReceivedSteps.push(step);
  if (allReceivedSteps.length > 500) {
    const removedStep = allReceivedSteps.shift();
    if (removedStep && removedStep.step_index !== undefined) {
      processedStepIndices.delete(removedStep.step_index);
    }
  }

  // Do NOT blanket-reset all agents on every step.
  // Only reset agents to idle when a full planning cycle completes (PLANNER_RESPONSE DONE).
  if (stepHandlers[step.type]) {
    stepHandlers[step.type](step);
  } else if (toolTypes.includes(step.type)) {
    handleToolResponse(step);
  }

  if (step.status === 'DONE' && step.type === 'PLANNER_RESPONSE') {
    // Reset all agents to idle when the planning cycle completes
    Object.keys(AGENTS).forEach(k => updateAgentStatus(k, 'idle'));
    kanbanTasks.forEach(t => {
      if (t.status === 'progress') t.status = 'done';
    });
    renderKanban();
  }

  queueUIUpdate();
}

let uiUpdatePending = false;
function queueUIUpdate() {
  if (uiUpdatePending) return;
  uiUpdatePending = true;
  requestAnimationFrame(() => {
    recalculateAgentStats();
    updateTokenSavingsDashboard();
    uiUpdatePending = false;
  });
}

function estimateStepTokens(step) {
  let size = (step.content ? step.content.length : 0) + (step.tool_calls ? JSON.stringify(step.tool_calls).length : 0);
  let tokens = Math.max(12, Math.round(size * 1.5));
  if (['RUN_COMMAND', 'VIEW_FILE', 'GREP_SEARCH', 'LIST_DIRECTORY'].includes(step.type)) {
    tokens = Math.max(tokens, 600);
  }
  return tokens;
}

function recalculateAgentStats() {
  Object.keys(stats).forEach(k => {
    stats[k].calls = 0;
    stats[k].tokens = 0;
  });
  
  const totalSteps = allReceivedSteps.length;
  
  allReceivedSteps.forEach((step, idx) => {
    let agentKey = null;
    let isCall = false;
    
    if (step.type === 'USER_INPUT' || step.type === 'PLANNER_RESPONSE') {
      agentKey = 'manager';
      isCall = true;
    } else if (['GREP_SEARCH', 'LIST_DIRECTORY', 'VIEW_FILE'].includes(step.type)) {
      agentKey = 'researcher';
      isCall = true;
    } else if (step.type === 'CODE_ACTION') {
      agentKey = 'developer';
      isCall = true;
    } else if (step.type === 'RUN_COMMAND') {
      const cmd = step.content || '';
      agentKey = (cmd.includes('test') || cmd.includes('lint') || cmd.includes('check')) ? 'qa' : 'developer';
      isCall = true;
    }
    
    if (agentKey) {
      const rawTokens = estimateStepTokens(step);
      let optTokens = rawTokens;
      
      if (currentStrategy === 'window') {
        if (idx < totalSteps - 5) optTokens = 0;
      } else if (currentStrategy === 'prune') {
        if (step.pruned) optTokens = Math.round(rawTokens * 0.15);
      } else if (currentStrategy === 'summarize') {
        if (idx < totalSteps - 3) optTokens = 150;
      } else if (currentStrategy === 'cache') {
        if (idx < totalSteps - 3) optTokens = Math.round(rawTokens * 0.25);
      }
      
      stats[agentKey].calls += isCall ? 1 : 0;
      stats[agentKey].tokens += optTokens;
    }
  });
  
  Object.keys(stats).forEach(k => {
    const ui = DOM.agents[k];
    if (ui) {
      ui.calls.innerText = stats[k].calls;
      ui.tokens.innerText = stats[k].tokens.toLocaleString();
    }
  });
}

function updateTokenSavingsDashboard() {
  let totalRawTokens = 0;
  let totalOptimizedTokens = 0;
  
  allReceivedSteps.forEach((step, idx) => {
    const rawTokens = estimateStepTokens(step);
    totalRawTokens += rawTokens;
    
    let optTokens = rawTokens;
    if (currentStrategy === 'window') {
      if (idx < allReceivedSteps.length - 5) optTokens = 0;
    } else if (currentStrategy === 'prune') {
      if (step.pruned) optTokens = Math.round(rawTokens * 0.15);
    } else if (currentStrategy === 'summarize') {
      if (idx < allReceivedSteps.length - 3) optTokens = 150;
    } else if (currentStrategy === 'cache') {
      if (idx < allReceivedSteps.length - 3) optTokens = Math.round(rawTokens * 0.25);
    }
    totalOptimizedTokens += optTokens;
  });
  
  const savedTokens = Math.max(0, totalRawTokens - totalOptimizedTokens);
  const savingRate = totalRawTokens > 0 ? Math.round((savedTokens / totalRawTokens) * 100) : 0;
  
  const rawCost = (totalRawTokens / 1000000) * 0.15;
  const optimizedCost = (totalOptimizedTokens / 1000000) * 0.15;
  const savedCost = Math.max(0, rawCost - optimizedCost);
  
  DOM.statsRawTokens.innerText = totalRawTokens.toLocaleString();
  DOM.statsOptimizedTokens.innerText = totalOptimizedTokens.toLocaleString();
  DOM.statsSavedTokens.innerText = savedTokens.toLocaleString();
  DOM.savingsRate.innerText = `${savingRate}%`;
  DOM.savingsRate.className = savingRate > 0 ? 'pulse-save' : '';
  DOM.statsSavedCost.innerText = `$${savedCost.toFixed(5)} USD`;

  checkTokenLimitAlert(totalOptimizedTokens);
}

function checkTokenLimitAlert(totalOptimizedTokens) {
  const tokenLimit = parseInt(DOM.limitSelect ? DOM.limitSelect.value : 1000000, 10);
  const percentage = (totalOptimizedTokens / tokenLimit) * 100;
  
  if (!DOM.alertBanner || !DOM.alertText) return;
  
  if (percentage >= 100) {
    DOM.alertBanner.className = 'token-alert-banner danger';
    DOM.alertText.innerText = currentLanguage === 'en' ? `🚨 Critical Warning: Token usage reached 100% Limit (${totalOptimizedTokens.toLocaleString()} / ${tokenLimit.toLocaleString()})!` :
                              currentLanguage === 'ja' ? `🚨 致命的な警告：トークン消費量が 100% 上限に達しました (${totalOptimizedTokens.toLocaleString()} / ${tokenLimit.toLocaleString()})！` :
                              `🚨 致命警告：Token 消耗已達 100% 上限 (${totalOptimizedTokens.toLocaleString()} / ${tokenLimit.toLocaleString()})，模型即將無法使用！`;
    DOM.alertBanner.style.display = 'flex';
    triggerDesktopNotification(
      currentLanguage === 'en' ? '🚨 AI Agent Office: Token Limit Exceeded!' :
      currentLanguage === 'ja' ? '🚨 AI Agent Office: トークン制限を超過しました！' :
      '🚨 AI Agent Office: Token Limit Exceeded!',
      currentLanguage === 'en' ? `Token usage reached 100% (${totalOptimizedTokens.toLocaleString()} / ${tokenLimit.toLocaleString()})!` :
      currentLanguage === 'ja' ? `トークン消費量が 100% に達しました (${totalOptimizedTokens.toLocaleString()} / ${tokenLimit.toLocaleString()})！` :
      `Token 消耗已達 100% 上限 (${totalOptimizedTokens.toLocaleString()} / ${tokenLimit.toLocaleString()})！`
    );
    if (lastTokenAlertLogged !== 'danger') {
      lastTokenAlertLogged = 'danger';
    }
  } else if (percentage >= 80) {
    DOM.alertBanner.className = 'token-alert-banner warning';
    DOM.alertText.innerText = currentLanguage === 'en' ? `⚠️ Warning: Token usage reached ${Math.round(percentage)}% (${totalOptimizedTokens.toLocaleString()} / ${tokenLimit.toLocaleString()})!` :
                              currentLanguage === 'ja' ? `⚠️ 早期通知：トークン消費量が ${Math.round(percentage)}% に達しました (${totalOptimizedTokens.toLocaleString()} / ${tokenLimit.toLocaleString()})！` :
                              `⚠️ 提前通知：Token 消耗已達 ${Math.round(percentage)}% (${totalOptimizedTokens.toLocaleString()} / ${tokenLimit.toLocaleString()})，即將無法使用！`;
    DOM.alertBanner.style.display = 'flex';
    triggerDesktopNotification(
      currentLanguage === 'en' ? '⚠️ AI Agent Office: Token Warning' :
      currentLanguage === 'ja' ? '⚠️ AI Agent Office: トークン警告' :
      '⚠️ AI Agent Office: Token Warning',
      currentLanguage === 'en' ? `Token usage reached ${Math.round(percentage)}% (${totalOptimizedTokens.toLocaleString()} / ${tokenLimit.toLocaleString()})!` :
      currentLanguage === 'ja' ? `トークン消費量が ${Math.round(percentage)}% に達しました (${totalOptimizedTokens.toLocaleString()} / ${tokenLimit.toLocaleString()})！` :
      `Token 消耗已達 ${Math.round(percentage)}% (${totalOptimizedTokens.toLocaleString()} / ${tokenLimit.toLocaleString()})，請注意優化！`
    );
    if (lastTokenAlertLogged !== 'warning') {
      lastTokenAlertLogged = 'warning';
    }
  } else {
    DOM.alertBanner.style.display = 'none';
    lastTokenAlertLogged = null;
  }
}

function triggerDesktopNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const now = Date.now();
    if (notificationThrottles[title] && (now - notificationThrottles[title]) < 15000) return;
    notificationThrottles[title] = now;
    try {
      new Notification(title, { body: body });
    } catch (e) {
      console.error('Desktop Notification error:', e);
    }
  }
}

function setupNotificationButton() {
  if (!DOM.notifyBtn || !DOM.notifyBtnText) return;
  
  const updateBtnUI = () => {
    if (!('Notification' in window)) {
      DOM.notifyBtnText.innerText = currentLanguage === 'en' ? '❌ Notifications Not Supported' :
                                    currentLanguage === 'ja' ? '❌ 通知はサポートされていません' :
                                    '❌ 不支援桌面通知';
      DOM.notifyBtn.disabled = true;
      return;
    }
    if (Notification.permission === 'granted') {
      DOM.notifyBtnText.innerText = currentLanguage === 'en' ? '🟢 Desktop Notifications Enabled' :
                                    currentLanguage === 'ja' ? '🟢 デスクトップ通知が有効' :
                                    '🟢 已啟用桌面通知';
      DOM.notifyBtn.style.borderColor = 'rgba(0, 255, 133, 0.4)';
      DOM.notifyBtn.style.color = 'var(--neon-emerald)';
    } else if (Notification.permission === 'denied') {
      DOM.notifyBtnText.innerText = currentLanguage === 'en' ? '🔴 Notifications Blocked' :
                                    currentLanguage === 'ja' ? '🔴 通知がブロックされています' :
                                    '🔴 桌面通知已被拒絕';
      DOM.notifyBtn.style.borderColor = 'rgba(255, 0, 122, 0.4)';
      DOM.notifyBtn.style.color = 'var(--neon-rose)';
    } else {
      DOM.notifyBtnText.innerText = TRANSLATIONS[currentLanguage]['notify-btn-text'] || '🔔 啟用瀏覽器桌面通知';
      DOM.notifyBtn.style.borderColor = 'var(--border-color)';
      DOM.notifyBtn.style.color = 'var(--text-primary)';
    }
  };
  
  updateBtnUI();
  
  // Re-bind to ensure click works after UI repaint
  DOM.notifyBtn.replaceWith(DOM.notifyBtn.cloneNode(true));
  DOM.notifyBtn = document.getElementById('notify-btn');
  DOM.notifyBtnText = document.getElementById('notify-btn-text');
  
  DOM.notifyBtn.addEventListener('click', () => {
    if (!('Notification' in window)) return;
    Notification.requestPermission().then(permission => {
      updateBtnUI();
      if (permission === 'granted') {
        const title = currentLanguage === 'en' ? 'Subscribed Successfully' :
                      currentLanguage === 'ja' ? '購読完了' : '訂閱成功';
        const body = currentLanguage === 'en' ? 'You will be notified when tokens are close to the limit!' :
                     currentLanguage === 'ja' ? 'トークン制限に近づくと通知されます！' : '當 Token 接近上限時，您將會收到通知！';
        new Notification(title, { body: body });
      }
    });
  });
}

function getStrategyName(strategy) {
  const tKey = 'opt-' + strategy;
  return TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][tKey] || strategy;
}

function connectStream(strategy = 'none') {
  updateConnectionStatus('connecting');
  currentStrategy = strategy;

  if (eventSource) eventSource.close();
  const isLocalFile = window.location.protocol === 'file:';
  const baseUrl = isLocalFile ? 'http://localhost:3000' : '';
  eventSource = new EventSource(`${baseUrl}/stream?strategy=${strategy}`);

  eventSource.onopen = () => {
    console.log('SSE connection successfully opened! Strategy:', strategy);
    updateConnectionStatus('connected');
    
    DOM.chatContainer.innerHTML = '';
    kanbanTasks = [];
    processedStepIndices.clear();
    allReceivedSteps = [];
    
    Object.keys(stats).forEach(k => {
      stats[k].calls = 0;
      stats[k].tokens = 0;
      if (DOM.agents[k]) {
        DOM.agents[k].calls.innerText = 0;
        DOM.agents[k].tokens.innerText = 0;
      }
    });
    
    updateTokenSavingsDashboard();
    
    const connectMsg = currentLanguage === 'en' ? `Connected to Agent Office! Current Token Strategy: ${getStrategyName(strategy)}. Filtering and syncing logs...` :
                       currentLanguage === 'ja' ? `エージェントオフィスに接続しました！現在のトークン戦略：${getStrategyName(strategy)}。ログを同期中...` :
                       `已連結代理辦公室！當前Token策略：${getStrategyName(strategy)}。正在過濾並同步歷史紀錄...`;
    appendChat('System', 'received', connectMsg, 'user');
  };

  eventSource.onerror = (err) => {
    console.error('SSE Connection failed:', err);
    updateConnectionStatus('disconnected');
  };

  eventSource.onmessage = (event) => {
    try {
      const step = JSON.parse(event.data);
      const stepId = step.step_index;
      if (stepId !== undefined && processedStepIndices.has(stepId)) return;
      if (stepId !== undefined) processedStepIndices.add(stepId);
      processStep(step);
    } catch (e) {
      console.error('Failed to parse SSE JSON line:', e);
    }
  };
}

const MODAL_3D_HEADS = {
  manager: `
    <polygon points="-12,-20 0,-26 12,-20 0,-14" fill="#c084fc" />
    <polygon points="-12,-20 0,-14 0,0 -12,-6" fill="#a78bfa" />
    <polygon points="0,-14 12,-20 12,-6 0,0" fill="#7c3aed" />
    <path d="M -12,-12 Q 0,-30 12,-12" fill="none" stroke="#1e293b" stroke-width="4" />
    <circle cx="-12" cy="-10" r="4.5" fill="#10b981" />
    <circle cx="12" cy="-10" r="4.5" fill="#10b981" />
    <rect x="-8" y="-10" width="2.4" height="4" fill="#000000" />
    <rect x="-2" y="-9" width="2.4" height="4" fill="#000000" />
  `,
  researcher: `
    <polygon points="-12,-20 0,-26 12,-20 0,-14" fill="#fed7aa" />
    <polygon points="-12,-20 0,-14 0,0 -12,-6" fill="#ffedd5" />
    <polygon points="0,-14 12,-20 12,-6 0,0" fill="#f97316" />
    <polygon points="-20,-18 -4,-24 16,-18 0,-12" fill="#7c2d12" />
    <polygon points="-10,-24 0,-28 10,-24 0,-20" fill="#9a3412" />
    <polygon points="-10,-24 0,-20 0,-28 -10,-32" fill="#7c2d12" />
    <polygon points="0,-20 10,-24 10,-32 0,-28" fill="#431407" />
    <rect x="-8" y="-10" width="2.4" height="4" fill="#000000" />
    <rect x="-2" y="-9" width="2.4" height="4" fill="#000000" />
  `,
  developer: `
    <polygon points="-12,-20 0,-26 12,-20 0,-14" fill="#a7f3d0" />
    <polygon points="-12,-20 0,-14 0,0 -12,-6" fill="#f0fdf4" />
    <polygon points="0,-14 12,-20 12,-6 0,0" fill="#10b981" />
    <rect x="-10" y="-12" width="8" height="6" fill="none" stroke="#1e293b" stroke-width="2.5" />
    <rect x="-2" y="-11" width="8" height="6" fill="none" stroke="#1e293b" stroke-width="2.5" />
    <line x1="-10" y1="-9" x2="6" y2="-9" stroke="#1e293b" stroke-width="1.6" />
    <rect x="-8" y="-10" width="2" height="2" fill="#000000" />
    <rect x="0" y="-9" width="2" height="2" fill="#000000" />
  `,
  qa: `
    <polygon points="-12,-20 0,-26 12,-20 0,-14" fill="#fce7f3" />
    <polygon points="-12,-20 0,-14 0,0 -12,-6" fill="#fff1f2" />
    <polygon points="0,-14 12,-20 12,-6 0,0" fill="#ec4899" />
    <rect x="-8" y="-10" width="2.4" height="4" fill="#000000" />
    <rect x="-2" y="-9" width="2.4" height="4" fill="#000000" />
  `
};

function openAgentModal(agentKey) {
  const agent = AGENTS[agentKey];
  if (!agent) return;

  const modalAvatarG = document.getElementById('modal-avatar-3d-g');
  if (modalAvatarG) {
    modalAvatarG.innerHTML = MODAL_3D_HEADS[agentKey] || '';
  }
  
  const container = document.getElementById('modal-avatar-container');
  if (container) {
    container.style.borderColor = agent.color;
    container.style.boxShadow = `0 0 10px ${agent.color}40`;
  }

  document.getElementById('modal-name').innerText = agent.name;
  document.getElementById('modal-role').innerText = agent.role;
  document.getElementById('modal-prompt').innerText = agent.prompt;

  const toolsEl = document.getElementById('modal-tools');
  toolsEl.innerHTML = '';
  agent.tools.forEach(tool => {
    const badge = document.createElement('span');
    badge.className = 'card-assignee';
    badge.innerText = tool;
    badge.style.borderColor = `${agent.color}40`;
    badge.style.color = agent.color;
    toolsEl.appendChild(badge);
  });

  DOM.detailsOverlay.classList.add('active');
}

function setupEvents() {
  document.querySelectorAll('.agent-card').forEach(card => {
    card.addEventListener('click', () => {
      openAgentModal(card.getAttribute('data-agent'));
    });
  });

  document.querySelectorAll('.graph-node, .office-char').forEach(node => {
    node.addEventListener('click', () => {
      const agentKey = node.id.replace('node-', '').replace('char-', '');
      if (AGENTS[agentKey]) openAgentModal(agentKey);
    });
  });

  DOM.modalClose.addEventListener('click', () => {
    DOM.detailsOverlay.classList.remove('active');
  });

  DOM.detailsOverlay.addEventListener('click', (e) => {
    if (e.target === DOM.detailsOverlay) {
      DOM.detailsOverlay.classList.remove('active');
    }
  });

  DOM.connBadge.addEventListener('click', () => connectStream(currentStrategy));

  if (DOM.strategySelect) {
    DOM.strategySelect.addEventListener('change', (e) => connectStream(e.target.value));
  }

  if (DOM.limitSelect) {
    DOM.limitSelect.addEventListener('change', () => {
      recalculateAgentStats();
      updateTokenSavingsDashboard();
    });
  }

  if (DOM.alertCloseBtn) {
    DOM.alertCloseBtn.addEventListener('click', () => {
      if (DOM.alertBanner) DOM.alertBanner.style.display = 'none';
    });
  }

  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      applyLanguage(e.target.value);
    });
  }

  setupNotificationButton();
}

window.addEventListener('DOMContentLoaded', () => {
  setupEvents();
  
  // Load saved language or default to 'zh'
  const savedLang = localStorage.getItem('agent_office_lang') || 'zh';
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.value = savedLang;
  }
  applyLanguage(savedLang);

  connectStream('none');
  initWandering();
});

// Note: Transitioned to cute 16-bit retro pixel chibi avatars for character designs to reduce visual overload in the office simulator.
