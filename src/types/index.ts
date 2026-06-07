export type LoadStatus = 'loading' | 'success' | 'error';

export type SubjectArea =
  | 'Biology'
  | 'Chemistry'
  | 'Neuroscience'
  | 'Medicine'
  | 'Engineering'
  | 'Environmental Sciences';

export type VideoType = 'Research Journal' | 'Science Education';

export type ScriptStatus =
  | 'intake'
  | 'generated'
  | 'needs-author-fix'
  | 'editorial-review'
  | 'revision-requested'
  | 'approved';

export type LocalizationStatus =
  | 'ingested'
  | 'translating'
  | 'validation'
  | 'review'
  | 'published'
  | 'blocked';

export type AssetType = 'PPTX' | 'PDF' | 'DOCX' | 'SRT/VTT';

export type Language =
  | 'Spanish'
  | 'Mandarin'
  | 'Portuguese'
  | 'French'
  | 'German'
  | 'Japanese';

export type Severity = 'critical' | 'warning' | 'info';
export type ValidationTone = 'green' | 'amber' | 'red';
export type MetricIntent = 'positive' | 'negative' | 'neutral';
export type TrendDirection = 'up' | 'down' | 'flat';

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  unit: 'number' | 'percent' | 'hours' | 'score' | 'assets' | 'submissions';
  deltaPct?: number;
  trend?: TrendDirection;
  intent: MetricIntent;
  hint?: string;
}

export interface DashboardFilters {
  subjectAreas: SubjectArea[];
  statuses: string[];
  languages: Language[];
}

export interface QueueFilters extends DashboardFilters {
  videoTypes: VideoType[];
  assetTypes: AssetType[];
  markets: string[];
}

export interface FilterOptions {
  subjectAreas: SubjectArea[];
  scriptStatuses: ScriptStatus[];
  localizationStatuses: LocalizationStatus[];
  videoTypes: VideoType[];
  assetTypes: AssetType[];
  languages: Language[];
  markets: string[];
  owners: string[];
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface QueueQuery {
  filters?: Partial<QueueFilters>;
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
}

export interface ScriptSubmission {
  id: string;
  title: string;
  author: string;
  institution: string;
  subjectArea: SubjectArea;
  videoType: VideoType;
  sourceType: 'Paper upload' | 'Protocol notes' | 'Abstract paste' | 'DOCX upload';
  status: ScriptStatus;
  submittedAt: string;
  validationScore: number;
  redFlags: number;
  amberFlags: number;
  greenChecks: number;
  wordCount: number;
  completionPct: number;
  estimatedRevisionCycles: number;
  timeSavedHours: number;
  owner: string;
}

export interface ScriptSection {
  id: string;
  title: 'Introduction' | 'Protocol' | 'Representative Results' | 'Discussion';
  wordCount: number;
  qualityScore: number;
  locked: boolean;
  body: string;
}

export interface ValidationIssue {
  id: string;
  severity: Severity;
  title: string;
  location: string;
  recommendation: string;
}

export interface ScriptDetail {
  submission: ScriptSubmission;
  sourceSummary: string;
  styleGuideContext: string[];
  sections: ScriptSection[];
  validationIssues: ValidationIssue[];
  editorialNotes: string[];
}

export interface LocalizationJob {
  id: string;
  title: string;
  course: string;
  subjectArea: SubjectArea;
  assetType: AssetType;
  targetLanguage: Language;
  market: string;
  status: LocalizationStatus;
  queuedAt: string;
  assetCount: number;
  segmentCount: number;
  validationScore: number;
  criticalIssues: number;
  warningIssues: number;
  infoIssues: number;
  templatePreservationPct: number;
  glossaryAccuracyPct: number;
  overflowBoxes: number;
  reviewer: string;
  etaHours: number;
}

export interface TranslationSegment {
  id: string;
  source: string;
  translated: string;
  confidencePct: number;
  issue?: Severity;
}

export interface GlossaryTerm {
  source: string;
  target: string;
  subjectArea: SubjectArea;
  consistencyPct: number;
}

export interface LocalizationDetail {
  job: LocalizationJob;
  originalLayout: string;
  translatedLayout: string;
  segments: TranslationSegment[];
  validationIssues: ValidationIssue[];
  glossaryTerms: GlossaryTerm[];
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
  feature: 'Script Generator' | 'Localization Engine';
  title: string;
  detail: string;
  owner: string;
  severity: Severity;
}

export interface PipelinePoint {
  stage: string;
  scriptCount: number;
  localizationCount: number;
}

export interface ValidationMixPoint {
  name: string;
  value: number;
  tone: ValidationTone;
}

export interface ThroughputPoint {
  week: string;
  submissions: number;
  localizedAssets: number;
  editorHoursSaved: number;
}

export interface WorkQueueItem {
  id: string;
  feature: 'Script Generator' | 'Localization Engine';
  title: string;
  owner: string;
  score: number;
  blockerCount: number;
  route: string;
}

export interface DashboardSummary {
  metrics: KpiMetric[];
  pipeline: PipelinePoint[];
  validationMix: ValidationMixPoint[];
  throughput: ThroughputPoint[];
  workQueue: WorkQueueItem[];
  activity: ActivityEntry[];
}

export interface ScriptGenerationInput {
  title: string;
  subjectArea: SubjectArea;
  videoType: VideoType;
  sourceText: string;
}

export interface GeneratedScriptDraft {
  title: string;
  score: number;
  estimatedGenerationSeconds: number;
  timeSavedHours: number;
  sections: ScriptSection[];
  validationIssues: ValidationIssue[];
}
