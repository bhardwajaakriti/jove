import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

interface MultiSelectFilterProps<T extends string> {
  label: string;
  options: T[];
  selected: T[];
  onChange: (values: T[]) => void;
  formatOption?: (value: T) => string;
}

export function MultiSelectFilter<T extends string>({
  label,
  options,
  selected,
  onChange,
  formatOption = (value) => value,
}: MultiSelectFilterProps<T>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const isAll = selected.length === 0;
  const summary = isAll ? 'All' : selected.length === 1 ? formatOption(selected[0]) : `${selected.length} selected`;

  const toggle = (value: T) => {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  return (
    <>
      <Button
        variant="outlined"
        color="inherit"
        size="small"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        endIcon={<KeyboardArrowDownRoundedIcon />}
        sx={{
          borderColor: 'divider',
          color: 'text.primary',
          justifyContent: 'space-between',
          minWidth: 156,
        }}
      >
        <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
          {label}:
        </Box>
        <Box component="span" sx={{ fontWeight: 800 }}>
          {summary}
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { maxHeight: 360, minWidth: 240 } } }}
      >
        <MenuItem dense onClick={() => onChange([])}>
          <Checkbox edge="start" checked={isAll} disableRipple size="small" />
          <ListItemText primary="All" primaryTypographyProps={{ fontWeight: 700 }} />
        </MenuItem>
        <Divider />
        {options.map((option) => (
          <MenuItem dense key={option} onClick={() => toggle(option)}>
            <Checkbox edge="start" checked={selected.includes(option)} disableRipple size="small" />
            <ListItemText primary={formatOption(option)} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
