import { Stack, Typography } from '@mui/material';

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Stack spacing={0.5} sx={{ p: 3 }} alignItems="flex-start">
      <Typography variant="subtitle1">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Stack>
  );
}
