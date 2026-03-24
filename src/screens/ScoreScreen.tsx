import { useEffect, useState, useRef } from "react";
import HeaderBar from "@/components/HeaderBar";
import BottomNav from "@/components/BottomNav";
import { useNavigation } from "@/hooks/useNavigation";
import { useAppContext } from "@/context/AppContext";

const TIER_CONFIG: Record<number, { emoji: string; bg: string; text: string }> = {
  0: { emoji: "", bg: "bg-gray-100", text: "text-gray-500" },
  1: { emoji: "⚡", bg: "bg-amber-100", text: "text-amber-700" },
  2: { emoji: "🔥", bg: "bg-blue-100", text: "text-cp-primary" },
  3: { emoji: "🏆", bg: "bg-teal-100", text: "text-teal-700" },
  4: { emoji: "💎", bg: "bg-green-100", text: "text-cp-success" },
};

const DIMENSION_GROUPS = [
  { label: "PAYMENT RELIABILITY", colorClass: "text-cp-success", signals: ["Bill Payment Consistency", "Bill Payment Variety", "Payment Timing Regularity"] },
  { label: "WALLET ACTIVITY", colorClass: "text-cp-primary", signals: ["Reload Frequency", "Reload Amount Consistency", "Time-to-Spend After Reload", "Balance Floor Maintenance"] },
  { label: "SPENDING BEHAVIOUR", colorClass: "text-cp-warning", signals: ["Spending Regularity", "Essential vs Discretionary Ratio", "Transaction Diversity"] },
  { label: "FINANCIAL GROWTH", colorClass: "text-cp-purple", signals: ["GO+ Participation", "Account Activity Trend"] },
];

const DIRECTION_COLORS: Record<string, string> = { positive: "text-cp-success", neutral: "text-cp-warning", needs_work: "text-cp-danger" };
const DIRECTION_BAR_COLORS: Record<string, string> = { positive: "bg-cp-success", neutral: "bg-cp-warning", needs_work: "bg-cp-danger" };

const CIRCUMFERENCE = 2 * Math.PI * 90;

const TIER_THRESHOLDS = [0, 40, 55, 70, 85];

const NEXT_TIER_NAMES: Record<number, string> = { 1: "Builder", 2: "Climber", 3: "Achiever", 4: "Elite" };

const ScoreScreen = () => {
  const { navigateTo } = useNavigation();
  const { scoreData } = useAppContext();
  const [displayScore, setDisplayScore] = useState(0);
  const [arcOffset, setArcOffset] = useState(CIRCUMFERENCE);
  const [showBadge, setShowBadge] = useState(false);
  const [barsAnimated, setBarsAnimated] = useState(false);
  const [tierProgress, setTierProgress] = useState(0);
  const animFrameRef = useRef<number>(0);

  const data = scoreData as {
    score: number; tier: number; tier_label: string; segment: string;
    recency_trend: string; persona_name: string;
    qualifying_amount_min: number; qualifying_amount_max: number;
    factors: { display_name: string; normalised_score: number; direction: string; weighted_contribution: number }[];
  } | null;

  const score = Math.round(data?.score ?? 0);
  const tier = data?.tier ?? 0;
  const tierLabel = data?.tier_label ?? "";
  const tierCfg = TIER_CONFIG[tier] || TIER_CONFIG[0];
  const nextTierIdx = Math.min(tier + 1, 4);
  const nextTierScore = TIER_THRESHOLDS[nextTierIdx];
  const currentTierStart = TIER_THRESHOLDS[tier];
  const progressInTier = nextTierScore > currentTierStart
    ? ((score - currentTierStart) / (nextTierScore - currentTierStart)) * 100
    : 100;
  const pointsToNext = nextTierScore - score;
  const nextTierName = NEXT_TIER_NAMES[nextTierIdx] || "Elite";

  useEffect(() => {
    if (!score) return;
    const targetOffset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
    requestAnimationFrame(() => setArcOffset(targetOffset));

    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);

    const badgeTimer = setTimeout(() => setShowBadge(true), 1400);
    const barsTimer = setTimeout(() => setBarsAnimated(true), 600);
    const tierTimer = setTimeout(() => setTierProgress(progressInTier), 1600);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(badgeTimer);
      clearTimeout(barsTimer);
      clearTimeout(tierTimer);
    };
  }, [score]);

  if (!scoreData) {
    return (
      <div className="min-h-screen bg-cp-bg flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
      </div>
    );
  }

  let globalBarIndex = 0;

  return (
    <div className="min-h-screen bg-cp-bg pb-24">
      <HeaderBar />
      <div className="px-4 pt-1 pb-2">
        <h1 className="text-[15px] font-semibold text-cp-text-dark mt-3 mb-1">Your Credit Readiness</h1>
      </div>

      {/* Score Gauge Card */}
      <div className="mx-4 rounded-2xl bg-cp-card shadow-md p-6">
        <div className="flex justify-center">
          <div className="relative" style={{ width: 220, height: 220 }}>
            <svg width="220" height="220" className="transform -rotate-90">
              <circle cx="110" cy="110" r="90" fill="none" stroke="hsl(var(--border))" strokeWidth="12" />
              <circle cx="110" cy="110" r="90" fill="none" stroke="hsl(var(--cp-primary))" strokeWidth="12" strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={arcOffset} className="transition-all duration-[1200ms] ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[48px] font-bold text-cp-primary">{displayScore}</span>
              <span className="text-xs text-cp-text-light -mt-1">out of 100</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <span className={`inline-flex items-center rounded-full px-4 py-2 font-semibold text-sm transition-all duration-400 ${tierCfg.bg} ${tierCfg.text} ${showBadge ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            {tierCfg.emoji} {tierLabel}
          </span>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
          {[`📊 ${data?.recency_trend ? data.recency_trend.charAt(0).toUpperCase() + data.recency_trend.slice(1) : "Stable"}`].map((s, i) => (
            <span key={i} className="text-[11px] text-cp-text-light bg-muted rounded-full px-3 py-1">{s}</span>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-[13px] text-cp-text-med text-center mb-2">
            You are <span className="font-semibold">{pointsToNext} points</span> from {TIER_CONFIG[nextTierIdx]?.emoji} {nextTierName}
          </p>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-cp-primary transition-all duration-[1000ms] ease-out" style={{ width: `${tierProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Factor Bars Card */}
      <div className="mx-4 mt-3 rounded-2xl bg-cp-card shadow-sm p-5">
        <h2 className="text-sm font-semibold text-cp-text-dark mb-3">What shaped this score</h2>
        {DIMENSION_GROUPS.map((group, gi) => {
          const factors = (data?.factors || []).filter(f => group.signals.includes(f.display_name));
          return (
            <div key={gi} className={gi > 0 ? "mt-4 pt-4 border-t border-border" : ""}>
              <p className={`text-[11px] uppercase tracking-widest font-semibold mb-2 ${group.colorClass}`}>{group.label}</p>
              <div className="space-y-2.5">
                {factors.map((factor) => {
                  const barIndex = globalBarIndex++;
                  return (
                    <div key={factor.display_name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] text-cp-text-dark truncate mr-2">{factor.display_name}</span>
                        <span className={`text-xs font-medium ${DIRECTION_COLORS[factor.direction]}`}>{Math.round(factor.normalised_score)}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${DIRECTION_BAR_COLORS[factor.direction]} transition-all duration-[800ms] ease-out`} style={{ width: barsAnimated ? `${factor.normalised_score}%` : "0%", transitionDelay: `${barIndex * 60}ms` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mx-4 my-4 pb-4">
        <button onClick={() => navigateTo("offer")} className="w-full h-14 rounded-2xl bg-accent text-accent-foreground font-semibold text-base hover:brightness-110 active:scale-95 transition-all">
          See Your Loan Offer →
        </button>
        <p className="text-center text-[13px] text-cp-primary cursor-pointer mt-2" onClick={() => navigateTo("progress")}>📊 My Progress</p>
      </div>
      <BottomNav />
    </div>
  );
};

export default ScoreScreen;
