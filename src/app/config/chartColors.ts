import type { LocalizationStatus, MetricIntent, ScriptStatus, Severity, ValidationTone } from '@/types';

export const STATUS_COLORS: Record<ScriptStatus | LocalizationStatus, string> = {
  intake: '#6C7A89',
  generated: '#2E7FA8',
  'needs-author-fix': '#BF3D31',
  'editorial-review': '#B86F14',
  'revision-requested': '#6D62A8',
  approved: '#1F8A64',
  ingested: '#6C7A89',
  translating: '#2E7FA8',
  validation: '#B86F14',
  review: '#6D62A8',
  published: '#1F8A64',
  blocked: '#BF3D31',
};

export const STATUS_LABELS: Record<ScriptStatus | LocalizationStatus, string> = {
  intake: 'Intake',
  generated: 'Generated',
  'needs-author-fix': 'Needs fix',
  'editorial-review': 'Editorial review',
  'revision-requested': 'Revision requested',
  approved: 'Approved',
  ingested: 'Ingested',
  translating: 'Translating',
  validation: 'Validation',
  review: 'Review',
  published: 'Published',
  blocked: 'Blocked',
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#BF3D31',
  warning: '#B86F14',
  info: '#2E7FA8',
};

export const VALIDATION_TONE_COLORS: Record<ValidationTone, string> = {
  green: '#1F8A64',
  amber: '#B86F14',
  red: '#BF3D31',
};

export const INTENT_COLORS: Record<MetricIntent, string> = {
  positive: '#1F8A64',
  negative: '#BF3D31',
  neutral: '#697785',
};

export const CHART_PALETTE = [
  '#0069A6',
  '#F7941D',
  '#1F8A64',
  '#6D62A8',
  '#BF3D31',
  '#4F7D7A',
  '#B86F14',
  '#6C7A89',
];

export const SERIES_COLORS = {
  script: '#0069A6',
  localization: '#F7941D',
  saved: '#1F8A64',
  baseline: '#9AA5B1',
};
