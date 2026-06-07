import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { ChartSkeleton, ListSkeleton } from '@/components/loaders/Skeletons';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ScoreBar } from '@/components/shared/ScoreBar';
import { SeverityChip } from '@/components/shared/SeverityChip';
import { StatusChip } from '@/components/shared/StatusChip';
import { useAppSelector } from '@/app/store/hooks';
import { SERIES_COLORS } from '@/app/config/chartColors';
import { DEFAULT_PAGE_SIZE } from '@/constants/app';
import { useAsync } from '@/hooks/useAsync';
import { useDataSource } from '@/hooks/useDataSource';
import { formatDate } from '@/utils/format';

export default function LocalizationPage() {
  const ds = useDataSource();
  const navigate = useNavigate();
  const { id } = useParams();
  const filters = useAppSelector((state) => state.filters);
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState('critical');
  const [toast, setToast] = useState<string>();
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPageIndex(0);
  }, [filterKey, sortBy]);

  const { data: options } = useAsync(() => ds.getFilterOptions(), []);
  const {
    data: page,
    status,
    reload,
  } = useAsync(
    () => ds.getLocalizationJobs({ filters, page: pageIndex + 1, pageSize, search, sortBy }),
    [filterKey, pageIndex, pageSize, search, sortBy],
  );

  const selectedId = id ?? page?.items[0]?.id;
  const { data: detail, status: detailStatus } = useAsync(
    () => (selectedId ? ds.getLocalizationJob(selectedId) : Promise.resolve(null)),
    [selectedId],
  );

  const validationChart = detail
    ? [
        { name: 'Template', value: detail.job.templatePreservationPct },
        { name: 'Glossary', value: detail.job.glossaryAccuracyPct },
        { name: 'Overall', value: detail.job.validationScore },
      ]
    : [];

  return (
    <Box>
      <PageHeader
        title="Multilingual Localization Review"
        subtitle="AI-translated learning assets with terminology QA, text overflow checks, placeholder preservation, and side-by-side editor review."
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<AutoFixHighRoundedIcon />}
              disabled={!detail}
              onClick={() => setToast('Regeneration request queued')}
            >
              Regenerate
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircleRoundedIcon />}
              disabled={!detail || detail.job.criticalIssues > 0}
              onClick={() => setToast('Localized asset approved')}
            >
              Approve asset
            </Button>
          </Stack>
        }
      />

      {options && (
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <FilterPanel options={options} mode="localization" />
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'grid', gap: 2, alignItems: 'start', gridTemplateColumns: { xs: '1fr', lg: 'minmax(560px, 1fr) minmax(420px, 0.95fr)' } }}>
        <Card sx={{ position: { lg: 'sticky' }, top: { lg: 88 }, alignSelf: 'start' }}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="subtitle1">Localization jobs</Typography>
                <Typography variant="caption" color="text.secondary">
                  {page ? `${page.total} localization jobs` : 'Loading localization jobs'}
                </Typography>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="localization-sort-label">Sort</InputLabel>
                  <Select
                    labelId="localization-sort-label"
                    label="Sort"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                  >
                    <MenuItem value="critical">Critical first</MenuItem>
                    <MenuItem value="score">Lowest QA</MenuItem>
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="oldest">Oldest</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder="Search title, course, market"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPageIndex(0);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: { md: 320 } }}
                />
              </Stack>
            </Stack>

            {status === 'error' && <ErrorState onRetry={reload} />}
            {status === 'loading' && <ListSkeleton rows={8} />}
            {status === 'success' && page && page.items.length === 0 && (
              <EmptyState title="No localization jobs match these filters" description="Clear filters or search another course." />
            )}
            {status === 'success' && page && page.items.length > 0 && (
              <>
                <Box sx={{ overflowX: 'auto', maxHeight: { lg: 'calc(100vh - 300px)' }, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Asset</TableCell>
                        <TableCell>Language</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>QA</TableCell>
                        <TableCell>Issues</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {page.items.map((item) => (
                        <TableRow
                          key={item.id}
                          hover
                          selected={item.id === selectedId}
                          onClick={() => navigate(`/localization/${item.id}`)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell sx={{ minWidth: 260 }}>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                              {item.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.course} - {item.assetType} - {item.assetCount} assets
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" icon={<TranslateRoundedIcon />} label={item.targetLanguage} variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <StatusChip status={item.status} />
                          </TableCell>
                          <TableCell sx={{ minWidth: 120 }}>
                            <ScoreBar value={item.validationScore} />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              <Chip size="small" color={item.criticalIssues ? 'error' : 'success'} label={item.criticalIssues} />
                              <Chip size="small" color="warning" variant="outlined" label={item.warningIssues} />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
                <TablePagination
                  component="div"
                  count={page.total}
                  page={pageIndex}
                  rowsPerPage={pageSize}
                  rowsPerPageOptions={[10, 20, 30]}
                  onPageChange={(_, nextPage) => setPageIndex(nextPage)}
                  onRowsPerPageChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPageIndex(0);
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Stack spacing={2}>
          {detailStatus === 'loading' && <ChartSkeleton height={520} />}
          {detailStatus === 'success' && !detail && (
            <Card>
              <EmptyState title="Select a localization job" description="Choose a job to load translation and validation detail." />
            </Card>
          )}
          {detailStatus === 'success' && detail && (
            <>
              <Card>
                <CardContent>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" noWrap>
                        {detail.job.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {detail.job.course} - {detail.job.market} - Queued {formatDate(detail.job.queuedAt)}
                      </Typography>
                    </Box>
                    <StatusChip status={detail.job.status} />
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                    <ScoreBar value={detail.job.validationScore} label="Overall QA" />
                    <ScoreBar value={detail.job.templatePreservationPct} label="Template" />
                    <ScoreBar value={detail.job.glossaryAccuracyPct} label="Glossary" />
                  </Box>
                  {detail.job.criticalIssues > 0 && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1.25, fontWeight: 800 }}>
                      Approval is locked until critical localization issues are resolved.
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Box>
                      <Typography variant="subtitle1">Language availability</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Current asset package availability by target language
                      </Typography>
                    </Box>
                    <Button size="small" variant="outlined" onClick={() => setToast('Translation demand signal captured')}>
                      Request translation
                    </Button>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(options?.languages ?? []).map((language) => (
                      <Chip
                        key={language}
                        label={language}
                        color={language === detail.job.targetLanguage ? 'primary' : 'default'}
                        variant={language === detail.job.targetLanguage ? 'filled' : 'outlined'}
                        size="small"
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <ChartContainer title="Validation dimensions" subtitle="Template preservation and scientific glossary accuracy" height={220}>
                <ResponsiveContainer>
                  <BarChart data={validationChart} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill={SERIES_COLORS.localization} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                    Side-by-side review
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, bgcolor: 'background.default' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                        English original
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {detail.originalLayout}
                      </Typography>
                    </Box>
                    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, bgcolor: 'background.default' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                        {detail.job.targetLanguage} output
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {detail.translatedLayout}
                      </Typography>
                    </Box>
                  </Box>
                  <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                    {detail.segments.map((segment) => (
                      <Box key={segment.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, bgcolor: 'background.default' }}>
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Typography variant="caption" color="text.secondary">
                            Segment confidence {segment.confidencePct}%
                          </Typography>
                          {segment.issue && <SeverityChip severity={segment.issue} />}
                        </Stack>
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
                          {segment.source}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                          {segment.translated}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                    Glossary consistency
                  </Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Source term</TableCell>
                          <TableCell>Localized term</TableCell>
                          <TableCell>Consistency</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detail.glossaryTerms.map((term) => (
                          <TableRow key={`${term.source}-${term.target}`}>
                            <TableCell sx={{ fontWeight: 800 }}>{term.source}</TableCell>
                            <TableCell>{term.target}</TableCell>
                            <TableCell sx={{ minWidth: 160 }}>
                              <ScoreBar value={term.consistencyPct} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                    Validation report
                  </Typography>
                  <Stack spacing={1.25}>
                    {detail.validationIssues.map((issue) => (
                      <Stack key={issue.id} direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, bgcolor: 'background.default' }}>
                        <SeverityChip severity={issue.severity} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {issue.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {issue.location} - {issue.recommendation}
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </>
          )}
        </Stack>
      </Box>
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2800}
        onClose={() => setToast(undefined)}
        message={toast}
      />
    </Box>
  );
}
