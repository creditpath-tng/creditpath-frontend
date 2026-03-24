import { useAppContext, Screen } from "@/context/AppContext";

export const useNavigation = () => {
  const { setCurrentScreen } = useAppContext();

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  return { navigateTo };
};
