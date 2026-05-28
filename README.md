# AI Agent Office ── 3D 體素辦公模擬器與 Token 監控面板 🎮🤖

[繁體中文 (Traditional Chinese)](#-繁體中文) | [English](#-english) | [日本語 (Japanese)](#-日本語)

---

## 🇹🇼 繁體中文

一個為 **Antigravity-cli (Gemini AI Agent)** 設計的專案視覺化監控面板。本專案以 **3D 體素（Voxel）復古風格** 呈現辦公室代理人的即時動態，並整合了對話日誌的 **SSE (Server-Sent Events) 即時串流**、**Token 消耗監控與警報**，以及多種 **Token 脈絡優化策略模擬**。

### 🎨 專案特色
* **體素復古視覺風格 (Voxel Aesthetic)**：以精緻的 SVG 體素圖示呈現四個核心 AI 代理人：**Antigravity (Manager)**、**Developer (開發者)**、**QA (測試者)** 與 **Researcher (研究員)**。代理人會根據其目前的真實任務動態（如 Thinking、Working、Researching、Idle）變換表情、動作與燈號。
* **即時事件串流 (SSE)**：後端會動態掃描您本機的對話軌跡（`transcript.jsonl`），並透過 `/stream` 端點實時推送到前端。
* **多國語言切換 (I18n)**：提供繁體中文、英文與日文的即時 UI 切換按鈕。
* **Token 消耗警報**：自動累計當前對話所消耗的 Tokens，並在接近設定的上限時（如 100K、500K、1M 或 2M）發出警報橫幅與桌面通知。
* **優化策略模擬**：可切換原始歷史 (none)、滑動窗口 (window)、工具輸出裁減 (prune)、記憶摘要化 (summarize)、脈絡快取 (cache) 等多種 Token 優化模式。

### 🚀 快速開始使用
1. **啟動後端伺服器**：
   * **Windows**: 在本目錄執行 PowerShell 命令：
     ```powershell
     .\start_service.ps1
     ```
   * **macOS / Linux**: 直接執行 Node.js 命令：
     ```bash
     node server.js
     ```
2. **打開網頁**：在瀏覽器中開啟 **[http://localhost:3000](http://localhost:3000)**。
3. **切換語言**：使用控制列的「語言 / Lang」下拉式選單在中文、英文與日文之間無縫切換。

---

## 🇺🇸 English

An interactive, 3D voxel-style dashboard designed to visualize your AI Agent's real-time activities, monitor token consumption, and simulate token optimization strategies by tailing active conversation logs via Server-Sent Events (SSE).

### 🎨 Key Features
* **3D Voxel Aesthetic**: Features cute SVG isometric voxel agents representing **Antigravity (Manager)**, **Developer (Coder)**, **QA (Tester)**, and **Researcher (Searcher)**. Agents animate in real-time based on their active task states.
* **Real-time SSE Logs Stream**: The lightweight Node.js server automatically tails your local active agent session transcript (`transcript.jsonl`) and streams it to the web UI.
* **Language Selector (I18n)**: Seamlessly toggle the entire dashboard interface between Traditional Chinese, English, and Japanese at any time.
* **Token Alert & Monitor**: Tracks accumulated session token usage and issues warnings (via UI banner and desktop notifications) when approaching the custom threshold (100K, 500K, 1M, or 2M).
* **Optimization Strategy Simulator**: Toggle between different token saving modes: Full History, Sliding Window, Tool Output Pruning, Memory Summarization, and Context Caching.

### 🚀 How to Run
1. **Start the Server**:
   * **Windows**: Open PowerShell in the project directory and run:
     ```powershell
     .\start_service.ps1
     ```
   * **macOS / Linux**: Run the Node command directly:
     ```bash
     node server.js
     ```
2. **Open the Dashboard**: Visit **[http://localhost:3000](http://localhost:3000)** in your default browser.
3. **Switch Language**: Use the "Language / Lang" select box in the header controls to toggle between English, Chinese, and Japanese.

---

## 🇯🇵 日本語

**Antigravity-cli (Gemini AI Agent)** 専用のビジュアル監視パネルです。**3D ボクセル（Voxel）風**のレトロなグラフィックでエージェントたちのリアルタイムのアクティビティを再現し、対話ログの **SSE (Server-Sent Events) ストリーム**、**Token 消費警告**、各種 **Token 最適化戦略シミュレーター** を搭載しています。

### 🎨 主な機能
* **ボクセル・レトロビジュアル**：SVGで描かれたかわいいキャラクター **Antigravity (Manager)**、**Developer (開発)**、**QA (テスト)**、**Researcher (調査)** が登場。状況（Thinking、Coding、Research、Idle）に合わせてリアルタイムで表情や動きがアニメーション変化します。
* **SSE リアルタイムストリーミング**：バックエンドがローカルの対話ログ（`transcript.jsonl`）を自動検知し、ブラウザへプッシュ配信します。
* **多言語対応 (I18n)**：コントロールバー of 選択ボックスから、日本語、英語、繁体字中国語をいつでも切り替え可能です。
* **トークンアラート機能**：セッション全体の消費トークンを算出し、設定した警告しきい値（100K、500K、1M、2M）に近づいた際にアラートバナーやデスクトップ通知で警告します。
* **最適化戦略シミュレーター**：コンテキスト削減戦略（スライディングウィンドウ、ツール出力削減、記憶の要約、コンテキストキャッシュなど）をフロントエンド上でトグルして効果を可視化できます。

### 🚀 起動方法
1. **サーバーの起動**：
   * **Windows**: プロジェクトフォルダで PowerShell を起動し、以下を実行します：
     ```powershell
     .\start_service.ps1
     ```
   * **macOS / Linux**: ターミナルで Node.js を直接実行します：
     ```bash
     node server.js
     ```
2. **ブラウザで開く**：ブラウザから **[http://localhost:3000](http://localhost:3000)** にアクセスします。
3. **言語の切り替え**：ヘッダーの「言語 / Lang」セレクトボックスから「日本語」を選択して表示を切り替えます。
