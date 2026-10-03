# B2 英語口說／聽力 PWA 製作 TODO

- 狀態：**v0.2.0** — 無 token 模式完整 + MiMo AI 對話 + 統計
- 建立時間：2026-10-02 13:41（Asia/Shanghai）
- 目標檔案：`F:\30590\SelfWork\Englist\readme.md`

## 原始需求

製作一個可以部署在 GitHub Pages 的 Service Worker PWA，協助已有 B2 基礎的使用者，在忙碌辦公時間與零碎休息時間快速提升英文口說、聽力、small talk 與 business talk。

使用者可以：

- 使用自己的 AI token。
- 讓 token 只保存在目前設備。
- 自己新增英文句子與單字。
- 在手機與電腦上各自使用。
- 透過手動匯出／匯入搬移學習資料。
- 不依賴帳號、資料庫、雲端同步或自建 WebSocket 伺服器。

## 判斷

原本的 60 分鐘完整學習流程需要改成微型高頻訓練：

- 90 秒快速練習。
- 5 分鐘 small talk。
- 15 分鐘 business talk。
- 10–15 分鐘通勤聽力。
- 每週至少兩次 15–20 分鐘完整英文對話。

產品核心不是文法考試，而是：

1. 聽懂主旨、人物、時間、數字與要求。
2. 能立即回答與追問。
3. 卡住時能要求重複、澄清或換句話說。
4. 能完成進度報告、問題說明、提案、確認與會議總結。
5. 每回合只修正最多三個最重要問題。

## 硬性範圍限制

- 前端部署：GitHub Pages。
- 離線能力：Service Worker + Cache API。
- 本機資料：IndexedDB。
- 小量介面設定：localStorage。
- API token：每台設備自行設定，預設不跨設備轉移。
- 跨設備：加密 JSON 手動匯出／匯入。
- 不製作：帳號、登入、雲端同步、雲端資料庫、後端管理台、自建 WebSocket gateway。
- AI 連線：第一版使用瀏覽器 HTTPS API 呼叫。
- 若日後 AI 供應商提供瀏覽器即時連線，再評估 WebSocket 或 WebRTC。

## 建議 source code 檔案樹

```text
englist-pwa/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ public/
│  ├─ manifest.webmanifest
│  ├─ icons/
│  └─ audio/
├─ src/
│  ├─ main.ts
│  ├─ app/
│  │  ├─ router.ts
│  │  ├─ state.ts
│  │  └─ types.ts
│  ├─ components/
│  │  ├─ BigActionButton.ts
│  │  ├─ BeginnerGuide.ts
│  │  ├─ PracticeTimer.ts
│  │  ├─ MicPermissionGuide.ts
│  │  ├─ TokenSetup.ts
│  │  ├─ PhraseEditor.ts
│  │  ├─ FeedbackCard.ts
│  │  ├─ ExportImportPanel.ts
│  │  └─ DeviceStatus.ts
│  ├─ features/
│  │  ├─ onboarding/
│  │  ├─ quick-practice/
│  │  ├─ small-talk/
│  │  ├─ business-talk/
│  │  ├─ listening/
│  │  ├─ repair-drill/
│  │  ├─ phrase-vault/
│  │  └─ progress/
│  ├─ ai/
│  │  ├─ client.ts
│  │  ├─ prompt.ts
│  │  ├─ response-schema.ts
│  │  └─ redact.ts
│  ├─ audio/
│  │  ├─ recorder.ts
│  │  ├─ speech-to-text.ts
│  │  ├─ text-to-speech.ts
│  │  └─ audio-permission.ts
│  ├─ storage/
│  │  ├─ indexeddb.ts
│  │  ├─ local-preferences.ts
│  │  ├─ token-vault.ts
│  │  ├─ export-import.ts
│  │  └─ migrations.ts
│  ├─ pwa/
│  │  ├─ register-service-worker.ts
│  │  ├─ update-notice.ts
│  │  └─ offline-queue.ts
│  ├─ security/
│  │  ├─ crypto.ts
│  │  ├─ csp-notes.md
│  │  └─ secret-redaction.ts
│  └─ styles/
│     ├─ tokens.css
│     ├─ mobile.css
│     └─ accessibility.css
├─ tests/
│  ├─ storage.test.ts
│  ├─ token-vault.test.ts
│  ├─ export-import.test.ts
│  ├─ practice-session.test.ts
│  └─ accessibility.test.ts
└─ README.md
```

## TODO 0：建立專案與部署骨架

- [x] 建立 Vite + TypeScript 前端。
- [x] 設定 GitHub Pages base path。
- [x] 建立 GitHub Actions build/deploy workflow。
- [x] 建立 `manifest.webmanifest`。
- [x] 建立手機、桌面與 PWA icon。
- [ ] 確認 HTTPS 頁面可載入。（需部署後驗證）
- [x] 加入版本號與更新提示。
- [ ] 確認 SPA 重新整理不會出現空白頁。（hash-based 路由，理論上不會）

驗收：

- [ ] 可由 GitHub Pages 開啟。（需部署後驗證）
- [ ] 可在手機與桌面加入主畫面。（需部署後驗證）
- [x] 發布新版本後可提示使用者更新。

## TODO 1：新手引導

- [x] 首次開啟顯示「每天只要 90 秒」。
- [x] 讓使用者選擇目標：日常聊天、small talk、工作英文、聽力。
- [x] 讓使用者選擇時間：90 秒、5 分鐘、15 分鐘。
- [ ] 用一般語言說明 AI token，不出現 API、endpoint、origin 等術語。（AI 功能尚未實作）
- [ ] 顯示「這台設備保存」與「每次輸入」兩種模式。（同上）
- [ ] 引導麥克風權限。（麥克風功能尚未實作）
- [x] 提供第一次 90 秒練習。
- [x] 每一步只顯示一個主要按鈕。
- [x] 所有步驟提供「稍後設定」。

驗收：

- [x] 不懂技術的使用者可在 2 分鐘內開始第一次練習。
- [x] 使用者不設定 token 也能查看示範與無 AI 練習。

## TODO 2：首頁與快速練習

首頁只保留：

- [x] 開始 90 秒。
- [x] 今天複習。
- [x] 開始對話。（AI 對話已實作，需 token）
- [x] 新增一句話。

快速練習：

- [x] 播放一句英文。
- [x] 使用者回答。（文字輸入）
- [x] AI 回答並追問。（MiMo provider 已接）
- [x] 顯示最多三個修正。
- [x] 使用者重講。
- [x] 計算完成時間、回答次數、追問次數與卡住次數。
- [x] 提供「給我提示」、「換簡單一點」、「再說一次」、「顯示中文」。

驗收：

- [x] 一次點擊後 5 秒內進入練習。
- [x] 90 秒內至少完成一輪問答與重講。
- [x] AI 不會只回覆而不追問。

## TODO 3：small talk 情境

- [ ] 第一次見面。
- [ ] 午餐聊天。
- [ ] 天氣與週末。
- [ ] 旅行。
- [ ] 興趣。
- [ ] 工作近況。
- [ ] 會議前閒聊。
- [ ] 會議後閒聊。

每個情境建立：

- [ ] 開場句。
- [ ] 回應句。
- [ ] 追問句。
- [ ] 分享個人資訊句。
- [ ] 結束話題句。
- [ ] 三個難度。
- [ ] 三個可替換變體。

驗收：

- [ ] 使用者可以連續完成 5 分鐘 small talk。
- [ ] 系統會要求使用者至少主動追問三次。

## TODO 4：business talk 情境

- [ ] 進度更新。
- [ ] 說明延遲。
- [ ] 說明問題。
- [ ] 提出方案。
- [ ] 詢問需求。
- [ ] 確認截止時間。
- [ ] 禮貌不同意。
- [ ] 會議總結。
- [ ] 分配下一步工作。
- [ ] 向主管報告風險。

每個情境包含：

- [ ] 任務說明。
- [ ] 角色設定。
- [ ] 目標資訊。
- [ ] 對方可能追問。
- [ ] 可用語塊。
- [ ] 完成標準。
- [ ] 會議結束句。

驗收：

- [ ] 使用者能完成 10 分鐘工作對話。
- [ ] 對方能理解問題、原因與下一步。
- [ ] 系統評估溝通是否成功，不以文法滿分為唯一目標。

## TODO 5：聽力與口說

- [ ] 使用 Speech Recognition 或可替換 STT provider。（後續加入）
- [x] 使用 SpeechSynthesis 或可替換 TTS provider。
- [x] 支援慢速與正常速度。
- [x] 支援先聽後看文字。
- [ ] 支援跟讀。（基本版：重播後自行跟讀）
- [ ] 支援聽完重述。（基本版：顯示原文可比較）
- [x] 支援手動輸入，讓沒有麥克風時仍可使用。
- [ ] 支援麥克風權限被拒絕的替代流程。（麥克風功能尚未實作）
- [ ] 記錄反應時間與停頓。（部分：練習計時已實作）
- [x] 不把原始錄音預設永久保存。

驗收：

- [x] 麥克風拒絕時仍可做文字練習。（純文字模式已實作）
- [x] 噪音環境下能切換文字模式。
- [x] 使用者可以聽一句、回答一句、再獲得追問。

## TODO 6：卡住修復訓練

建立固定句型：

- [ ] Could you say that again?
- [ ] Could you say it more slowly?
- [ ] Do you mean that ...?
- [ ] Let me think for a second.
- [ ] What I’m trying to say is ...
- [ ] I’m not familiar with that term.
- [ ] Could you give me an example?
- [ ] Let me make sure I understood you.

功能：

- [ ] 隨機顯示聽不懂情境。
- [ ] 使用者必須使用修復句。
- [ ] 對方重新說明。
- [ ] 計算是否成功把對話繼續下去。
- [ ] 不因文法小錯誤直接判定失敗。

## TODO 7：自訂句子與單字

- [ ] 新增英文句子。
- [ ] 新增單字。
- [ ] 新增中文備註。
- [ ] 新增情境標籤。
- [ ] 設定重要程度。
- [ ] AI 產生自然版本。
- [ ] AI 產生簡短版本。
- [ ] AI 產生正式版本。
- [ ] AI 產生口語版本。
- [ ] AI 產生三個變體。
- [ ] AI 將句子轉成 small talk 練習。
- [ ] AI 將句子轉成 business talk 練習。
- [ ] 一鍵加入複習佇列。

資料介面：

```ts
export interface PhraseCard {
  id: string;
  english: string;
  meaning?: string;
  tags: string[];
  scenario?: "daily" | "small-talk" | "business" | "repair";
  difficulty: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
  updatedAt: string;
  nextReviewAt: string;
  lastScore?: number;
  reviewCount: number;
}
```

## TODO 8：本機資料儲存

IndexedDB 儲存：

- [x] phraseCards。
- [x] practiceSessions。
- [x] reviewQueue。
- [x] userSettings。
- [ ] exportMetadata。（匯出功能尚未實作）
- [x] appMigrations。（onupgradeneeds 已處理版本遷移）

localStorage 只儲存：

- [x] UI 主題。（支援 dark mode 自動偵測）
- [x] 是否完成 onboarding。
- [x] 最後使用的練習模式。
- [x] 非敏感介面設定。

不得直接保存：

- [x] 明文 API token。
- [x] 長期登入密碼。
- [x] 未加密的敏感工作內容。
- [x] 不必要的原始錄音。

驗收：

- [x] 關閉瀏覽器後句子與進度仍可讀取。
- [ ] 清除網站資料後，應能顯示資料已不存在。（尚未實作提示）
- [x] IndexedDB 版本升級不會破壞舊資料。

## TODO 9：Token Vault

提供模式：

```ts
export type TokenMode = "memory" | "session" | "device-encrypted";
```

功能：

- [ ] 每次輸入，不保存。
- [ ] 本次分頁保存。
- [ ] 此設備加密保存。
- [ ] 顯示／隱藏 token。
- [ ] 測試 AI 連線。
- [ ] 清除 token。
- [ ] 清除所有本機資料。
- [ ] 不在 URL、console、錯誤訊息或分析紀錄輸出 token。
- [ ] 失敗時遮罩 token。
- [ ] token 預設不進入匯出檔。

加密保存流程：

1. [ ] 使用者輸入 token。
2. [ ] 使用者設定本機解鎖密碼。
3. [ ] 使用 Web Crypto 產生 salt。
4. [ ] 使用密碼衍生加密金鑰。
5. [ ] 保存 ciphertext、salt、iv。
6. [ ] 不保存解鎖密碼。
7. [ ] 啟動時要求解鎖。
8. [ ] 登出或鎖定時清除記憶體中的明文 token。

資料介面：

```ts
export interface EncryptedToken {
  version: 1;
  ciphertext: string;
  salt: string;
  iv: string;
  createdAt: string;
  lastUsedAt?: string;
}
```

## TODO 10：手動匯出／匯入

- [ ] 匯出句子、單字、標籤與進度。
- [ ] 預設排除 token。
- [ ] 提供「包含 token」明確勾選。
- [ ] 匯出前要求本機密碼。
- [ ] 產生加密 JSON。
- [ ] 匯入前顯示檔案內容摘要。
- [ ] 匯入前建立目前資料備份。
- [ ] 支援覆蓋、合併、取消。
- [ ] 發生衝突時用一般語言提示。
- [ ] 不使用帳號或雲端同步。
- [ ] 可選擇產生小量資料 QR Code，但不把長期 token 放入 QR Code。

驗收：

- [ ] 電腦匯出後可在手機匯入。
- [ ] 匯出檔沒有 token，除非使用者明確選取。
- [ ] 匯入失敗不會破壞現有資料。

## TODO 11：Service Worker PWA

- [ ] 快取 HTML、CSS、JavaScript、icon。
- [ ] 快取固定練習句與已下載音訊。
- [ ] 顯示離線狀態。
- [ ] AI 無法連線時切換無 AI 練習。
- [ ] 網路恢復後顯示重新連線。
- [ ] 新版本更新提示。
- [ ] 清除過期快取。
- [ ] 不把 token 或敏感回應放入 Cache API。
- [ ] 不快取含敏感資料的 API 回應。

驗收：

- [ ] 沒網路時能開啟 PWA。
- [ ] 沒網路時能複習句子。
- [ ] 沒網路時不能假裝 AI 已回覆。
- [ ] 重新連線後能恢復 AI 功能。

## TODO 12：AI Client

AI client 必須可替換 provider：

```ts
export interface AiClient {
  generateReply(input: PracticeInput): Promise<CoachReply>;
  generatePhraseVariants(input: PhraseInput): Promise<PhraseVariants>;
  generateListeningTask(input: ListeningInput): Promise<ListeningTask>;
}
```

AI 回覆格式：

```ts
export interface CoachReply {
  reply: string;
  nextQuestion: string;
  usefulPhrases: string[];
  corrections: string[];
  score: {
    understanding: number;
    fluency: number;
    interaction: number;
  };
  shouldContinue: boolean;
}
```

規則：

- [x] 每回合最多三個修正。
- [x] 優先修正造成誤解的錯誤。
- [x] 一定要提出下一個問題。
- [x] 不要把所有錯誤改成母語者等級。
- [x] 先保持對話，再提供修正。
- [x] 沒有 token 時顯示一般練習模式。
- [x] 網路錯誤時保留目前練習狀態。

## TODO 13：新手友善 UX

- [ ] 所有技術錯誤轉成人話。
- [ ] 每個頁面只有一個主要行動。
- [ ] 所有危險操作需要確認。
- [ ] 清除資料提供撤銷或備份提醒。
- [ ] 所有空白頁提供下一步。
- [ ] 不用顏色作為唯一狀態標示。
- [ ] 支援鍵盤、手機觸控與螢幕閱讀器。
- [ ] 按鈕文字使用動詞。
- [ ] 不顯示不必要的技術術語。
- [ ] 提供「我不知道怎麼辦」按鈕。
- [ ] 每個設定旁邊附一行解釋。

常見錯誤訊息：

- Token 無效：`AI 密鑰無法使用，請重新檢查或換一組。`
- 沒麥克風：`請允許麥克風，或改用文字練習。`
- 離線：`目前沒有網路，可以先複習已保存的句子。`
- AI 逾時：`AI 回應較慢，請按重試。`
- 儲存失敗：`瀏覽器不允許保存資料，請先匯出備份。`

## TODO 14：學習統計

只追蹤與口語實用性相關的指標：

- [x] 今日練習分鐘數。
- [ ] 連續對話最長時間。（需 AI 對話記錄）
- [ ] 主動追問次數。（需 AI 對話記錄）
- [ ] 成功使用修復句次數。（需修復句追蹤）
- [ ] 聽懂主旨比例。（需理解度評分）
- [ ] 平均回答延遲。（部分：練習計時已實作）
- [ ] 重複錯誤句。（需錯誤追蹤）
- [x] business 情境完成數。
- [x] small talk 情境完成數。

不把「錯誤數越少」作為唯一進步標準。

## TODO 15：測試

功能測試：

- [ ] IndexedDB 建立、讀取、更新、刪除。
- [ ] token 三種保存模式。
- [ ] token 清除。
- [ ] 匯出與匯入。
- [ ] 匯入錯誤復原。
- [ ] Service Worker 安裝與更新。
- [ ] 離線頁面。
- [ ] AI timeout。
- [ ] 麥克風拒絕。
- [ ] 手機窄螢幕。
- [ ] 桌面寬螢幕。

安全測試：

- [ ] repository 沒有 token。
- [ ] console 沒有 token。
- [ ] URL 沒有 token。
- [ ] 匯出檔預設沒有 token。
- [ ] Service Worker Cache 沒有 token。
- [ ] 使用 `textContent` 顯示 AI 回覆，不直接插入未消毒 HTML。
- [ ] AI 回覆與 IndexedDB 內容視為不可信輸入。

## TODO 16：部署

- [ ] 建立 GitHub Actions workflow。
- [ ] 設定 build。
- [ ] 設定 Pages deploy。
- [ ] 設定 base path。
- [ ] 確認 manifest。
- [ ] 確認 Service Worker scope。
- [ ] 確認 HTTPS。
- [ ] 確認手機安裝。
- [ ] 確認桌面安裝。
- [ ] 確認新版快取可更新。
- [ ] 發布前執行 token 搜尋，確保 repository 無秘密。

## 風險

| 風險 | 等級 | 對策 |
|---|---|---|
| token 被 XSS 讀取 | 高 | 不保存明文；CSP；避免 innerHTML；提供每次輸入模式 |
| 瀏覽器清除本機資料 | 中 | 加密 JSON 匯出／匯入 |
| AI token 被誤匯出 | 高 | 預設排除；明確勾選才包含 |
| AI 回覆不準 | 中 | 固定 JSON schema；最多三個修正；使用者可跳過 |
| 麥克風權限失敗 | 中 | 文字模式與手動輸入 |
| 網路中斷 | 中 | Service Worker 離線複習；AI 功能明確顯示不可用 |
| 不同設備資料不同步 | 中 | 明確標示本機資料；提供手動匯出／匯入 |
| 儲存空間被清除 | 中 | 啟用時嘗試 `navigator.storage.persist()`；不保證成功；提供備份 |
| 錯誤訊息太技術化 | 中 | 建立錯誤對照表與新手引導 |

## 驗收標準

- [ ] 不懂技術的使用者可在 2 分鐘內開始第一次練習。
- [ ] 90 秒模式可以完成問答、追問與重講。
- [ ] 使用者可自行新增句子，並立即轉成練習。
- [ ] 可在手機與電腦分別使用。
- [ ] 可用加密檔案手動搬移句子與進度。
- [ ] token 預設不跨設備、不進匯出檔。
- [ ] GitHub Pages 可直接部署。
- [ ] PWA 可安裝。
- [ ] 沒網路時仍能複習。
- [ ] 沒有自建 WebSocket 伺服器。
- [ ] 沒有帳號、資料庫或雲端同步。
- [ ] 每次 AI 回饋最多三個修正。
- [ ] 連續四週使用後，能完成至少 10 分鐘英文工作對話。

## 未解問題

- [x] 第一版 AI provider 要支援哪一個？ → **MiMo（小米）**，OpenAI API 相容，CORS 已確認可直連。見 `docs/mimo-contract.md`。
- [ ] 第一版是否使用瀏覽器原生 Speech Recognition，或直接接 AI STT？ → 第一版先用文字輸入，Speech Recognition 後續加入。
- [x] 是否需要保存短期音訊，還是只保存文字轉錄？ → **不保存原始錄音**，只保存文字。
- [x] 使用者是否接受每台設備各自輸入 token？ → **是**，每台設備自行設定，預設不跨設備轉移。
- [ ] 是否需要把匯出檔再加一層使用者密碼？ → 第一版先做明文 JSON 匯出，加密是 P1。
- [ ] GitHub Pages repository 名稱與 production URL 是什麼？ → 暫用 `englist-pwa`，部署前確認。
- [x] 第一版要使用純 TypeScript，還是 React／Vue？ → **純 TypeScript + DOM**，零框架依賴。

## 建議開發順序

1. [x] PWA 骨架與 GitHub Pages 部署。
2. [x] IndexedDB 與句子資料模型。
3. [x] 首頁與 90 秒快速練習。
4. [x] 自訂句子與複習佇列。
5. [x] small talk 與 business talk 情境。（內建3個 TopicPack）
6. [x] AI client 與固定 JSON schema。（MiMo provider + CoachReply JSON）
7. [x] token vault。（sessionStorage 記憶體模式）
8. [x] 語音輸入、播放與權限引導。（播放已實作，語音輸入待加入）
9. [x] Service Worker 離線能力。（vite-plugin-pwa 自動生成）
10. [ ] 加密匯出／匯入。（明文 JSON 匯出已實作）
11. [ ] 錯誤處理、無障礙與安全測試。
12. [x] GitHub Pages production 部署。

## 證據與來源

以下資料由 open-websearch MCP 於 2026-10-02 UTC 擷取：

1. GitHub Pages 是從 repository 發布 HTML、CSS、JavaScript 的靜態網站託管服務：  
   https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
2. PWA 可以安裝到設備，並使用 Service Worker、Cache API 與離線功能：  
   https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
3. IndexedDB 適合保存大量結構化本機資料，但受同源政策與瀏覽器儲存限制影響：  
   https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
4. localStorage 會跨瀏覽器工作階段保存，但只屬於該網站 origin：  
   https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
5. `StorageManager.persist()` 只是向瀏覽器請求持久保存，瀏覽器不一定同意：  
   https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
6. OWASP 不建議把敏感資訊或 session token 直接放在 localStorage；XSS 可以讀取：  
   https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html
7. Cambridge 將 B2 First 定位為能在英語環境中生活、工作或學習的溝通能力：  
   https://www.cambridgeenglish.org/exams-and-tests/qualifications/first/
8. EF SET 說明 CEFR 使用 can-do statements 描述語言能力：  
   https://www.efset.org/cefr/
9. CEFR 活動與領域的次級整理：  
   https://en.wikipedia.org/wiki/Common_European_Framework_of_Reference_for_Languages

## 研究限制

- Council of Europe 官方頁面在本次擷取回傳 403。
- British Council 頁面在本次擷取逾時或無可讀內容。
- OpenAI API key safety 頁面在本次擷取無可讀內容。
- 因此 token 安全部分採 OWASP、MDN 與架構判斷，不把未成功擷取的頁面當成證據。
- 本文件是製作 TODO 與技術設計，不代表已完成任何 source code。


---

# 補充 TODO：無 token 優先、語音控制、推薦句庫與快取

本補充是對前一版 TODO 的細化。設計原則是：**沒有 AI token 時仍然可以完成聽力、播放、跟讀、錄音、複習與固定情境練習；有 token 時才增加生成、評語與個人化。**

## A. 功能能力矩陣

| 功能 | 沒有 token | 有 token | 本機資料 |
|---|---|---|---|
| 播放英文 | SpeechSynthesis | AI 產生內容後再播放 | voice、rate、pitch、volume |
| 選擇語音 | SpeechSynthesis.getVoices() | 同左 | voice name、lang |
| 慢速／加速 | SpeechSynthesisUtterance.rate | 同左 | playbackRate |
| 大小聲 | utterance.volume、AudioContext GainNode | 同左 | volume |
| 聽力跟讀 | 固定句庫 + TTS | AI 產生句子 + TTS | 完成次數 |
| 麥克風錄音 | MediaRecorder | 同左 | 預設不保存原始音檔 |
| 語音轉文字 | Web Speech Recognition（瀏覽器支援時） | AI STT provider | transcript |
| small talk | 預置情境與句型模板 | AI 動態追問 | scenario progress |
| business talk | 預置任務卡與模板 | AI 角色扮演與修正 | task result |
| 新增句子 | 手動輸入與模板變體 | AI 產生變體 | phraseCards |
| 推薦內容 | 內建主題與複習演算法 | AI 推薦與改寫 | recommendation cache |
| 評分 | 自我評分、時間、完成率 | AI 語意與互動評分 | session score |
| 離線使用 | 可以 | 不可以生成新內容 | Cache + IndexedDB |

## B. SpeechSynthesis 語音播放模組

### B1. 初始化與語音清單

- [ ] 建立 `SpeechEngine` 介面。
- [ ] 使用 `window.speechSynthesis`。
- [ ] 使用 `speechSynthesis.getVoices()` 取得設備可用語音。
- [ ] 監聽 `voiceschanged`，因為部分瀏覽器不會在頁面初次載入時立即提供語音。
- [ ] 保存 `voice.name`、`voice.lang`、`voice.default`。
- [ ] 顯示「美式」、「英式」、「澳洲」等語言標籤；不自行判斷聲音性別。
- [ ] 顯示「設備未提供此語音」的替代提示。
- [ ] 依 `en-US`、`en-GB`、`en-AU` 分組。
- [ ] 提供「測試這個聲音」按鈕。
- [ ] 提供預設語音設定。

### B2. 播放控制

```ts
export interface VoiceSettings {
  voiceName?: string;
  lang: string;
  rate: number;       // 建議 0.6 - 1.4
  pitch: number;      // 建議 0.8 - 1.2
  volume: number;     // 0 - 1
  sentencePauseMs: number;
  repeatCount: number;
}
```

- [ ] 播放。
- [ ] 暫停。
- [ ] 繼續。
- [ ] 停止。
- [ ] 重播目前句子。
- [ ] 重播目前單字。
- [ ] 播放整組句子。
- [ ] 只播放英文，不播放中文。
- [ ] 英文後播放中文。
- [ ] 中文後播放英文。
- [ ] A/B 速度切換。
- [ ] 0.6x、0.8x、1.0x、1.2x、1.4x 快速按鈕。
- [ ] 音量滑桿。
- [ ] 語調滑桿。
- [ ] 句子間停頓滑桿。
- [ ] 重播次數 1、2、3 次。
- [ ] 播放佇列可取消。
- [ ] 新句子播放前清除舊佇列，避免連續誤播。
- [ ] 使用 `start`、`boundary`、`end`、`error` 事件更新介面。
- [ ] 若瀏覽器不提供 boundary 事件，關閉逐字高亮而不是報錯。

### B3. 逐字高亮

- [ ] 將句子拆成 token。
- [ ] 使用 `boundary` event 推估目前朗讀位置。
- [ ] 目前單字加底色。
- [ ] 點擊單字可重播該單字。
- [ ] 點擊句子可從該句重新播放。
- [ ] 沒有 boundary 支援時改為句子級高亮。
- [ ] 高亮不能依賴精確字數，避免不同語音造成錯位。

### B4. SpeechSynthesis 限制處理

- [ ] 某些行動瀏覽器需要使用者點擊後才能播放。
- [ ] 播放前顯示「按一下開始聲音」。
- [ ] 音訊被瀏覽器阻擋時顯示解法。
- [ ] `getVoices()` 回傳空陣列時等待 `voiceschanged`。
- [ ] Safari、Chrome、Firefox 分別測試語音名稱與語言。
- [ ] 不假設每台設備都有相同的聲音。
- [ ] 使用者更換設備後重新選擇語音。

## C. Web Audio API 聲音處理模組

Web Audio API 用於本機播放與錄音監控；它不是必要的 AI 服務。

### C1. 播放處理

- [ ] 建立 `AudioContext`。
- [ ] 在使用者互動後啟動或 resume AudioContext。
- [ ] 建立 master GainNode。
- [ ] 提供總音量控制。
- [ ] 提供靜音。
- [ ] 提供左／右聲道平衡（設備支援時）。
- [ ] 提供耳機模式。
- [ ] 提供低音量辦公室模式。
- [ ] 提供音量過大警告。
- [ ] 對錄音或下載音檔使用 AnalyserNode 顯示波形。
- [ ] 不假設 SpeechSynthesis 的聲音一定能被 AudioContext 捕捉；無法捕捉時仍保留基本音量控制。

### C2. 音訊視覺化

- [ ] 即時音量電平。
- [ ] 錄音前 3 秒測試。
- [ ] 顯示「太安靜」、「正常」、「太大聲」。
- [ ] 顯示麥克風是否有輸入。
- [ ] 錄音時顯示簡單波形。
- [ ] 不保存波形資料，只在畫面即時顯示。
- [ ] 沒有麥克風時隱藏波形而保留文字模式。

## D. MediaDevices 與 MediaRecorder 模組

### D1. 麥克風權限

- [ ] 只有使用者按下「開始錄音」時才要求權限。
- [ ] 顯示為什麼需要麥克風。
- [ ] 提供允許、稍後、改用文字三個選項。
- [ ] 捕捉 `NotAllowedError`。
- [ ] 捕捉 `NotFoundError`。
- [ ] 捕捉 `NotReadableError`。
- [ ] 捕捉裝置被其他程式佔用。
- [ ] 提供重新測試按鈕。
- [ ] 顯示目前使用的麥克風名稱（若瀏覽器允許）。
- [ ] 不把設備名稱送給 AI。

### D2. 錄音策略

- [ ] 使用 `MediaRecorder` 錄製短片段。
- [ ] 預設每段最多 30 秒。
- [ ] 超過時間自動停止並提示。
- [ ] 錄音完成後可播放。
- [ ] 錄音完成後可刪除。
- [ ] 預設不保存原始錄音。
- [ ] 若使用者選擇保存，標記保存期限。
- [ ] 提供「只保留轉錄，不保留音檔」。
- [ ] 支援瀏覽器不支援 MediaRecorder 時的文字替代。
- [ ] 確認 MIME type，如 `audio/webm`、`audio/mp4`。
- [ ] 不把音檔放入 Service Worker Cache。

## E. 無 token 語音轉文字

### E1. Web Speech Recognition

- [ ] 建立 provider detection。
- [ ] 檢查 `SpeechRecognition` 或 `webkitSpeechRecognition`。
- [ ] 設定 `lang = en-US`。
- [ ] 支援 interim transcript。
- [ ] 支援 final transcript。
- [ ] 顯示「正在聽」狀態。
- [ ] 顯示「停止」按鈕。
- [ ] 只將 final transcript 用於評估。
- [ ] interim transcript 不寫入永久資料。
- [ ] 不支援時顯示「請自行比較錄音與標準句」。
- [ ] 不把瀏覽器支援差異誤報成使用者錯誤。

### E2. 無 token 評分

- [ ] 計算說話秒數。
- [ ] 計算文字數。
- [ ] 計算每分鐘字數。
- [ ] 計算停頓次數。
- [ ] 計算 filler words，如 `um`、`uh`、`you know`。
- [ ] 比對是否包含任務必要關鍵字。
- [ ] 允許使用者自評：簡單、普通、困難。
- [ ] 不宣稱瀏覽器本機評分等同 AI 語意評估。

## F. 固定內容庫：沒有 token 也能練

### F1. 預置主題分類

- [ ] Introductions。
- [ ] Daily routine。
- [ ] Weekend。
- [ ] Weather。
- [ ] Food。
- [ ] Travel。
- [ ] Hobbies。
- [ ] Current project。
- [ ] Progress update。
- [ ] Delay explanation。
- [ ] Asking for clarification。
- [ ] Giving an opinion。
- [ ] Agreeing。
- [ ] Disagreeing politely。
- [ ] Meeting summary。
- [ ] Next steps。
- [ ] Emergency repair phrases。

### F2. 每個主題的固定資料

```ts
export interface TopicPack {
  id: string;
  title: string;
  level: "b1" | "b2" | "c1";
  category: "small-talk" | "business" | "repair" | "listening";
  goals: string[];
  starterPhrases: PhraseCard[];
  questionTemplates: string[];
  answerTemplates: string[];
  followUpTemplates: string[];
  closingTemplates: string[];
  audioTextIds: string[];
}
```

- [ ] 每個主題至少 20 句。
- [ ] 每句提供中文意思。
- [ ] 每句提供可替換欄位。
- [ ] 每句提供短版與自然版。
- [ ] 每句附使用場合。
- [ ] 每句附常見錯誤。
- [ ] 每句附可播放文字。
- [ ] 每個主題可完全離線使用。
- [ ] 內建內容隨版本更新，但不覆蓋使用者自訂內容。

### F3. 無 token 對話模板

```ts
export interface DialogueTemplate {
  id: string;
  topicId: string;
  turns: Array<{
    speaker: "coach" | "learner";
    text: string;
    expectedKeywords?: string[];
    alternatives?: string[];
  }>;
}
```

- [ ] Coach 先播放問題。
- [ ] 使用者回答。
- [ ] 使用者選擇「我完成了」。
- [ ] 系統顯示示範答案。
- [ ] 使用者重講。
- [ ] 下一題從固定佇列選取。
- [ ] 以關鍵字與完成步驟做本機檢查。
- [ ] 不把模板練習假裝成自由 AI 對話。

## G. 新增一句話：推薦、生成、批准、快取

### G1. 新增流程

使用者按「新增一句話」後依序顯示：

1. [ ] 選擇主題。
2. [ ] 選擇使用場合。
3. [ ] 選擇難度。
4. [ ] 輸入自己的句子或單字。
5. [ ] 選擇是否需要 AI 建議。
6. [ ] 預覽結果。
7. [ ] 使用者勾選要保存的版本。
8. [ ] 選擇加入哪個複習佇列。
9. [ ] 立即播放與跟讀。

主題選項：

- [ ] 自我介紹。
- [ ] 目前工作。
- [ ] 專案進度。
- [ ] 會議。
- [ ] 問問題。
- [ ] 解釋問題。
- [ ] 表達意見。
- [ ] small talk。
- [ ] 旅行。
- [ ] 興趣。
- [ ] 職場禮貌。
- [ ] 聽不懂時的修復。

### G2. 沒有 token 時的推薦

- [ ] 從內建 TopicPack 選出相關句子。
- [ ] 使用模板替換使用者輸入的名詞。
- [ ] 顯示 3 個固定變體。
- [ ] 使用者可修改變體。
- [ ] 以語音播放修改後句子。
- [ ] 保存到本機推薦快取。
- [ ] 不顯示「AI 正在生成」。

### G3. 有 token 時的推薦

AI 輸入：

```json
{
  "topic": "project-status",
  "situation": "weekly meeting",
  "userSentence": "這個功能晚兩天",
  "register": "professional",
  "targetLevel": "B2"
}
```

AI 必須回傳：

```json
{
  "natural": "This feature is running two days behind schedule.",
  "simple": "This feature will be two days late.",
  "polite": "It looks like this feature may be delayed by two days.",
  "spoken": "We’re about two days behind on this feature.",
  "alternatives": [
    "We need two more days to complete it.",
    "The delay is caused by an integration issue."
  ],
  "followUpQuestion": "Would you like me to explain the cause of the delay?",
  "tags": ["business", "status-update", "delay"],
  "warnings": []
}
```

- [ ] AI 結果先顯示預覽，不直接寫入。
- [ ] 使用者選取要保存的版本。
- [ ] 使用者可以編輯 AI 結果。
- [ ] AI 結果一定附語音播放按鈕。
- [ ] AI 結果一定附「加入複習」按鈕。
- [ ] 遇到不自然結果可按「換一版」。
- [ ] 不重複生成相同請求。

### G4. 推薦快取

```ts
export interface RecommendationCache {
  cacheKey: string;
  inputHash: string;
  provider?: string;
  model?: string;
  result: PhraseVariants;
  createdAt: string;
  expiresAt?: string;
  approved: boolean;
}
```

- [ ] 以輸入句子、主題、場合、難度建立 hash。
- [ ] 相同輸入先查 IndexedDB。
- [ ] 命中快取時不呼叫 AI。
- [ ] 顯示「這是你之前保存的建議」。
- [ ] 使用者可重新生成。
- [ ] 使用者可刪除單筆快取。
- [ ] 使用者可清除全部 AI 建議快取。
- [ ] 快取不包含 API token。
- [ ] AI 回覆若格式錯誤不得進入快取。
- [ ] 快取超過上限時依最後使用時間清理。
- [ ] 固定內建 TopicPack 不依賴 AI 快取。

## H. 推薦引擎

### H1. 不用 token 的推薦排序

- [ ] 未練習過的主題優先。
- [ ] 近期錯誤多的句子優先。
- [ ] 到期複習的句子優先。
- [ ] 使用者最近工作標籤優先。
- [ ] small talk 與 business talk 交替。
- [ ] 避免連續推薦相同句型。
- [ ] 每次推薦 3 個選項，不顯示過長清單。
- [ ] 提供「換三句」。
- [ ] 提供「今天只練最重要的一句」。

### H2. 有 token 的推薦排序

- [ ] 使用者輸入今日工作關鍵字。
- [ ] AI 建議 5 句可直接使用的英文。
- [ ] 先顯示短版。
- [ ] 再顯示自然版與正式版。
- [ ] 使用者批准後才保存。
- [ ] 對敏感公司資料先提示不要貼入。
- [ ] 對輸入內容做本機遮罩提示。
- [ ] 不把工作內容寫入公共固定句庫。

## I. 複習排程細節

- [ ] 新句子立即安排第一次複習。
- [ ] 第一次：10 分鐘後。
- [ ] 第二次：隔天。
- [ ] 第三次：3 天後。
- [ ] 第四次：7 天後。
- [ ] 第五次：14 天後。
- [ ] 使用者答錯時縮短間隔。
- [ ] 使用者答對且反應快時延長間隔。
- [ ] 使用者只看提示時不算完全答對。
- [ ] 只聽懂但講不出來時分開記錄。
- [ ] 只會念出來但不懂意思時分開記錄。
- [ ] 支援「今天不要再出現」。
- [ ] 支援「這句太難，拆成兩句」。

## J. 本機快取分類

```text
Cache API：
  app-shell-v1
  static-audio-v1
  topic-packs-v1

IndexedDB：
  phraseCards
  userEdits
  recommendationCache
  reviewQueue
  practiceSessions
  voiceSettings

記憶體：
  明文 token
  當前 AI 回應
  interim transcript
```

- [ ] 不將 API 回應直接全部快取。
- [ ] 不將 token 放入 Cache API。
- [ ] 不將原始錄音放入 Service Worker Cache。
- [ ] Cache 名稱包含版本。
- [ ] Service Worker 啟用時清理舊版本。
- [ ] 內建音訊失效時顯示重新下載。
- [ ] 使用者可以清除音訊但保留句子。
- [ ] 使用者可以清除 AI 快取但保留自訂句子。

## K. 無 token 模式的完整流程

```text
選擇主題
  ↓
選擇固定句子
  ↓
SpeechSynthesis 播放
  ↓
使用者跟讀或錄音
  ↓
Speech Recognition（若支援）
  ↓
本機計算時間、字數、關鍵字
  ↓
顯示示範答案
  ↓
再次播放與重講
  ↓
IndexedDB 保存複習結果
```

- [ ] 這條流程完全不呼叫 AI。
- [ ] 沒有 token 時首頁仍可完成每日任務。
- [ ] AI 功能不可用時不要讓首頁看起來壞掉。
- [ ] 將「AI 練習」與「瀏覽器練習」清楚分開標示。

## L. source code 新增檔案清單

- [ ] `src/audio/speech-engine.ts`：SpeechSynthesis 封裝。
- [ ] `src/audio/voice-registry.ts`：語音清單與 voiceschanged。
- [ ] `src/audio/audio-context.ts`：AudioContext、GainNode、AnalyserNode。
- [ ] `src/audio/recorder.ts`：MediaRecorder。
- [ ] `src/audio/speech-recognition.ts`：原生語音轉文字偵測。
- [ ] `src/audio/capabilities.ts`：瀏覽器能力矩陣。
- [ ] `src/content/topic-packs.ts`：內建主題資料。
- [ ] `src/content/dialogue-templates.ts`：無 token 對話模板。
- [ ] `src/content/recommendation-engine.ts`：本機推薦排序。
- [ ] `src/content/phrase-generator.ts`：AI 或模板產生變體。
- [ ] `src/content/recommendation-cache.ts`：IndexedDB 推薦快取。
- [ ] `src/practice/offline-session.ts`：無 token 練習流程。
- [ ] `src/practice/ai-session.ts`：有 token AI 流程。
- [ ] `src/storage/cache-names.ts`：Cache API 版本。
- [ ] `src/storage/export-schema.ts`：匯出檔 schema。
- [ ] `src/ui/capability-warning.ts`：瀏覽器能力提示。
- [ ] `src/ui/beginner-copy.ts`：新手友善文案。
- [ ] `src/tests/browser-matrix.ts`：Chrome、Safari、Firefox、Android、iOS 測試表。

## M. 必須建立的 capability matrix

```ts
export interface BrowserCapabilities {
  speechSynthesis: boolean;
  speechRecognition: boolean;
  mediaRecorder: boolean;
  microphone: boolean;
  audioContext: boolean;
  indexedDb: boolean;
  serviceWorker: boolean;
  cacheApi: boolean;
  secureContext: boolean;
}
```

- [ ] 啟動時檢測能力。
- [ ] 每個功能根據能力矩陣顯示。
- [ ] 不支援時提供替代方案。
- [ ] 不把整個應用判定為不可用。
- [ ] 將能力檢測結果只保存為非敏感診斷資訊。
- [ ] 使用者可在設定頁重新檢測。

## N. 新增驗收案例

- [ ] 沒有 token，使用 Chrome 桌面版完成 90 秒練習。
- [ ] 沒有 token，使用手機 Safari 播放固定句子。
- [ ] 使用者切換美式與英式語音。
- [ ] 使用者把速度調成 0.8x 並重播。
- [ ] 使用者調整音量並停止播放。
- [ ] 語音清單延遲出現時仍能選擇語音。
- [ ] 瀏覽器沒有 Speech Recognition 時改用手動完成。
- [ ] 沒有麥克風權限時仍可做聽力練習。
- [ ] 使用者新增「專案延遲」句子。
- [ ] 沒有 token 時從 business TopicPack 推薦固定變體。
- [ ] 有 token 時 AI 產生建議並進入推薦快取。
- [ ] 相同句子再次請求時命中快取。
- [ ] 使用者批准前不保存 AI 建議。
- [ ] 清除 AI 快取不會刪除自訂句子。
- [ ] 匯出資料不包含 token。
- [ ] 匯入資料不會覆蓋目前資料，除非使用者確認。
- [ ] Service Worker 離線時仍可播放內建練習。
- [ ] 新版本能清除舊 Cache。
- [ ] 手機與桌面分別保存不同語音設定。
- [ ] API 失敗時自動回到無 token 模式。

## O. 本次補充研究來源

本次由 open-websearch MCP 於 2026-10-02 UTC 擷取：

- SpeechSynthesis：可取得設備語音、播放、暫停、繼續、停止與語音清單變更事件  
  https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- SpeechSynthesisUtterance：支援 language、voice、rate、pitch、volume 與播放事件  
  https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
- SpeechRecognition：瀏覽器語音轉文字能力與相容性  
  https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- getUserMedia：麥克風權限與安全上下文  
  https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- MediaRecorder：瀏覽器錄音 API  
  https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- Web Audio API：AudioContext、音訊節點與即時音訊處理  
  https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- AudioContext：建立與控制音訊處理圖  
  https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
- Cache API：Service Worker 快取、版本、清理與瀏覽器配額限制  
  https://developer.mozilla.org/en-US/docs/Web/API/Cache

## P. 補充後的優先順序

第一階段（完全不需要 token）：

- [ ] PWA 骨架。
- [ ] Service Worker。
- [ ] IndexedDB。
- [ ] 內建 TopicPack。
- [ ] SpeechSynthesis 語音播放。
- [ ] 語音、速度、音量、重播控制。
- [ ] 90 秒無 token 練習。
- [ ] 自訂句子。
- [ ] 本機複習排程。

第二階段（可選 token）：

- [ ] token vault。
- [ ] AI 句子推薦。
- [ ] AI 句子變體。
- [ ] AI small talk。
- [ ] AI business talk。
- [ ] AI 回覆與三項修正。
- [ ] AI 推薦快取。

第三階段（語音增強）：

- [ ] MediaRecorder。
- [ ] Speech Recognition。
- [ ] 波形與音量偵測。
- [ ] 停頓與語速統計。
- [ ] 錄音與文字轉錄管理。

這樣即使沒有 token，產品仍然是一個完整可用的英文口說／聽力 PWA；AI 只負責增加個人化與生成能力，而不是成為產品唯一的核心依賴。



---

# 補充 TODO：句子／單字快速查詢與免費外部資源

## Q. 功能判斷

這個功能應該是產品的一級入口，因為使用者在閱讀工作文件或看到陌生句子時，最需要的是：

```text
看到陌生字句
  ↓
選取或貼上
  ↓
一個按鈕查詢
  ↓
立即播放
  ↓
選擇加入句庫或複習
```

需要區分兩種情境：

1. **在本 PWA 內選取文字**：可以使用右鍵、長按、選取工具列與自訂按鈕。
2. **在其他網站或其他 App 選取文字**：普通 GitHub Pages PWA 無法攔截整個作業系統的右鍵選單，必須使用剪貼簿、系統分享，或日後另外製作瀏覽器擴充功能。

不要把「網頁右鍵」誤解成可以控制所有網站的瀏覽器右鍵選單。

## R. 快速查詢入口

### R1. PWA 內的桌面操作

- [ ] 在句子卡片上按右鍵顯示自訂選單。
- [ ] 選單包含「翻譯」、「字典」、「搜尋」、「播放」、「加入複習」。
- [ ] 支援滑鼠右鍵。
- [ ] 支援鍵盤 Context Menu 鍵。
- [ ] 支援 `Ctrl+K` 或 `Alt+L` 開啟查詢面板。
- [ ] 右鍵選單不永久停用瀏覽器原生選單。
- [ ] 選單顯示目前選取文字。
- [ ] 沒有選取文字時，使用目前句子或目前單字。
- [ ] 查詢文字過長時提示使用者縮短。
- [ ] 自動移除多餘空白。
- [ ] 保留原始文字與標準化文字。

### R2. PWA 內的手機操作

- [ ] 長按句子卡片顯示操作列。
- [ ] 使用文字選取後顯示浮動「查詢」按鈕。
- [ ] 提供固定底部工具列，避免依賴右鍵。
- [ ] 提供「貼上並查詢」大按鈕。
- [ ] 提供「從剪貼簿讀取」按鈕。
- [ ] 若剪貼簿權限被拒絕，顯示一般貼上輸入框。
- [ ] 支援手機分享進入 PWA（若瀏覽器與 manifest 支援 Web Share Target）。
- [ ] 不要求使用者理解瀏覽器權限名稱。

### R3. 選取文字資料模型

```ts
export interface LookupQuery {
  id: string;
  rawText: string;
  normalizedText: string;
  detectedType: "word" | "phrase" | "sentence" | "unknown";
  source: "selection" | "paste" | "manual" | "share";
  sourceContext?: string;
  createdAt: string;
}
```

- [ ] 單字自動判定為 `word`。
- [ ] 2–8 個字自動判定為 `phrase`。
- [ ] 含標點或超過 8 個字判定為 `sentence`。
- [ ] 無法判定時仍允許查詢。
- [ ] 不把完整工作文件自動送出。
- [ ] 查詢前顯示文字預覽。
- [ ] 提供「只查這個單字」與「查整句」兩個選項。

## S. 查詢面板

查詢面板固定顯示：

- [ ] 原文。
- [ ] 文字類型。
- [ ] 「播放」。
- [ ] 「翻譯」。
- [ ] 「字典」。
- [ ] 「例句搜尋」。
- [ ] 「發音」。
- [ ] 「加入我的句庫」。
- [ ] 「加入今日複習」。
- [ ] 「用 AI 解釋」（只有 token 模式顯示）。
- [ ] 「複製查詢網址」。
- [ ] 「在新分頁開啟」。

查詢面板下方顯示：

- [ ] 最近查詢。
- [ ] 已保存查詢。
- [ ] 相同句子的歷史版本。
- [ ] 該句子的播放設定。
- [ ] 是否已加入複習。

## T. 免費外部資源 Provider

### T1. Provider 介面

```ts
export interface LookupProvider {
  id: string;
  label: string;
  supports: Array<"word" | "phrase" | "sentence">;
  buildUrl(query: LookupQuery): string;
  openMode: "new-tab" | "same-tab" | "in-app";
  requiresToken: boolean;
}
```

- [ ] Provider 不直接依賴 AI。
- [ ] Provider URL 使用 `encodeURIComponent`。
- [ ] Provider 設定放在單獨檔案。
- [ ] Provider 失效時不影響其他 Provider。
- [ ] 使用者可以停用不需要的 Provider。
- [ ] 查詢網址不包含 API token。
- [ ] 對外部頁面使用 `noopener,noreferrer`。

### T2. Google Translate

使用者指定的免費連結：

```ts
export function buildGoogleTranslateUrl(text: string): string {
  const encoded = encodeURIComponent(text.trim());
  return `https://translate.google.com/?sl=auto&tl=zh-TW&text=${encoded}&op=translate`;
}
```

TODO：

- [ ] 語言來源使用 `auto`。
- [ ] 目標語言預設 `zh-TW`。
- [ ] 允許切換 `zh-CN`、`ja`、`ko`、`en`。
- [ ] 允許使用者在設定頁修改目標語言。
- [ ] 一鍵開啟 Google Translate。
- [ ] 一鍵複製 Google Translate URL。
- [ ] 查詢後回到 PWA 時保留原始文字。
- [ ] 不嘗試從 Google Translate 頁面抓取結果。
- [ ] 不把 Google Translate HTML 放進 Cache API。
- [ ] 若外部頁面被阻擋，仍可複製網址手動開啟。

### T3. 字典與例句 Provider

預設提供可修改的外部連結模板：

- [ ] Cambridge Dictionary。
- [ ] Merriam-Webster。
- [ ] Longman Dictionary。
- [ ] Oxford Learner’s Dictionaries。
- [ ] Wiktionary。
- [ ] YouGlish 發音與真實例句。
- [ ] 使用者自訂字典網址。

Provider URL 範例：

```ts
export const dictionaryProviders: LookupProvider[] = [
  {
    id: "cambridge",
    label: "Cambridge Dictionary",
    supports: ["word", "phrase"],
    buildUrl: q =>
      `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(q.normalizedText)}`,
    openMode: "new-tab",
    requiresToken: false
  },
  {
    id: "wiktionary",
    label: "Wiktionary",
    supports: ["word", "phrase"],
    buildUrl: q =>
      `https://en.wiktionary.org/wiki/${encodeURIComponent(q.normalizedText)}`,
    openMode: "new-tab",
    requiresToken: false
  },
  {
    id: "youglish",
    label: "YouGlish",
    supports: ["word", "phrase", "sentence"],
    buildUrl: q =>
      `https://youglish.com/pronounce/${encodeURIComponent(q.normalizedText)}/english`,
    openMode: "new-tab",
    requiresToken: false
  }
];
```

- [ ] URL 建立後先顯示預覽。
- [ ] 以使用者點擊開啟，避免 popup blocker。
- [ ] 新分頁標示「將離開本 PWA」。
- [ ] 使用有意義的 target 名稱，避免每次開一個新視窗。
- [ ] 外部結果若要保存，使用者手動填寫或貼回 PWA。

### T4. Web Search Provider

- [ ] 提供「搜尋整句」。
- [ ] 提供「搜尋英文意思」。
- [ ] 提供「搜尋使用例句」。
- [ ] 提供「搜尋發音」。
- [ ] 提供「搜尋職場用法」。
- [ ] 預設使用瀏覽器開啟搜尋網址。
- [ ] 不在前端偷偷抓取搜尋結果。
- [ ] 若未來接 web-search MCP，設計成可替換 adapter。
- [ ] 沒有 MCP 時仍可使用 Google、Bing、DuckDuckGo 的外部搜尋網址。
- [ ] 讓使用者選擇搜尋引擎。
- [ ] 儲存使用者最後選擇的搜尋引擎。

```ts
export interface SearchProvider {
  id: "google" | "bing" | "duckduckgo" | "custom";
  label: string;
  buildUrl(query: string, mode: "meaning" | "examples" | "business"): string;
}
```

搜尋 URL 生成規則：

```ts
const searchTerms = {
  meaning: (q: string) => `${q} meaning in English`,
  examples: (q: string) => `${q} example sentences`,
  business: (q: string) => `${q} business English usage`
};
```

## U. 外部查詢與本機收藏流程

```text
選取句子
  ↓
按「查詢」
  ↓
選擇翻譯／字典／搜尋／發音
  ↓
外部頁面查閱
  ↓
回到 PWA
  ↓
按「加入我的句庫」
  ↓
編輯中文意思、主題、場合
  ↓
播放
  ↓
加入複習
```

- [ ] 外部查詢本身不自動保存。
- [ ] 使用者按「加入」才保存。
- [ ] 保存時帶入原始查詢文字。
- [ ] 保存時可補充中文意思。
- [ ] 保存時可選主題。
- [ ] 保存時可選 small talk 或 business talk。
- [ ] 保存時可直接選擇語音。
- [ ] 保存時可直接測試 0.8x 與 1.0x。
- [ ] 保存後自動建立複習排程。
- [ ] 保存後可立即開始跟讀。
- [ ] 外部結果不可直接當成可信內容，使用者可編輯。

## V. AI 與免費查詢的分工

沒有 token：

- [ ] Google Translate：人工翻譯查詢。
- [ ] 字典網址：人工查看定義。
- [ ] YouGlish：人工查看發音例句。
- [ ] Web Search：人工搜尋。
- [ ] PWA：播放、錄音、保存、複習、分類、快取。

有 token：

- [ ] AI 將外部查到的內容整理成 B2 可用句子。
- [ ] AI 產生自然版、簡短版、正式版。
- [ ] AI 產生 small talk 變體。
- [ ] AI 產生 business talk 變體。
- [ ] AI 產生追問。
- [ ] AI 建議主題與複習優先級。
- [ ] AI 結果必須經使用者批准才保存。

## W. 查詢快取

```ts
export interface LookupHistory {
  id: string;
  query: LookupQuery;
  providerId: string;
  url: string;
  openedAt: string;
  savedAsPhraseId?: string;
  favorite: boolean;
}
```

- [ ] 保存查詢歷史。
- [ ] 最多保存最近 100 筆。
- [ ] 支援收藏。
- [ ] 支援刪除單筆。
- [ ] 支援清除全部歷史。
- [ ] 不保存外部頁面的完整 HTML。
- [ ] 不保存 API token。
- [ ] 相同文字與相同 Provider 可去重。
- [ ] 顯示「已查過」而不是重複建立紀錄。
- [ ] 只有使用者按「加入句庫」才建立 PhraseCard。

## X. 右鍵、長按與相容性

MDN 指出 `contextmenu` 事件在部分瀏覽器的支援不是完整 Baseline，因此不可只依靠右鍵。

- [ ] 桌面提供右鍵選單。
- [ ] 同時提供「查詢」按鈕。
- [ ] 手機提供長按與浮動工具列。
- [ ] 支援鍵盤快捷鍵。
- [ ] Firefox Shift + 右鍵時仍保留原生選單。
- [ ] 右鍵選單被阻擋時仍可使用一般按鈕。
- [ ] 觸控設備不顯示「請按右鍵」。
- [ ] 螢幕閱讀器可讀出查詢按鈕。
- [ ] 外部連結清楚標示會開啟新分頁。

## Y. Clipboard 與分享

Clipboard API 在安全上下文（HTTPS）可讀寫，但瀏覽器可能要求使用者互動或權限。

- [ ] 「從剪貼簿查詢」必須由使用者點擊觸發。
- [ ] 讀取失敗時提供貼上輸入框。
- [ ] 「複製翻譯網址」使用 Clipboard API。
- [ ] 複製失敗時顯示可手動選取的 URL。
- [ ] 不在頁面載入時自動讀取剪貼簿。
- [ ] 不把剪貼簿內容長期保存，除非使用者按保存。
- [ ] 支援 Web Share API 時提供「分享至 PWA」。
- [ ] 分享內容先顯示預覽，避免誤保存敏感資料。

## Z. 外部頁面安全與隱私

- [ ] 所有外部 URL 使用 `encodeURIComponent`。
- [ ] 不把 token 附加到查詢網址。
- [ ] 不把整份文件自動送到搜尋引擎。
- [ ] 顯示「外部網站可能看到你查詢的文字」。
- [ ] 對工作機密文字顯示提醒。
- [ ] 提供「只查單字」按鈕。
- [ ] 提供「移除公司名稱後再查」功能。
- [ ] 不使用未經使用者點擊的自動跳轉。
- [ ] 使用 `noopener,noreferrer`。
- [ ] 不使用 `innerHTML` 顯示外部查詢結果。
- [ ] 外部查詢結果視為不可信文字。

## AA. 新增 source code 檔案

- [ ] `src/lookup/lookup-types.ts`：查詢與 Provider 型別。
- [ ] `src/lookup/lookup-panel.ts`：查詢面板。
- [ ] `src/lookup/context-menu.ts`：PWA 內右鍵選單。
- [ ] `src/lookup/selection-toolbar.ts`：手機選取工具列。
- [ ] `src/lookup/clipboard.ts`：複製與貼上。
- [ ] `src/lookup/providers/google-translate.ts`：Google Translate URL。
- [ ] `src/lookup/providers/dictionary.ts`：字典 URL。
- [ ] `src/lookup/providers/search.ts`：搜尋 URL。
- [ ] `src/lookup/providers/youglish.ts`：發音 URL。
- [ ] `src/lookup/history.ts`：查詢歷史。
- [ ] `src/lookup/save-as-phrase.ts`：查詢轉句庫。
- [ ] `src/content/topic-recommender.ts`：主題推薦。
- [ ] `src/content/template-variants.ts`：無 token 變體。
- [ ] `src/content/ai-recommendation.ts`：AI 可選推薦。
- [ ] `src/storage/lookup-store.ts`：IndexedDB 查詢歷史。
- [ ] `src/ui/external-link-warning.ts`：外部頁面提示。

## AB. 新增測試

- [ ] 選取單字後可開啟 Google Translate。
- [ ] 選取整句後可開啟 Google Translate。
- [ ] 中文標點與 emoji 會正確 URL encode。
- [ ] 空白文字不允許查詢。
- [ ] 文字過長時顯示縮短提示。
- [ ] 桌面右鍵可顯示自訂選單。
- [ ] 手機長按可顯示查詢工具列。
- [ ] 右鍵不可用時，一般查詢按鈕仍可用。
- [ ] Clipboard 權限拒絕時可手動貼上。
- [ ] popup blocker 阻擋時顯示可點擊連結。
- [ ] 外部 Provider URL 不包含 token。
- [ ] 查詢後可保存為 PhraseCard。
- [ ] 保存時可選主題。
- [ ] 保存後可播放與加入複習。
- [ ] 相同查詢可去重。
- [ ] 清除查詢歷史不會刪除句庫。
- [ ] 工作機密提示會在外部查詢前顯示。
- [ ] 無 token 時 Google Translate、字典與搜尋仍然可用。

## AC. 本次新增研究來源

本次由 open-websearch MCP 於 2026-10-02 UTC 擷取：

- `contextmenu` 事件可由滑鼠右鍵或鍵盤觸發，但 MDN 標示瀏覽器支援不是完整 Baseline：  
  https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
- Clipboard API 需要安全上下文，讀取通常需要使用者互動或權限：  
  https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
- `window.open()` 可能受 popup blocker 影響，且跨 origin 頁面不能由 PWA 讀取內容：  
  https://developer.mozilla.org/en-US/docs/Web/API/Window/open
- 使用者指定的 Google Translate 連結模板：  
  https://translate.google.com/?sl=auto&tl=zh-TW&text=sadasdasdasdas&op=translate

## AD. 本次新增優先順序

第一優先：

- [ ] PWA 內選取文字。
- [ ] 查詢按鈕。
- [ ] Google Translate URL。
- [ ] 字典 URL。
- [ ] 句子播放。
- [ ] 加入我的句庫。
- [ ] IndexedDB 查詢歷史。

第二優先：

- [ ] 桌面右鍵選單。
- [ ] 手機長按工具列。
- [ ] Clipboard 複製／貼上。
- [ ] YouGlish。
- [ ] 多搜尋引擎 URL。
- [ ] 查詢結果去重。
- [ ] 工作機密提示。

第三優先：

- [ ] Web Share Target。
- [ ] 使用者自訂 Provider。
- [ ] 查詢轉 small talk。
- [ ] 查詢轉 business talk。
- [ ] AI 整理外部查詢結果。
- [ ] AI 推薦快取與使用者批准流程。



---

# 補充 TODO：MiMo（小米）第一 Provider 與可替換 AI 架構

## AE. Provider 決策

第一個實際串接的 AI provider：

- [ ] Provider ID：`mimo`
- [ ] 顯示名稱：`Xiaomi MiMo`
- [ ] 使用者設定：MiMo token。
- [ ] 使用者設定：模型名稱。
- [ ] 使用者設定：API endpoint（預設值必須以 MiMo 官方文件確認後填入）。
- [ ] 使用者設定：是否啟用串流回覆。
- [ ] 使用者設定：最大回覆長度。
- [ ] 使用者設定：溫度或 provider 支援的等價參數。
- [ ] 使用者設定：測試連線。
- [ ] 使用者設定：清除 MiMo token。
- [ ] 儲存模式沿用 memory、session、device-encrypted。
- [ ] MiMo 設定與其他 provider 設定分開保存。
- [ ] 不把 MiMo 特有欄位散落在 small talk、business talk 或 audio 模組。

目前只確認 MiMo 官方文件入口可取得 MiMo 模型與 Token Plan 資訊；API endpoint、模型 ID、請求欄位與瀏覽器 CORS 必須在實作時依官方文件逐項驗證，不能自行猜測或硬編碼。

官方入口：

- https://mimo.mi.com/docs/zh-CN/welcome
- https://mimo.xiaomi.com/zh
- https://aistudio.xiaomimimo.com/

## AF. Provider-neutral 介面

所有 AI 功能只能依賴統一介面：

```ts
export type AiProviderId =
  | "mimo"
  | "openai"
  | "anthropic"
  | "gemini"
  | "openrouter"
  | "custom";

export interface AiProviderConfig {
  id: AiProviderId;
  label: string;
  baseUrl: string;
  chatPath: string;
  model: string;
  authScheme: "bearer" | "api-key" | "custom";
  tokenMode: "memory" | "session" | "device-encrypted";
  supportsStreaming: boolean;
  supportsJsonMode: boolean;
  supportsSpeechToText: boolean;
  supportsTextToSpeech: boolean;
  enabled: boolean;
}

export interface AiProvider {
  id: AiProviderId;
  validateConfig(config: AiProviderConfig): Promise<ProviderValidation>;
  chat(request: NormalizedChatRequest): Promise<NormalizedChatResponse>;
  streamChat?(
    request: NormalizedChatRequest,
    onDelta: (delta: string) => void
  ): Promise<NormalizedChatResponse>;
  normalizeError(error: unknown): ProviderError;
}
```

- [ ] 練習模組只呼叫 `AiProvider.chat()`。
- [ ] 句子推薦只呼叫 `AiProvider.chat()`。
- [ ] AI 回覆格式在 provider adapter 之後統一。
- [ ] Provider 回傳格式不直接暴露給 UI。
- [ ] Provider 變更不需要修改複習演算法。
- [ ] Provider 變更不需要修改語音播放。
- [ ] Provider 變更不需要修改 IndexedDB schema。
- [ ] Provider 變更不需要修改 small talk 情境資料。

## AG. Provider Registry

```ts
export interface ProviderRegistry {
  register(provider: AiProvider): void;
  get(id: AiProviderId): AiProvider;
  listAvailable(): AiProviderConfig[];
  getDefault(): AiProviderId;
}
```

- [ ] 預設 provider 為 `mimo`。
- [ ] 如果 MiMo token 未設定，顯示無 token 模式。
- [ ] 如果 MiMo 連線失敗，不自動把 token 傳給另一個 provider。
- [ ] 使用者切換 provider 時重新測試。
- [ ] 每個 provider 有獨立錯誤訊息。
- [ ] 每個 provider 有獨立模型設定。
- [ ] 每個 provider 有獨立用量顯示。
- [ ] Provider 清單只顯示已實作與已測試的 provider。
- [ ] 未實作 provider 顯示「尚未支援」，不顯示假按鈕。

## AH. MiMo Adapter 實作任務

新增：

- [ ] `src/ai/providers/mimo-provider.ts`。
- [ ] `src/ai/providers/mimo-schema.ts`。
- [ ] `src/ai/providers/mimo-error.ts`。
- [ ] `src/ai/providers/mimo-config.ts`。
- [ ] `src/ai/providers/mimo-health-check.ts`。
- [ ] `src/ai/providers/mimo-stream.ts`。

MiMo adapter 必須完成：

- [ ] 從官方文件確認 base URL。
- [ ] 從官方文件確認 chat path。
- [ ] 從官方文件確認 token header。
- [ ] 從官方文件確認 model 欄位。
- [ ] 從官方文件確認 messages 格式。
- [ ] 從官方文件確認 system message 支援。
- [ ] 從官方文件確認 JSON response 支援。
- [ ] 從官方文件確認 streaming 格式。
- [ ] 從官方文件確認 max tokens 欄位。
- [ ] 從官方文件確認 temperature 或等價欄位。
- [ ] 從官方文件確認 rate limit 錯誤。
- [ ] 從官方文件確認錯誤 response schema。
- [ ] 確認瀏覽器直接呼叫所需 CORS。
- [ ] 如果 MiMo 不支援瀏覽器 CORS，明確標示第一版無法直接由 GitHub Pages 呼叫。
- [ ] 不因「看起來像 OpenAI API」就直接假設完全相容。
- [ ] 將所有 MiMo 特有欄位集中在 adapter。

### MiMo 設定介面

```ts
export interface MiMoConfig extends AiProviderConfig {
  id: "mimo";
  apiKeyRef: string;
  model: string;
  baseUrl: string;
  chatPath: string;
  requestTimeoutMs: number;
  maxOutputTokens: number;
}
```

- [ ] 設定頁顯示「MiMo（小米）」。
- [ ] token 輸入框預設遮罩。
- [ ] token 不預填。
- [ ] 模型使用文字欄位或官方模型清單。
- [ ] endpoint 顯示「進階設定」。
- [ ] 一般使用者只需填 token。
- [ ] 點擊「測試 MiMo」才送出測試請求。
- [ ] 測試成功只顯示成功，不顯示 token。
- [ ] 測試失敗顯示可理解的原因。
- [ ] 顯示最後成功測試時間。
- [ ] 顯示目前 provider 與模型名稱。
- [ ] 支援清除設定。
- [ ] 清除 token 後保留非敏感 UI 設定。

## AI. Normalized request／response

所有 provider 先轉為統一格式：

```ts
export interface NormalizedChatRequest {
  system?: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  responseFormat?: "text" | "json";
  temperature?: number;
  maxOutputTokens?: number;
  stream?: boolean;
  metadata: {
    feature: "phrase" | "small-talk" | "business" | "feedback";
    locale: string;
    targetLevel: "B1" | "B2" | "C1";
  };
}

export interface NormalizedChatResponse {
  text: string;
  provider: AiProviderId;
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  finishReason?: string;
  rawSaved: false;
}
```

- [ ] UI 只讀取 `text`、`usage`、`finishReason`。
- [ ] 不保存 raw provider response。
- [ ] 不把 provider request 寫入查詢歷史。
- [ ] 不把工作機密文字寫入一般診斷 log。
- [ ] JSON 模式解析失敗時進入修復流程。
- [ ] 修復仍失敗時顯示純文字結果。
- [ ] 純文字結果不假裝是完整結構化評分。

## AJ. MiMo Prompt Profile

Prompt 內容與 provider 分離：

```ts
export interface PromptProfile {
  id: string;
  system: string;
  responseFormat: "text" | "json";
  maxOutputTokens: number;
  temperature?: number;
}
```

MiMo 第一版 profiles：

- [ ] `mimo-phrase-variants`。
- [ ] `mimo-small-talk-coach`。
- [ ] `mimo-business-coach`。
- [ ] `mimo-repair-drill`。
- [ ] `mimo-listening-question`。
- [ ] `mimo-feedback`。
- [ ] `mimo-lookup-explanation`。

每個 profile 必須：

- [ ] 要求 B2 可用英文。
- [ ] 不要求母語者等級。
- [ ] 每回合最多三項修正。
- [ ] 必須提出下一個問題。
- [ ] 使用者未要求時不要長篇解釋文法。
- [ ] 回傳固定 JSON schema 時嚴格遵守。
- [ ] 不把 token 或內部設定放入 prompt。
- [ ] 不將公司機密自動加入永久記錄。

## AK. Streaming 與非 Streaming

- [ ] MiMo 支援串流時使用 `streamChat()`。
- [ ] 不支援串流時使用 `chat()`。
- [ ] UI 顯示「正在思考」。
- [ ] 串流過程不保存半成品到句庫。
- [ ] 串流中斷時保留已收到文字。
- [ ] 使用者可停止生成。
- [ ] 停止生成不會清除上一個完整句子。
- [ ] 串流訊息超過上限時停止並提示。
- [ ] 沒有串流時仍保持相同 UI。
- [ ] 不把 provider 的 SSE 或特殊格式暴露給 features。

## AL. MiMo 錯誤處理

依 `docs/mimo-contract.md` 第 8 節的官方錯誤碼，統一轉換為：

```ts
export type ProviderErrorCode =
  | "invalid-token"        // 401：缺／錯 key、header 格式錯、Token Plan 與 PAYG key 混用
  | "forbidden"            // 403：地區不可用，或 key 被風險控管限制
  | "invalid-model"        // 400/404：模型不存在或不支援
  | "invalid-endpoint"     // 404：路徑錯誤
  | "content-filtered"     // 421：內容審核攔截（新增，原本漏了）
  | "insufficient-balance" // 402：餘額不足（新增，原本漏了）
  | "rate-limited"         // 429：請求過頻或 Token Plan 額度用盡
  | "cors-blocked"         // 保留給日後其他 provider；MiMo 實測不會出現（見 AS1）
  | "timeout"
  | "network"
  | "unsupported-format"
  | "unknown";
```

**兩個原本漏掉的錯誤碼**：

- `402 Insufficient Balance`（餘額不足）與 `429 Too Many Requests` 是不同情境 — **402 重試也沒用**，只能請使用者儲值；429 才該退避重試。原本的 `quota-exceeded` 把兩者混在一起，會導致對沒錢的帳號無限重試。
- `421 Content Filter`（內容審核）在練習場景會發生（例如討論公司問題時被攔），原本完全沒有對應碼，會變成 `unknown` 而給出誤導訊息。

使用者看到：

- [ ] invalid-token：MiMo token 無法使用，請重新檢查。也檢查是不是把 Token Plan 的 key 用在 Pay-as-you-go 的網址上。
- [ ] forbidden：此服務在你所在的地區無法使用，或這把 key 被限制了。請重新建立一把 key。
- [ ] invalid-model：目前模型名稱無法使用，請查看 MiMo 模型設定。
- [ ] invalid-endpoint：MiMo endpoint 設定不正確。
- [ ] content-filtered：MiMo 暫時無法處理這段內容。換個說法，或改用無 AI 練習。
- [ ] insufficient-balance：MiMo 帳戶餘額不足，已切換到無 token 練習。請先儲值。
- [ ] rate-limited：MiMo 暫時限制請求，請稍後再試。
- [ ] cors-blocked：此 AI 服務不允許瀏覽器直接呼叫，需改用官方支援的方式。
- [ ] timeout：MiMo 回應逾時，可重試或使用固定句庫。
- [ ] network：目前沒有網路，可使用離線練習。
- [ ] unsupported-format：此 MiMo 模型不支援目前功能。
- [ ] unknown：MiMo 回應發生未知錯誤，保留原始練習內容。

- [ ] 錯誤 log 不包含 token。
- [ ] 錯誤 log 不包含完整工作文件。
- [ ] 不自動重試 invalid-token、invalid-model、forbidden、insufficient-balance、content-filtered。
- [ ] 只對 429 與 5xx（500 / 503）做有限次重試，exponential backoff + jitter，最多 2 次。
- [ ] 每種錯誤都提供「切換無 token 模式」。

## AM. 未來新增其他 AI 的流程

新增 provider 只允許修改：

- [ ] `src/ai/providers/<provider>-provider.ts`。
- [ ] `src/ai/providers/<provider>-schema.ts`。
- [ ] `src/ai/providers/<provider>-error.ts`。
- [ ] `src/ai/provider-registry.ts`。
- [ ] provider 設定畫面。
- [ ] provider 測試。

新增 provider 不應修改：

- [ ] PhraseCard。
- [ ] ReviewQueue。
- [ ] SpeechEngine。
- [ ] TopicPack。
- [ ] small talk feature。
- [ ] business talk feature。
- [ ] Service Worker。
- [ ] 匯出／匯入 schema。

未來可加入：

- [ ] OpenAI adapter。
- [ ] Anthropic adapter。
- [ ] Gemini adapter。
- [ ] OpenRouter adapter。
- [ ] 自訂 OpenAI-compatible adapter。
- [ ] 本機 WebLLM adapter。
- [ ] 使用者自訂 endpoint adapter。

每一個新 provider 必須通過：

- [ ] token 設定測試。
- [ ] chat 測試。
- [ ] JSON response 測試。
- [ ] streaming 測試（若支援）。
- [ ] timeout 測試。
- [ ] error normalization 測試。
- [ ] 不同模型名稱測試。
- [ ] token 不出現在 log 的測試。
- [ ] 句子推薦、small talk、business talk 整合測試。

## AN. Provider 設定匯出規則

匯出學習資料時：

- [ ] 預設不匯出任何 provider token。
- [ ] 可匯出 provider ID。
- [ ] 可匯出模型名稱。
- [ ] 可匯出語音設定。
- [ ] 可匯出是否啟用 AI。
- [ ] 不匯出 endpoint 中可能包含的敏感 query。
- [ ] 使用者若勾選「包含 token」，顯示高風險警告。
- [ ] 匯出檔使用加密密碼。
- [ ] 匯入後 token 預設仍需重新確認。
- [ ] MiMo token 不自動同步到其他設備。

## AO. MiMo 測試案例

- [ ] 使用正確 MiMo token 可完成測試請求。
- [ ] token 錯誤時顯示 invalid-token。
- [ ] endpoint 錯誤時顯示 invalid-endpoint。
- [ ] model 錯誤時顯示 invalid-model。
- [ ] MiMo API 不支援 CORS 時給出明確提示。
- [ ] MiMo 回傳純文字時可顯示。
- [ ] MiMo 回傳 JSON 時可解析。
- [ ] JSON 格式不完整時進入 fallback。
- [ ] MiMo 不支援 streaming 時自動使用非串流。
- [ ] 使用者按停止時不再追加文字。
- [ ] MiMo timeout 時可使用固定 TopicPack。
- [ ] MiMo 額度不足時仍可播放、複習、錄音。
- [ ] token 從未出現在 URL、console、Cache API、匯出檔。
- [ ] 切換到未來 provider 時 PhraseCard 不需轉換。

## AP. 本次 MiMo 研究限制

- [ ] 實作前必須重新確認 MiMo 官方 API 文件。
- [ ] 本次 MCP 能取得 MiMo 官方文件首頁與產品資訊，但 API 內文由動態頁面渲染，無法從擷取結果確認完整 endpoint、model ID、header、streaming 與 CORS。
- [ ] 不在 source code 中猜測 `baseUrl`、`chatPath` 或模型名稱。
- [ ] 將這些值放入 provider config，待官方文件確認後填入。
- [ ] 若瀏覽器直連被 CORS 阻擋，必須在 TODO 中標記為 blocking issue，不偷偷改成未授權的代理服務。

## AQ. 本次補充來源

- MiMo 官方文件入口：  
  https://mimo.mi.com/docs/zh-CN/welcome
- MiMo 官方產品頁：  
  https://mimo.xiaomi.com/zh
- MiMo Studio：  
  https://aistudio.xiaomimimo.com/
- 本次搜尋時間：2026-10-02 UTC。

> **2026-10-02 補充（以 curl 直接取得官方靜態文件，非站內搜尋）**：完整合約、CORS 實測、錯誤碼對照、rate limit 與模型清單已整理在 `docs/mimo-contract.md`。文件索引 <https://mimo.mi.com/llms.txt>，全文單檔 <https://mimo.mi.com/llms-full.txt>。

---

# 補充 TODO：工程／產品檢視結論，以及 MiMo 串接落地與可替換 AI 架構

> 本段從工程與產品兩個角度回頭檢視前面所有 TODO（0–16、A–AD、AE–AQ），把「還缺什麼才真的做得出來」補上。
> MiMo 作為第一個 provider 與多 provider 彈性的方向已經寫在 AE–AQ，這裡不重複列同樣的 checkbox，而是補三件事：**可行性門檻**、**抽象要開到多大**、**第一版到底做哪些**。

## AR. 檢視總結

前面方向正確的三點：

1. 無 token 也能練（A–K）— 降低對 AI 的單點依賴。
2. Provider-neutral 介面（AF）— 避免 MiMo 特有欄位滲進功能層。
3. token 只存本機、預設不進匯出檔 — 隱私承諾清楚。

但有三件事會決定專案成敗，目前都沒有被列成「要先做的事」：

| # | 問題 | 為什麼嚴重 | 現在寫在哪 | 應該在哪 |
|---|---|---|---|---|
| B1 | MiMo 是否支援瀏覽器 CORS | 不支援就完全不能由 GitHub Pages 呼叫，整個 Phase 2 不成立 | AP「研究限制」的註腳 | **Phase 2 之前的 go/no-go gate** — 見 AS，**已解除** |
| B2 | Scope 是三個月不是一個 MVP | TODO 0–16 + A–AQ 是完整產品規格 | 分散在 §P 與 §AD，且互相衝突 | **一份唯一排序的 backlog** |
| B3 | TopicPack 是內容工程不是寫程式 | 17 主題 × 20 句 × 6 個欄位 ≈ 2000 個內容欄位 | 當成功能項目列在 F1/F2 | **獨立、有時間盒、有完成定義的工作** |

## AS. B1：CORS 已實測 — **結果 A，可以直連**

純前端 PWA 直接呼叫 LLM API，能不能成功**完全取決於對方有沒有回 `Access-Control-Allow-Origin`**。這原本是最高的可行性風險，現已實測解決。

### AS1. 實測結果

2026-10-02 對 API host 發出瀏覽器 preflight，**Pay-as-you-go 與 Token Plan 兩個 host 都回**：

```http
HTTP/2 200
access-control-allow-origin: *
access-control-allow-methods: POST
access-control-allow-headers: content-type, api-key, authorization
access-control-max-age: 1800
```

未帶 key 的錯誤回應（401）**同樣帶** `access-control-allow-origin: *`，代表錯誤 body 可以被瀏覽器 JavaScript 讀到，錯誤碼對照表做得出有意義的訊息。

**結論：GitHub Pages 上的純前端 PWA 可以直接呼叫 MiMo，不需要任何 proxy。**

- 不需要使用者自建 proxy。
- 「不自建後端」的硬約束**維持不變**。
- AS1 原本列的結果 B／C 分支不必走了；下方的選項保留作為日後其他 provider 的決策框架。

### AS2. CORS 開了帶來的安全意涵

`access-control-allow-origin: *` 代表**任何網站**都能帶著使用者的 key 呼叫 MiMo，MiMo 不會擋。key 被 XSS 讀走就直接可被任意網站使用。

因此既有設計全部維持必要，不可因為「CORS 通了」而鬆懈：

- [ ] CSP 的 `connect-src` 白名單（AW1）。
- [ ] 不使用 `innerHTML` 顯示 AI 回覆。
- [ ] token 不以明文進 localStorage（token-vault 三種模式）。
- [ ] 提供「每次輸入、不保存」模式給高風險使用者。

### AS3. 已確認的合約（摘要）

完整內容與範例見 **`docs/mimo-contract.md`**（本專案事實來源）：

| 項目 | 值 |
|---|---|
| 相容協定 | **OpenAI API 與 Anthropic API 皆相容** |
| Base URL（PAYG） | `https://api.xiaomimimo.com/v1` |
| Base URL（Token Plan） | `https://token-plan-cn.xiaomimimo.com/v1` |
| Endpoint | `POST {baseUrl}/chat/completions` |
| Auth | `api-key: $KEY` 或 `Authorization: Bearer $KEY` |
| Key 格式 | PAYG `sk-`／Token Plan 個人 `tp-`／團隊 `ttp-` |
| 建議模型 | `mimo-v2.6-flash`（練習）、`mimo-v2.6-pro`（評語） |
| 模型上限參數 | **`max_completion_tokens`**（不是 `max_tokens`） |
| Rate limit | RPM 100、TPM 10M（ASR 只有 TPM 10K） |

三個待辦：

- [ ] ~~確認 baseUrl / chatPath / auth header / model id~~ — 已確認，見 `docs/mimo-contract.md`。
- [ ] ~~確認 CORS~~ — 已確認可直連。
- [ ] 仍需實測：streaming SSE 欄位、Structured Output 確切欄位、ASR／TTS 是否也開放瀏覽器 CORS、服務條款。

> MiMo 是 **OpenAI 相容**，代表 `MiMoProvider` 的請求形狀可以直接映射到 OpenAI Chat Completions，不必自己發明格式。這大幅降低 adapter 成本，也讓未來的 `openai-provider` 幾乎是複製貼上。

## AT. B2：只有一個 provider 時，抽象開到哪裡

可替換是對的方向，但判斷是：**現在建「邊界」，不要建「插件系統」**。過早的 registry／plugin 機制會拖慢第一個可跑版本，而在沒有第二個 provider 之前它無法被驗證。

### AT1. v1 要做的「縫」

- [ ] 一個窄介面 `AiProvider`：只有 `healthCheck` / `chat` / `streamChat?` / `normalizeError`。
- [ ] 一個實作 `MiMoProvider`。
- [ ] 一個 `AiGateway`：**功能層唯一入口**，負責 timeout、有限重試、降級到無 token 模式、請求次數護欄、prompt profile 選擇。
- [ ] 一個 `normalizeError()`。
- [ ] 一個 response schema validator：AI 回應 parse 不過就不准進 UI 與 cache。

### AT2. v1 不要做

- [ ] ~~ProviderRegistry 的註冊／動態載入機制~~ — 先在 `AiGateway` 內 `if (id === "mimo") return new MiMoProvider()`。
- [ ] ~~多 provider 設定 UI 與切換畫面~~ — 只做 MiMo 一張設定卡。
- [ ] ~~per-provider 用量統計~~ — 先只做請求次數。
- [ ] ~~WebLLM、使用者自訂 endpoint adapter~~ — P2。
- [ ] ~~`AiProviderId` 的 closed union 型別~~ — 見 AU。

判斷準則寫進 code review checklist：**當第二個 provider 真的要進來時才實作 registry；在那之前 `AiGateway` 內的硬編碼分支是刻意的，不是技術債。**

### AT3. 分層與不變式

```text
features/  (quick-practice, small-talk, business-talk, phrase, lookup)
   │  只呼叫
   ▼
AiGateway / AiClient   ← 功能層：timeout、重試、降級、成本護欄、prompt profile
   │  只依賴
   ▼
AiProvider (interface) ← 傳輸層：窄介面，換 provider 不動
   │  實作
   ▼
providers/mimo/*       ← 所有 MiMo 特有欄位只活在這一層
```

不變式（每個 PR 都要檢查）：

- [ ] `features/*` 不得 import `ai/providers/*`。
- [ ] `ai/providers/*` 不得 import `features/*` 或 `storage/*`。
- [ ] prompt 文字不得寫在 provider 檔案內（放在 `prompt-profiles/`）。
- [ ] provider 不得把 raw response 往上丟。
- [ ] `storage/*` 不得知道任何 provider 特有欄位。

## AU. 介面修正（本次檢視發現的型別問題）

- [ ] **兩層介面沒講清楚**：TODO 12 的 `AiClient` 與 AF 的 `AiProvider` 是不同層。`AiProvider` = 傳輸層（換 provider 不動）；`AiClient` = 功能層（`generateReply` / `generatePhraseVariants` / `generateListeningTask`）。要明寫這個分層，否則會長出兩套平行系統。
- [ ] **`NormalizedChatResponse.rawSaved: false`** 是常數不是資料，移除。
- [ ] **`MiMoConfig.apiKeyRef` 語意未定義**。config 不應持有 token，也不應持有可逆的 token reference。token 只存在 `token-vault`；config 只存 `baseUrl` / `chatPath` / `model` / `requestTimeoutMs` / `maxOutputTokens` 等非敏感欄位。
- [ ] **`AiProviderId` 是 closed union，但 AM 又要支援 `custom` 與使用者自訂 endpoint**，兩者矛盾。改成 `string` 品牌型別，或 `"mimo" | "openai" | ... | custom:${string}`。
- [ ] **`authScheme: "custom"` 目前形同虛設**，要定義 hook 或先拿掉。
- [ ] **`ProviderValidation` 未定義型別**，補上 `{ ok: boolean; code?: ProviderErrorCode; message: string }`。
- [ ] **`maxOutputTokens` 對映到 MiMo 的 `max_completion_tokens`**，不是 `max_tokens`。這層翻譯放在 `mimo-provider.ts`，上層維持 provider-neutral 的名字。
- [ ] **MiMo 相容 OpenAI API**，`NormalizedChatRequest` 可直接映射到 OpenAI Chat Completions 形狀。`authScheme` 實際只需要 `api-key` 與 `bearer` 兩種（MiMo 兩者都支援），`"custom"` 可先拿掉。
- [ ] **`temperature` 不保證有效**：thinking mode 下 MiMo 會把 `temperature` / `top_p` 強制改回 1.0 / 0.95。UI 不要承諾「可調整溫度」，或只在非 thinking 模式顯示。
- [ ] **JSON 模式一律非串流**。串流只用於對話文字；部分 JSON 無法安全解析。這條規則寫進 `AiGateway`，不要交給各 feature 自己處理。
- [ ] **AI 請求不得進 `offline-queue`**。AI 回應會過期；`offline-queue.ts` 只排非 AI 動作（例如「加入句庫」）。

## AV. MiMo adapter 實作順序（對照 AH）

合約已確認（見 `docs/mimo-contract.md`），照這個順序做，每一步都有測試才算完成。不要一次寫完再一起測：

1. [ ] `healthCheck()` — 用 `GET {baseUrl}/models` 做最小請求，只回 ok／錯誤碼。**先寫這個**，設定頁的「測試連線」與所有錯誤處理都靠它。
2. [ ] `chat()` 非串流 — `POST {baseUrl}/chat/completions`，欄位名照合約（注意 `max_completion_tokens`）。
3. [ ] `normalizeError()` — 對照合約第 8 節的 400/401/402/403/404/421/429/500/503 寫映射，並把真實 error body 存成 fixture。
4. [ ] JSON response 解析 + schema validate + 解析失敗的 fallback 流程。
5. [ ] `streamChat()` — 合約標示支援，但 SSE 欄位尚未逐項確認。**先做非串流上線**，確認 SSE 後再開。

新增檔案：

- [x] `docs/mimo-contract.md`（唯一事實來源，已完成）。
- [ ] `src/ai/gateway.ts`。
- [ ] `src/ai/provider.ts`（只有介面）。
- [ ] `src/ai/schema-validate.ts`。
- [ ] `src/ai/prompt-profiles/*.ts`（含 `version` 欄位）。
- [ ] `src/ai/providers/mimo/contract-fixtures.json`（真實請求／回應樣本）。
- [ ] `tests/ai/contract-mimo.test.ts`。

設定頁要讓使用者選**方案**（Pay-as-you-go / Token Plan），因為兩者的 `baseUrl` 與 key 格式不同，混用會 401。這是官方文件明列的常見錯誤。

## AW. 安全與成本護欄（目前文件缺的）

### AW1. 安全

- [ ] CSP 要實際寫出來：`default-src 'self'`、`script-src 'self'`、`connect-src` **白名單**只放 MiMo endpoint 與查詢用的外部網域。現在只有 `csp-notes.md` 這個檔名，沒有內容。
- [ ] `connect-src` 至少要含：`https://api.xiaomimimo.com`、`https://token-plan-cn.xiaomimimo.com`（兩者都要，因為使用者可能用任一種方案）。
- [ ] 評估 `require-trusted-types-for 'script'`。
- [ ] token 不進 prompt、不進 log、不進 URL、不進 export（既有規則保留）。
- [ ] Prompt injection：使用者句子與工作內容視為 untrusted，用明確 delimiter 包住；system prompt 不得被使用者內容覆寫。單人 app 風險低，但要寫成一條規則。
- [ ] 確認 MiMo 服務條款允許瀏覽器直連 + 使用者自帶 key。

### AW2. 成本護欄（BYO token，燒的是使用者的錢）

- [ ] 每個練習 session 的 AI 請求上限（建議 30 次），到上限後明確提示並自動轉無 token 模式。
- [ ] 自動重試只限 `429` / `5xx`，最多 2 次，指數退避 + jitter。
- [ ] **`4xx` 一律不重試**，尤其 `invalid-token`。
- [ ] UI 顯示「這次練習用了幾次 AI」。
- [ ] provider 有回 `usage` 就顯示 token 用量；沒有就不要假裝有。
- [ ] 逾時上限（建議 30s），逾時後保留目前練習狀態並可重試。

## AX. 產品層：PM 檢視

### AX1. 定位句（現在沒有，要先寫死）

> 一台手機、90 秒、用你自己的 AI key，在辦公室零碎時間練工作英文；沒有網路或沒有 key 也還是能練。

相對於 ChatGPT 語音、Duolingo、ELSA 只保留四個差異點：**離線可用**、**BYO key（內容不進第三方帳號）**、**工作情境（進度／延遲／提案／會議總結）**、**90 秒微任務**。其他都不要當賣點。

### AX2. 第一版唯一 backlog（取代 §P 與 §AD 的衝突）

§P 把「無 token 練習」排第一，§AD 把「查詢入口」排第一，兩個第一版會打架。以下這份是**唯一排序**，之後的優先順序一律以此為準：

**P0（第一版就做）**

- [ ] PWA 骨架 + GitHub Pages + Service Worker 離線。
- [ ] IndexedDB + `PhraseCard` + 複習排程。
- [ ] SpeechSynthesis 播放（速度、音量、重播）。
- [ ] 查詢入口**只做**：Google Translate、一個字典、播放、加入我的句庫。
- [ ] **3 個** TopicPack（自我介紹 / 進度更新 / 聽不懂修復），各 20 句。
- [ ] 90 秒無 token 練習。
- [x] ~~MiMo CORS spike~~ — **已完成，結果 A：可直連**（AS1）。
- [ ] `AiProvider` + `MiMoProvider`（合約已確認，見 `docs/mimo-contract.md`）。
- [ ] 90 秒有 token 練習 + 每回合最多三項修正。

**P1（之後）**

- [ ] small talk / business talk 其餘情境。
- [ ] 右鍵選單、長按工具列、Clipboard、Web Share Target。
- [ ] MediaRecorder、Speech Recognition、波形。
- [ ] 推薦引擎與推薦快取。
- [ ] 匯出／匯入（先做不含 token 的 JSON 匯出；加密是 P1）。

**P2（先不做）**

- [ ] QR Code。
- [ ] 使用者自訂 Provider、WebLLM、多搜尋引擎。
- [ ] 多 provider 切換 UI。
- [ ] 音訊視覺化。

### AX3. B3：內容工程要獨立時間盒

F2 要求「每個主題至少 20 句」× 17 主題 ×（中文意思＋可替換欄位＋短版／自然版＋使用場合＋常見錯誤＋可播放文字）≈ **2000 個內容欄位**。這是撰寫與校稿工作，不是功能項目。

- [ ] 第一版只做 3 個 TopicPack（見 AX2），並把內容負責人與完成定義寫下來。
- [ ] 單一 TopicPack 的完成定義：20 句、每句有中文意思、每句有可替換欄位、每句能被 TTS 正確朗讀（實機聽過）。
- [ ] 內建內容與使用者自訂內容分開儲存，版本更新不得覆蓋使用者資料（既有規則保留）。

### AX4. 成功指標（要能測的，不是四週後的結果）

「連續四週後能完成 10 分鐘工作對話」是**結果指標，本產品無法自動測量**，不要當上線門檻。改成每兩週一次自我評量 + 使用者自己回聽一段 2 分鐘錄音。

上線後看的 leading indicators：

| 指標 | 目標 |
|---|---|
| onboarding → 完成第一輪 90 秒的比例 | ≥ 60% |
| 開啟 app 到第一句發聲的時間 | ≤ 20 秒 |
| 7 天內練習 ≥ 3 天的使用者比例 | 持續上升 |
| 單次練習平均時長 | 落在 3–15 分鐘 |
| 修復句使用後成功續聊的比例 | 有追蹤即可 |
| AI 請求失敗率 | < 5%，其中 `cors-blocked` 必須是 **0** |

### AX5. 上線門檻（launch gate）

- [ ] MiMo CORS 結論已出，且已決定走 A / B / C 哪一條。
- [ ] 無 token 模式可完成完整 90 秒流程。
- [ ] 自動化測試證明 token 不出現在 URL / console / Cache API / export。
- [ ] Chrome 桌面、Android Chrome、iOS Safari 三者實機跑過播放與麥克風。
- [ ] PWA 可安裝、離線可開、離線可複習。
- [ ] 鍵盤可完成一輪練習；不只用顏色標示狀態；錯誤訊息全部走人話對照表。
- [ ] repo 無秘密（secret scan 通過）。

### AX6. 風險表新增列

| 風險 | 等級 | 對策 |
|---|---|---|
| ~~MiMo 不支援瀏覽器 CORS~~ | ~~高~~ **已解除** | 2026-10-02 實測：`access-control-allow-origin: *`，可直連（AS1） |
| key 被 XSS 讀走後任何網站都能用 | 高 | `access-control-allow-origin: *` 無法擋；只能靠 CSP、不碰 `innerHTML`、token 不進明文儲存（AS2） |
| 內容量遠大於程式量 | 高 | 第一版只做 3 個 TopicPack，獨立時間盒 |
| 單人開發時間不足 | 高 | 只做 P0；維持每兩週有可跑版本 |
| Android SpeechSynthesis 品質差異 | 中 | 實機測試；提供語音選擇與速度調整；不承諾口音 |
| Speech Recognition 會把音訊送到瀏覽器廠商 | 中 | 預設關閉並明講隱私；保留文字輸入 |
| MiMo 模型下架或 API 變動 | 中 | adapter 隔離 + `docs/mimo-contract.md` + `healthCheck()` |
| 過早抽象拖慢第一個可跑版本 | 中 | 只建縫不建 registry（AT） |

## AY. 工程實務補齊

- [ ] CI 一個指令跑完：typecheck + lint + unit test + build + secret scan。
- [ ] 加 Lighthouse CI（PWA installable、離線、可存取性分數）。
- [ ] AI 回應一律通過 schema validator（zod 或 JSON Schema）才准進 UI 與 IndexedDB。
- [ ] `PromptProfile` 加 `version`；練習紀錄只存 prompt version（不存 prompt 內容），方便日後調 prompt 而不混淆舊紀錄。
- [ ] opt-in 的本地診斷 log，內容必須遮罩過，可匯出給自己除錯。
- [ ] 匯出檔要有 `schemaVersion`，匯入要能讀舊版。
- [ ] **檔案樹已經不一致**：`src/features/`、`src/practice/`、`src/content/`、`src/lookup/` 三套並存（原始檔樹、L、AA 各寫各的）。收斂成一份，並以 AT3 的分層為準。

## AZ. 唯一開發順序（取代 §P 與 §AD）

1. [x] ~~MiMo CORS + contract spike~~ — **已完成**。CORS 可直連，合約見 `docs/mimo-contract.md`。後續 AI 工作沒有可行性阻礙。
2. [ ] PWA 骨架 + GitHub Pages + Service Worker。
3. [ ] IndexedDB + `PhraseCard` + 複習排程。
4. [ ] SpeechSynthesis 播放 + 速度／音量／重播。
5. [ ] 3 個 TopicPack + 90 秒無 token 練習。
6. [ ] 查詢入口（Google Translate + 字典 + 播放 + 加入句庫）。
7. [ ] `AiProvider` 介面 + `AiGateway` + `MiMoProvider`（healthCheck → chat → error → JSON → stream）。
8. [ ] 90 秒有 token 練習 + 每回合最多三項修正。
9. [ ] Token vault（memory / session / device-encrypted）。
10. [ ] 錯誤人話化 + 可存取性 + 安全測試 + CI。
11. [ ] 匯出／匯入。
12. [ ] 通過 AX5 上線門檻後部署。

## BA. 本次檢視限制

**更正**：先前版本寫「本次環境無法讀取 MiMo API 內文、受網路政策阻擋」，這是**錯的**。實際狀況是：

- 網路本身通 — `curl` 對 `mimo.mi.com`、`mimo.xiaomi.com`、`aistudio.xiaomimimo.com` 全部回 HTTP 200。
- 掛掉的是工具，不是網路：`open-websearch` MCP 因 Node 版本不符而 crash（`ReferenceError: File is not defined`，Node 18 缺 `File` 全域）；`WebFetch` 被 claude.ai 的網域驗證擋下；Playwright 在此環境對任何網站都失敗。
- MiMo 文件站是 SPA，所以抓 HTML 拿不到正文；但 `/static/docs/**/*.md` 是靜態 markdown，`curl` 直接可讀，索引在 `https://mimo.mi.com/llms.txt`。

因此 **`baseUrl`、`chatPath`、auth header、model id、錯誤碼、rate limit、CORS 全部已確認**，寫在 `docs/mimo-contract.md`。

仍未確認（不影響第一版）：

- streaming 的 SSE 事件欄位逐項格式。
- Structured Output 的確切欄位名與支援模型範圍。
- ASR（`mimo-v2.5-asr`）與 TTS（`mimo-v2.5-tts`）的請求格式，以及是否同樣開放瀏覽器 CORS。
- 服務條款中關於瀏覽器直連與使用者自帶 key 的規定。

其他：

- 本次只補 TODO、架構判斷與優先順序，未撰寫任何 source code。
- 本檔的 markdown 跳脫字元（反斜線加反引號、反斜線加右括號、反斜線加 `${`）已修正為正常 markdown，文字內容未改動；備份為 `readme.md.bak`。

---

# 補充 TODO：AI 結構化資料應用（v0.3.0）

## 核心原則

**AI 是資料產生器，不是聊天對象。** App 控制流程，AI 只產出結構化 JSON，App 拿這個 JSON 驅動下一步。使用者看到的是練習、測驗、情境任務，不是聊天視窗。

## AR2. 弱點分析 + 針對性練習

- [x] App 從 reviewQueue 取得評分為 hard 或到期的句子
- [x] App 從 practiceSessions 取得最近練習紀錄
- [x] 將資料 + 指定 JSON schema 傳給 AI
- [x] AI 回傳 `WeaknessAnalysis`：弱點句子、弱點模式、建議主題
- [ ] 首頁顯示「🎯 今日弱點」卡片（改為情境任務入口）
- [x] 點擊進入針對性練習（只練弱點句子，不是隨機 10 句）
- [x] 離線時用本地模板（顯示評分為 hard 的句子，不用 AI）

## AR3. 填空測驗

- [x] 從 phraseCards 選取句子（優先弱點句）
- [x] AI 生成填空題（挖空關鍵字 + 答案 + 提示）
- [x] 使用者輸入答案 → 本地比對或 AI 評分
- [x] 答對加分 + 短期不再出現
- [x] 答錯加權複習
- [x] 離線時用模板挖空（固定挖數字/動詞位置）

## AR4. 情境任務

- [x] AI 從弱點句子生成情境（主管問延遲、客戶問進度等）
- [x] 顯示情境卡：角色、場景、問題、期望關鍵句
- [x] 使用者輸入回答
- [x] AI 回傳 `Feedback`：正確性、分數、修正、下一題
- [x] 顯示評分 + 修正 + 追問
- [x] 連續 3 題完成後顯示小結

## AR5. 結構化 AI schema

```ts
interface WeaknessAnalysis {
  weakPhrases: string[];
  pattern: string;
  focusTopic: string;
  suggestedScenario: string;
}

interface QuizQuestion {
  type: 'fill-blank';
  phraseId: string;
  question: string;  // "I've been with the company for about ___ years."
  answer: string;    // "three"
  hint: string;
}

interface ScenarioTask {
  scenario: string;
  role: string;
  question: string;
  expectedKeyPhrases: string[];
  successCriteria: string;
}

interface AiFeedback {
  correct: boolean;
  score: number;
  corrections: string[];
  nextQuestion: string;
  improvementTip: string;
}
```

## AR6. AI Gateway 新增方法

- [x] `analyzeWeakness(reviews, sessions): Promise<WeaknessAnalysis>`
- [x] `generateQuiz(phrases): Promise<QuizQuestion[]>`
- [x] `generateScenario(weakPhrases): Promise<ScenarioTask>`
- [x] `scoreResponse(userResponse, expectedPhrases): Promise<AiFeedback>`
- [x] 每個方法：建 prompt + 指定 schema → aiChat → parseAiJson → 回傳型別

## AR7. 測試

- [x] 弱點分析正確讀取本地資料
- [x] 填空題答案正確比對
- [x] 情境任務可完成（輸入 → 評分 → 下一題）
- [x] 離線時降級為本地模板
- [x] AI 回應格式錯誤時 fallback 為純文字
- [ ] token 不出現在 console 或 URL
