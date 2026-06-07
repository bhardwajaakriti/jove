import type {
  ActivityEntry,
  DashboardFilters,
  DashboardSummary,
  FilterOptions,
  GeneratedScriptDraft,
  LocalizationDetail,
  LocalizationJob,
  Paginated,
  QueueQuery,
  ScriptDetail,
  ScriptGenerationInput,
  ScriptSubmission,
} from '@/types';

/**
 * Single frontend data contract. Pages depend on this interface only, never on
 * bundled fixture files or fetch, mirroring the data-loading pattern in agentic_hub_coworkers.
 */
export interface WorkflowDataSource {
  readonly id: string;
  readonly label: string;

  getDashboardSummary(filters?: Partial<DashboardFilters>): Promise<DashboardSummary>;
  getScriptSubmissions(query?: QueueQuery): Promise<Paginated<ScriptSubmission>>;
  getScriptSubmission(id: string): Promise<ScriptDetail | null>;
  getLocalizationJobs(query?: QueueQuery): Promise<Paginated<LocalizationJob>>;
  getLocalizationJob(id: string): Promise<LocalizationDetail | null>;
  getFilterOptions(): Promise<FilterOptions>;
  getActivity(params?: { limit?: number }): Promise<ActivityEntry[]>;
  generateScriptDraft(input: ScriptGenerationInput): Promise<GeneratedScriptDraft>;
}
