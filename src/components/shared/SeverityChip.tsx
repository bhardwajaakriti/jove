import { Box, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { Severity } from '@/types';
import { SEVERITY_COLORS } from '@/app/config/chartColors';
import { sentenceCase } from '@/utils/format';

export function SeverityChip({ severity }: { severity: Severity }) {
  const color = SEVERITY_COLORS[severity];
  return (
    <Chip
      size="small"
      label={sentenceCase(severity)}
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
