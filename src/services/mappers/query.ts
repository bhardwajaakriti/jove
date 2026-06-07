import type {
  LocalizationJob,
  Paginated,
  QueueQuery,
  ScriptSubmission,
} from '@/types';

export function paginate<T>(items: T[], page = 1, pageSize = 12): Paginated<T> {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const start = (safePage - 1) * safePageSize;
  return {
    items: items.slice(start, start + safePageSize),
    page: safePage,
    pageSize: safePageSize,
    total: items.length,
  };
}

function includesOrAll<T extends string>(selected: T[] | undefined, value: T): boolean {
  return !selected?.length || selected.includes(value);
}

function includesStringOrAll(selected: string[] | undefined, value: string): boolean {
  return !selected?.length || selected.includes(value);
}

export function queryScriptSubmissions(
  submissions: ScriptSubmission[],
  query: QueueQuery = {},
): Paginated<ScriptSubmission> {
  const q = query.search?.trim().toLowerCase();
  const filtered = submissions.filter((item) => {
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q) ||
      item.institution.toLowerCase().includes(q);
    return (
      matchesSearch &&
      includesOrAll(query.filters?.subjectAreas, item.subjectArea) &&
      includesOrAll(query.filters?.videoTypes, item.videoType) &&
      includesStringOrAll(query.filters?.statuses, item.status)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (query.sortBy === 'oldest') return a.submittedAt.localeCompare(b.submittedAt);
    if (query.sortBy === 'score') return a.validationScore - b.validationScore;
    if (query.sortBy === 'blockers') return b.redFlags - a.redFlags;
    return b.submittedAt.localeCompare(a.submittedAt);
  });

  return paginate(sorted, query.page, query.pageSize);
}

export function queryLocalizationJobs(
  jobs: LocalizationJob[],
  query: QueueQuery = {},
): Paginated<LocalizationJob> {
  const q = query.search?.trim().toLowerCase();
  const filtered = jobs.filter((item) => {
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.course.toLowerCase().includes(q) ||
      item.market.toLowerCase().includes(q);
    return (
      matchesSearch &&
      includesOrAll(query.filters?.subjectAreas, item.subjectArea) &&
      includesOrAll(query.filters?.assetTypes, item.assetType) &&
      includesOrAll(query.filters?.languages, item.targetLanguage) &&
      includesOrAll(query.filters?.markets, item.market) &&
      includesStringOrAll(query.filters?.statuses, item.status)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (query.sortBy === 'oldest') return a.queuedAt.localeCompare(b.queuedAt);
    if (query.sortBy === 'score') return a.validationScore - b.validationScore;
    if (query.sortBy === 'critical') return b.criticalIssues - a.criticalIssues;
    return b.queuedAt.localeCompare(a.queuedAt);
  });

  return paginate(sorted, query.page, query.pageSize);
}
