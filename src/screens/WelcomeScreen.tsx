import { useState } from "react";
import { useAppContext, Persona } from "@/context/AppContext";
import { useNavigation } from "@/hooks/useNavigation";
import HeaderBar from "@/components/HeaderBar";



const PERSONAS: { id: Persona; label: string; subtitle: string; level: string }[] = [
  { id: "aishah", label: "Aishah 22", subtitle: "University student", level: "🔥 Climber potential" },
  { id: "haziq", label: "Haziq 25", subtitle: "Fresh graduate", level: "🏆 Achiever potential" },
  { id: "priya", label: "Priya 23", subtitle: "Part-time worker", level: "⚡ Builder potential" },
];

const WelcomeScreen = () => {
  const { selectedPersona, setSelectedPersona, consentGiven, setConsentGiven, setIsLoading } = useAppContext();
  const { navigateTo } = useNavigation();
  const canProceed = selectedPersona && consentGiven;
  const activePersona = PERSONAS.find((p) => p.id === selectedPersona);

  const handleAnalyse = () => {
    if (!canProceed) return;
    setIsLoading(true);
    navigateTo("loading");
  };


  return (
    <div className="flex flex-col min-h-screen bg-card">
      <HeaderBar />

      {/* Hero Card */}
      <div className="mx-4 mt-4 rounded-2xl bg-card shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary to-accent" />
        <div className="p-6">
          <h1 className="text-xl font-semibold text-cp-text-dark">
            Understand your credit readiness
          </h1>
          <p className="text-sm text-cp-text-med leading-relaxed mt-2">
            We analyse your TNG transaction history to show what you may qualify for.
            Your data is used only for this assessment and you may request an
            explanation of any decision at any time.
          </p>
        </div>
      </div>

      {/* Persona Selector */}
      <div className="mx-4 mt-4">
        <p className="text-xs uppercase tracking-widest text-cp-text-light mb-2">
          Select your profile
        </p>
        <div className="flex gap-2">
          {PERSONAS.map((p) => {
            const isSelected = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p.id)}
                className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all duration-200
                  ${isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-cp-text-med hover:border-primary/40"
                  }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      {activePersona && (
          <p className="text-xs text-cp-text-light mt-2">
            {activePersona.subtitle}
          </p>
        )}
      </div>

      {/* Level Preview Teaser */}
      {activePersona && (
        <div className="mx-4 mt-4 animate-fade-in">
          <div className="bg-cp-bg rounded-xl px-4 py-3">
            <p className="text-[13px] text-cp-text-dark">
              {activePersona.level.split(" ")[0]}{" "}
              <span className="text-cp-text-med">
                Your starting potential:{" "}
                <span className="font-medium text-cp-text-dark">
                  {activePersona.level.slice(activePersona.level.indexOf(" ") + 1)}
                </span>
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Consent */}
      <div className="mx-4 mt-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={() => setConsentGiven(!consentGiven)}
            className="mt-0.5 h-5 w-5 rounded border-border accent-primary shrink-0"
          />
          <span className="text-[13px] text-cp-text-med leading-relaxed">
            🔒 I consent to my TNG transaction history being used for this credit
            readiness assessment in accordance with Malaysia's PDPA requirements.
          </span>
        </label>
      </div>

      {/* CTA */}
      <div className="mx-4 mt-4 mb-8">
        <button
          disabled={!canProceed}
          onClick={handleAnalyse}
          className={`w-full h-[52px] rounded-2xl text-base font-semibold transition-all duration-200
            ${canProceed
              ? "bg-accent text-accent-foreground hover:brightness-110 active:scale-[0.97]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
        >
          Analyse My History
        </button>

      </div>

      <p
        className="text-center text-[11px] text-cp-text-light cursor-pointer mb-4"
        onClick={() => navigateTo("admin")}
      >
        Admin
      </p>
    </div>
  );
};

export default WelcomeScreen;
