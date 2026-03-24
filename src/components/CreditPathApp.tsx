import { useAppContext } from "@/context/AppContext";
import PhoneFrame from "@/components/PhoneFrame";
import WelcomeScreen from "@/screens/WelcomeScreen";
import LoadingScreen from "@/screens/LoadingScreen";
import ScoreScreen from "@/screens/ScoreScreen";
import OfferScreen from "@/screens/OfferScreen";
import ExplainScreen from "@/screens/ExplainScreen";
import ProgressScreen from "@/screens/ProgressScreen";
import AuditScreen from "@/screens/AuditScreen";
import AdminScreen from "@/screens/AdminScreen";

const screenMap: Record<string, React.FC> = {
  welcome: WelcomeScreen,
  loading: LoadingScreen,
  score: ScoreScreen,
  offer: OfferScreen,
  explain: ExplainScreen,
  progress: ProgressScreen,
  audit: AuditScreen,
  admin: AdminScreen,
};

const CreditPathApp = () => {
  const { currentScreen } = useAppContext();
  const ScreenComponent = screenMap[currentScreen] || WelcomeScreen;

  return (
    <PhoneFrame>
      <ScreenComponent />
    </PhoneFrame>
  );
};

export default CreditPathApp;
