// ─── X-Test (Impulse Control CPT) ─────────────────────────────────────────

export interface XTrialRecord {
  trial: number;
  stimulus: string;
  isNogo: boolean; // true = red jellyfish
  responded: boolean;
  rt: number; // ms; -1 if no response
  correct: boolean;
}

// ─── AX-Test (Working Memory CPT) ─────────────────────────────────────────

export type AXTrialType = "AX" | "AY" | "BX" | "BY";

export interface AXTrialRecord {
  trial: number;
  prevStimulus: string;
  stimulus: string;
  trialType: AXTrialType;
  responded: boolean;
  rt: number; // -1 if no response
  correct: boolean;
}

// ─── Output ────────────────────────────────────────────────────────────────

export interface FocusQuestScores {
  // X-Test
  xHits: number;
  xOmissions: number;
  xFalseAlarms: number;
  xCorrectRejections: number;
  xOmissionPct: number;
  xCommissionPct: number;
  xMeanRT: number;
  xSdRT: number;
  xICV: number;
  xVigSlope: number; // linear RT slope — positive = slowing (attention decay)
  cCPT_X: number; // 0-100 impulse control composite

  // AX-Test
  axHits: number;
  axOmissions: number;
  bxErrors: number; // tapped coin after non-starfish (WM + impulse failure)
  ayErrors: number; // tapped other after starfish (anticipatory error)
  axTotalAX: number;
  axTotalNonAX: number;
  axMeanRT: number;
  axSdRT: number;
  dPrime: number; // signal detection sensitivity
  cCPT_AX: number; // 0-100 working memory composite

  // Combined clinical indices
  cIA: number; // Inattention
  cHI: number; // Hyperactivity/Impulsivity
  totalTrials: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = avg(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

function linearSlope(arr: number[]): number {
  const n = arr.length;
  if (n < 2) return 0;
  const xs = arr.map((_, i) => i);
  const mx = avg(xs);
  const my = avg(arr);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (arr[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den ? Number((num / den).toFixed(4)) : 0;
}

/** Logit function for d-prime: ln(p / (1-p)) */
function logit(p: number): number {
  const clamped = Math.max(0.01, Math.min(0.99, p));
  return Math.log(clamped / (1 - clamped));
}

// ─── Main Calculation ───────────────────────────────────────────────────────

export function calcFocusQuestScores(
  xData: XTrialRecord[],
  axData: AXTrialRecord[]
): FocusQuestScores {
  // ── X-Test ──────────────────────────────────────────────────────────────
  const xGo = xData.filter((t) => !t.isNogo);
  const xNogo = xData.filter((t) => t.isNogo);

  const xHits = xGo.filter((t) => t.responded).length;
  const xOmissions = xGo.length - xHits;
  const xFalseAlarms = xNogo.filter((t) => t.responded).length;
  const xCorrectRejections = xNogo.length - xFalseAlarms;

  const xOmPct = xGo.length ? (xOmissions / xGo.length) * 100 : 0;
  const xCoPct = xNogo.length ? (xFalseAlarms / xNogo.length) * 100 : 0;

  const xRTs = xGo.filter((t) => t.rt > 0 && t.rt < 2000).map((t) => t.rt);
  const xMeanRT = Number(avg(xRTs).toFixed(1));
  const xSdRT = Number(std(xRTs).toFixed(1));
  const xICV = xMeanRT > 0 ? Number(((xSdRT / xMeanRT) * 100).toFixed(1)) : 0;
  const xVigSlope = linearSlope(xGo.map((t) => (t.rt > 0 ? t.rt : 1000)));

  const cCPT_X = Math.max(
    0,
    Math.min(100, Math.round(100 - xOmPct * 1.5 - xCoPct * 2 - xICV / 2))
  );

  // ── AX-Test ─────────────────────────────────────────────────────────────
  const axTrials = axData.filter((t) => t.trialType === "AX");
  const bxTrials = axData.filter((t) => t.trialType === "BX");
  const ayTrials = axData.filter((t) => t.trialType === "AY");
  const nonAxTrials = axData.filter((t) => t.trialType !== "AX");

  const axHits = axTrials.filter((t) => t.responded).length;
  const axOmissions = axTrials.length - axHits;
  const bxErrors = bxTrials.filter((t) => t.responded).length;
  const ayErrors = ayTrials.filter((t) => t.responded).length;

  const axRTs = axTrials
    .filter((t) => t.rt > 0 && t.rt < 2000)
    .map((t) => t.rt);
  const axMeanRT = Number(avg(axRTs).toFixed(1));
  const axSdRT = Number(std(axRTs).toFixed(1));

  // d-prime: signal detection theory
  const pHit = axTrials.length ? axHits / axTrials.length : 0;
  const pFA = nonAxTrials.length
    ? nonAxTrials.filter((t) => t.responded).length / nonAxTrials.length
    : 0;
  const dPrime = Number((logit(pHit) - logit(pFA)).toFixed(2));

  const cCPT_AX = Math.max(
    0,
    Math.min(100, Math.round(50 + dPrime * 15))
  );

  // ── Combined indices ─────────────────────────────────────────────────────
  const axTotal = axTrials.length;
  const cIA = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 -
          xOmPct * 1.2 -
          (axTotal > 0 ? (axOmissions / axTotal) * 80 : 0) -
          Math.max(0, xVigSlope) * 30
      )
    )
  );

  const bxTotal = bxTrials.length;
  const cHI = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 -
          xCoPct * 2 -
          (bxTotal > 0 ? (bxErrors / bxTotal) * 100 : 0)
      )
    )
  );

  return {
    xHits,
    xOmissions,
    xFalseAlarms,
    xCorrectRejections,
    xOmissionPct: Number(xOmPct.toFixed(1)),
    xCommissionPct: Number(xCoPct.toFixed(1)),
    xMeanRT,
    xSdRT,
    xICV,
    xVigSlope,
    cCPT_X,
    axHits,
    axOmissions,
    bxErrors,
    ayErrors,
    axTotalAX: axTrials.length,
    axTotalNonAX: nonAxTrials.length,
    axMeanRT,
    axSdRT,
    dPrime,
    cCPT_AX,
    cIA,
    cHI,
    totalTrials: xData.length + axData.length,
  };
}
