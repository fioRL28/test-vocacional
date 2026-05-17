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

export type PromptStyle = "exploratory" | "behavioral" | "situational" | "reflective";

export type Question = {
  id: number;
  kind: QuestionKind;
  text: string;
  dimension?: Dimension;
  model?: "RIASEC" | "Big Five" | "Contexto";
  stage: "exploracion" | "profundizacion" | "contexto";
  promptStyle?: PromptStyle;
  helperPrompts?: string[];
  trigger?: "uncertainty" | "pressure" | "contradiction" | "motivation" | "prioritization";
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
};

export type Answer = LikertAnswer | OpenAnswer;

export type ContradictionStatus = "unresolved" | "attempted" | "resolved";

export type Profile = {
  id: string;
  name: string;
  description: string;
  dimensions: Partial<Record<Dimension, number>>;
};

export type SearchParams = Record<string, string | string[] | undefined>;

export type AdaptiveStatus = {
  title: string;
  detail: string;
};
