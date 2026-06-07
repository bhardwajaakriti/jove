import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'mock-data');
const TODAY = new Date('2026-06-07T00:00:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260607);
const rand = (min, max) => min + (max - min) * rng();
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (items) => items[Math.floor(rng() * items.length)];
const round = (value, dp = 0) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};
const isoDate = (date) => date.toISOString().slice(0, 10);
const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);

const SUBJECT_AREAS = [
  'Biology',
  'Chemistry',
  'Neuroscience',
  'Medicine',
  'Engineering',
  'Environmental Sciences',
];
const VIDEO_TYPES = ['JoVE Journal', 'Science Education'];
const SCRIPT_STATUSES = [
  'intake',
  'generated',
  'needs-author-fix',
  'editorial-review',
  'revision-requested',
  'approved',
];
const LOCALIZATION_STATUSES = [
  'ingested',
  'translating',
  'validation',
  'review',
  'published',
  'blocked',
];
const ASSET_TYPES = ['PPTX', 'PDF', 'DOCX', 'SRT/VTT'];
const LANGUAGES = ['Spanish', 'Mandarin', 'Portuguese', 'French', 'German', 'Japanese'];
const MARKETS = ['Latin America', 'Mainland China', 'Brazil', 'France', 'Germany', 'Japan'];
const OWNERS = ['Maya Patel', 'Jordan Lee', 'Sofia Ramirez', 'Eli Morgan', 'Priya Shah'];
const INSTITUTIONS = [
  'Northbridge University',
  'Westlake Bioengineering Lab',
  'Kyoto Biomedical Center',
  'Sao Paulo Research Institute',
  'Helix Neuroscience Group',
  'Greenfield Teaching Hospital',
  'Ridgeview Molecular Lab',
  'Montclair College of Science',
];
const AUTHORS = [
  'Dr. Lin Chen',
  'Ava Morrison',
  'Dr. Mateo Silva',
  'Nora Iyer',
  'Dr. Elise Bernard',
  'Kenji Watanabe',
  'Dr. Samir Rao',
  'Helena Brooks',
];
const COURSE_TOPICS = [
  'Cell Culture Fundamentals',
  'PCR and Gel Electrophoresis',
  'Neural Recording Methods',
  'Organic Synthesis Lab',
  'Microscopy and Imaging',
  'Environmental Sampling',
  'Clinical Skills: Sterile Technique',
  'Microfluidics Design',
];
const MATERIAL_TERMS = ['pipette', 'centrifuge', 'buffer', 'PCR', 'agarose gel', 'fluorescence microscope'];

function scriptTitle(subject, index) {
  const topics = {
    Biology: ['Quantifying Cell Migration', 'Preparing Primary Cell Cultures', 'Flow Cytometry Gating'],
    Chemistry: ['Thin-Layer Chromatography', 'Catalyst Screening', 'Solvent Extraction'],
    Neuroscience: ['Patch Clamp Recording', 'Mouse Behavioral Assay', 'Immunostaining Brain Tissue'],
    Medicine: ['Sterile Field Preparation', 'Ultrasound-Guided Sampling', 'Patient Simulation Debrief'],
    Engineering: ['Microfluidic Chip Assembly', '3D Printed Scaffold Testing', 'Sensor Calibration'],
    'Environmental Sciences': ['Soil Microbiome Sampling', 'Water Quality Assay', 'Field Sediment Core Prep'],
  };
  return `${pick(topics[subject])} Protocol ${String(index + 1).padStart(2, '0')}`;
}

function scriptStatus(score, redFlags) {
  if (score >= 91 && redFlags === 0) return 'approved';
  if (redFlags >= 2) return 'needs-author-fix';
  if (score < 78) return 'revision-requested';
  if (score < 86) return 'editorial-review';
  return pick(['generated', 'editorial-review', 'approved']);
}

function buildScript(i) {
  const subjectArea = pick(SUBJECT_AREAS);
  const redFlags = randInt(0, 3);
  const amberFlags = randInt(1, 7);
  const greenChecks = randInt(8, 18);
  const validationScore = Math.max(58, Math.min(98, round(96 - redFlags * rand(8, 12) - amberFlags * rand(1.2, 2.4))));
  const submittedAt = isoDate(addDays(TODAY, -randInt(0, 42)));
  const status = scriptStatus(validationScore, redFlags);
  const wordCount = randInt(1450, 3600);

  return {
    id: `script-${String(i + 1).padStart(3, '0')}`,
    title: scriptTitle(subjectArea, i),
    author: pick(AUTHORS),
    institution: pick(INSTITUTIONS),
    subjectArea,
    videoType: pick(VIDEO_TYPES),
    sourceType: pick(['Paper upload', 'Protocol notes', 'Abstract paste', 'DOCX upload']),
    status,
    submittedAt,
    validationScore,
    redFlags,
    amberFlags,
    greenChecks,
    wordCount,
    completionPct: round(Math.min(100, validationScore + rand(-8, 8))),
    estimatedRevisionCycles: round(Math.max(1, 3.4 - validationScore / 45 + redFlags * 0.55), 1),
    timeSavedHours: round(rand(4.5, 12.5), 1),
    owner: pick(OWNERS),
  };
}

function sectionBody(title, script) {
  const term = pick(MATERIAL_TERMS);
  const subject = script.subjectArea.toLowerCase();
  const base = {
    Introduction: `This section frames the ${subject} problem, describes why the visual method matters, and positions the procedure for JoVE viewers. The draft summarizes the scientific rationale, expected learning outcome, and experimental context for reproducible execution.`,
    Protocol: `1. Prepare samples, reagents, and equipment, including the ${term}. 2. Label each sample and control before beginning the procedure. 3. Execute the procedure in numbered imperative steps. 4. Record timing, temperature, and visual acceptance criteria after each critical step.`,
    'Representative Results': `Representative outputs should show the expected visual endpoint, quantified comparison, and figure references. The draft calls out Figure 1 for setup, Figure 2 for the observed outcome, and Table 1 for quality control values.`,
    Discussion: `The discussion identifies critical steps, troubleshooting guidance, limitations, and safe handling notes. It avoids first-person phrasing and keeps claims tied to observations captured during filming.`,
  };
  return base[title];
}

function buildValidationIssues(script) {
  const issues = [];
  if (script.redFlags > 0) {
    issues.push({
      id: `${script.id}-issue-protocol`,
      severity: 'critical',
      title: 'Protocol steps need stricter imperative voice',
      location: 'Protocol',
      recommendation: 'Rewrite passive steps as direct actions and confirm each step can be filmed.',
    });
  }
  if (script.redFlags > 1) {
    issues.push({
      id: `${script.id}-issue-materials`,
      severity: 'critical',
      title: 'Materials list is incomplete',
      location: 'Protocol',
      recommendation: 'Add reagents, equipment, supplier-neutral descriptions, and safety constraints.',
    });
  }
  if (script.amberFlags > 2) {
    issues.push({
      id: `${script.id}-issue-results`,
      severity: 'warning',
      title: 'Representative results need tighter figure references',
      location: 'Representative Results',
      recommendation: 'Attach figure labels to each expected visual outcome before editorial review.',
    });
  }
  issues.push({
    id: `${script.id}-issue-style`,
    severity: 'info',
    title: 'JoVE section structure preserved',
    location: 'All sections',
    recommendation: 'Locked sections are present and cannot be deleted in the author editor.',
  });
  return issues;
}

function buildScriptDetail(script) {
  const sectionTitles = ['Introduction', 'Protocol', 'Representative Results', 'Discussion'];
  return {
    submission: script,
    sourceSummary: `${script.author} uploaded ${script.sourceType.toLowerCase()} for a ${script.videoType} manuscript. The AI draft used JoVE section rules, subject terminology, and published-article examples for ${script.subjectArea}.`,
    styleGuideContext: [
      'All required JoVE sections must be present.',
      'Protocol instructions use numbered imperative voice.',
      'No first-person phrasing in restricted manuscript sections.',
      'Figures, tables, materials, and safety notes must be explicitly referenced.',
    ],
    sections: sectionTitles.map((title, idx) => ({
      id: `${script.id}-section-${idx + 1}`,
      title,
      wordCount: randInt(260, 820),
      qualityScore: Math.max(62, Math.min(98, round(script.validationScore + rand(-8, 7)))),
      locked: true,
      body: sectionBody(title, script),
    })),
    validationIssues: buildValidationIssues(script),
    editorialNotes: [
      'AI draft generated with JoVE house structure locked.',
      `Estimated revision cycles reduced to ${script.estimatedRevisionCycles}.`,
      script.redFlags > 0 ? 'Author must clear red validation flags before submission unlocks.' : 'Ready for editor approval or light copy edit.',
    ],
  };
}

function buildLocalizationJob(i) {
  const subjectArea = pick(SUBJECT_AREAS);
  const targetLanguage = LANGUAGES[i % LANGUAGES.length];
  const market = MARKETS[LANGUAGES.indexOf(targetLanguage)];
  const criticalIssues = randInt(0, 3);
  const warningIssues = randInt(1, 8);
  const validationScore = Math.max(60, Math.min(99, round(97 - criticalIssues * rand(9, 13) - warningIssues * rand(1.1, 2.2))));
  const status =
    criticalIssues >= 2
      ? 'blocked'
      : validationScore >= 91
        ? pick(['published', 'review'])
        : validationScore >= 82
          ? pick(['validation', 'review'])
          : pick(['translating', 'validation']);

  return {
    id: `loc-${String(i + 1).padStart(3, '0')}`,
    title: pick(COURSE_TOPICS),
    course: `${subjectArea} Core Lab ${randInt(100, 499)}`,
    subjectArea,
    assetType: pick(ASSET_TYPES),
    targetLanguage,
    market,
    status,
    queuedAt: isoDate(addDays(TODAY, -randInt(0, 35))),
    assetCount: randInt(8, 72),
    segmentCount: randInt(80, 540),
    validationScore,
    criticalIssues,
    warningIssues,
    infoIssues: randInt(2, 12),
    templatePreservationPct: Math.max(72, Math.min(99, round(98 - criticalIssues * 5 - warningIssues * 0.8 + rand(-2, 2), 1))),
    glossaryAccuracyPct: Math.max(74, Math.min(99, round(97 - criticalIssues * 4 - warningIssues * 0.7 + rand(-2, 2), 1))),
    overflowBoxes: Math.max(0, criticalIssues + randInt(0, 4)),
    reviewer: pick(OWNERS),
    etaHours: randInt(3, 44),
  };
}

function buildLocalizationIssues(job) {
  const issues = [];
  if (job.criticalIssues > 0) {
    issues.push({
      id: `${job.id}-issue-overflow`,
      severity: 'critical',
      title: 'Translated slide text exceeds safe text-box bounds',
      location: 'Slide 7',
      recommendation: 'Auto-scale to the minimum allowed font size, then manually shorten the segment.',
    });
  }
  if (job.criticalIssues > 1) {
    issues.push({
      id: `${job.id}-issue-placeholder`,
      severity: 'critical',
      title: 'Figure placeholder changed during translation',
      location: 'Companion document',
      recommendation: 'Restore [Figure 1] and [Table 2] placeholders exactly as source.',
    });
  }
  if (job.warningIssues > 2) {
    issues.push({
      id: `${job.id}-issue-term`,
      severity: 'warning',
      title: 'Scientific term consistency needs review',
      location: 'Glossary check',
      recommendation: 'Approve one glossary mapping and apply it across all assets.',
    });
  }
  issues.push({
    id: `${job.id}-issue-theme`,
    severity: 'info',
    title: 'JoVE visual template preserved',
    location: 'Master slides',
    recommendation: 'Logos, colors, and image positions remained locked during generation.',
  });
  return issues;
}

function buildSegments(job) {
  const translatedVerb = {
    Spanish: 'Prepare y etiquete cada muestra antes de iniciar el procedimiento.',
    Mandarin: '在开始步骤前准备并标记每个样本。',
    Portuguese: 'Prepare e rotule cada amostra antes de iniciar o procedimento.',
    French: 'Preparez et etiquetez chaque echantillon avant de commencer la procedure.',
    German: 'Bereiten Sie jede Probe vor und beschriften Sie sie vor Beginn des Verfahrens.',
    Japanese: '手順を開始する前に各サンプルを準備し、ラベルを付けます。',
  };
  return [
    {
      id: `${job.id}-seg-1`,
      source: 'Prepare and label each sample before beginning the procedure.',
      translated: translatedVerb[job.targetLanguage],
      confidencePct: Math.max(72, Math.min(99, round(job.glossaryAccuracyPct + rand(-4, 2)))),
    },
    {
      id: `${job.id}-seg-2`,
      source: 'Record temperature, incubation time, and visible acceptance criteria.',
      translated: `Localized ${job.targetLanguage} segment preserving the numbered instruction and measurement terms.`,
      confidencePct: Math.max(70, Math.min(99, round(job.validationScore + rand(-5, 4)))),
      issue: job.warningIssues > 3 ? 'warning' : undefined,
    },
    {
      id: `${job.id}-seg-3`,
      source: 'Do not translate the placeholder [Figure 1] or merge bullet levels.',
      translated: `Localized ${job.targetLanguage} segment with [Figure 1] preserved and bullet structure retained.`,
      confidencePct: job.criticalIssues > 1 ? 76 : 94,
      issue: job.criticalIssues > 1 ? 'critical' : undefined,
    },
  ];
}

function buildLocalizationDetail(job) {
  return {
    job,
    originalLayout: 'English source asset: JoVE title block, two-column protocol body, figure placeholder, and branded footer.',
    translatedLayout: `${job.targetLanguage} output: same master slide, locked logo, retained image positions, and text boxes auto-fit to JoVE bounds.`,
    segments: buildSegments(job),
    validationIssues: buildLocalizationIssues(job),
    glossaryTerms: [
      {
        source: 'PCR',
        target: job.targetLanguage === 'Spanish' ? 'PCR' : 'PCR',
        subjectArea: job.subjectArea,
        consistencyPct: 100,
      },
      {
        source: 'pipette',
        target: job.targetLanguage === 'French' ? 'pipette' : `${job.targetLanguage} glossary term`,
        subjectArea: job.subjectArea,
        consistencyPct: Math.max(78, round(job.glossaryAccuracyPct - rand(0, 4))),
      },
      {
        source: 'centrifuge',
        target: `${job.targetLanguage} glossary term`,
        subjectArea: job.subjectArea,
        consistencyPct: Math.max(76, round(job.glossaryAccuracyPct - rand(0, 5))),
      },
    ],
  };
}

function buildActivity(scripts, jobs) {
  const scriptEvents = scripts.slice(0, 10).map((script, idx) => ({
    id: `activity-script-${idx + 1}`,
    timestamp: isoDate(addDays(TODAY, -idx)),
    feature: 'Script Generator',
    title: script.title,
    detail: script.redFlags > 0 ? 'Validation report flagged required author fixes.' : 'Draft passed JoVE section structure checks.',
    owner: script.owner,
    severity: script.redFlags > 0 ? 'critical' : script.amberFlags > 3 ? 'warning' : 'info',
  }));
  const locEvents = jobs.slice(0, 10).map((job, idx) => ({
    id: `activity-loc-${idx + 1}`,
    timestamp: isoDate(addDays(TODAY, -idx - 1)),
    feature: 'Localization Engine',
    title: `${job.title} - ${job.targetLanguage}`,
    detail: job.criticalIssues > 0 ? 'Template or placeholder issue requires reviewer action.' : 'Glossary and layout checks completed.',
    owner: job.reviewer,
    severity: job.criticalIssues > 0 ? 'critical' : job.warningIssues > 4 ? 'warning' : 'info',
  }));
  return [...scriptEvents, ...locEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

function writeJson(path, data) {
  const target = join(OUT, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`);
}

function main() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const scripts = Array.from({ length: 36 }, (_, index) => buildScript(index));
  const localizationJobs = Array.from({ length: 34 }, (_, index) => buildLocalizationJob(index));

  writeJson('script-submissions/index.json', { items: scripts });
  scripts.forEach((script) => writeJson(`script-details/${script.id}.json`, buildScriptDetail(script)));

  writeJson('localization-jobs/index.json', { items: localizationJobs });
  localizationJobs.forEach((job) => writeJson(`localization-details/${job.id}.json`, buildLocalizationDetail(job)));

  writeJson('filter-options.json', {
    subjectAreas: SUBJECT_AREAS,
    scriptStatuses: SCRIPT_STATUSES,
    localizationStatuses: LOCALIZATION_STATUSES,
    videoTypes: VIDEO_TYPES,
    assetTypes: ASSET_TYPES,
    languages: LANGUAGES,
    markets: MARKETS,
    owners: OWNERS,
  });
  writeJson('activity.json', buildActivity(scripts, localizationJobs));
}

main();
