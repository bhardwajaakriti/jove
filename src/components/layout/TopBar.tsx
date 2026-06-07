import {
  AppBar,
  Box,
  Chip,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import { setSidebarOpen, toggleColorMode } from '@/app/store/uiSlice';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { APP_NAME, APP_SUBTITLE } from '@/constants/app';
import { dataSource } from '@/services/dataSourceRegistry';

export function TopBar() {
  const dispatch = useAppDispatch();
  const colorMode = useAppSelector((state) => state.ui.colorMode);
  const ModeIcon = colorMode === 'light' ? DarkModeRoundedIcon : LightModeRoundedIcon;

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          sx={{ mr: 1, display: { md: 'none' } }}
          onClick={() => dispatch(setSidebarOpen(true))}
          aria-label="Open navigation"
        >
          <MenuRoundedIcon />
        </IconButton>
        <ScienceRoundedIcon sx={{ color: 'secondary.main', mr: 1 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap>
            {APP_NAME}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
            {APP_SUBTITLE}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 'auto' }}>
          <Chip size="small" label={dataSource.label} variant="outlined" sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />
          <Tooltip title="Toggle theme">
            <IconButton onClick={() => dispatch(toggleColorMode())} aria-label="Toggle theme">
              <ModeIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
