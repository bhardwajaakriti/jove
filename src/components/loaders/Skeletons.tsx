import { Box, Skeleton, Stack } from '@mui/material';

export function KpiGridSkeleton() {
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <Skeleton key={idx} variant="rounded" height={132} />
      ))}
    </Box>
  );
}

export function ChartSkeleton({ height = 320 }: { height?: number }) {
  return <Skeleton variant="rounded" height={height} />;
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Stack spacing={1.25}>
      {Array.from({ length: rows }).map((_, idx) => (
        <Skeleton key={idx} variant="rounded" height={64} />
      ))}
    </Stack>
  );
}
