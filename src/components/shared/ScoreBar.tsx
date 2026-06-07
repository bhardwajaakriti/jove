import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

export function ScoreBar({ value, label }: { value: number; label?: string }) {
  const theme = useTheme();
  const color =
    value >= 88 ? theme.palette.success.main : value >= 76 ? theme.palette.warning.main : theme.palette.error.main;
  return (
    <Stack spacing={0.75}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {label && (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
        )}
        <Typography variant="caption" sx={{ color, fontWeight: 800 }}>
          {value}/100
        </Typography>
      </Stack>
      <Box sx={{ height: 8, borderRadius: 99, bgcolor: alpha(theme.palette.text.primary, 0.08), overflow: 'hidden' }}>
        <Box sx={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', bgcolor: color }} />
      </Box>
    </Stack>
  );
}
