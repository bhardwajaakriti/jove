import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { KpiCard } from '@/components/cards/KpiCard';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { ChartSkeleton, KpiGridSkeleton, ListSkeleton } from '@/components/loaders/Skeletons';
import { ErrorState } from '@/components/shared/ErrorState';
import { ScoreBar } from '@/components/shared/ScoreBar';
import { SeverityChip } from '@/components/shared/SeverityChip';
import { useAppSelector } from '@/app/store/hooks';
import { CHART_PALETTE, SERIES_COLORS, VALIDATION_TONE_COLORS } from '@/app/config/chartColors';
import { APP_TODAY } from '@/constants/app';
import { useAsync } from '@/hooks/useAsync';
import { useDataSource } from '@/hooks/useDataSource';
import { formatDate } from '@/utils/format';

export default function OverviewPage() {
  const ds = useDataSource();
  const filters = useAppSelector((state) => state.filters);
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  const { data: options } = useAsync(() => ds.getFilterOptions(), []);
  const { data: summary, status, reload } = useAsync(
    () => ds.getDashboardSummary(filters),
    [filterKey],
  );

  return (
    <Box>
      <PageHeader
        title="JoVE AI Command Center"
        subtitle="Operational mock dashboard for author manuscript generation, validation gates, multilingual localization, and reviewer queues."
        actions={
          <Chip
            icon={<CalendarTodayRoundedIcon sx={{ fontSize: 16 }} />}
            label={formatDate(APP_TODAY)}
            variant="outlined"
            size="small"
          />
        }
      />

      {options && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <FilterPanel options={options} mode="dashboard" />
          </CardContent>
        </Card>
      )}

      {status === 'error' && <ErrorState onRetry={reload} />}
      {status === 'loading' && (
        <Stack spacing={3}>
          <KpiGridSkeleton />
          <ChartSkeleton />
        </Stack>
      )}

      {status === 'success' && summary && (
        <Stack spacing={2.5}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {summary.metrics.map((metric) => (
              <KpiCard key={metric.id} metric={metric} />
            ))}
          </Box>

          <Box sx={{ display: 'grid', gap: 2, alignItems: 'start', gridTemplateColumns: { xs: '1fr', lg: '1.35fr 0.85fr' } }}>
            <ChartContainer title="AI workflow pipeline" subtitle="Script drafts and localization batches by current stage" height={320}>
              <ResponsiveContainer>
                <BarChart data={summary.pipeline} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="stage" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="scriptCount" name="Scripts" stackId="a" fill={SERIES_COLORS.script} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="localizationCount" name="Localization" stackId="a" fill={SERIES_COLORS.localization} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Validation report mix" subtitle="Traffic-light checks across active PRD workflows" height={320}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={summary.validationMix} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={2}>
                    {summary.validationMix.map((entry) => (
                      <Cell key={entry.name} fill={VALIDATION_TONE_COLORS[entry.tone]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Box>

          <Box sx={{ display: 'grid', gap: 2, alignItems: 'start', gridTemplateColumns: { xs: '1fr', lg: '1.15fr 0.85fr' } }}>
            <ChartContainer title="Throughput trend" subtitle="Weekly mock output and estimated editorial hours saved" height={320}>
              <ResponsiveContainer>
                <LineChart data={summary.throughput} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="submissions" name="Submissions" stroke={SERIES_COLORS.script} strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="localizedAssets" name="Localized assets" stroke={SERIES_COLORS.localization} strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="editorHoursSaved" name="Hours saved" stroke={SERIES_COLORS.saved} strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            <Card sx={{ alignSelf: 'start' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle1">Priority work queue</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Required fixes blocking submission or publish
                    </Typography>
                  </Box>
                  <Button component={RouterLink} to="/editorial" size="small" endIcon={<ArrowForwardRoundedIcon />}>
                    Queues
                  </Button>
                </Stack>
                <Stack divider={<Divider flexItem />} spacing={0.75}>
                  {summary.workQueue.slice(0, 4).map((item) => (
                    <Stack
                      key={item.id}
                      spacing={0.75}
                      component={RouterLink}
                      to={item.route}
                      sx={{
                        color: 'inherit',
                        textDecoration: 'none',
                        py: 0.75,
                        px: 0.75,
                        mx: -0.75,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'primary.light' },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                            {item.feature} - {item.owner} - {item.blockerCount} blockers
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {item.score}/100
                        </Typography>
                      </Stack>
                      <ScoreBar value={item.score} />
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1">Recent AI operations</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Latest validation decisions and reviewer actions
                  </Typography>
                </Box>
              </Stack>
              {summary.activity.length === 0 ? (
                <ListSkeleton rows={4} />
              ) : (
                <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' } }}>
                  {summary.activity.slice(0, 8).map((entry, idx) => (
                    <Stack
                      key={entry.id}
                      spacing={0.75}
                      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, bgcolor: 'background.default' }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <SeverityChip severity={entry.severity} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(entry.timestamp)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                        {entry.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entry.feature} - {entry.detail}
                      </Typography>
                      <Box sx={{ height: 3, width: `${Math.min(100, 42 + idx * 8)}%`, bgcolor: CHART_PALETTE[idx % CHART_PALETTE.length], borderRadius: 99 }} />
                    </Stack>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  );
}
