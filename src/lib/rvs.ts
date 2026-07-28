export function calculateRVS(latencyMs: number): number {
  const latencySeconds = latencyMs / 1000;
  if (latencySeconds < 5) return 0.9;
  if (latencySeconds < 15) return 0.5;
  return 0.2;
}
