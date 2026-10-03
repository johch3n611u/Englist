# MiMo API Contract（事實來源）

- 擷取時間：2026-10-02
- 擷取方式：`curl` 直接抓官方靜態文件 `https://mimo.mi.com/static/docs/**/*.md`（索引為 `https://mimo.mi.com/llms.txt`）+ 對 API host 實測 CORS
- 文件站是 SPA，MCP 抓不到正文；但 `/static/docs/` 是靜態 markdown，可直接讀取
- **本文件是 `src/ai/providers/mimo/*` 的唯一事實來源。程式中的 `baseUrl`、`chatPath`、model id、header 名稱一律以本文件為準，不得另行猜測。**

## 1. API 相容性

官方明確宣稱同時相容兩種格式，可直接沿用既有 SDK 的請求形狀：

- OpenAI API 相容
- Anthropic API 相容

> 這對本專案的意義：`NormalizedChatRequest` 可以直接映射到 OpenAI Chat Completions 形狀，不必自己發明請求格式。Anthropic 形狀作為第二選項備用。

## 2. Base URL

| 用途 | 協定 | Base URL | Key 格式 |
|---|---|---|---|
| Pay-as-you-go 即時推論 | OpenAI | `https://api.xiaomimimo.com/v1` | `sk-xxxxx` |
| Pay-as-you-go 即時推論 | Anthropic | `https://api.xiaomimimo.com/anthropic` | `sk-xxxxx` |
| Batch Inference | OpenAI | `https://batch-api-cn.xiaomimimo.com/v1` | `sk-xxxxx` |
| Token Plan | OpenAI | `https://token-plan-cn.xiaomimimo.com/v1` | 個人 `tp-xxxxx`／團隊 `ttp-xxxxx` |
| Token Plan | Anthropic | `https://token-plan-cn.xiaomimimo.com/anthropic` | 同上 |

> Token Plan 與 Pay-as-you-go 是**不同 host 與不同 key**，混用會得到 401。設定頁要讓使用者選方案，再決定 baseUrl 預設值。
> Batch API 不用於本專案（互動式練習需要即時回覆），列出僅供識別。

## 3. 認證

兩種 header 任選其一：

```http
api-key: $MIMO_API_KEY
```

```http
Authorization: Bearer $MIMO_API_KEY
```

兩者都在 CORS preflight 的 `access-control-allow-headers` 內，瀏覽器可直接使用。

API Key 建立位置：<https://platform.xiaomimimo.com/#/console/api-keys>
Token Plan 專用 Base URL 與 Key：<https://platform.xiaomimimo.com/#/console/plan-manage>
用量查詢：<https://platform.xiaomimimo.com/#/console/usage>

## 4. Chat Endpoint

```http
POST {baseUrl}/chat/completions
Content-Type: application/json
api-key: $MIMO_API_KEY
```

### 請求欄位

| 欄位 | 型別 | 說明 |
|---|---|---|
| `model` | string | 必填，見第 5 節 |
| `messages` | array | `role` 為 `system` / `user` / `assistant` |
| `max_completion_tokens` | integer | **注意欄位名不是 `max_tokens`** |
| `temperature` | number | 見第 6 節，各模型不同 |
| `top_p` | number | 見第 6 節 |
| `stream` | boolean | `false` 預設 |
| `stop` | string \| null | |
| `frequency_penalty` | number | |
| `presence_penalty` | number | |
| `tools` | array | function calling |
| `tool_choice` | string \| object | 例：`"auto"` |

### 最小範例

```bash
curl --location --request POST 'https://api.xiaomimimo.com/v1/chat/completions' \
--header "api-key: $MIMO_API_KEY" \
--header "Content-Type: application/json" \
--data-raw '{
    "model": "mimo-v2.6-flash",
    "messages": [
        {"role": "system", "content": "You are MiMo, an AI assistant developed by Xiaomi."},
        {"role": "user", "content": "please introduce yourself"}
    ],
    "max_completion_tokens": 1024,
    "temperature": 1.0,
    "top_p": 0.95,
    "stream": false
}'
```

## 5. 模型

| Model ID | 狀態 | 用途 |
|---|---|---|
| `mimo-v2.6-pro` | 現行 | 文字生成，能力較高 |
| `mimo-v2.6-flash` | 現行 | 文字生成，速度快、成本低 |
| `mimo-v2.6-pro-ultraspeed` | 現行（需接洽） | 極速輸出，額度客製 |
| `mimo-v2.5-pro` | **to be deprecated** | 不要用於新功能 |
| `mimo-v2.5` | **to be deprecated** | 不要用於新功能 |
| `mimo-v2.5-asr` | 現行 | 語音辨識（STT） |
| `mimo-v2.5-tts` | 現行 | 語音合成（TTS） |
| `mimo-v2.5-tts-voiceclone` | 現行 | 聲音複製 |
| `mimo-v2.5-tts-voicedesign` | 現行 | 聲音設計 |

**本專案建議**：練習對話用 `mimo-v2.6-flash`（快速、便宜，90 秒練習不需要最強模型），評語／修正可用 `mimo-v2.6-pro`。不要寫死在程式裡，放進 `MiMoConfig.model`。

動態清單：`GET {baseUrl}/models`

## 6. 參數範圍（各模型不同）

| Model ID | `temperature` | `top_p` |
|---|---|---|
| `mimo-v2.6-flash` | 預設 1.0，範圍 [0, 1.5] | 預設 0.95，範圍 [0.01, 1.0] |
| `mimo-v2.6-pro` | 同上 | 同上 |
| `mimo-v2.6-pro-ultraspeed` | 同上 | 同上 |
| `mimo-v2.5-pro`（待棄用） | 同上 | 同上 |
| `mimo-v2.5`（待棄用） | 同上 | 同上 |

**重要**：thinking mode 下，`mimo-v2.6-flash`、`mimo-v2.6-pro`、`mimo-v2.6-pro-ultraspeed`、`mimo-v2.5-pro`、`mimo-v2.5` **不支援自訂 `temperature` 與 `top_p`**，即使傳入也會被強制設為 1.0 與 0.95。

> 對 `PromptProfile.temperature` 的影響：不要在 UI 上承諾「可調整溫度」，或只在非 thinking 模式顯示該設定。

## 7. Rate Limit

以**帳號**為單位計算（同帳號下所有 API key 呼叫同一模型的總和）。

| 類別 | Model ID | RPM | TPM |
|---|---|---|---|
| 文字 | `mimo-v2.6-pro` | 100 | 10M |
| 文字 | `mimo-v2.6-flash` | 100 | 10M |
| 文字 | `mimo-v2.6-pro-ultraspeed` | 客製（需接洽） | 客製 |
| 文字 | `mimo-v2.5-pro` / `mimo-v2.5`（待棄用） | 100 | 10M |
| ASR | `mimo-v2.5-asr` | 100 | **10K** |
| TTS | `mimo-v2.5-tts` / `-voiceclone` / `-voicedesign` | 100 | 10M |

> ASR 的 TPM 只有 10K，遠低於文字模型。若接 ASR，必須另外做節流，不能沿用文字的重試策略。

## 8. 錯誤碼（官方）

| Code | 原因 | 對應本專案 `ProviderErrorCode` |
|---|---|---|
| 400 Invalid Format | 請求格式錯、參數缺漏或超界、model 不存在、multimodal 輸入不合規 | `invalid-model` 或 `unsupported-format` |
| 401 Authentication Fails | 缺／錯 API Key、header 格式錯、**Token Plan 與 PAYG 的 key 混用** | `invalid-token` |
| 402 Insufficient Balance | 帳戶餘額不足 | `quota-exceeded` |
| 403 Forbidden Access | 服務在該地區不可用，或 key 被風險控管限制 | `invalid-token` 或新增 `forbidden` |
| 404 Not Found | endpoint 或 model 不支援該能力（例如影像輸入） | `invalid-endpoint` / `unsupported-format` |
| 421 Content Filter | 內容審核攔截 | **`ProviderErrorCode` 目前沒有這一項，要新增** |
| 429 Too Many Requests | 請求過頻，或 Token Plan 額度用盡 | `rate-limited` |
| 500 Server Error | 服務端錯誤 | `unknown`（可重試） |
| 503 Server Overloaded | 服務過載 | `unknown`（可重試） |

官方建議：429 採用 exponential backoff + retry；降低請求頻率。

**需要修正既有設計**：`ProviderErrorCode` 要補 `insufficient-balance`（402）與 `content-filtered`（421）。402 與 429 是不同情境 — 402 是沒錢了，重試也沒用；429 才該退避重試。

## 9. CORS 實測結果（決定性）

對 API host 發出瀏覽器 preflight：

```http
OPTIONS /v1/chat/completions HTTP/2
Origin: https://30590.github.io
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type,api-key,authorization
```

回應（Pay-as-you-go 與 Token Plan 兩個 host 都相同）：

```http
HTTP/2 200
vary: Origin
vary: Access-Control-Request-Method
vary: Access-Control-Request-Headers
access-control-allow-origin: *
access-control-allow-methods: POST
access-control-allow-headers: content-type, api-key, authorization
access-control-max-age: 1800
server: MiFE/3.4.34
```

`GET /v1/models` 未帶 key 時回 401，**該 401 回應同樣帶 `access-control-allow-origin: *`**，代表錯誤回應的 body 可被瀏覽器 JavaScript 讀取。

### 結論

**結果 A 成立：GitHub Pages 上的純前端 PWA 可以直接呼叫 MiMo，不需要任何 proxy。**

- 不需要使用者自建 proxy
- 不需要改動「不自建後端」的硬約束
- 讀錯誤 body 可以做到，錯誤碼對照表有實作價值

### 安全意涵（不可忽略）

`access-control-allow-origin: *` 代表**任何網站**都可以帶著使用者的 key 呼叫 MiMo。key 一旦被 XSS 讀走就能被任意網站使用，而且 MiMo 不會擋。因此既有設計裡的 CSP、不使用 `innerHTML`、token 不進 localStorage 明文，全部維持必要，不可因「CORS 通了」而鬆懈。

## 10. 其他能力

- **Structured Output**：支援，見官方 `quick-start/usage-guide/text-generation/structured-output.md`。用於 `CoachReply` 的 JSON 回應。
- **Streaming**：支援 `stream: true`。詳細 SSE 事件格式未逐項確認，實作前需再抓 `api/chat/openai-api.md` 逐欄核對。
- **Thinking mode**：多輪 tool call 下會回傳 `reasoning_content` 欄位，官方建議後續請求把先前的 `reasoning_content` 一併傳回以維持最佳效果。多輪練習要保留這個欄位。
- **Web Search tool calling**、**Deep Thinking**、**Batch API**、**影像／音訊／影片理解**：皆有支援，本專案目前用不到。
- **ASR / TTS**：`api/audio/Speech-Recognition.md` 與 `api/audio/tts.md`，皆標示 OpenAI API 相容。這對 TODO 5（聽力與口說）有直接影響 — 不必只依賴瀏覽器的 Web Speech API。已下載待評估。

## 11. 仍未確認（實作前要補）

- [ ] streaming 的 SSE 事件欄位逐項確認（`api/chat/openai-api.md`，61KB 已下載待讀）
- [ ] Structured Output 的確切欄位名與支援的模型範圍
- [ ] ASR / TTS 的請求格式、音訊格式限制、是否支援瀏覽器直連 CORS
- [ ] Token Plan 是否與 PAYG 有不同 rate limit
- [ ] 服務條款中關於瀏覽器直連與使用者自帶 key 的規定
- [ ] 402 餘額不足時是否會回傳可判讀的 body

## 12. 參考文件索引

- <https://mimo.mi.com/llms.txt>（全部文件索引）
- <https://mimo.mi.com/llms-full.txt>（全文單檔）
- <https://mimo.mi.com/static/docs/quick-start/summary/first-api-call.md>
- <https://mimo.mi.com/static/docs/quick-start/summary/model.md>
- <https://mimo.mi.com/static/docs/api/chat/openai-api.md>
- <https://mimo.mi.com/static/docs/api/guidance/error-codes.md>
- <https://mimo.mi.com/static/docs/api/guidance/rate-limit.md>
- <https://mimo.mi.com/static/docs/api/guidance/model-hyperparameters.md>
- <https://mimo.mi.com/static/docs/quick-start/usage-guide/text-generation/structured-output.md>
- <https://mimo.mi.com/static/docs/api/model/list-models.md>
- <https://mimo.mi.com/static/docs/api/audio/tts.md>
- <https://mimo.mi.com/static/docs/api/audio/Speech-Recognition.md>
