import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { simulateConfig } from "@/services/api";
import BottomNav from "@/components/BottomNav";

const SEGMENT_KEYS = ["student", "early_career", "irregular"] as const;
const SEGMENT_LABELS: Record<string, string> = { student: "Student", early_career: "Early Career", irregular: "Irregular" };

const SIGNAL_KEYS = [
  "bill_payment_consistency", "bill_payment_variety", "payment_timing_regularity", "reload_frequency",
  "reload_amount_consistency", "time_to_spend_after_reload", "balance_floor_maintenance", "spending_regularity",
  "essential_vs_discretionary", "transaction_diversity", "go_plus_participation", "account_activity_trend",
];

const SIGNAL_NAMES = [
  "Bill Consistency", "Bill Variety", "Payment Timing", "Reload Freq",
  "Reload Consistency", "Time-to-Spend", "Balance Floor", "Spend Regularity",
  "Essential Ratio", "Tx Diversity", "GO+ Participation", "Activity Trend",
];

const DEFAULT_WEIGHTS: Record<string, Record<string, number>> = {
  student: {
    bill_payment_consistency: 12, bill_payment_variety: 9, payment_timing_regularity: 8, reload_frequency: 7,
    reload_amount_consistency: 8, time_to_spend_after_reload: 6, balance_floor_maintenance: 6, spending_regularity: 9,
    essential_vs_discretionary: 8, transaction_diversity: 5, go_plus_participation: 8, account_activity_trend: 14,
  },
  early_career: {
    bill_payment_consistency: 10, bill_payment_variety: 8, payment_timing_regularity: 7, reload_frequency: 8,
    reload_amount_consistency: 7, time_to_spend_after_reload: 6, balance_floor_maintenance: 7, spending_regularity: 8,
    essential_vs_discretionary: 8, transaction_diversity: 6, go_plus_participation: 12, account_activity_trend: 13,
  },
  irregular: {
    bill_payment_consistency: 10, bill_payment_variety: 7, payment_timing_regularity: 6, reload_frequency: 7,
    reload_amount_consistency: 6, time_to_spend_after_reload: 5, balance_floor_maintenance: 7, spending_regularity: 7,
    essential_vs_discretionary: 8, transaction_diversity: 9, go_plus_participation: 10, account_activity_trend: 18,
  },
};

const RECENCY_OPTIONS = ["Recent Heavy", "Balanced", "Historical"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SimResult = Record<string, any>;

const AdminScreen = () => {
  const { toast } = useToast();
  const [segment, setSegment] = useState<string>("student");
  const [weights, setWeights] = useState<Record<string, Record<string, number>>>(() => {
    const w: Record<string, Record<string, number>> = {};
    for (const k of SEGMENT_KEYS) w[k] = { ...DEFAULT_WEIGHTS[k] };
    return w;
  });
  const [recency, setRecency] = useState("Balanced");
  const [simulating, setSimulating] = useState(false);
  const [simResults, setSimResults] = useState<SimResult[]>([]);
  const [simError, setSimError] = useState<string | null>(null);

  const currentWeights = weights[segment];
  const total = SIGNAL_KEYS.reduce((sum, key) => sum + (currentWeights[key] || 0), 0);

  const updateWeight = (signalKey: string, val: number) => {
    setWeights((prev) => ({
      ...prev,
      [segment]: { ...prev[segment], [signalKey]: val },
    }));
  };

  const runSim = async () => {
    setSimulating(true);
    setSimError(null);
    try {
      // Convert integer percentages to decimals
      const decimalWeights: Record<string, Record<string, number>> = {};
      for (const seg of SEGMENT_KEYS) {
        decimalWeights[seg] = {};
        for (const key of SIGNAL_KEYS) {
          decimalWeights[seg][key] = (weights[seg][key] || 0) / 100;
        }
      }

      const payload = {
        segment_weights: decimalWeights,
        tier_thresholds: {},
        recency_mode: recency.toLowerCase().replace(" ", "_"),
      };
      console.log('Simulation payload:', JSON.stringify(payload, null, 2));

      const result = await simulateConfig(payload);
      console.log('Simulation result:', JSON.stringify(result, null, 2));
      const rawResults = result.simulation_results || result.results || result.persona_results || [];
      setSimResults(rawResults);
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
          {SIGNAL_KEYS.map((key, i) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-cp-text-dark truncate mr-2">{SIGNAL_NAMES[i]}</span>
                <span className="text-xs text-cp-primary font-bold w-8 text-right">{currentWeights[key]}%</span>
              </div>
              <input type="range" min={1} max={30} step={1} value={currentWeights[key]} onChange={(e) => updateWeight(key, Number(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-muted accent-primary cursor-pointer" />
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


      {simResults.length > 0 && (
        <div className="mx-4 mt-3 rounded-2xl bg-cp-card shadow-sm p-5 animate-fade-in">
          <h2 className="text-sm font-semibold text-cp-text-dark">Live Tier Impact Preview</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted">
                  {["Persona", "Segment", "Score", "Tier", "Changed?"].map((h) => (
                    <th key={h} className="px-2 py-2 text-left font-semibold text-cp-text-med">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {simResults.map((r, i) => (
                  <tr key={i} className={r.tier_changed ? "bg-green-50" : ""}>
                    <td className="px-2 py-2 text-cp-text-dark font-medium">{r.persona || r.name || '—'}</td>
                    <td className="px-2 py-2 text-cp-text-med">{r.segment || '—'}</td>
                    <td className="px-2 py-2 text-cp-text-med">{Math.round(r.simulated_score ?? r.score ?? 0)}</td>
                    <td className="px-2 py-2 text-cp-text-med">{r.simulated_tier_label || r.simulated_tier || r.tier || '—'}</td>
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
    </div>
  );
};

export default AdminScreen;
