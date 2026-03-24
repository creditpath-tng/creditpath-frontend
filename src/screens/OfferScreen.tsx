import { useEffect, useState, useRef } from "react";
import HeaderBar from "@/components/HeaderBar";
import BottomNav from "@/components/BottomNav";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/use-toast";

const MOCK = {
  tier: 2, tier_label: "Climber", persona_name: "Aishah",
  amount_min: 300, amount_max: 500,
};

const OfferScreen = () => {
  const { navigateTo } = useNavigation();
  const { toast } = useToast();
  const [displayMin, setDisplayMin] = useState(0);
  const [displayMax, setDisplayMax] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const duration = 1000;
    const start = performance.now();
    const animate = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayMin(Math.round(eased * MOCK.amount_min));
      setDisplayMax(Math.round(eased * MOCK.amount_max));
      if (p < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    const t1 = setTimeout(() => setShowToast(true), 600);
    const t2 = setTimeout(() => setShowToast(false), 3100);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="min-h-screen bg-cp-bg relative">
      <HeaderBar />

      {/* Milestone Toast */}
      <div
        className={`absolute left-0 right-0 top-14 z-10 bg-cp-success text-white rounded-b-2xl px-4 py-3 text-center text-sm font-medium transition-all duration-500 ${
          showToast ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        🎉 Level up! You've reached Climber
      </div>

      {/* Offer Card */}
      <div className="mx-4 mt-4 rounded-2xl bg-cp-card shadow-lg overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent" />
        <div className="p-7">
          <p className="text-[13px] text-cp-text-light text-center mb-2">
            Based on your TNG history, you may qualify for
          </p>
          <p className="text-[38px] font-bold text-cp-primary text-center">
            RM{displayMin} – RM{displayMax}
          </p>
          <div className="flex justify-center mt-2">
            <span className="inline-flex items-center rounded-full px-4 py-2 font-semibold text-sm bg-blue-100 text-cp-primary">
              🔥 Climber
            </span>
          </div>

          <div className="h-px bg-border my-4" />

          <div className="flex gap-2 flex-wrap justify-center">
            {["No collateral needed", "Instant decision", "Build your credit"].map((t) => (
              <span key={t} className="rounded-full bg-muted border border-border px-3 py-1 text-xs text-cp-text-med">
                {t}
              </span>
            ))}
          </div>

          <p className="mt-4 text-[11px] text-cp-text-light italic text-center">
            Indicative range only. Final approval subject to GOpinjam assessment.
            This tool does not constitute a credit offer.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mx-4 mt-4 flex flex-col gap-3 mb-8">
        <button
          onClick={() => navigateTo("explain")}
          className="w-full h-14 rounded-2xl bg-accent text-accent-foreground font-semibold text-base hover:brightness-110 active:scale-95 transition-all"
        >
          See What Influenced This →
        </button>
        <button
          onClick={() => toast({ description: "Redirecting to GOpinjam..." })}
          className="w-full h-14 rounded-2xl border-2 border-primary text-primary font-semibold text-[15px] bg-cp-card hover:bg-muted active:scale-95 transition-all"
        >
          Apply via GOpinjam
        </button>
      </div>

      <p
        className="text-center text-[13px] text-cp-primary cursor-pointer mb-6"
        onClick={() => navigateTo("score")}
      >
        ← Back to my score
      </p>
    </div>
  );
};

export default OfferScreen;
