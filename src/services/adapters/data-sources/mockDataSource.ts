import type { JoveDataSource } from '@/services/dataSource';
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
import { buildDashboardSummary } from '@/services/mappers/dashboard';
import { queryLocalizationJobs, queryScriptSubmissions } from '@/services/mappers/query';
import { buildGeneratedDraft } from '@/services/mappers/scriptDraft';

const BASE = `${import.meta.env.BASE_URL}mock-data`;
const MOCKS_ENABLED = import.meta.env.VITE_ENABLE_MOCKS !== 'false';

type LatencyTier = 'fast' | 'normal' | 'heavy';
const TIER_RANGE_MS: Record<LatencyTier, [number, number]> = {
  fast: [160, 340],
  normal: [320, 680],
  heavy: [540, 980],
};

const LATENCY_FACTOR = (() => {
  switch ((import.meta.env.VITE_MOCK_LATENCY ?? 'normal').toLowerCase()) {
    case 'off':
      return 0;
    case 'fast':
      return 0.45;
    case 'slow':
      return 1.75;
    default:
      return 1;
  }
})();

function delay(tier: LatencyTier = 'normal'): Promise<void> {
  if (!MOCKS_ENABLED || LATENCY_FACTOR === 0) return Promise.resolve();
  const [min, max] = TIER_RANGE_MS[tier];
  let ms = (min + Math.random() * (max - min)) * LATENCY_FACTOR;
  if (Math.random() < 0.08) ms += 300 + Math.random() * 650;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`Mock fetch failed: ${path} (${res.status})`);
  return (await res.json()) as T;
}

function once<T>(loader: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | undefined;
  return () => (promise ??= loader());
}

export class MockDataSource implements JoveDataSource {
  readonly id = 'mock';
  readonly label = 'Mock data (bundled JSON)';

  private loadScripts = once(async () => {
    const data = await fetchJson<{ items: ScriptSubmission[] }>('script-submissions/index.json');
    return data.items;
  });

  private loadLocalizationJobs = once(async () => {
    const data = await fetchJson<{ items: LocalizationJob[] }>('localization-jobs/index.json');
    return data.items;
  });

  private loadFilterOptions = once(() => fetchJson<FilterOptions>('filter-options.json'));
  private loadActivity = once(() => fetchJson<ActivityEntry[]>('activity.json'));

  async getDashboardSummary(
    filters: Partial<DashboardFilters> = {},
  ): Promise<DashboardSummary> {
    await delay('heavy');
    const [scripts, jobs, activity] = await Promise.all([
      this.loadScripts(),
      this.loadLocalizationJobs(),
      this.loadActivity(),
    ]);
    return buildDashboardSummary(scripts, jobs, activity, filters);
  }

  async getScriptSubmissions(query: QueueQuery = {}): Promise<Paginated<ScriptSubmission>> {
    await delay('normal');
    const submissions = await this.loadScripts();
    return queryScriptSubmissions(submissions, query);
  }

  async getScriptSubmission(id: string): Promise<ScriptDetail | null> {
    await delay('fast');
    try {
      return await fetchJson<ScriptDetail>(`script-details/${id}.json`);
    } catch (error) {
      console.warn(`[mockDataSource] Missing script detail for ${id}`, error);
      return null;
    }
  }

  async getLocalizationJobs(query: QueueQuery = {}): Promise<Paginated<LocalizationJob>> {
    await delay('normal');
    const jobs = await this.loadLocalizationJobs();
    return queryLocalizationJobs(jobs, query);
  }

  async getLocalizationJob(id: string): Promise<LocalizationDetail | null> {
    await delay('fast');
    try {
      return await fetchJson<LocalizationDetail>(`localization-details/${id}.json`);
    } catch (error) {
      console.warn(`[mockDataSource] Missing localization detail for ${id}`, error);
      return null;
    }
  }

  async getFilterOptions(): Promise<FilterOptions> {
    await delay('fast');
    return this.loadFilterOptions();
  }

  async getActivity(params: { limit?: number } = {}): Promise<ActivityEntry[]> {
    await delay('fast');
    const activity = await this.loadActivity();
    return params.limit ? activity.slice(0, params.limit) : activity;
  }

  async generateScriptDraft(input: ScriptGenerationInput): Promise<GeneratedScriptDraft> {
    await delay('heavy');
    return buildGeneratedDraft(input);
  }
}
