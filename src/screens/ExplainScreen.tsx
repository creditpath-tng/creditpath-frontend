import { useState } from "react";
import { ChevronDown } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useNavigation } from "@/hooks/useNavigation";
import { useAppContext } from "@/context/AppContext";

const IMPACT_CONFIG: Record<string, { icon: string; iconColor: string; iconBg: string; badge: string; badgeBg: string; badgeText: string }> = {
  positive: { icon: "✓", iconColor: "text-cp-success", iconBg: "bg-green-100", badge: "Strong", badgeBg: "bg-green-100", badgeText: "text-cp-success" },
  neutral: { icon: "≈", iconColor: "text-cp-warning", iconBg: "bg-amber-100", badge: "Moderate", badgeBg: "bg-amber-100", badgeText: "text-cp-warning" },
  needs_work: { icon: "↑", iconColor: "text-cp-danger", iconBg: "bg-red-100", badge: "Improve", badgeBg: "bg-red-100", badgeText: "text-cp-danger" },
};

const FALLBACK = {
  headline: "Your TNG history shows consistent financial habits.",
  summary: "Your bill payment record is strong and you maintain a steady eWallet balance.",
  factor_cards: [],
  nudge_quests: [],
};

const ExplainScreen = () => {
  const { navigateTo } = useNavigation();
  const { explainData } = useAppContext();
  const [questsOpen, setQuestsOpen] = useState(false);

  console.log('explainData:', JSON.stringify(explainData));

  const raw = (explainData || FALLBACK) as Record<string, unknown>;
  const data = {
    headline: (raw.headline as string) || FALLBACK.headline,
    summary: (raw.summary as string) || FALLBACK.summary,
    factor_cards: (raw.factor_cards || raw.factors || raw.factor_list || []) as { factor: string; impact: string; plain_language: string }[],
    nudge_quests: (raw.nudge_quests || raw.quests || raw.nudges || []) as { quest_text: string; estimated_impact: string; direction: string }[],
  };

  return (
    <div className="min-h-screen bg-cp-bg pb-20">
      <div className="flex items-center justify-between px-5 h-14 bg-primary">
        <div className="flex items-center gap-3">
          <span className="text-primary-foreground cursor-pointer text-lg" onClick={() => navigateTo("offer")}>←</span>
          <span className="text-[18px] font-bold text-primary-foreground">Why this result?</span>
        </div>
        <span className="text-[11px] italic text-primary-foreground/70">Powered by Experian</span>
      </div>

      <h1 className="mx-4 mt-4 text-lg font-semibold text-cp-text-dark">{data.headline}</h1>
      <p className="mx-4 mt-2 text-sm text-cp-text-med leading-relaxed">{data.summary}</p>

      {/* Factor Cards */}
      <div className="mx-4 mt-4">
        <p className="text-[11px] uppercase tracking-widest text-cp-text-light mb-3">Factors Reviewed</p>
        {(data.factor_cards || []).map((card) => {
          const cfg = IMPACT_CONFIG[card.impact] || IMPACT_CONFIG.neutral;
          return (
            <div key={card.factor} className="rounded-xl bg-cp-card shadow-sm border border-border p-4 mb-3 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full ${cfg.iconBg} flex items-center justify-center flex-shrink-0`}>
                <span className={`text-base font-bold ${cfg.iconColor}`}>{cfg.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-cp-text-dark">{card.factor}</p>
                <p className="text-[13px] text-cp-text-med leading-snug mt-1">{card.plain_language}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold flex-shrink-0 ${cfg.badgeBg} ${cfg.badgeText}`}>{cfg.badge}</span>
            </div>
          );
        })}
      </div>

      {/* Improvement Quests */}
      {data.nudge_quests && data.nudge_quests.length > 0 && (
        <div className="mx-4 mt-2">
          <button onClick={() => setQuestsOpen(!questsOpen)} className="w-full flex items-center justify-between bg-purple-50 rounded-xl p-4 cursor-pointer">
            <span className="text-sm font-semibold text-cp-purple">⚡ Improvement Quests</span>
            <ChevronDown size={18} className={`text-cp-purple transition-transform duration-300 ${questsOpen ? "rotate-180" : ""}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ease-out bg-purple-50 rounded-b-xl ${questsOpen ? "max-h-96 px-4 pb-4" : "max-h-0"}`}>
            {data.nudge_quests.map((q, i) => (
              <div key={i} className={i < data.nudge_quests.length - 1 ? "mb-3" : ""}>
                <p className="text-sm text-cp-text-dark font-medium">{q.quest_text}</p>
                <p className="text-xs text-cp-success mt-1">Estimated impact: {q.estimated_impact}</p>
                <p className="text-xs text-accent font-medium mt-0.5 cursor-pointer">Start this quest →</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mx-4 mt-4 mb-2 text-[11px] text-cp-text-light italic text-center">
        This explanation is provided under Malaysia's PDPA requirements and logged for your records. You may contest this decision at any time.
      </p>
      <p className="text-center text-[13px] text-cp-primary underline cursor-pointer mt-1 mb-8" onClick={() => navigateTo("audit")}>View audit record →</p>
      <BottomNav />
    </div>
  );
};

export default ExplainScreen;
