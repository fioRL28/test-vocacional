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

export type QuestionKind = "likert" | "open";

export type QuestionType =
  | "likert"
  | "forced-choice"
  | "scenario"
  | "preference"
  | "open-reflection";

export type AdaptivePhase = "baseline" | "deepening" | "discrimination" | "closure";

export type PromptStyle = "exploratory" | "behavioral" | "situational" | "reflective";

export type Question = {
  id: number;
  kind: QuestionKind;
  text: string;
  dimension?: Dimension;
  model?: "RIASEC" | "Big Five" | "Contexto";
  stage: "exploracion" | "profundizacion" | "contexto";
  promptStyle?: PromptStyle;
  semanticFocus?: string[];
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
};

export type OpenAnswer = {
  kind: "open";
  questionId: number;
  trigger: NonNullable<Question["trigger"]>;
  text: string;
  order: number;
  careerReference?: string;
  observedMismatch?: boolean;
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
  highUncertainty: boolean;
  lowDifferentiation: boolean;
  nearbyProfileIds: string[];
  missingSemanticFocus: SemanticCoverage[];
  weakCoreProfileIds: string[];
};
