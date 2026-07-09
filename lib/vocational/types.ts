export type Dimension =
  | "realista"
  | "investigativo"
  | "artistico"
  | "social"
  | "emprendedor"
  | "convencional"
  | "apertura"
  | "responsabilidad"
  | "extraversion"
  | "amabilidad"
  | "neuroticismo"
  | "incertidumbre"
  | "presion"
  | "tolerancia";

export type RiasecDimension = Extract<
  Dimension,
  "realista" | "investigativo" | "artistico" | "social" | "emprendedor" | "convencional"
>;

export type BigFiveDimension = Extract<
  Dimension,
  "apertura" | "responsabilidad" | "extraversion" | "amabilidad" | "neuroticismo"
>;

export type VocationalTrainingType = "universitaria" | "tecnica" | "oficio";

export type OccupationalRoute = {
  id: string;
  name: string;
  riasecPrimary: RiasecDimension;
  riasecSecondary: RiasecDimension[];
  bigFiveSupport: BigFiveDimension[];
  trainingTypes: VocationalTrainingType[];
  description: string;
  activities: string[];
  recommendedWorkConditions: string[];
  relatedProfileIds: string[];
};

export type OccupationalRouteCompatibility = {
  route: OccupationalRoute;
  score: number;
  riasecPrimaryScore: number;
  riasecSecondaryScore: number;
  bigFiveSupportScore: number;
  matchedRiasec: Array<{ dimension: RiasecDimension; value: number; role: "primary" | "secondary" }>;
  matchedBigFive: Array<{ dimension: BigFiveDimension; value: number }>;
  explanation: string[];
};

export type QuestionKind = "likert" | "open";

export type ResponseScaleType =
  | "interest"
  | "frequency"
  | "intensity"
  | "forced_choice";

export type ForcedChoiceOption = {
  id: string;
  text: string;
  dimension: Dimension;
  semanticFocus?: string[];
  nextQuestionId?: number;
  careerRouteIds?: string[];
  isUnknown?: boolean;
  opensTextInput?: boolean;
};

export type QuestionType =
  | "likert"
  | "forced-choice"
  | "scenario"
  | "preference"
  | "open-reflection";

export type AdaptivePhase = "baseline" | "deepening" | "discrimination" | "closure";

export type AdaptiveClosingReason =
  | "baseline-incomplete"
  | "high-profile-clarity"
  | "unresolved-conflict"
  | "missing-semantic-focus"
  | "max-question-limit"
  | "needs-deepening";

export type PromptStyle = "exploratory" | "behavioral" | "situational" | "reflective";

export type Question = {
  id: number;
  kind: QuestionKind;
  text: string;
  dimension?: Dimension;
  model?: "RIASEC" | "Big Five" | "Contexto";
  scaleType?: ResponseScaleType;
  contrastLabel?: string;
  stage: "exploracion" | "profundizacion" | "contexto";
  promptStyle?: PromptStyle;
  semanticFocus?: string[];
  forcedChoiceOptions?: ForcedChoiceOption[];
  guidedOptions?: string[];
  unsureOptions?: string[];
  helperPrompts?: string[];
  trigger?:
    | "uncertainty"
    | "pressure"
    | "contradiction"
    | "motivation"
    | "prioritization"
    | "contrast";
  optionalComment?: boolean;
};

export type LikertAnswer = {
  kind: "likert";
  questionId: number;
  dimension: Dimension;
  value: number;
  order: number;
  comment?: string;
  suspiciousInput?: boolean;
  suspiciousReason?: string;
};

export type OpenAnswer = {
  kind: "open";
  questionId: number;
  trigger: NonNullable<Question["trigger"]>;
  text: string;
  order: number;
  answerMode?: "guided-option" | "typed-text" | "unknown";
  selectedOptionId?: string;
  selectedOptionText?: string;
  careerReference?: string;
  observedMismatch?: boolean;
  suspiciousInput?: boolean;
  suspiciousReason?: string;
};

export type Answer = LikertAnswer | OpenAnswer;

export type ResultIndicators = {
  profileClarity: number;
  vocationalUncertainty: number;
  externalPressure: number;
};

export type ValidationObservation = {
  careerReference?: string;
  observedMismatch?: boolean;
};

export type PilotValidationMetadata = {
  anonymousId: string;
  careerInterestDeclared?: string;
  careerReference?: string;
  observedMismatch?: boolean;
  userSatisfaction?: number;
  perceivedUsefulness?: number;
  resultAgreement?: number;
};

export type ContradictionStatus = "unresolved" | "attempted" | "resolved";

export type Profile = {
  id: string;
  name: string;
  description: string;
  dimensions: Partial<Record<Dimension, number>>;
  coreRiasec: Dimension[];
  supportBigFive: Dimension[];
  contextVariables: Dimension[];
};

export type VocationalCombinedPattern = {
  id: string;
  label: string;
  profileId: Profile["id"];
  score: number;
  dimensions: Dimension[];
  explanation: string;
  socialManagementNuance?: boolean;
  requiresExplicitOperationalSignal?: boolean;
};

export type RouteCompatibilityTrace = {
  routeName: string;
  dimensionScore: number;
  combinedPatternScore: number;
  explicitEvidenceScore: number;
  adaptiveConfirmationScore: number;
  penaltyScore: number;
  finalScore: number;
  requiredEvidenceMet: boolean;
};

export type VocationalFamilyMetadata = {
  id: string;
  name: string;
  description: string;
  relatedProfileIds: string[];
  coreRiasec: Dimension[];
  supportBigFive: Dimension[];
  semanticFocus: string[];
};

export type VocationalSubrouteMetadata = {
  id: string;
  familyId: string;
  name: string;
  description: string;
  relatedProfileIds: string[];
  coreRiasec: Dimension[];
  supportBigFive: Dimension[];
  semanticFocus: string[];
  careerExamples: string[];
  conflictsWith: string[];
  validationNotes: string;
};

export type AdaptiveThemeBlock = {
  id: string;
  name: string;
  description: string;
  dimensions: Dimension[];
  semanticFocus: string[];
};

export type SearchParams = Record<string, string | string[] | undefined>;

export type AdaptiveStatus = {
  title: string;
  detail: string;
};

export type SemanticCoverage = {
  dimension: Dimension;
  exploredFocus: string[];
  missingFocus: string[];
  coverageRatio: number;
};

export type AdaptiveDiagnostics = {
  phase: AdaptivePhase;
  phaseReasons: string[];
  closingReason?: AdaptiveClosingReason;
  highUncertainty: boolean;
  lowDifferentiation: boolean;
  broadInterestPattern: boolean;
  broadInterestReason?: string;
  nearbyProfileIds: string[];
  missingSemanticFocus: SemanticCoverage[];
  weakCoreProfileIds: string[];
};

export type AuditSeverity = "low" | "medium" | "high";
export type AuditStatus = "ok" | "warning" | "critical";

export type AuditInterpretation = {
  status: AuditStatus;
  reason: string;
};

export type AuditIssue = {
  code: string;
  severity: AuditSeverity;
  message: string;
  targetId?: string | number;
};

export type QuestionCoherenceAudit = {
  questionId: number;
  score: number;
  status: AuditStatus;
  reason: string;
  dimension?: Dimension;
  trigger?: NonNullable<Question["trigger"]>;
  adaptiveThemeBlockIds: string[];
  issues: AuditIssue[];
};

export type RedundancyAudit = {
  score: number;
  status: AuditStatus;
  reason: string;
  pairs: Array<{
    questionIds: [number, number];
    dimension?: Dimension;
    similarity: number;
    sharedSemanticFocus: string[];
  }>;
};

export type ProfileAbsorptionAudit = {
  score: number;
  status: AuditStatus;
  reason: string;
  profileId: string;
  predictedCount: number;
  mismatchCount: number;
  careerReferences: string[];
  staticRiskFactors: string[];
};

export type ProfileSignalConsistencyAudit = {
  score: number;
  status: AuditStatus;
  reason: string;
  broadInterestPattern?: boolean;
  broadInterestReason?: string;
  profileId: string;
  traditionalProfileId: string;
  topRiasecDimensions: Dimension[];
  alignedDimensions: Dimension[];
  issues: AuditIssue[];
};

export type FlowEfficiencyAudit = {
  score: number;
  status: AuditStatus;
  reason: string;
  closingReason?: AdaptiveClosingReason;
  broadInterestPattern?: boolean;
  broadInterestReason?: string;
  questionCount: number;
  likertCount?: number;
  profileClarity: number;
  clarityPerQuestion: number;
  issues: AuditIssue[];
};

export type InternalInstrumentAuditReport = {
  generatedAt: string;
  questionCoherence: {
    score: number;
    status: AuditStatus;
    reason: string;
    questions: QuestionCoherenceAudit[];
  };
  redundancy: RedundancyAudit;
  profileAbsorption: ProfileAbsorptionAudit[];
  profileSignalConsistency: {
    score: number;
    status: AuditStatus;
    reason: string;
    sessions: ProfileSignalConsistencyAudit[];
  };
  flowEfficiency: {
    score: number;
    status: AuditStatus;
    reason: string;
    sessions: FlowEfficiencyAudit[];
  };
  issues: AuditIssue[];
};
