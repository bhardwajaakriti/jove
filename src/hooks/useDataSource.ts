import { dataSource } from '@/services/dataSourceRegistry';
import type { JoveDataSource } from '@/services/dataSource';

export function useDataSource(): JoveDataSource {
  return dataSource;
}
