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
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { ChartSkeleton, ListSkeleton } from '@/components/loaders/Skeletons';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { ScoreBar } from '@/components/shared/ScoreBar';
import { SeverityChip } from '@/components/shared/SeverityChip';
import { StatusChip } from '@/components/shared/StatusChip';
import { useAppSelector } from '@/app/store/hooks';
import { DEFAULT_PAGE_SIZE } from '@/constants/app';
import { useAsync } from '@/hooks/useAsync';
import { useDataSource } from '@/hooks/useDataSource';
import { formatDate } from '@/utils/format';

export default function EditorialQueuePage() {
  const ds = useDataSource();
  const navigate = useNavigate();
  const { id } = useParams();
  const filters = useAppSelector((state) => state.filters);
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState('blockers');
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
    () => ds.getScriptSubmissions({ filters, page: pageIndex + 1, pageSize, search, sortBy }),
    [filterKey, pageIndex, pageSize, search, sortBy],
  );

  const selectedId = id ?? page?.items[0]?.id;
  const { data: detail, status: detailStatus } = useAsync(
    () => (selectedId ? ds.getScriptSubmission(selectedId) : Promise.resolve(null)),
    [selectedId],
  );

  return (
    <Box>
      <PageHeader
        title="Editorial Manuscript Queue"
        subtitle="Incoming AI-generated drafts with validation scores, required fixes, and time-saved estimates for JoVE editors."
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<SendRoundedIcon />}
              disabled={!detail}
              onClick={() => setToast('Revision request prepared')}
            >
              Request revision
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircleRoundedIcon />}
              disabled={!detail || detail.submission.redFlags > 0}
              onClick={() => setToast('Draft accepted for editorial handoff')}
            >
              Accept draft
            </Button>
          </Stack>
        }
      />

      {options && (
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <FilterPanel options={options} mode="script" />
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'grid', gap: 2, alignItems: 'start', gridTemplateColumns: { xs: '1fr', lg: 'minmax(560px, 0.95fr) minmax(420px, 1.05fr)' } }}>
        <Card sx={{ position: { lg: 'sticky' }, top: { lg: 88 }, alignSelf: 'start' }}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="subtitle1">Submission queue</Typography>
                <Typography variant="caption" color="text.secondary">
                  {page ? `${page.total} manuscripts` : 'Loading manuscripts'}
                </Typography>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                <FormControl size="small" sx={{ minWidth: 168 }}>
                  <InputLabel id="editorial-sort-label">Sort</InputLabel>
                  <Select
                    labelId="editorial-sort-label"
                    label="Sort"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                  >
                    <MenuItem value="blockers">Required fixes</MenuItem>
                    <MenuItem value="score">Lowest score</MenuItem>
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="oldest">Oldest</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder="Search title, author, institution"
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
              <EmptyState title="No manuscripts match these filters" description="Clear filters or search for another author." />
            )}
            {status === 'success' && page && page.items.length > 0 && (
              <>
                <Box sx={{ overflowX: 'auto', maxHeight: { lg: 'calc(100vh - 300px)' }, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Manuscript</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Flags</TableCell>
                        <TableCell>Owner</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {page.items.map((item) => (
                        <TableRow
                          key={item.id}
                          hover
                          selected={item.id === selectedId}
                          onClick={() => navigate(`/editorial/${item.id}`)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell sx={{ minWidth: 260 }}>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                              {item.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.author} - {item.institution}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <StatusChip status={item.status} />
                          </TableCell>
                          <TableCell sx={{ minWidth: 120 }}>
                            <ScoreBar value={item.validationScore} />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              <Chip size="small" color={item.redFlags ? 'error' : 'success'} label={item.redFlags} />
                              <Chip size="small" color="warning" variant="outlined" label={item.amberFlags} />
                            </Stack>
                          </TableCell>
                          <TableCell>{item.owner}</TableCell>
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
              <EmptyState title="Select a manuscript" description="Choose a queue item to load its validation detail." />
            </Card>
          )}
          {detailStatus === 'success' && detail && (
            <>
              <Card>
                <CardContent>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" noWrap>
                        {detail.submission.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {detail.submission.subjectArea} - {detail.submission.videoType} - Submitted {formatDate(detail.submission.submittedAt)}
                      </Typography>
                    </Box>
                    <StatusChip status={detail.submission.status} />
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                    <ScoreBar value={detail.submission.validationScore} label="Validation" />
                    <Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        Revision cycles
                      </Typography>
                      <Typography variant="h6">{detail.submission.estimatedRevisionCycles}</Typography>
                    </Stack>
                    <Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        Time saved
                      </Typography>
                      <Typography variant="h6">{detail.submission.timeSavedHours}h</Typography>
                    </Stack>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {detail.sourceSummary}
                  </Typography>
                  {detail.submission.redFlags > 0 && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1.25, fontWeight: 800 }}>
                      Acceptance is locked until required fixes are resolved.
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                    Style guide checks
                  </Typography>
                  <Stack spacing={1}>
                    {detail.styleGuideContext.map((item) => (
                      <Stack key={item} direction="row" spacing={1} alignItems="flex-start">
                        <CheckCircleRoundedIcon sx={{ color: 'success.main', fontSize: 18, mt: 0.15 }} />
                        <Typography variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                    Locked JoVE sections
                  </Typography>
                  <Stack spacing={1.25}>
                    {detail.sections.map((section) => (
                      <Box key={section.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, bgcolor: 'background.default' }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                          <Typography variant="subtitle2">{section.title}</Typography>
                          <Chip size="small" label={`${section.qualityScore}/100`} variant="outlined" />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {section.wordCount} words - locked structure
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {section.body}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
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
