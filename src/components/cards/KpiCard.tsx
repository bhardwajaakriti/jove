import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import type { KpiMetric } from '@/types';
import { INTENT_COLORS } from '@/app/config/chartColors';
import { formatMetric, formatSignedPercent } from '@/utils/format';

export function KpiCard({ metric }: { metric: KpiMetric }) {
  const intentColor = INTENT_COLORS[metric.intent];
  const TrendIcon =
    metric.trend === 'down' ? ArrowDownwardRoundedIcon : metric.trend === 'flat' ? RemoveRoundedIcon : ArrowUpwardRoundedIcon;

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: intentColor }} />
      <CardContent sx={{ height: '100%', pl: 2.25 }}>
        <Stack spacing={1.1} sx={{ height: '100%', minHeight: 122 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
            {metric.label}
          </Typography>
          <Typography variant="h5" sx={{ color: 'text.primary', lineHeight: 1.1 }}>
            {formatMetric(metric.value, metric.unit)}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 'auto', minWidth: 0 }}>
            {typeof metric.deltaPct === 'number' && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.25,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  color: intentColor,
                  bgcolor: alpha(intentColor, 0.12),
                }}
              >
                <TrendIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  {formatSignedPercent(metric.deltaPct)}
                </Typography>
              </Box>
            )}
            {metric.hint && (
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.25, minWidth: 0 }}>
                {metric.hint}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
