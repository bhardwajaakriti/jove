import { Button, Stack } from '@mui/material';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { clearFilters, setFilterValues, type ArrayFilterKey } from '@/app/store/filtersSlice';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { MultiSelectFilter } from '@/components/filters/MultiSelectFilter';
import type { AssetType, FilterOptions, Language, SubjectArea, VideoType } from '@/types';
import { sentenceCase } from '@/utils/format';

export function FilterPanel({
  options,
  mode,
}: {
  options: FilterOptions;
  mode: 'dashboard' | 'script' | 'localization';
}) {
  const filters = useAppSelector((state) => state.filters);
  const dispatch = useAppDispatch();

  const update = <T extends string>(key: ArrayFilterKey, values: T[]) => {
    dispatch(setFilterValues({ key, values }));
  };

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
      <MultiSelectFilter<SubjectArea>
        label="Subject"
        options={options.subjectAreas}
        selected={filters.subjectAreas}
        onChange={(values) => update('subjectAreas', values)}
      />
      {mode !== 'script' && (
        <MultiSelectFilter<Language>
          label="Language"
          options={options.languages}
          selected={filters.languages}
          onChange={(values) => update('languages', values)}
        />
      )}
      {mode === 'script' && (
        <MultiSelectFilter<VideoType>
          label="Video type"
          options={options.videoTypes}
          selected={filters.videoTypes}
          onChange={(values) => update('videoTypes', values)}
        />
      )}
      {mode === 'localization' && (
        <>
          <MultiSelectFilter<AssetType>
            label="Asset"
            options={options.assetTypes}
            selected={filters.assetTypes}
            onChange={(values) => update('assetTypes', values)}
          />
          <MultiSelectFilter<string>
            label="Market"
            options={options.markets}
            selected={filters.markets}
            onChange={(values) => update('markets', values)}
          />
        </>
      )}
      <MultiSelectFilter<string>
        label="Status"
        options={mode === 'localization' ? options.localizationStatuses : options.scriptStatuses}
        selected={filters.statuses}
        onChange={(values) => update('statuses', values)}
        formatOption={sentenceCase}
      />
      <Button
        size="small"
        variant="text"
        startIcon={<ClearRoundedIcon />}
        onClick={() => dispatch(clearFilters())}
      >
        Clear
      </Button>
    </Stack>
  );
}
