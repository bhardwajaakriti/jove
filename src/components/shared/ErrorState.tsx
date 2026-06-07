import { Button, Stack, Typography } from '@mui/material';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';

export function ErrorState({ message = 'The mock data could not be loaded.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <Stack spacing={1.5} alignItems="flex-start" sx={{ p: 3 }}>
      <Typography variant="subtitle1">Something blocked this view</Typography>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
      {onRetry && (
        <Button size="small" variant="outlined" startIcon={<ReplayRoundedIcon />} onClick={onRetry}>
          Retry
        </Button>
      )}
    </Stack>
  );
}
