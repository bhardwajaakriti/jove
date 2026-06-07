import type { WorkflowDataSource } from '@/services/dataSource';
import { MockDataSource } from '@/services/adapters/data-sources/mockDataSource';

export type DataSourceKey = 'mock';

const FACTORIES: Record<DataSourceKey, () => WorkflowDataSource> = {
  mock: () => new MockDataSource(),
};

function resolveDataSource(): WorkflowDataSource {
  const requested = (import.meta.env.VITE_WORKFLOW_DATA_SOURCE ?? 'mock').toLowerCase();
  const isKnown = requested in FACTORIES;
  if (!isKnown) {
    console.warn(
      `[dataSource] Unknown VITE_WORKFLOW_DATA_SOURCE="${requested}" - falling back to "mock".`,
    );
  }
  const source = FACTORIES[(isKnown ? requested : 'mock') as DataSourceKey]();
  console.info(`[dataSource] Active source: "${source.id}" - ${source.label}`);
  return source;
}

export const dataSource: WorkflowDataSource = resolveDataSource();
