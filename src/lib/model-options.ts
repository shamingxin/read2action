/** 当前本地仅接入默认模型；与服务端模型配置对齐 */
export const DEFAULT_MODEL_VALUE = "deepseek-chat" as const;

/** 首页 / 项目页模型展示（单选项，无切换能力） */
export const MODEL_OPTIONS = [
  { value: DEFAULT_MODEL_VALUE, label: "智能整理" },
] as const;
