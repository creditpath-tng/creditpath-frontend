import React, { createContext, useContext, useState, ReactNode } from "react";

export type Persona = "aishah" | "haziq" | "priya";
export type Screen =
  | "welcome"
  | "loading"
  | "score"
  | "offer"
  | "explain"
  | "progress"
  | "audit"
  | "admin";

interface AppState {
  selectedPersona: Persona | null;
  consentGiven: boolean;
  scoreData: Record<string, unknown> | null;
  explainData: Record<string, unknown> | null;
  progressData: Record<string, unknown> | null;
  auditData: Record<string, unknown> | null;
  currentScreen: Screen;
  isLoading: boolean;
  error: string | null;
}

interface AppContextType extends AppState {
  setSelectedPersona: (p: Persona | null) => void;
  setConsentGiven: (v: boolean) => void;
  setScoreData: (d: Record<string, unknown> | null) => void;
  setExplainData: (d: Record<string, unknown> | null) => void;
  setProgressData: (d: Record<string, unknown> | null) => void;
  setAuditData: (d: Record<string, unknown> | null) => void;
  setCurrentScreen: (s: Screen) => void;
  setIsLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [scoreData, setScoreData] = useState<Record<string, unknown> | null>(null);
  const [explainData, setExplainData] = useState<Record<string, unknown> | null>(null);
  const [progressData, setProgressData] = useState<Record<string, unknown> | null>(null);
  const [auditData, setAuditData] = useState<Record<string, unknown> | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        selectedPersona, setSelectedPersona,
        consentGiven, setConsentGiven,
        scoreData, setScoreData,
        explainData, setExplainData,
        progressData, setProgressData,
        auditData, setAuditData,
        currentScreen, setCurrentScreen,
        isLoading, setIsLoading,
        error, setError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};
