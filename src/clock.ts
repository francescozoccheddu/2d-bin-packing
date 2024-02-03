export type ClockResult = R<{
  seconds: Num;
  debugString: Str;
}>

export type Clock = () => ClockResult;

export function startClock(): Clock {
  const startTime = performance.now();
  return () => {
    const endTime = performance.now();
    const ms = endTime - startTime;
    return {
      seconds: ms / 1000,
      debugString: `${Math.round(ms)}ms`,
    };
  };
}