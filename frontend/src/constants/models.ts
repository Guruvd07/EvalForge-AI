export interface EvaluationModel {
    key: string;
    displayName: string;
    provider: string;
  }
  
  export const EVALUATION_MODELS: EvaluationModel[] = [
    {
      key: "deepseek-v3",
      displayName: "DeepSeek V3",
      provider: "OpenRouter",
    },
    {
      key: "deepseek-r1",
      displayName: "DeepSeek R1",
      provider: "OpenRouter",
    },
    {
      key: "qwen3",
      displayName: "Qwen 2.5 7B",
      provider: "OpenRouter",
    },
    {
      key: "gemma3",
      displayName: "Gemma 3",
      provider: "OpenRouter",
    },
    {
      key: "mistral-small",
      displayName: "Mistral Small",
      provider: "OpenRouter",
    },
  ];