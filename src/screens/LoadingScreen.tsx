import axios from "axios";
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
  const [apiError, setApiError] = useState<{
    message: string;
    status: string;
    detail: string;
  } | null>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    setVisibleCount(0);
    setShowReady(false);
    setApiError(null);

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
        const message = axios.isAxiosError(err)
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unknown error";
        const status = axios.isAxiosError(err)
          ? String(err.response?.status ?? "Unknown")
          : "Unknown";
        const detailValue = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
        const detail = typeof detailValue === "string" ? detailValue : "Unknown";

        console.error("API Error:", err);
        setError(`Unable to connect to scoring service: ${message}`);
        setApiError({ message, status, detail });
        toast({
          variant: "destructive",
          description: `Connection error — ${message}`,
        });
      }
    }, 2400));

    return () => timers.forEach(clearTimeout);
  }, [navigateTo, selectedPersona, setError, setExplainData, setProgressData, setScoreData, toast]);

  const personaName = selectedPersona ? PERSONA_NAMES[selectedPersona] : "User";

  return (
    <div className="flex flex-col min-h-screen bg-card">
      <HeaderBar />

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {apiError ? (
          <div className="w-full max-w-sm rounded-2xl border border-destructive/20 bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-destructive">API Error: {apiError.message}</p>
            <p className="mt-2 text-sm text-destructive">Status: {apiError.status}</p>
            <p className="mt-2 text-sm text-destructive">Detail: {apiError.detail}</p>

            <button
              type="button"
              onClick={() => navigateTo("welcome")}
              className="mt-5 h-11 w-full rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
