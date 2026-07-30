import type {
  ReflectionRevisionDirection,
  ReflectionRevisionSignal,
} from "@/types/reflectionLoop";

const normalizeText = (value: string): string => {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const splitSentences = (value: string): string[] => {
  const normalized = normalizeText(value);

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/(?<=[.!?。！？])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
};

const normalizeSentenceForComparison = (
  value: string
): string => {
  return value
    .toLowerCase()
    .replace(/[.!?。！？"'“”‘’()[\]{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const findAddedSentences = (
  beforeSentences: string[],
  afterSentences: string[]
): string[] => {
  const beforeSet = new Set(
    beforeSentences.map(normalizeSentenceForComparison)
  );

  return afterSentences.filter((sentence) => {
    const normalized =
      normalizeSentenceForComparison(sentence);

    return normalized && !beforeSet.has(normalized);
  });
};

const findRemovedSentences = (
  beforeSentences: string[],
  afterSentences: string[]
): string[] => {
  const afterSet = new Set(
    afterSentences.map(normalizeSentenceForComparison)
  );

  return beforeSentences.filter((sentence) => {
    const normalized =
      normalizeSentenceForComparison(sentence);

    return normalized && !afterSet.has(normalized);
  });
};

const determineDirection = ({
  beforeText,
  afterText,
  lengthChange,
  sentenceChange,
  addedSentences,
  removedSentences,
}: {
  beforeText: string;
  afterText: string;
  lengthChange: number;
  sentenceChange: number;
  addedSentences: string[];
  removedSentences: string[];
}): ReflectionRevisionDirection => {
  if (beforeText === afterText) {
    return "unchanged";
  }

  if (
    lengthChange < 0 &&
    sentenceChange <= 0 &&
    addedSentences.length === 0
  ) {
    return "reduced";
  }

  if (
    lengthChange > 0 ||
    sentenceChange > 0 ||
    addedSentences.length > removedSentences.length
  ) {
    return "expanded";
  }

  return "refined";
};

export const analyzeReflectionRevision = ({
  beforeText,
  afterText,
}: {
  beforeText: string;
  afterText: string;
}): ReflectionRevisionSignal => {
  const normalizedBefore = normalizeText(beforeText);
  const normalizedAfter = normalizeText(afterText);

  const beforeSentences =
    splitSentences(normalizedBefore);

  const afterSentences =
    splitSentences(normalizedAfter);

  const addedSentences = findAddedSentences(
    beforeSentences,
    afterSentences
  );

  const removedSentences = findRemovedSentences(
    beforeSentences,
    afterSentences
  );

  const lengthChange =
    normalizedAfter.length - normalizedBefore.length;

  const sentenceChange =
    afterSentences.length - beforeSentences.length;

  const direction = determineDirection({
    beforeText: normalizedBefore,
    afterText: normalizedAfter,
    lengthChange,
    sentenceChange,
    addedSentences,
    removedSentences,
  });

  const hasMeaningfulChange =
    direction !== "unchanged" &&
    (
      Math.abs(lengthChange) >= 10 ||
      sentenceChange !== 0 ||
      addedSentences.length > 0 ||
      removedSentences.length > 0
    );

  return {
    direction,

    beforeLength: normalizedBefore.length,
    afterLength: normalizedAfter.length,
    lengthChange,

    beforeSentenceCount: beforeSentences.length,
    afterSentenceCount: afterSentences.length,
    sentenceChange,

    addedSentences,
    removedSentences,

    hasMeaningfulChange,
  };
};