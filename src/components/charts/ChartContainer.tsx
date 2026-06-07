import { Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function ChartContainer({
  title,
  subtitle,
  height = 320,
  children,
}: {
  title: string;
  subtitle?: string;
  height?: number;
  children: ReactNode;
}) {
  return (
    <Card sx={{ height: 'auto' }}>
      <CardContent>
        <Stack spacing={0.25} sx={{ mb: 2, minHeight: subtitle ? 44 : 28 }}>
          <Typography variant="subtitle1">{title}</Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
        <div style={{ width: '100%', height }}>{children}</div>
      </CardContent>
    </Card>
  );
}
