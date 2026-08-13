export interface DashboardStats {
    total_experiments: number;
    total_prompts: number;
    total_runs: number;
    total_results: number;
    total_models_executed: number;
    avg_latency_ms: number;
    avg_tokens: number;
    avg_cost: number;
  }
  
  export interface LeaderboardItem {
    rank: number;
    model: string;
    provider: string;
    evaluations: number;
    avg_latency_ms: number;
    avg_tokens: number;
    avg_cost: number;
  }
  
  export interface ModelAnalytics {
    model: string;
    runs: number;
    avg_latency_ms: number;
    avg_tokens: number;
  }
  
  export interface ModelMetrics {
    model: string;
    evaluations: number;
    min_latency: number;
    max_latency: number;
    avg_latency: number;
    total_tokens: number;
  }
  
  export interface ActivityItem {
    run_id: string;
    experiment_id: string;
    status: string;
    started_at: string;
    completed_at: string | null;
    selected_models: string[];
  }
  
  export interface Experiment {
    id: string;
    title: string;
    description: string | null;
    status: string;
    created_at: string;
  }

  export interface EvaluationResult {
    id: string;
    evaluation_run_id: string;
    prompt_id: string;
  
    model_name: string;
    provider: string;
  
    response_text: string;
  
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  
    latency_ms: number;
    cost: number;
  
    created_at: string;
  
    // Quality scores
    relevance_score: number;
    correctness_score: number;
    coherence_score: number;
    instruction_following_score: number;
    overall_score: number;
  }