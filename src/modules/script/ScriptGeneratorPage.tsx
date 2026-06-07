import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScoreBar } from '@/components/shared/ScoreBar';
import { SeverityChip } from '@/components/shared/SeverityChip';
import { useDataSource } from '@/hooks/useDataSource';
import type { GeneratedScriptDraft, SubjectArea, VideoType } from '@/types';
import { SUBJECT_OPTIONS, VIDEO_TYPE_OPTIONS } from './scriptOptions';

const SAMPLE_INPUT =
  'We describe a protocol for preparing adherent cell cultures, applying treatment conditions, imaging fluorescence markers, and comparing quantified cell migration against control samples. Materials include pipettes, sterile culture plates, phosphate-buffered saline, fluorescence microscope, incubator, and image analysis software. Figure 1 shows the culture setup and Figure 2 summarizes representative results.';

export default function ScriptGeneratorPage() {
  const ds = useDataSource();
  const [title, setTitle] = useState('Quantifying Cell Migration Using Fluorescence Imaging');
  const [subjectArea, setSubjectArea] = useState<SubjectArea>('Biology');
  const [videoType, setVideoType] = useState<VideoType>('Research Journal');
  const [sourceText, setSourceText] = useState(SAMPLE_INPUT);
  const [sourceFile, setSourceFile] = useState<string>();
  const [draft, setDraft] = useState<GeneratedScriptDraft>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [toast, setToast] = useState<string>();

  const draftText = useMemo(() => {
    if (!draft) return '';
    const sections = draft.sections
      .map((section) => `${section.title}\n${section.body}`)
      .join('\n\n');
    const issues = draft.validationIssues
      .map((issue) => `- [${issue.severity}] ${issue.location}: ${issue.title}. ${issue.recommendation}`)
      .join('\n');
    return `${draft.title}\nValidation score: ${draft.score}/100\n\n${sections}\n\nValidation report\n${issues}`;
  }, [draft]);

  const criticalIssueCount = draft?.validationIssues.filter((issue) => issue.severity === 'critical').length ?? 0;

  const generate = async () => {
    if (!title.trim()) {
      setError('Add a manuscript title before generating.');
      return;
    }
    if (sourceText.trim().length < 80 && !sourceFile) {
      setError('Add source material or attach a mock source file before generating.');
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const result = await ds.generateScriptDraft({ title, subjectArea, videoType, sourceText });
      setDraft(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setSourceFile(file.name);
    setToast(`${file.name} attached to the source packet`);
  };

  const copyDraft = async () => {
    if (!draftText) return;
    try {
      await navigator.clipboard.writeText(draftText);
      setToast('Draft copied');
    } catch {
      setToast('Copy was blocked by the browser');
    }
  };

  const downloadDraft = () => {
    if (!draft || !draftText) return;
    const blob = new Blob([draftText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${draft.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-draft.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setToast('Draft export prepared');
  };

  const submitDraft = () => {
    setToast(
      criticalIssueCount > 0
        ? 'Resolve required fixes before editorial handoff'
        : 'Draft moved to editorial handoff',
    );
  };

  return (
    <Box>
      <PageHeader
        title="AI Video Manuscript & Script Generator"
        subtitle="Prototype for the PRD author workflow: paste research material, generate a structured manuscript, validate required sections, and surface edit-ready guidance."
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" component="label" startIcon={<UploadFileRoundedIcon />}>
              Attach source
              <input
                hidden
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </Button>
            <Button variant="contained" startIcon={<AutoFixHighRoundedIcon />} onClick={generate} disabled={loading}>
              Generate draft
            </Button>
          </Stack>
        }
      />

      <Box sx={{ display: 'grid', gap: 2, alignItems: 'start', gridTemplateColumns: { xs: '1fr', lg: '420px minmax(0, 1fr)' } }}>
        <Card sx={{ position: { lg: 'sticky' }, top: { lg: 88 }, alignSelf: 'start' }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle1">Author input module</Typography>
                <Typography variant="body2" color="text.secondary">
                  Accepts pasted abstracts, protocol notes, paper excerpts, or structured method text.
                </Typography>
              </Stack>

              <TextField
                label="Manuscript title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel id="subject-area-label">Subject area</InputLabel>
                <Select
                  labelId="subject-area-label"
                  label="Subject area"
                  value={subjectArea}
                  onChange={(event) => setSubjectArea(event.target.value as SubjectArea)}
                >
                  {SUBJECT_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="video-type-label">Target video type</InputLabel>
                <Select
                  labelId="video-type-label"
                  label="Target video type"
                  value={videoType}
                  onChange={(event) => setVideoType(event.target.value as VideoType)}
                >
                  {VIDEO_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Paper abstract, protocol notes, or raw source text"
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                fullWidth
                multiline
                minRows={12}
              />

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {sourceFile && (
                  <Chip
                    icon={<InsertDriveFileRoundedIcon />}
                    label={sourceFile}
                    onDelete={() => setSourceFile(undefined)}
                    variant="outlined"
                  />
                )}
                <Button size="small" variant="text" onClick={() => setSourceText(SAMPLE_INPUT)}>
                  Load sample
                </Button>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<ClearRoundedIcon />}
                  onClick={() => {
                    setSourceText('');
                    setSourceFile(undefined);
                    setDraft(undefined);
                  }}
                >
                  Clear
                </Button>
              </Stack>

              {loading && (
                <Stack spacing={1}>
                  <LinearProgress />
                  <Typography variant="caption" color="text.secondary">
                    Applying style guide, section templates, and validation checks
                  </Typography>
                </Stack>
              )}
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle1">Generated manuscript draft</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Required sections are locked, editor-ready, and validated before submission unlocks.
                  </Typography>
                </Box>
                {draft && (
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Chip size="small" icon={<FactCheckRoundedIcon />} label={`${draft.estimatedGenerationSeconds}s sample generation`} />
                    <Chip size="small" color="success" variant="outlined" label={`${draft.timeSavedHours}h saved`} />
                  </Stack>
                )}
              </Stack>

              <Divider sx={{ my: 2 }} />

              {!draft ? (
                <Stack spacing={2} sx={{ minHeight: 420, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <AutoFixHighRoundedIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                  <Typography variant="h6">Draft preview</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
                    Required sections, style checks, and validation guidance will appear here.
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <ScoreBar value={draft.score} label="Validation score" />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button size="small" variant="outlined" startIcon={<ContentCopyRoundedIcon />} onClick={copyDraft}>
                      Copy draft
                    </Button>
                    <Button size="small" variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={downloadDraft}>
                      Export TXT
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<SendRoundedIcon />}
                      onClick={submitDraft}
                      disabled={criticalIssueCount > 0}
                    >
                      Submit to editorial
                    </Button>
                  </Stack>
                  {criticalIssueCount > 0 && (
                    <Alert severity="warning">
                      Required fixes must be cleared before editorial handoff.
                    </Alert>
                  )}
                  {draft.sections.map((section) => (
                    <Box key={section.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2, bgcolor: 'background.default' }}>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                        <LockRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="subtitle2">{section.title}</Typography>
                        <Chip size="small" label={`${section.wordCount} words`} variant="outlined" />
                        <Chip size="small" label={`${section.qualityScore}/100`} color={section.qualityScore > 85 ? 'success' : 'warning'} variant="outlined" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {section.body}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {draft && (
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                  Validation report
                </Typography>
                <Stack spacing={1.25}>
                  {draft.validationIssues.map((issue) => (
                    <Stack key={issue.id} direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, bgcolor: 'background.default' }}>
                      <SeverityChip severity={issue.severity} />
                      <Box sx={{ minWidth: 0 }}>
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
