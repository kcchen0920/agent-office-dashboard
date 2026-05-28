# AI Agent Office ── Minecraft 體素辦公模擬器與 Token 監控面板 🎮🤖

一個為 **Antigravity-cli (Gemini AI Agent)** 設計的專案視覺化監控面板。本專案以 **Minecraft 體素（Voxel）復古風格** 呈現辦公室代理人的即時動態，並整合了對話日誌的 **SSE (Server-Sent Events) 即時串流**、**Token 消耗監控與警報**，以及多種 **Token 脈絡優化策略模擬**。

An interactive, Minecraft-voxel style dashboard designed to visualize your AI Agent's real-time activities, monitor token consumption, and simulate token optimization strategies by tailing active conversation logs via Server-Sent Events (SSE).

---

## 🎨 畫面預覽與特色 (Key Features)

* **体素像素視覺風格 (Minecraft-Voxel Aesthetic)**
  * 以精緻的 SVG 體素圖示（Isometric Voxels）呈現四個核心 AI 代理人：**Antigravity (Manager)**、**Developer (開發者)**、**QA (測試者)** 與 **Researcher (研究員)**。
  * 代理人會根據目前的真實任務動態（例如：Thinking、Working、Researching、Idle）變換表情、動作與燈號。

* **即時事件串流 (Real-time SSE Logs Stream)**
  * 輕量級 Node.js 後端會動態掃描您本機的 Antigravity 歷史紀錄，並透過 `/stream` 端點將最新的對話軌跡（`transcript.jsonl`）實時推送到瀏覽器前端。

* **Token 消耗警報系統 (Token Usage Tracker & Alert Banner)**
  * 自動累計當前對話所消耗的 Tokens，並在達到設定的警報閾值（如 100K、500K、1M 或 2M）時，彈出醒目的橫幅警告。

* **脈絡優化策略模擬器 (Context Optimization Strategies Simulation)**
  可隨時切換不同的 Token 優化策略，過濾歷史紀錄並模擬後端 Token 的縮減：
  1. **原始歷史 (Full History - none)**：不進行任何裁剪，保留完整日誌。
  2. **滑動窗口 (Sliding Window - window)**：僅保留最新的數筆對話。
  3. **工具輸出裁減 (Tool Pruning - prune)**：自動裁剪過長且宂餘的工具執行結果（如大量代碼或搜尋結果）。
  4. **記憶摘要化 (Summarization - summarize)**：將較早的歷史工具與對話進行高度提煉與摘要壓縮。
  5. **脈絡快取 (Context Cache - cache)**：模擬 Gemini 的 Context Caching 快取機制。

* **瀏覽器桌面通知 (Native Desktop Notifications)**
  * 支援 HTML5 Web Notification API。當偵測到 Token 超標或代理人觸發重大錯誤時，會發送作業系統層級的桌面通知。

---

## 📁 專案檔案結構 (Project Structure)

```text
agent-office-dashboard/
├── index.html          # 前端儀表板 UI (整合了美輪美奐的 Glassmorphism 玻璃擬物設計)
├── app.js              # 前端邏輯 (負責連接 SSE、解析對話軌跡、更新統計數據與動畫控制)
├── style.css           # 視覺樣式與動畫 (包含霓虹漸層、響應式 Grid 排版與 SVG 立體體素特效)
├── server.js           # 輕量 Node.js 後端 (負責追蹤 brain 資料夾日誌、SSE 傳輸與模擬優化)
├── start_service.ps1   # Windows 快速啟動 PowerShell 指令檔
├── .gitignore          # Git 忽略設定
└── README.md           # 專案說明文件 (也就是本檔案)
```

---

## 🚀 快速開始使用 (How to Run)

### 系統需求 (Prerequisites)
* 本機需安裝 **Node.js** (建議 v16 以上版本)。
* 需有正在运行中的 Antigravity-cli (或本機存在其生成的 `.gemini/antigravity-cli/brain/` 軌跡資料夾)。

### 步驟 1：啟動後端伺服器

#### 🔹 Windows 系統
您可以使用我們提供的 PowerShell 指令檔快速啟動：
1. 以系統管理員身分或一般權限開啟 PowerShell / Terminal。
2. 進入專案目錄後執行：
   ```powershell
   .\start_service.ps1
   ```
   *(如果遇到執行原則限制，可使用 `powershell -ExecutionPolicy Bypass -File start_service.ps1` 執行)*

#### 🔹 Linux / macOS 系統
直接使用 Node.js 執行伺服器：
```bash
node server.js
```

當您看到以下訊息，代表伺服器已啟動成功：
`Agent Office Server listening at http://localhost:3000/`

---

### 步驟 2：打開瀏覽器
啟動後，請在瀏覽器（Chrome / Edge / Safari）中開啟以下網址：
👉 **[http://localhost:3000](http://localhost:3000)**

---

## ⚙️ 維護與推送至 GitHub (GitHub Management)

此專案已完成 Git 初始化，且已將主分支命名為 `main` 並與您的 GitHub 完成關聯。

* **更新程式碼後提交與上傳**：
  在您對 UI 樣式或伺服器做修改後，可使用以下指令提交並上傳至 GitHub：
  ```bash
  git add .
  git commit -m "Update dashboard features"
  git push origin main
  ```

---

## 🌟 開發者與貢獻資訊 (Developer Information)
* **開發維護者 (Maintainer)**: kc.chen
* **專案網址 (GitHub Repo)**: [kcchen0920/agent-office-dashboard](https://github.com/kcchen0920/agent-office-dashboard)
* **聯絡信箱 (Email)**: `kc.chen@mic.com.tw`
