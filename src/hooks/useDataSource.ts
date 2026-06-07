import { dataSource } from '@/services/dataSourceRegistry';
import type { WorkflowDataSource } from '@/services/dataSource';

export function useDataSource(): WorkflowDataSource {
  return dataSource;
}
