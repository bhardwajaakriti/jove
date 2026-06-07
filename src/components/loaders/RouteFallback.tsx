import { Box, CircularProgress, Stack, Typography } from '@mui/material';

export function RouteFallback() {
  return (
    <Box sx={{ display: 'grid', minHeight: 360, placeItems: 'center' }}>
      <Stack spacing={1.5} alignItems="center">
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">
          Loading JoVE workflow
        </Typography>
      </Stack>
    </Box>
  );
}
