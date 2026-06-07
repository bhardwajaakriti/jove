import type { JoveDataSource } from '@/services/dataSource';
import { MockDataSource } from '@/services/adapters/data-sources/mockDataSource';

export type DataSourceKey = 'mock';

const FACTORIES: Record<DataSourceKey, () => JoveDataSource> = {
  mock: () => new MockDataSource(),
};

function resolveDataSource(): JoveDataSource {
  const requested = (import.meta.env.VITE_JOVE_DATA_SOURCE ?? 'mock').toLowerCase();
  const isKnown = requested in FACTORIES;
  if (!isKnown) {
    console.warn(
      `[dataSource] Unknown VITE_JOVE_DATA_SOURCE="${requested}" - falling back to "mock".`,
    );
  }
  const source = FACTORIES[(isKnown ? requested : 'mock') as DataSourceKey]();
  console.info(`[dataSource] Active source: "${source.id}" - ${source.label}`);
  return source;
}

export const dataSource: JoveDataSource = resolveDataSource();
