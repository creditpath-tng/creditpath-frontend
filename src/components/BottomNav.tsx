import { useAppContext, Screen } from "@/context/AppContext";
import { useNavigation } from "@/hooks/useNavigation";

const TABS: { icon: string; label: string; screen: Screen }[] = [
  { icon: "📊", label: "Score", screen: "score" },
  { icon: "💡", label: "Explain", screen: "explain" },
  { icon: "🎯", label: "Progress", screen: "progress" },
  { icon: "📋", label: "Audit", screen: "audit" },
];

const BottomNav = () => {
  const { currentScreen } = useAppContext();
  const { navigateTo } = useNavigation();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-cp-card border-t border-border h-16 flex items-center justify-around z-40">
      {TABS.map((tab) => {
        const active = currentScreen === tab.screen;
        return (
          <button
            key={tab.screen}
            onClick={() => navigateTo(tab.screen)}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              active ? "text-cp-primary font-semibold" : "text-cp-text-light"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
