import { Box, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import { NavLink } from 'react-router-dom';
import { MODULE_NAV_ITEMS, type ModuleNavItem } from '@/constants/modules';

const ICONS: Record<ModuleNavItem['icon'], typeof DashboardRoundedIcon> = {
  dashboard: DashboardRoundedIcon,
  script: DescriptionRoundedIcon,
  editorial: FactCheckRoundedIcon,
  language: TranslateRoundedIcon,
};

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Toolbar sx={{ px: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h6" sx={{ color: 'primary.main', lineHeight: 1 }}>
            JoVE
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
            AI Ops
          </Typography>
        </Box>
      </Toolbar>
      <List sx={{ px: 1 }}>
        {MODULE_NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <ListItemButton
              key={item.id}
              component={NavLink}
              to={item.route}
              end={item.route === '/'}
              onClick={onNavigate}
              sx={{
                borderRadius: 1,
                mb: 0.75,
                minHeight: 68,
                alignItems: 'flex-start',
                color: 'text.secondary',
                borderLeft: '3px solid transparent',
                '&.active': {
                  bgcolor: 'primary.light',
                  color: 'primary.dark',
                  borderLeftColor: 'secondary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                secondary={item.description}
                primaryTypographyProps={{ fontWeight: 800, fontSize: 14 }}
                secondaryTypographyProps={{
                  fontSize: 11,
                  lineHeight: 1.25,
                  sx: {
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </>
  );
}
