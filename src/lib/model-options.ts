/** 当前本地仅接入 DeepSeek；与 `.env.local` 中 `AI_MODEL=deepseek-chat` 对齐 */
export const DEFAULT_MODEL_VALUE = "deepseek-chat" as const;

/** 首页 / 项目页模型展示（单选项，无切换能力） */
export const MODEL_OPTIONS = [
  { value: DEFAULT_MODEL_VALUE, label: "DeepSeek" },
] as const;
