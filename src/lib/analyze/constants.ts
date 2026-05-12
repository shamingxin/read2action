/** 与产品确认：单段文本上限（字符数，与 docs/08 及立项一致） */
export const ANALYZE_MAX_TEXT_CHARS = 12_000;

/** 上游 chat.completions 请求超时（毫秒）；超时返回 MODEL_TIMEOUT + HTTP 504 */
export const ANALYZE_MODEL_TIMEOUT_MS = 90_000;

/** OpenAI-compatible 默认基址（未设置 AI_BASE_URL 时使用） */
export const DEFAULT_AI_BASE_URL = "https://api.openai.com/v1";
