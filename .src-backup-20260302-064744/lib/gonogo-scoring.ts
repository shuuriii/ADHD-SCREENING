export interface TrialRecord {
  trial: number;
  trialType: "go" | "nogo";
  responded: boolean;
  rt: number; // -1 if no response
  correct: boolean;
}

export interface GoNoGoScores {
  aqvis: number;
  rcqvis: number;
  icv: number;
  meanRT: number;
  sdRT: number;
  vigSlope: number;
  omissions: number;
  falseAlarms: number;
  hits: number;
  correctRejections: number;
  omissionPct: number;
  commissionPct: number;
  goTotal: number;
  nogoTotal: number;
}

function avg(a: number[]): number {
  return a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
}

function std(a: number[]): number {
  if (a.length < 2) return 0;
  const m = avg(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / a.length);
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
    den += (xs[i] - mx) * (xs[i] - mx);
  }
  return den ? Number((num / den).toFixed(3)) : 0;
}

export function calcGoNoGoScores(data: TrialRecord[]): GoNoGoScores {
  const go = data.filter((t) => t.trialType === "go");
  const nogo = data.filter((t) => t.trialType === "nogo");

  const hits = go.filter((t) => t.responded).length;
  const omissions = go.length - hits;
  const falseAlarms = nogo.filter((t) => t.responded).length;
  const correctRejections = nogo.length - falseAlarms;

  const omPct = go.length ? (omissions / go.length) * 100 : 0;
  const coPct = nogo.length ? (falseAlarms / nogo.length) * 100 : 0;

  const rts = go
    .filter((t) => t.rt > 0 && t.rt < 3000)
    .map((t) => t.rt);
  const meanRT = Number(avg(rts).toFixed(1));
  const sdRT = Number(std(rts).toFixed(1));
  const icv = meanRT > 0 ? Number(((sdRT / meanRT) * 100).toFixed(1)) : 0;
  const vigSlope = linearSlope(
    go.map((t) => (t.rt > 0 ? t.rt : 1500))
  );

  const aqvis = Math.max(0, Math.min(100, Math.round(100 - omPct * 2 - icv / 2)));
  const rcqvis = Math.max(0, Math.min(100, Math.round(100 - coPct * 3)));

  return {
    aqvis,
    rcqvis,
    icv,
    meanRT,
    sdRT,
    vigSlope,
    omissions,
    falseAlarms,
    hits,
    correctRejections,
    omissionPct: Number(omPct.toFixed(1)),
    commissionPct: Number(coPct.toFixed(1)),
    goTotal: go.length,
    nogoTotal: nogo.length,
  };
}
