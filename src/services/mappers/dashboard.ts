import type {
  ActivityEntry,
  DashboardFilters,
  DashboardSummary,
  KpiMetric,
  LocalizationJob,
  PipelinePoint,
  ScriptSubmission,
  ThroughputPoint,
  ValidationMixPoint,
  WorkQueueItem,
} from '@/types';

function includesOrAll<T extends string>(selected: T[] | undefined, value: T): boolean {
  return !selected?.length || selected.includes(value);
}

function includesStringOrAll(selected: string[] | undefined, value: string): boolean {
  return !selected?.length || selected.includes(value);
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number, dp = 0): number {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
}

export function filterScripts(
  submissions: ScriptSubmission[],
  filters: Partial<DashboardFilters> = {},
): ScriptSubmission[] {
  return submissions.filter(
    (item) =>
      includesOrAll(filters.subjectAreas, item.subjectArea) &&
      includesStringOrAll(filters.statuses, item.status),
  );
}

export function filterLocalizationJobs(
  jobs: LocalizationJob[],
  filters: Partial<DashboardFilters> = {},
): LocalizationJob[] {
  return jobs.filter(
    (item) =>
      includesOrAll(filters.subjectAreas, item.subjectArea) &&
      includesOrAll(filters.languages, item.targetLanguage) &&
      includesStringOrAll(filters.statuses, item.status),
  );
}

function metric(
  id: string,
  label: string,
  value: number,
  unit: KpiMetric['unit'],
  deltaPct: number,
  intent: KpiMetric['intent'],
  hint: string,
): KpiMetric {
  return {
    id,
    label,
    value,
    unit,
    deltaPct,
    trend: deltaPct > 0 ? 'up' : deltaPct < 0 ? 'down' : 'flat',
    intent,
    hint,
  };
}

function buildPipeline(scripts: ScriptSubmission[], jobs: LocalizationJob[]): PipelinePoint[] {
  return [
    {
      stage: 'Intake',
      scriptCount: scripts.filter((s) => s.status === 'intake').length,
      localizationCount: jobs.filter((j) => j.status === 'ingested').length,
    },
    {
      stage: 'AI draft',
      scriptCount: scripts.filter((s) => s.status === 'generated').length,
      localizationCount: jobs.filter((j) => j.status === 'translating').length,
    },
    {
      stage: 'Validation',
      scriptCount: scripts.filter((s) => s.status === 'needs-author-fix').length,
      localizationCount: jobs.filter((j) => j.status === 'validation' || j.status === 'blocked').length,
    },
    {
      stage: 'Review',
      scriptCount: scripts.filter((s) => s.status === 'editorial-review' || s.status === 'revision-requested').length,
      localizationCount: jobs.filter((j) => j.status === 'review').length,
    },
    {
      stage: 'Approved',
      scriptCount: scripts.filter((s) => s.status === 'approved').length,
      localizationCount: jobs.filter((j) => j.status === 'published').length,
    },
  ];
}

function buildValidationMix(
  scripts: ScriptSubmission[],
  jobs: LocalizationJob[],
): ValidationMixPoint[] {
  const red = scripts.reduce((sum, item) => sum + item.redFlags, 0) +
    jobs.reduce((sum, item) => sum + item.criticalIssues, 0);
  const amber = scripts.reduce((sum, item) => sum + item.amberFlags, 0) +
    jobs.reduce((sum, item) => sum + item.warningIssues, 0);
  const green = scripts.reduce((sum, item) => sum + item.greenChecks, 0) +
    jobs.reduce((sum, item) => sum + Math.max(0, Math.round(item.validationScore / 12)), 0);

  return [
    { name: 'Pass', value: green, tone: 'green' },
    { name: 'Review', value: amber, tone: 'amber' },
    { name: 'Required fix', value: red, tone: 'red' },
  ];
}

function buildThroughput(
  scripts: ScriptSubmission[],
  jobs: LocalizationJob[],
): ThroughputPoint[] {
  const weeks = ['May 04', 'May 11', 'May 18', 'May 25', 'Jun 01'];
  const scriptBase = Math.max(6, Math.round(scripts.length / 5));
  const assetBase = Math.max(40, Math.round(jobs.reduce((sum, job) => sum + job.assetCount, 0) / 5));
  return weeks.map((week, idx) => ({
    week,
    submissions: Math.max(2, Math.round(scriptBase * (0.78 + idx * 0.08))),
    localizedAssets: Math.max(12, Math.round(assetBase * (0.7 + idx * 0.12))),
    editorHoursSaved: Math.max(18, Math.round((scriptBase * 3.5 + assetBase * 0.28) * (0.8 + idx * 0.1))),
  }));
}

function buildWorkQueue(
  scripts: ScriptSubmission[],
  jobs: LocalizationJob[],
): WorkQueueItem[] {
  const scriptItems: WorkQueueItem[] = scripts
    .filter((item) => item.redFlags > 0 || item.validationScore < 78)
    .map((item) => ({
      id: item.id,
      feature: 'Script Generator',
      title: item.title,
      owner: item.owner,
      score: item.validationScore,
      blockerCount: item.redFlags,
      route: `/editorial/${item.id}`,
    }));

  const localizationItems: WorkQueueItem[] = jobs
    .filter((item) => item.criticalIssues > 0 || item.validationScore < 82)
    .map((item) => ({
      id: item.id,
      feature: 'Localization Engine',
      title: `${item.title} - ${item.targetLanguage}`,
      owner: item.reviewer,
      score: item.validationScore,
      blockerCount: item.criticalIssues,
      route: `/localization/${item.id}`,
    }));

  return [...scriptItems, ...localizationItems]
    .sort((a, b) => b.blockerCount - a.blockerCount || a.score - b.score)
    .slice(0, 6);
}

export function buildDashboardSummary(
  submissions: ScriptSubmission[],
  jobs: LocalizationJob[],
  activity: ActivityEntry[],
  filters: Partial<DashboardFilters> = {},
): DashboardSummary {
  const scripts = filterScripts(submissions, filters);
  const localizationJobs = filterLocalizationJobs(jobs, filters);
  const scriptScore = avg(scripts.map((item) => item.validationScore));
  const localizationScore = avg(localizationJobs.map((item) => item.validationScore));
  const completionRate =
    scripts.length === 0 ? 0 : (scripts.filter((item) => item.status === 'approved').length / scripts.length) * 100;
  const publishedAssets = localizationJobs
    .filter((item) => item.status === 'published')
    .reduce((sum, item) => sum + item.assetCount, 0);
  const hoursSaved =
    scripts.reduce((sum, item) => sum + item.timeSavedHours, 0) +
    localizationJobs.reduce((sum, item) => sum + item.assetCount * 0.42, 0);
  const criticalIssues =
    scripts.reduce((sum, item) => sum + item.redFlags, 0) +
    localizationJobs.reduce((sum, item) => sum + item.criticalIssues, 0);

  return {
    metrics: [
      metric(
        'completion',
        'Submission completion',
        round(completionRate, 1),
        'percent',
        14.2,
        'positive',
        'Author starts to JoVE-ready drafts',
      ),
      metric(
        'scriptScore',
        'Script validation score',
        round(scriptScore, 1),
        'score',
        9.8,
        'positive',
        'Style guide, section, and protocol checks',
      ),
      metric(
        'localizedAssets',
        'Localized assets',
        publishedAssets,
        'assets',
        22.4,
        'positive',
        'Published in target languages',
      ),
      metric(
        'hoursSaved',
        'Editor hours saved',
        round(hoursSaved, 0),
        'hours',
        31.6,
        'positive',
        'Compared with historical manual workflow',
      ),
      metric(
        'localizationQuality',
        'Localization QA score',
        round(localizationScore, 1),
        'score',
        7.1,
        'positive',
        'Terminology and template preservation',
      ),
      metric(
        'criticalIssues',
        'Critical fixes open',
        criticalIssues,
        'number',
        -18.5,
        criticalIssues === 0 ? 'positive' : 'negative',
        'Must be cleared before submission or publish',
      ),
    ],
    pipeline: buildPipeline(scripts, localizationJobs),
    validationMix: buildValidationMix(scripts, localizationJobs),
    throughput: buildThroughput(scripts, localizationJobs),
    workQueue: buildWorkQueue(scripts, localizationJobs),
    activity: activity.slice(0, 8),
  };
}
