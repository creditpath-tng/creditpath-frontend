import { useState } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

const MOCK_ENTRIES = [
  { decision_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", timestamp: "2026-04-25T09:34:00Z", score: 62, tier: 2, explanation_generated: true, admp_compliant: true, explanation_hash: "sha256-a1b2c3d4e5f6" },
  { decision_id: "e5f6g7h8-i9j0-1234-klmn-op5678901234", timestamp: "2026-04-25T09:20:00Z", score: 58, tier: 2, explanation_generated: false, admp_compliant: false, explanation_hash: null as string | null },
];

const AuditScreen = () => {
  const { navigateTo } = useNavigation();
  const { toast } = useToast();
  const [expandedIdx, setExpandedIdx] = useState(0);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <div className="min-h-screen bg-cp-bg pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-14 bg-primary">
        <span className="text-[18px] font-bold text-primary-foreground">Audit Record</span>
        <span className="text-[11px] italic text-primary-foreground/70">Powered by Experian</span>
      </div>

      {/* Info Banner */}
      <div className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-base flex-shrink-0">ℹ️</span>
        <p className="text-[13px] text-cp-primary leading-relaxed">
          All credit assessments are logged under Malaysia's Personal Data Protection Act (PDPA) and ADMP requirements. You may request a copy or contest any decision at any time.
        </p>
      </div>

      {/* Framework Pills */}
      <div className="mx-4 mt-3 flex gap-2 flex-wrap">
        {["PDPA Compliant", "ADMP 2025", "Right to Explanation"].map((p) => (
          <span key={p} className="rounded-full bg-muted px-3 py-1 text-[11px] text-cp-text-med">{p}</span>
        ))}
      </div>

      {/* Audit Entries */}
      <div className="mx-4 mt-4">
        <h2 className="text-sm font-semibold text-cp-text-dark mb-3">Decision History</h2>

        {MOCK_ENTRIES.map((entry, i) => {
          const isOpen = expandedIdx === i;
          return (
            <div key={entry.decision_id} className="rounded-xl bg-cp-card shadow-sm border border-border mb-3 overflow-hidden">
              <div className="p-4 cursor-pointer" onClick={() => setExpandedIdx(isOpen ? -1 : i)}>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-cp-text-med">{formatDate(entry.timestamp)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${entry.admp_compliant ? "bg-green-100 text-green-700" : "bg-muted text-cp-text-light"}`}>
                    {entry.admp_compliant ? "ADMP ✓" : "Pending"}
                  </span>
                </div>
                <p className="text-[13px] text-cp-text-dark font-medium mt-1">
                  Credit Tier {entry.tier} · Score: {entry.score}/100
                </p>
                <p className="text-[11px] text-cp-text-light mt-1">↕ View details</p>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-48" : "max-h-0"}`}>
                <div className="px-4 pb-4 bg-muted/50 border-t border-border pt-3 space-y-1">
                  <p className="text-[11px] text-cp-text-light font-mono truncate">ID: {entry.decision_id}</p>
                  <p className="text-[11px] text-cp-text-light font-mono truncate">
                    Hash: {entry.explanation_hash || "Not generated"}
                  </p>
                  <p className="text-xs text-cp-text-med">Explanation generated: {entry.explanation_generated ? "Yes" : "No"}</p>
                  <p className="text-xs text-cp-text-med">Factors reviewed: 12</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Experian Attribution */}
      <div className="mx-4 mt-4 flex items-center gap-3 bg-muted rounded-xl p-4">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-sm">E</span>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-cp-text-dark">Powered by Experian Credit Bureau Intelligence</p>
          <p className="text-[11px] text-cp-text-light">Licensed Credit Reporting Agency · Malaysia</p>
        </div>
      </div>

      {/* Download */}
      <div className="mx-4 mt-3 mb-8">
        <button
          onClick={() => toast({ description: "Full export available in production release" })}
          className="w-full h-12 rounded-2xl border-2 border-border bg-cp-card text-cp-text-med text-sm font-medium active:scale-95 transition-all"
        >
          ⬇ Download Record
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default AuditScreen;
