import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useNavigation } from "@/hooks/useNavigation";
import HeaderBar from "@/components/HeaderBar";

const LoadingScreen = () => {
  const { selectedPersona, setScoreData, setExplainData, setProgressData } = useAppContext();
  const { navigateTo } = useNavigation();
  const [message, setMessage] = useState("Initialising...");

  useEffect(() => {
    if (!selectedPersona) {
      setMessage("No persona selected, redirecting...");
      navigateTo("welcome");
      return;
    }

    const runAnalysis = async () => {
      try {
        setMessage("Calling /score...");

        const scoreRes = await fetch(
          "https://e37fcc4b-dc6d-4821-85bc-7940a9476e3f-00-bxzh6v4v6i34.picard.replit.dev/score",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer demo-token-creditpath-2026",
            },
            body: JSON.stringify({
              user_id: `${selectedPersona}_001`,
              persona: selectedPersona,
            }),
          }
        );

        setMessage(`/score status: ${scoreRes.status}`);

        if (!scoreRes.ok) {
          const errText = await scoreRes.text();
          setMessage(`/score failed: ${scoreRes.status} — ${errText}`);
          return;
        }

        const scoreData = await scoreRes.json();
        setMessage(`Score received: ${scoreData.score} tier ${scoreData.tier}`);
        setScoreData(scoreData);

        await new Promise((r) => setTimeout(r, 1000));
        navigateTo("score");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setMessage(`Caught error: ${msg}`);
      }
    };

    runAnalysis();
  }, [selectedPersona, navigateTo, setScoreData, setExplainData, setProgressData]);

  return (
    <div className="flex flex-col min-h-screen bg-card">
      <HeaderBar />

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin-slow" />
        </div>

        <p className="mt-8 text-[20px] font-semibold text-foreground text-center max-w-xs">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
