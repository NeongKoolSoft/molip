export type ReflectionState =
  | "observation"
  | "description"
  | "connection"
  | "discovery"
  | "integration";

export type ReflectionQuestionIntent =
  | "describe"
  | "connect"
  | "discover"
  | "integrate";

export type ReflectionLoopContext = {
  currentState: ReflectionState;
  targetState: ReflectionState;

  primaryTarget: string | null;
  latestFocus: string | null;

  reason: string;
  evidence: string[];

  questionIntent: ReflectionQuestionIntent;

  previousQuestion: string | null;

  revision: ReflectionRevisionSignal | null;
  transition: ReflectionTransition | null;
};

export type ReflectionRevisionDirection =
  | "unchanged"
  | "reduced"
  | "refined"
  | "expanded";

export type ReflectionRevisionSignal = {
  direction: ReflectionRevisionDirection;

  beforeLength: number;
  afterLength: number;
  lengthChange: number;

  beforeSentenceCount: number;
  afterSentenceCount: number;
  sentenceChange: number;

  addedSentences: string[];
  removedSentences: string[];

  hasMeaningfulChange: boolean;
};

export type ReflectionTransitionType =
  | "unchanged"
  | "deepened"
  | "broadened"
  | "refined"
  | "reduced";

export type ReflectionTransition = {
  fromState: ReflectionState;
  toState: ReflectionState;

  transitionType: ReflectionTransitionType;

  reason: string;
  evidence: string[];

  hasProgress: boolean;
};

export type ReflectionQuestionContext = {
  currentState: ReflectionState;
  targetState: ReflectionState;

  questionIntent: ReflectionQuestionIntent;

  primaryTarget: string | null;
  latestFocus: string | null;

  previousQuestion: string | null;

  evidence: string[];

  revisionDirection: ReflectionRevisionDirection | null;
  transitionType: ReflectionTransitionType | null;
};

export type ReflectionQuestionResult = {
  question: string;
  intent: ReflectionQuestionIntent;

  primaryTarget: string | null;
  targetState: ReflectionState;
};

