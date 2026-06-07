import { Box, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { LocalizationStatus, ScriptStatus } from '@/types';
import { STATUS_COLORS, STATUS_LABELS } from '@/app/config/chartColors';

export function StatusChip({
  status,
  size = 'small',
}: {
  status: ScriptStatus | LocalizationStatus;
  size?: 'small' | 'medium';
}) {
  const color = STATUS_COLORS[status];
  return (
    <Chip
      size={size}
      label={STATUS_LABELS[status]}
      icon={<Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, ml: 1 }} />}
      sx={{
        color,
        bgcolor: alpha(color, 0.12),
        border: `1px solid ${alpha(color, 0.3)}`,
        '& .MuiChip-icon': { ml: 0.75 },
      }}
    />
  );
}
