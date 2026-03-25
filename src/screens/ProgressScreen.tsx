import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { useNavigation } from "@/hooks/useNavigation";
import { useAppContext } from "@/context/AppContext";
import { getProgress } from "@/services/api";

const LEVELS = [
  { emoji: "S", label: "Starter" },
  { emoji: "⚡", label: "Builder" },
  { emoji: "🔥", label: "Climber" },
  { emoji: "🏆", label: "Achiever" },
  { emoji: "💎", label: "Elite" },
];

const STREAKS = [
  { icon: "🧾", name: "Bill Payments", key: "bill_streak" as const },
  { icon: "💳", name: "Wallet Reloads", key: "reload_streak" as const },
  { icon: "💰", name: "Balance Maintained", key: "balance_streak" as const },
];

const MILESTONES = [
  { id: "first_score", icon: "🏁", name: "First Score", desc: "You took your first step" },
  { id: "first_tier", icon: "⚡", name: "Builder", desc: "Your first loan offer" },
  { id: "bill_streak_3", icon: "🔥", name: "Bill Streak", desc: "3 months consistent" },
  { id: "climber_reached", icon: "🔥", name: "Climber", desc: "Loan upgraded to RM300–500" },
  { id: "achiever", icon: "🏆", name: "Achiever", desc: "Reach tier 3" },
  { id: "elite", icon: "💎", name: "Elite", desc: "Reach tier 4" },
  { id: "bureau_entry", icon: "📋", name: "Bureau Entry", desc: "6 months + tier 2" },
];

const CHART_W = 300;
const CHART_H = 80;
const CHART_MIN = 40;
const CHART_MAX = 80;
const toPoint = (val: number, i: number, total: number) => {
  const x = (i / (total - 1)) * CHART_W;
  const y = CHART_H - ((val - CHART_MIN) / (CHART_MAX - CHART_MIN)) * CHART_H;
  return { x, y };
};

const TIER_THRESHOLDS = [0, 40, 55, 70, 85];

const ProgressScreen = () => {
  const { navigateTo } = useNavigation();
  const { progressData, setProgressData, scoreData, selectedPersona } = useAppContext();
  const [tierProgress, setTierProgress] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedPersona) {
      console.log('Fetching progress for persona:', selectedPersona);
      getProgress(selectedPersona).then((data) => {
        setProgressData(data);
      }).catch((err) => {
        console.error('Failed to fetch progress:', err);
      });
    }
  }, [selectedPersona]);

  const prog = progressData as {
    level_badge?: string; current_tier?: number; points_to_next_level?: number;
    next_level_name?: string; streak_data?: { bill_streak: number; reload_streak: number; balance_streak: number };
    monthly_score_history?: number[]; milestones_unlocked?: string[];
    months_active?: number; go_plus_active?: boolean; share_text?: string;
  } | null;

  const currentScore = Math.round((scoreData as { score?: number } | null)?.score || 0);
  const currentTier = (scoreData as { tier?: number } | null)?.tier ?? prog?.current_tier ?? 2;
  const nextLevelName = prog?.next_level_name ?? LEVELS[Math.min(currentTier + 1, 4)]?.label ?? "Achiever";
  const currentTierStart = TIER_THRESHOLDS[currentTier];
  const nextTierStart = TIER_THRESHOLDS[Math.min(currentTier + 1, 4)];
  const pointsToNext = Math.round(nextTierStart - currentScore);
  const streakData = prog?.streak_data ?? { bill_streak: 3, reload_streak: 4, balance_streak: 2 };
  const scoreHistory = prog?.monthly_score_history ?? [48, 52, 55, 58, 60, 62];
  const scoreDiff = (scoreHistory[scoreHistory.length - 1] || 0) - (scoreHistory[0] || 0);
  const trendLabel = scoreDiff > 2
    ? { text: '↑ Improving', color: 'hsl(var(--cp-success))' }
    : scoreDiff < -2
    ? { text: '↓ Declining', color: 'hsl(var(--cp-danger))' }
    : { text: '→ Stable', color: 'hsl(var(--cp-warning))' };
  const milestonesUnlocked = prog?.milestones_unlocked ?? ["first_score", "first_tier", "bill_streak_3", "climber_reached"];
  const shareText = prog?.share_text ?? `I just reached Level ${currentTier} on CreditPath! #CreditPath #TNG`;
  const levelBadge = prog?.level_badge ?? `${LEVELS[currentTier]?.emoji} ${LEVELS[currentTier]?.label}`;
  const targetProgress = nextTierStart > currentTierStart
    ? ((currentScore - currentTierStart) / (nextTierStart - currentTierStart)) * 100
    : 100;

  useEffect(() => {
    const t = setTimeout(() => setTierProgress(targetProgress), 100);
    return () => clearTimeout(t);
  }, [targetProgress]);

  const points = scoreHistory.map((v, i) => toPoint(v, i, scoreHistory.length));
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = `M${points[0].x},${CHART_H} ${points.map((p) => `L${p.x},${p.y}`).join(" ")} L${points[points.length - 1].x},${CHART_H} Z`;
  const lastScore = scoreHistory[scoreHistory.length - 1];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-cp-bg pb-20">
      <div className="flex items-center justify-between px-5 h-14 bg-primary">
        <div className="flex items-center gap-3">
          <span className="text-primary-foreground cursor-pointer text-lg" onClick={() => navigateTo("score")}>←</span>
          <span className="text-[18px] font-bold text-primary-foreground">My Progress</span>
        </div>
        <span className="text-[11px] italic text-primary-foreground/70">Powered by Experian</span>
      </div>

      {/* Level Hero Card */}
      <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-br from-primary to-[hsl(214,66%,22%)] p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <span className="text-[48px] leading-none">{levelBadge.split(" ")[0]}</span>
          <div>
            <p className="text-2xl font-bold">{levelBadge.split(" ").slice(1).join(" ") || LEVELS[currentTier]?.label}</p>
            <p className="text-[13px] text-primary-foreground/80">You are {Math.round(pointsToNext * 10) / 10} points from {nextLevelName}</p>
          </div>
        </div>

        <div className="mt-3 h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary-foreground/90 rounded-full transition-all duration-[1000ms] ease-out" style={{ width: `${tierProgress}%` }} />
        </div>

        <div className="mt-4 flex justify-between">
          {LEVELS.map((l, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className={`${i === currentTier ? "text-2xl" : "text-base opacity-50"}`}>{l.emoji}</span>
              <span className="text-[10px] text-primary-foreground/60 mt-1">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Streak Section */}
      <div className="mx-4 mt-3 rounded-2xl bg-cp-card shadow-sm p-5">
        <h2 className="text-sm font-semibold text-cp-text-dark">Active Streaks</h2>
        <div className="mt-3 flex flex-col gap-4">
          {STREAKS.map((s) => {
            const count = streakData[s.key];
            return (
              <div key={s.key}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cp-text-dark">{s.icon} {s.name}</span>
                  <span className="rounded-full bg-orange-100 text-orange-700 px-3 py-1 font-bold text-sm">{count}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full ${i >= 6 - count ? "bg-cp-primary" : "bg-muted"}`} />
                  ))}
                </div>
                <p className="text-[11px] text-cp-text-light mt-1">{count} months in a row</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 bg-amber-50 rounded-xl p-3">
          <p className="text-[13px] text-cp-warning font-medium">⚠️ Keep your bill streak alive — next payment due soon</p>
        </div>
      </div>

      {/* Score History Chart */}
      <div className="mx-4 mt-3 rounded-2xl bg-cp-card shadow-sm p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-cp-text-dark">Score History</h2>
          <span className="text-xs font-bold" style={{ color: trendLabel.color }}>{trendLabel.text}</span>
        </div>
        <div className="mt-3 w-full overflow-hidden">
          <svg viewBox={`-10 -20 ${CHART_W + 20} ${CHART_H + 30}`} className="w-full" preserveAspectRatio="xMidYMid meet">
            <path d={areaPath} fill="hsl(var(--cp-primary) / 0.1)" />
            <polyline points={polyline} fill="none" stroke="hsl(var(--cp-primary))" strokeWidth="2.5" strokeLinejoin="round" />
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 6 : 4} fill="hsl(var(--cp-primary))" />
            ))}
            <text x={points[points.length - 1].x} y={points[points.length - 1].y - 12} textAnchor="middle" fill="hsl(var(--cp-primary))" fontSize="12" fontWeight="bold">{lastScore}</text>
            {["M-5", "M-4", "M-3", "M-2", "M-1", "Now"].map((label, i) => (
              <text key={i} x={points[i].x} y={CHART_H + 16} textAnchor="middle" fill="hsl(var(--cp-text-light))" fontSize="10">{label}</text>
            ))}
          </svg>
        </div>
      </div>

      {/* Milestone Badges */}
      <div className="mx-4 mt-3 rounded-2xl bg-cp-card shadow-sm p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-cp-text-dark">Achievements</h2>
          <span className="text-xs text-cp-text-light">{milestonesUnlocked.length} of {MILESTONES.length} unlocked</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {MILESTONES.map((m) => {
            const unlocked = milestonesUnlocked.includes(m.id);
            return (
              <div key={m.id} className={`rounded-xl p-3 text-center border ${unlocked ? "bg-primary/10 border-primary/20" : "bg-muted border-border opacity-50"}`}>
                <span className="text-2xl">{unlocked ? m.icon : "🔒"}</span>
                <p className={`text-xs font-semibold mt-1 ${unlocked ? "text-cp-primary" : "text-cp-text-light"}`}>{m.name}</p>
                <p className="text-[11px] text-cp-text-light">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Share */}
      <div className="mx-4 mt-4 mb-8">
        <button onClick={() => setShowShareModal(true)} className="w-full h-12 rounded-2xl border-2 border-primary bg-cp-card text-cp-primary font-semibold text-sm hover:bg-muted active:scale-95 transition-all">
          🔗 Share my progress
        </button>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-cp-card rounded-2xl shadow-xl p-6 max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-cp-text-dark text-center">Share your CreditPath journey</h3>
            <div className="mt-4 bg-muted rounded-xl p-3 text-[13px] text-cp-text-med select-all">{shareText}</div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleCopy} className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium active:scale-95 transition-all">{copied ? "Copied!" : "Copy text"}</button>
              <button onClick={() => setShowShareModal(false)} className="flex-1 h-10 rounded-xl border border-border text-cp-text-med text-sm font-medium active:scale-95 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
};

export default ProgressScreen;
