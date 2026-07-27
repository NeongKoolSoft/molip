export type ReflectionState =
  | "observation"
  | "expanding"
  | "connecting"
  | "discovering"
  | "integrated";
  

export type ReflectionLoopContext = {
  currentState: ReflectionState;
  nextState: ReflectionState;
  reason: string;
};