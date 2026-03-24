import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { simulateConfig } from "@/services/api";
import BottomNav from "@/components/BottomNav";

const SEGMENT_KEYS = ["student", "early_career", "irregular"] as const;
const SEGMENT_LABELS: Record<string, string> = { student: "Student", early_career: "Early Career", irregular: "Irregular" };

const SIGNAL_NAMES = [
  "Bill Consistency", "Bill Variety", "Payment Timing", "Reload Freq",
  "Reload Consistency", "Time-to-Spend", "Balance Floor", "Spend Regularity",
  "Essential Ratio", "Tx Diversity", "GO+ Participation", "Activity Trend",
];

const SIGNAL_KEYS = [
  "bill_consistency", "bill_variety", "payment_timing", "reload_freq",
  "reload_consistency", "time_to_spend", "balance_floor", "spend_regularity",
  "essential_ratio", "tx_diversity", "go_plus", "activity_trend",
];

const DEFAULT_WEIGHTS: Record<string, number[]> = {
  student: [12, 9, 8, 7, 8, 6, 6, 9, 8, 5, 8, 14],
  early_career: [10, 8, 7, 8, 7, 6, 7, 8, 8, 6, 12, 13],
  irregular: [10, 7, 6, 7, 6, 5, 7, 7, 8, 9, 10, 18],
};

const RECENCY_OPTIONS = ["Recent Heavy", "Balanced", "Historical"];

interface SimResult {
  persona: string;
  name: string;
  default_tier: number;
  simulated_tier: number;
  default_score: number;
  simulated_score: number;
  score_delta: number;
  tier_changed: boolean;
}

const AdminScreen = () => {
  const { toast } = useToast();
  const [segment, setSegment] = useState<string>("student");
  const [weights, setWeights] = useState<Record<string, number[]>>(() => {
    const w: Record<string, number[]> = {};
    for (const k of SEGMENT_KEYS) w[k] = [...DEFAULT_WEIGHTS[k]];
    return w;
  });
  const [recency, setRecency] = useState("Balanced");
  const [simulating, setSimulating] = useState(false);
  const [simResults, setSimResults] = useState<SimResult[] | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  const currentWeights = weights[segment];
  const total = currentWeights.reduce((a, b) => a + b, 0);

  const updateWeight = (idx: number, val: number) => {
    setWeights((prev) => {
      const next = { ...prev, [segment]: [...prev[segment]] };
      next[segment][idx] = val;
      return next;
    });
  };

  const runSim = async () => {
    setSimulating(true);
    setSimError(null);
    try {
      const payload = {
        segment_weights: {},
        tier_thresholds: {},
        recency_mode: recency.toLowerCase().replace(" ", "_"),
      };
      console.log('Simulate payload:', JSON.stringify(payload));

      const response = await fetch(
        'https://e37fcc4b-dc6d-4821-85bc-7940a9476e3f-00-bxzh6v4v6i34.picard.replit.dev/admin/simulate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer admin-token-creditpath-2026'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Simulate failed: ${response.status} — ${errText}`);
      }

      const result = await response.json();
      console.log('Simulate result:', JSON.stringify(result));

      // Map API response to SimResult array
      const results: SimResult[] = (result.results || result.persona_results || []).map((r: Record<string, unknown>) => ({
        persona: r.persona as string,
        name: (r.name || r.persona_name || r.persona) as string,
        default_tier: (r.default_tier ?? r.original_tier ?? 0) as number,
        simulated_tier: (r.simulated_tier ?? r.sim_tier ?? 0) as number,
        default_score: (r.default_score ?? r.original_score ?? 0) as number,
        simulated_score: (r.simulated_score ?? r.sim_score ?? 0) as number,
        score_delta: (r.score_delta ?? r.delta ?? 0) as number,
        tier_changed: (r.tier_changed ?? r.changed ?? false) as boolean,
      }));

      setSimResults(results);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("Simulation error:", err);
      setSimError(msg);
      toast({ variant: "destructive", description: `Simulation failed — ${msg}` });
    } finally {
      setSimulating(false);
    }
  };

  const SIM_COLORS: Record<string, string> = { aishah: "bg-cp-primary", haziq: "bg-cp-success", priya: "bg-cp-warning" };

  return (
    <div className="min-h-screen bg-cp-bg pb-8">
      <div className="flex items-center justify-between px-5 h-14 bg-primary">
        <span className="text-[18px] font-bold text-primary-foreground">Admin Dashboard</span>
        <span className="bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-[11px] font-semibold">Admin</span>
      </div>

      {/* Segment Tabs */}
      <div className="mx-4 mt-4 flex gap-2">
        {SEGMENT_KEYS.map((s) => (
          <button key={s} onClick={() => setSegment(s)} className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${segment === s ? "bg-primary text-primary-foreground" : "bg-muted text-cp-text-med"}`}>
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
          <span className={`text-sm font-bold ${total === 100 ? "text-cp-success" : "text-cp-danger"}`}>Total: {total}%</span>
        </div>
        <div className="mt-4 space-y-3">
          {SIGNAL_NAMES.map((name, i) => (
            <div key={name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-cp-text-dark truncate mr-2">{name}</span>
                <span className="text-xs text-cp-primary font-bold w-8 text-right">{currentWeights[i]}%</span>
              </div>
              <input type="range" min={1} max={30} step={1} value={currentWeights[i]} onChange={(e) => updateWeight(i, Number(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-muted accent-primary cursor-pointer" />
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
            <button key={r} onClick={() => setRecency(r)} className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${recency === r ? "bg-primary text-primary-foreground" : "bg-muted text-cp-text-med"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Simulate Button */}
      <div className="mx-4 mt-4">
        <button onClick={runSim} disabled={simulating} className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-2xl active:scale-95 transition-all disabled:opacity-70">
          {simulating ? "Simulating..." : "▶ Run Impact Simulation"}
        </button>
      </div>

      {/* Error Display */}
      {simError && (
        <div className="mx-4 mt-2 rounded-xl bg-destructive/10 border border-destructive p-3">
          <p className="text-sm text-destructive font-medium break-all">{simError}</p>
        </div>
      )}


      {simResults && (
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
                {simResults.map((r) => (
                  <tr key={r.persona || r.name} className={r.tier_changed ? "bg-green-50" : ""}>
                    <td className="px-2 py-2 text-cp-text-dark font-medium">{r.name}</td>
                    <td className="px-2 py-2 text-cp-text-med">{r.default_tier}</td>
                    <td className="px-2 py-2 text-cp-text-med">{r.simulated_tier}</td>
                    <td className="px-2 py-2 text-cp-text-med">{r.score_delta > 0 ? "+" : ""}{r.score_delta.toFixed(1)}</td>
                    <td className="px-2 py-2">
                      {r.tier_changed
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
      {simResults && (
        <div className="mx-4 mt-3 mb-8 rounded-2xl bg-cp-card shadow-sm p-5">
          <h2 className="text-sm font-semibold text-cp-text-dark">Score Distribution (simulated)</h2>
          <div className="mt-3 flex items-end justify-around h-24 relative">
            {[25, 50, 75].map((v) => (
              <div key={v} className="absolute left-0 right-0 border-t border-border" style={{ bottom: `${(v / 100) * 100}%` }} />
            ))}
            {simResults.map((r) => (
              <div key={r.persona || r.name} className="flex flex-col items-center z-10">
                <span className="text-xs font-bold text-cp-text-dark mb-1">{Math.round(r.simulated_score)}</span>
                <div className={`w-10 ${SIM_COLORS[r.persona] || "bg-cp-primary"} rounded-t-md`} style={{ height: `${(r.simulated_score / 100) * 80}px` }} />
                <span className="text-[10px] text-cp-text-light mt-1">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminScreen;
