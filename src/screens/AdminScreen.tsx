import { useState } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import BottomNav from "@/components/BottomNav";

const SEGMENT_KEYS = ["student", "early_career", "irregular"] as const;
const SEGMENT_LABELS: Record<string, string> = { student: "Student", early_career: "Early Career", irregular: "Irregular" };

const SIGNAL_NAMES = [
  "Bill Consistency", "Bill Variety", "Payment Timing", "Reload Freq",
  "Reload Consistency", "Time-to-Spend", "Balance Floor", "Spend Regularity",
  "Essential Ratio", "Tx Diversity", "GO+ Participation", "Activity Trend",
];

const DEFAULT_WEIGHTS: Record<string, number[]> = {
  student: [12, 9, 8, 7, 8, 6, 6, 9, 8, 5, 8, 14],
  early_career: [10, 8, 7, 8, 7, 6, 7, 8, 8, 6, 12, 13],
  irregular: [10, 7, 6, 7, 6, 5, 7, 7, 8, 9, 10, 18],
};

const RECENCY_OPTIONS = ["Recent Heavy", "Balanced", "Historical"];

const MOCK_SIM_ROWS = [
  { name: "Aishah", defaultTier: 2, simTier: 2, delta: "+0.0", changed: false, score: 62, color: "bg-cp-primary" },
  { name: "Haziq", defaultTier: 3, simTier: 3, delta: "+0.0", changed: false, score: 76, color: "bg-cp-success" },
  { name: "Priya", defaultTier: 1, simTier: 1, delta: "+0.0", changed: false, score: 47, color: "bg-cp-warning" },
];

const AdminScreen = () => {
  const { navigateTo } = useNavigation();
  const [segment, setSegment] = useState<string>("student");
  const [weights, setWeights] = useState<Record<string, number[]>>(() => {
    const w: Record<string, number[]> = {};
    for (const k of SEGMENT_KEYS) w[k] = [...DEFAULT_WEIGHTS[k]];
    return w;
  });
  const [recency, setRecency] = useState("Balanced");
  const [simulating, setSimulating] = useState(false);
  const [simDone, setSimDone] = useState(false);

  const currentWeights = weights[segment];
  const total = currentWeights.reduce((a, b) => a + b, 0);

  const updateWeight = (idx: number, val: number) => {
    setWeights((prev) => {
      const next = { ...prev, [segment]: [...prev[segment]] };
      next[segment][idx] = val;
      return next;
    });
  };

  const runSim = () => {
    setSimulating(true);
    setTimeout(() => { setSimulating(false); setSimDone(true); }, 800);
  };

  return (
    <div className="min-h-screen bg-cp-bg pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-14 bg-primary">
        <span className="text-[18px] font-bold text-primary-foreground">Admin Dashboard</span>
        <span className="bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-[11px] font-semibold">Admin</span>
      </div>

      {/* Segment Tabs */}
      <div className="mx-4 mt-4 flex gap-2">
        {SEGMENT_KEYS.map((s) => (
          <button
            key={s}
            onClick={() => setSegment(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              segment === s ? "bg-primary text-primary-foreground" : "bg-muted text-cp-text-med"
            }`}
          >
            {SEGMENT_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Weight Sliders */}
      <div className="mx-4 mt-3 rounded-2xl bg-cp-card shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-cp-text-dark">Feature Weights — {SEGMENT_LABELS[segment]}</h2>
            <p className="text-xs text-cp-text-light">Total must sum to 100%</p>
          </div>
          <span className={`text-sm font-bold ${total === 100 ? "text-cp-success" : "text-cp-danger"}`}>
            Total: {total}%
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {SIGNAL_NAMES.map((name, i) => (
            <div key={name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-cp-text-dark truncate mr-2">{name}</span>
                <span className="text-xs text-cp-primary font-bold w-8 text-right">{currentWeights[i]}%</span>
              </div>
              <input
                type="range"
                min={1} max={30} step={1}
                value={currentWeights[i]}
                onChange={(e) => updateWeight(i, Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-muted accent-primary cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tier Thresholds */}
      <div className="mx-4 mt-3 rounded-2xl bg-cp-card shadow-sm p-5">
        <h2 className="text-sm font-semibold text-cp-text-dark mb-3">Tier Thresholds</h2>
        <div className="flex h-8 w-full rounded-full overflow-hidden">
          {[
            { w: "40%", bg: "bg-muted", label: "None" },
            { w: "15%", bg: "bg-amber-400", label: "Builder" },
            { w: "15%", bg: "bg-cp-primary", label: "Climber" },
            { w: "15%", bg: "bg-teal-500", label: "Achiever" },
            { w: "15%", bg: "bg-cp-success", label: "Elite" },
          ].map((t) => (
            <div key={t.label} className={`${t.bg} h-full`} style={{ width: t.w }} />
          ))}
        </div>
        <div className="flex mt-1">
          {["None", "Builder", "Climber", "Achiever", "Elite"].map((l, i) => (
            <span key={l} className="text-[10px] text-cp-text-light text-center" style={{ width: i === 0 ? "40%" : "15%" }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Recency Mode */}
      <div className="mx-4 mt-3 rounded-2xl bg-cp-card shadow-sm p-4">
        <h2 className="text-sm font-semibold text-cp-text-dark">Recency Weighting</h2>
        <div className="flex gap-2 mt-2">
          {RECENCY_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRecency(r)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                recency === r ? "bg-primary text-primary-foreground" : "bg-muted text-cp-text-med"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Simulate Button */}
      <div className="mx-4 mt-4">
        <button
          onClick={runSim}
          disabled={simulating}
          className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-2xl active:scale-95 transition-all disabled:opacity-70"
        >
          {simulating ? "Simulating..." : "▶ Run Impact Simulation"}
        </button>
      </div>

      {/* Simulation Results */}
      {simDone && (
        <div className="mx-4 mt-3 rounded-2xl bg-cp-card shadow-sm p-5 animate-fade-in">
          <h2 className="text-sm font-semibold text-cp-text-dark">Live Tier Impact Preview</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted">
                  {["Persona", "Default", "Sim", "Δ Score", "Changed?"].map((h) => (
                    <th key={h} className="px-2 py-2 text-left font-semibold text-cp-text-med">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_SIM_ROWS.map((r) => (
                  <tr key={r.name} className={r.changed ? "bg-green-50" : ""}>
                    <td className="px-2 py-2 text-cp-text-dark font-medium">{r.name}</td>
                    <td className="px-2 py-2 text-cp-text-med">{r.defaultTier}</td>
                    <td className="px-2 py-2 text-cp-text-med">{r.simTier}</td>
                    <td className="px-2 py-2 text-cp-text-med">{r.delta}</td>
                    <td className="px-2 py-2">
                      {r.changed
                        ? <span className="bg-green-100 text-green-700 rounded-full px-2 text-[11px]">✓ Changed</span>
                        : <span className="text-cp-text-light">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Score Distribution */}
      <div className="mx-4 mt-3 mb-8 rounded-2xl bg-cp-card shadow-sm p-5">
        <h2 className="text-sm font-semibold text-cp-text-dark">Score Distribution (3 demo personas)</h2>
        <div className="mt-3 flex items-end justify-around h-24 relative">
          {/* Grid lines */}
          {[25, 50, 75].map((v) => (
            <div key={v} className="absolute left-0 right-0 border-t border-border" style={{ bottom: `${(v / 100) * 100}%` }} />
          ))}
          {MOCK_SIM_ROWS.map((r) => (
            <div key={r.name} className="flex flex-col items-center z-10">
              <span className="text-xs font-bold text-cp-text-dark mb-1">{r.score}</span>
              <div className={`w-10 ${r.color} rounded-t-md`} style={{ height: `${(r.score / 100) * 80}px` }} />
              <span className="text-[10px] text-cp-text-light mt-1">{r.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminScreen;
