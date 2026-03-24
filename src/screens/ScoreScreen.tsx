import { useEffect, useState, useRef } from "react";
import HeaderBar from "@/components/HeaderBar";
import { useNavigation } from "@/hooks/useNavigation";

const MOCK_SCORE_DATA = {
  score: 62, tier: 2, tier_label: "Climber", segment: "student",
  recency_trend: "improving", persona_name: "Aishah",
  qualifying_amount_min: 300, qualifying_amount_max: 500,
  factors: [
    { display_name: "Bill Payment Consistency", normalised_score: 83, direction: "positive", weighted_contribution: 9.96 },
    { display_name: "Bill Payment Variety", normalised_score: 50, direction: "neutral", weighted_contribution: 4.5 },
    { display_name: "Payment Timing Regularity", normalised_score: 72, direction: "positive", weighted_contribution: 5.76 },
    { display_name: "Reload Frequency", normalised_score: 42, direction: "needs_work", weighted_contribution: 2.94 },
    { display_name: "Reload Amount Consistency", normalised_score: 69, direction: "neutral", weighted_contribution: 5.52 },
    { display_name: "Time-to-Spend After Reload", normalised_score: 42, direction: "needs_work", weighted_contribution: 2.52 },
    { display_name: "Balance Floor Maintenance", normalised_score: 72, direction: "positive", weighted_contribution: 4.32 },
    { display_name: "Spending Regularity", normalised_score: 78, direction: "positive", weighted_contribution: 7.02 },
    { display_name: "Essential vs Discretionary Ratio", normalised_score: 61, direction: "neutral", weighted_contribution: 4.88 },
    { display_name: "Transaction Diversity", normalised_score: 50, direction: "neutral", weighted_contribution: 2.5 },
    { display_name: "GO+ Participation", normalised_score: 0, direction: "needs_work", weighted_contribution: 0 },
    { display_name: "Account Activity Trend", normalised_score: 65, direction: "neutral", weighted_contribution: 9.1 },
  ],
};

const TIER_CONFIG: Record<number, { emoji: string; bg: string; text: string }> = {
  0: { emoji: "", bg: "bg-gray-100", text: "text-gray-500" },
  1: { emoji: "⚡", bg: "bg-amber-100", text: "text-amber-700" },
  2: { emoji: "🔥", bg: "bg-blue-100", text: "text-cp-primary" },
  3: { emoji: "🏆", bg: "bg-teal-100", text: "text-teal-700" },
  4: { emoji: "💎", bg: "bg-green-100", text: "text-cp-success" },
};

const DIMENSION_GROUPS = [
  { label: "PAYMENT RELIABILITY", colorClass: "text-cp-success", barColor: "bg-cp-success",
    signals: ["Bill Payment Consistency", "Bill Payment Variety", "Payment Timing Regularity"] },
  { label: "WALLET ACTIVITY", colorClass: "text-cp-primary", barColor: "bg-cp-primary",
    signals: ["Reload Frequency", "Reload Amount Consistency", "Time-to-Spend After Reload", "Balance Floor Maintenance"] },
  { label: "SPENDING BEHAVIOUR", colorClass: "text-cp-warning", barColor: "bg-cp-warning",
    signals: ["Spending Regularity", "Essential vs Discretionary Ratio", "Transaction Diversity"] },
  { label: "FINANCIAL GROWTH", colorClass: "text-cp-purple", barColor: "bg-cp-purple",
    signals: ["GO+ Participation", "Account Activity Trend"] },
];

const DIRECTION_COLORS: Record<string, string> = {
  positive: "text-cp-success",
  neutral: "text-cp-warning",
  needs_work: "text-cp-danger",
};

const DIRECTION_BAR_COLORS: Record<string, string> = {
  positive: "bg-cp-success",
  neutral: "bg-cp-warning",
  needs_work: "bg-cp-danger",
};

const CIRCUMFERENCE = 2 * Math.PI * 90;

const ScoreScreen = () => {
  const { navigateTo } = useNavigation();
  const [displayScore, setDisplayScore] = useState(0);
  const [arcOffset, setArcOffset] = useState(CIRCUMFERENCE);
  const [showBadge, setShowBadge] = useState(false);
  const [barsAnimated, setBarsAnimated] = useState(false);
  const [tierProgress, setTierProgress] = useState(0);
  const animFrameRef = useRef<number>(0);

  const data = MOCK_SCORE_DATA;
  const tierCfg = TIER_CONFIG[data.tier] || TIER_CONFIG[0];
  const nextTierScore = 69; // Achiever starts at 69
  const progressInTier = ((data.score % 25) / 25) * 100;

  useEffect(() => {
    // Animate arc
    const targetOffset = CIRCUMFERENCE - (data.score / 100) * CIRCUMFERENCE;
    requestAnimationFrame(() => setArcOffset(targetOffset));

    // Animate number count-up
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayScore(Math.round(eased * data.score));
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);

    // Show badge after 1400ms
    const badgeTimer = setTimeout(() => setShowBadge(true), 1400);
    // Animate bars
    const barsTimer = setTimeout(() => setBarsAnimated(true), 600);
    // Tier progress
    const tierTimer = setTimeout(() => setTierProgress(progressInTier), 1600);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(badgeTimer);
      clearTimeout(barsTimer);
      clearTimeout(tierTimer);
    };
  }, []);

  let globalBarIndex = 0;

  return (
    <div className="min-h-screen bg-cp-bg">
      <HeaderBar />

      <div className="px-4 pt-1 pb-2">
        <h1 className="text-[15px] font-semibold text-cp-text-dark mt-3 mb-1">Your Credit Readiness</h1>
      </div>

      {/* Score Gauge Card */}
      <div className="mx-4 rounded-2xl bg-cp-card shadow-md p-6">
        {/* SVG Gauge */}
        <div className="flex justify-center">
          <div className="relative" style={{ width: 220, height: 220 }}>
            <svg width="220" height="220" className="transform -rotate-90">
              <circle cx="110" cy="110" r="90" fill="none" stroke="hsl(var(--border))" strokeWidth="12" />
              <circle
                cx="110" cy="110" r="90" fill="none"
                stroke="hsl(var(--cp-primary))"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={arcOffset}
                className="transition-all duration-[1200ms] ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[48px] font-bold text-cp-primary">{displayScore}</span>
              <span className="text-xs text-cp-text-light -mt-1">out of 100</span>
            </div>
          </div>
        </div>

        {/* Level Badge */}
        <div className="flex justify-center mt-4">
          <span
            className={`inline-flex items-center rounded-full px-4 py-2 font-semibold text-sm transition-all duration-400 ${tierCfg.bg} ${tierCfg.text} ${
              showBadge ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          >
            {tierCfg.emoji} {data.tier_label}
          </span>
        </div>

        {/* Streak Row */}
        <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
          {["🔥 3-month bill streak", "💰 4-month reload streak", "📊 Improving"].map((s, i) => (
            <span key={i} className="text-[11px] text-cp-text-light bg-muted rounded-full px-3 py-1">{s}</span>
          ))}
        </div>

        {/* Next Level Nudge */}
        <div className="mt-4">
          <p className="text-[13px] text-cp-text-med text-center mb-2">
            You are <span className="font-semibold">{nextTierScore - data.score} points</span> from 🏆 Achiever
          </p>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-cp-primary transition-all duration-[1000ms] ease-out"
              style={{ width: `${tierProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Factor Bars Card */}
      <div className="mx-4 mt-3 rounded-2xl bg-cp-card shadow-sm p-5">
        <h2 className="text-sm font-semibold text-cp-text-dark mb-3">What shaped this score</h2>

        {DIMENSION_GROUPS.map((group, gi) => {
          const factors = data.factors.filter(f => group.signals.includes(f.display_name));
          return (
            <div key={gi} className={gi > 0 ? "mt-4 pt-4 border-t border-border" : ""}>
              <p className={`text-[11px] uppercase tracking-widest font-semibold mb-2 ${group.colorClass}`}>
                {group.label}
              </p>
              <div className="space-y-2.5">
                {factors.map((factor) => {
                  const barIndex = globalBarIndex++;
                  return (
                    <div key={factor.display_name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] text-cp-text-dark truncate mr-2">{factor.display_name}</span>
                        <span className={`text-xs font-medium ${DIRECTION_COLORS[factor.direction]}`}>
                          {factor.normalised_score}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${DIRECTION_BAR_COLORS[factor.direction]} transition-all duration-[800ms] ease-out`}
                          style={{
                            width: barsAnimated ? `${factor.normalised_score}%` : "0%",
                            transitionDelay: `${barIndex * 60}ms`,
                          }}
                        />
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
        <button
          onClick={() => navigateTo("offer")}
          className="w-full h-14 rounded-2xl bg-accent text-accent-foreground font-semibold text-base hover:brightness-110 active:scale-95 transition-all"
        >
          See Your Loan Offer →
        </button>
      </div>
    </div>
  );
};

export default ScoreScreen;
