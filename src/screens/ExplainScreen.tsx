import { useState } from "react";
import { ChevronDown } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useNavigation } from "@/hooks/useNavigation";

const MOCK = {
  headline: "Your TNG history shows consistent financial habits.",
  summary:
    "Your bill payment record is strong and you maintain a steady eWallet balance. You qualify for a RM300–500 first loan. Your score has room to grow — see below for specific actions.",
  factor_cards: [
    { factor: "Bill Payment Consistency", impact: "positive", plain_language: "You have paid bills consistently — one of the strongest signals of financial reliability." },
    { factor: "Reload Frequency", impact: "needs_work", plain_language: "Your reload frequency is below average. Aim for at least 2–3 reloads per month, even in smaller amounts." },
    { factor: "GO+ Participation", impact: "needs_work", plain_language: "You do not have a GO+ account. Opening GO+ and depositing even RM10 is one of the fastest ways to improve your score." },
    { factor: "Transaction Diversity", impact: "neutral", plain_language: "You use TNG at several merchant types. Adding 2–3 more categories would improve this." },
  ],
  nudge_quests: [
    { quest_text: "Open GO+ today and deposit RM10.", estimated_impact: "+8 to +12 points over 2 months", direction: "needs_work" },
    { quest_text: "Reload your eWallet at least 3 times this month.", estimated_impact: "+3 to +5 points over 1 month", direction: "needs_work" },
    { quest_text: "Use TNG at one new merchant category this month.", estimated_impact: "+2 to +4 points over 1 month", direction: "neutral" },
  ],
};

const IMPACT_CONFIG: Record<string, { icon: string; iconColor: string; iconBg: string; badge: string; badgeBg: string; badgeText: string }> = {
  positive: { icon: "✓", iconColor: "text-cp-success", iconBg: "bg-green-100", badge: "Strong", badgeBg: "bg-green-100", badgeText: "text-cp-success" },
  neutral: { icon: "≈", iconColor: "text-cp-warning", iconBg: "bg-amber-100", badge: "Moderate", badgeBg: "bg-amber-100", badgeText: "text-cp-warning" },
  needs_work: { icon: "↑", iconColor: "text-cp-danger", iconBg: "bg-red-100", badge: "Improve", badgeBg: "bg-red-100", badgeText: "text-cp-danger" },
};

const ExplainScreen = () => {
  const { navigateTo } = useNavigation();
  const [questsOpen, setQuestsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cp-bg">
      {/* Header with back */}
      <div className="flex items-center justify-between px-5 h-14 bg-primary">
        <div className="flex items-center gap-3">
          <span className="text-primary-foreground cursor-pointer text-lg" onClick={() => navigateTo("offer")}>←</span>
          <span className="text-[18px] font-bold text-primary-foreground">Why this result?</span>
        </div>
        <span className="text-[11px] italic text-primary-foreground/70">Powered by Experian</span>
      </div>

      {/* Headline & Summary */}
      <h1 className="mx-4 mt-4 text-lg font-semibold text-cp-text-dark">{MOCK.headline}</h1>
      <p className="mx-4 mt-2 text-sm text-cp-text-med leading-relaxed">{MOCK.summary}</p>

      {/* Factor Cards */}
      <div className="mx-4 mt-4">
        <p className="text-[11px] uppercase tracking-widest text-cp-text-light mb-3">Factors Reviewed</p>

        {MOCK.factor_cards.map((card) => {
          const cfg = IMPACT_CONFIG[card.impact];
          return (
            <div key={card.factor} className="rounded-xl bg-cp-card shadow-sm border border-border p-4 mb-3 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full ${cfg.iconBg} flex items-center justify-center flex-shrink-0`}>
                <span className={`text-base font-bold ${cfg.iconColor}`}>{cfg.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-cp-text-dark">{card.factor}</p>
                <p className="text-[13px] text-cp-text-med leading-snug mt-1">{card.plain_language}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold flex-shrink-0 ${cfg.badgeBg} ${cfg.badgeText}`}>
                {cfg.badge}
              </span>
            </div>
          );
        })}
      </div>

      {/* Improvement Quests Accordion */}
      <div className="mx-4 mt-2">
        <button
          onClick={() => setQuestsOpen(!questsOpen)}
          className="w-full flex items-center justify-between bg-purple-50 rounded-xl p-4 cursor-pointer"
        >
          <span className="text-sm font-semibold text-cp-purple">⚡ Improvement Quests</span>
          <ChevronDown
            size={18}
            className={`text-cp-purple transition-transform duration-300 ${questsOpen ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out bg-purple-50 rounded-b-xl ${
            questsOpen ? "max-h-96 px-4 pb-4" : "max-h-0"
          }`}
        >
          {MOCK.nudge_quests.map((q, i) => (
            <div key={i} className={i < MOCK.nudge_quests.length - 1 ? "mb-3" : ""}>
              <p className="text-sm text-cp-text-dark font-medium">{q.quest_text}</p>
              <p className="text-xs text-cp-success mt-1">Estimated impact: {q.estimated_impact}</p>
              <p className="text-xs text-accent font-medium mt-0.5 cursor-pointer">Start this quest →</p>
            </div>
          ))}
        </div>
      </div>

      {/* PDPA Footnote */}
      <p className="mx-4 mt-4 mb-2 text-[11px] text-cp-text-light italic text-center">
        This explanation is provided under Malaysia's PDPA requirements and logged for your records. You may contest this decision at any time.
      </p>

      <p
        className="text-center text-[13px] text-cp-primary underline cursor-pointer mt-1 mb-8"
        onClick={() => navigateTo("audit")}
      >
        View audit record →
      </p>
    </div>
  );
};

export default ExplainScreen;
