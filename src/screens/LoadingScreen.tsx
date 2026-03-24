import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/use-toast";
import HeaderBar from "@/components/HeaderBar";
import { scoreUser, explainDecision, getProgress } from "@/services/api";

const MESSAGES = [
  { text: "Reading your transaction history...", delay: 0 },
  { text: "Calculating your credit signals...", delay: 900 },
  { text: "Preparing your result...", delay: 1800 },
];

const PERSONA_NAMES: Record<string, string> = {
  aishah: "Aishah",
  haziq: "Haziq",
  priya: "Priya",
};

const LoadingScreen = () => {
  const { selectedPersona, setScoreData, setExplainData, setProgressData, setError } = useAppContext();
  const { navigateTo } = useNavigation();
  const { toast } = useToast();
  const [visibleCount, setVisibleCount] = useState(0);
  const [showReady, setShowReady] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    MESSAGES.forEach((msg, i) => {
      timers.push(
        setTimeout(() => setVisibleCount(i + 1), msg.delay)
      );
    });

    timers.push(setTimeout(() => setShowReady(true), 2200));

    // After messages shown, make real API calls
    timers.push(setTimeout(async () => {
      if (!selectedPersona) {
        navigateTo("welcome");
        return;
      }
      try {
        const scoreResult = await scoreUser(selectedPersona);
        setScoreData(scoreResult);

        const explainResult = await explainDecision({
          decision_id: scoreResult.decision_id,
          tier: scoreResult.tier,
          score: scoreResult.score,
          factors: scoreResult.factors,
        });
        setExplainData(explainResult);

        const progressResult = await getProgress(selectedPersona);
        setProgressData(progressResult);

        navigateTo("score");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("API Error:", err);
        setError(`Unable to connect to scoring service: ${message}`);
        toast({
          variant: "destructive",
          description: `Connection error — ${message}`,
        });
        navigateTo("welcome");
      }
    }, 2400));

    return () => timers.forEach(clearTimeout);
  }, [navigateTo, selectedPersona]);

  const personaName = selectedPersona ? PERSONA_NAMES[selectedPersona] : "User";

  return (
    <div className="flex flex-col min-h-screen bg-card">
      <HeaderBar />

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin-slow" />
        </div>

        <div className="mt-8 space-y-3 text-center">
          {MESSAGES.map((msg, i) => (
            <p
              key={i}
              className={`text-[15px] text-cp-text-med transition-opacity duration-400
                ${i < visibleCount ? "animate-fade-in-subtle" : "opacity-0"}`}
            >
              {msg.text}
            </p>
          ))}
        </div>

        {showReady && (
          <p className="mt-6 text-[13px] text-cp-text-light italic animate-fade-in-subtle">
            {personaName}'s profile is ready.
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
