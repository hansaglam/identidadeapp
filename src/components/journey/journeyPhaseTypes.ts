/** Journey faz kartı — theme.ts JOURNEY_PHASES ile uyumlu alt küme. */
export interface JourneyPhaseDef {
  id: number;
  label: string;
  days: string;
  startDay: number;
  endDay: number;
  subtitle: string;
}
