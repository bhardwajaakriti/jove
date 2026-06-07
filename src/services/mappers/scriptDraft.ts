import type {
  GeneratedScriptDraft,
  ScriptGenerationInput,
  ScriptSection,
  ValidationIssue,
} from '@/types';

function sentenceFromInput(sourceText: string): string {
  const cleaned = sourceText.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'The submitted protocol material outlines the experimental context and core method.';
  const sentence = cleaned.split(/[.!?]/).find((part) => part.trim().length > 30);
  return (sentence ?? cleaned).slice(0, 180).trim();
}

function section(
  id: string,
  title: ScriptSection['title'],
  body: string,
  qualityScore: number,
): ScriptSection {
  return {
    id,
    title,
    body,
    qualityScore,
    wordCount: body.split(/\s+/).length,
    locked: true,
  };
}

export function buildGeneratedDraft(input: ScriptGenerationInput): GeneratedScriptDraft {
  const seed = sentenceFromInput(input.sourceText);
  const hasMaterials = /material|reagent|buffer|sample|cell|slide/i.test(input.sourceText);
  const hasFigures = /figure|table|result|image|graph/i.test(input.sourceText);
  const issues: ValidationIssue[] = [];

  if (!hasMaterials) {
    issues.push({
      id: 'draft-issue-materials',
      severity: 'critical',
      title: 'Materials list needs detail',
      location: 'Protocol',
      recommendation: 'Add reagents, equipment, sample preparation, and safety notes before submission.',
    });
  }

  if (!hasFigures) {
    issues.push({
      id: 'draft-issue-figures',
      severity: 'warning',
      title: 'Representative results need figure anchors',
      location: 'Representative Results',
      recommendation: 'Reference expected figures or tables so editors can match visuals to narration.',
    });
  }

  issues.push({
    id: 'draft-issue-word-count',
    severity: 'info',
    title: 'Discussion is within JoVE guidance',
    location: 'Discussion',
    recommendation: 'Keep final commentary concise and avoid first-person phrasing.',
  });

  const score = Math.max(68, 94 - issues.filter((i) => i.severity === 'critical').length * 14 - issues.filter((i) => i.severity === 'warning').length * 5);

  return {
    title: input.title || `${input.subjectArea} video manuscript draft`,
    score,
    estimatedGenerationSeconds: 24,
    timeSavedHours: 7.5,
    sections: [
      section(
        'intro',
        'Introduction',
        `${seed}. This ${input.videoType} manuscript introduces the scientific question, expected learning outcome, and context required for reproducible visual demonstration in ${input.subjectArea}.`,
        88,
      ),
      section(
        'protocol',
        'Protocol',
        '1. Prepare all materials and verify instrument calibration. 2. Label samples and controls before beginning the procedure. 3. Perform each method step in sequence using imperative, observable actions. 4. Record timing, temperature, and acceptance criteria for repeatability.',
        hasMaterials ? 91 : 74,
      ),
      section(
        'results',
        'Representative Results',
        'The expected output should demonstrate visible protocol milestones, measurable comparison points, and visual evidence that the method produced interpretable scientific results.',
        hasFigures ? 89 : 78,
      ),
      section(
        'discussion',
        'Discussion',
        'The discussion explains critical steps, common pitfalls, troubleshooting guidance, and limitations while preserving JoVE style and avoiding unsupported claims.',
        92,
      ),
    ],
    validationIssues: issues,
  };
}
