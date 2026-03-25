import { useState, useEffect } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { getAuditLog } from "@/services/api";
import BottomNav from "@/components/BottomNav";

const AuditScreen = () => {
  const { navigateTo } = useNavigation();
  const { toast } = useToast();
  const { auditData, setAuditData, selectedPersona } = useAppContext();
  const [expandedIdx, setExpandedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudit = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAuditLog(selectedPersona || undefined);
        setAuditData(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(`Unable to load audit records: ${msg}`);
        console.error("Audit fetch error:", err);
        toast({ variant: "destructive", description: `Connection error — ${msg}` });
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, [selectedPersona]);

  const entries = (auditData as { entries?: { decision_id: string; timestamp: string; score: number; tier: number; explanation_generated: boolean; admp_compliant: boolean; explanation_hash: string | null }[] } | null)?.entries || [];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <div className="min-h-screen bg-cp-bg pb-20">
      <div className="flex items-center justify-between px-5 h-14 bg-primary">
        <span className="text-[18px] font-bold text-primary-foreground">Audit Record</span>
        <span className="text-[11px] italic text-primary-foreground/70">Powered by Experian</span>
      </div>

      <div className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-base flex-shrink-0">ℹ️</span>
        <p className="text-[13px] text-cp-primary leading-relaxed">
          All credit assessments are logged under Malaysia's Personal Data Protection Act (PDPA) and ADMP requirements. You may request a copy or contest any decision at any time.
        </p>
      </div>

      <div className="mx-4 mt-3 flex gap-2 flex-wrap">
        {["PDPA Compliant", "ADMP 2025", "Right to Explanation"].map((p) => (
          <span key={p} className="rounded-full bg-muted px-3 py-1 text-[11px] text-cp-text-med">{p}</span>
        ))}
      </div>

      <div className="mx-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-cp-text-dark">Decision History</h2>
          {entries.length > 0 && (
            <button onClick={() => setAuditData({ entries: [] })} className="text-[12px] text-cp-danger cursor-pointer">Clear History</button>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-cp-danger">{error}</div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="text-center py-8 text-sm text-cp-text-light">No audit entries found</div>
        )}

        {!loading && !error && entries.map((entry, i) => {
          const isOpen = expandedIdx === i;
          return (
            <div key={entry.decision_id} className="rounded-xl bg-cp-card shadow-sm border border-border mb-3 overflow-hidden">
              <div className="p-4 cursor-pointer" onClick={() => setExpandedIdx(isOpen ? -1 : i)}>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-cp-text-med">
                    {new Date(entry.timestamp).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${entry.admp_compliant === true ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {entry.admp_compliant === true ? "ADMP ✓" : "Pending"}
                  </span>
                </div>
                <p className="text-[13px] text-cp-text-dark font-medium mt-1">Credit Tier {entry.tier} · Score: {Math.round(entry.score)}/100</p>
                <p className="text-[11px] text-cp-text-light mt-1">↕ View details</p>
              </div>
              <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-48" : "max-h-0"}`}>
                <div className="px-4 pb-4 bg-muted/50 border-t border-border pt-3 space-y-1">
                  <p className="text-[11px] text-gray-400 font-mono truncate">Decision ID: {(entry.decision_id || '').slice(0, 36)}</p>
                  <p className="text-[11px] text-gray-400 font-mono truncate">Hash: {entry.explanation_hash || "Not generated"}</p>
                  <p className={`text-xs ${entry.explanation_generated ? "text-green-600" : "text-amber-600"}`}>
                    Explanation generated: {entry.explanation_generated ? "Yes ✓" : "No — explanation not yet requested"}
                  </p>
                  <p className="text-xs text-gray-500">Factors reviewed: 12</p>
                </div>
              </div>
            </div>
          );
        })}

      <div className="mx-4 mt-4 flex items-center gap-3 bg-muted rounded-xl p-4">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-sm">E</span>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-cp-text-dark">Powered by Experian Credit Bureau Intelligence</p>
          <p className="text-[11px] text-cp-text-light">Licensed Credit Reporting Agency · Malaysia</p>
        </div>
      </div>

      <div className="mx-4 mt-3 mb-8">
        <button onClick={() => toast({ description: "Full export available in production release" })} className="w-full h-12 rounded-2xl border-2 border-border bg-cp-card text-cp-text-med text-sm font-medium active:scale-95 transition-all">
          ⬇ Download Record
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default AuditScreen;
