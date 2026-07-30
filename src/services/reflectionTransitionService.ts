import type {
  ReflectionRevisionSignal,
  ReflectionState,
  ReflectionTransition,
  ReflectionTransitionType,
} from "@/types/reflectionLoop";

const stateOrder: Record<ReflectionState, number> = {
  observation: 0,
  description: 1,
  connection: 2,
  discovery: 3,
  integration: 4,
};

const getHigherState = (
  currentState: ReflectionState
): ReflectionState => {
  switch (currentState) {
    case "observation":
      return "description";

    case "description":
      return "connection";

    case "connection":
      return "discovery";

    case "discovery":
      return "integration";

    case "integration":
      return "integration";
  }
};

const determineTransitionType = ({
  fromState,
  toState,
  revision,
}: {
  fromState: ReflectionState;
  toState: ReflectionState;
  revision: ReflectionRevisionSignal;
}): ReflectionTransitionType => {
  if (revision.direction === "unchanged") {
    return "unchanged";
  }

  if (revision.direction === "reduced") {
    return "reduced";
  }

  if (stateOrder[toState] > stateOrder[fromState]) {
    return "deepened";
  }

  if (
    revision.direction === "expanded" &&
    revision.addedSentences.length > 0
  ) {
    return "broadened";
  }

  return "refined";
};

const determineToState = ({
  currentState,
  revision,
}: {
  currentState: ReflectionState;
  revision: ReflectionRevisionSignal;
}): ReflectionState => {
  if (!revision.hasMeaningfulChange) {
    return currentState;
  }

  if (revision.direction === "reduced") {
    return currentState;
  }

  if (
    revision.direction === "expanded" &&
    (
      revision.sentenceChange > 0 ||
      revision.addedSentences.length > 0
    )
  ) {
    return getHigherState(currentState);
  }

  return currentState;
};

const buildReason = ({
  fromState,
  toState,
  revision,
}: {
  fromState: ReflectionState;
  toState: ReflectionState;
  revision: ReflectionRevisionSignal;
}): string => {
  if (revision.direction === "unchanged") {
    return "질문 이후 기록에 확인할 수 있는 변화가 나타나지 않았습니다.";
  }

  if (revision.direction === "reduced") {
    return "기록이 줄어들었지만, 이것만으로 Reflection이 얕아졌다고 판단하지 않습니다.";
  }

  if (stateOrder[toState] > stateOrder[fromState]) {
    return "질문 이후 새로운 문장이나 설명이 추가되어 Reflection이 한 단계 확장된 것으로 봅니다.";
  }

  if (revision.direction === "refined") {
    return "새로운 내용을 크게 추가하기보다 기존 표현을 다듬은 변화가 나타났습니다.";
  }

  return "질문 이후 기록이 넓어졌지만 현재 Reflection 상태는 유지되었습니다.";
};

const selectEvidence = (
  revision: ReflectionRevisionSignal,
  limit = 3
): string[] => {
  if (revision.addedSentences.length > 0) {
    return revision.addedSentences.slice(0, limit);
  }

  if (revision.removedSentences.length > 0) {
    return revision.removedSentences.slice(0, limit);
  }

  return [];
};

export const createReflectionTransition = ({
  currentState,
  revision,
}: {
  currentState: ReflectionState;
  revision: ReflectionRevisionSignal;
}): ReflectionTransition => {
  const toState = determineToState({
    currentState,
    revision,
  });

  const transitionType = determineTransitionType({
    fromState: currentState,
    toState,
    revision,
  });

  return {
    fromState: currentState,
    toState,

    transitionType,

    reason: buildReason({
      fromState: currentState,
      toState,
      revision,
    }),

    evidence: selectEvidence(revision),

    hasProgress:
      transitionType === "deepened" ||
      transitionType === "broadened",
  };
};