import { AppProvider } from "@/context/AppContext";
import CreditPathApp from "@/components/CreditPathApp";

const Index = () => (
  <AppProvider>
    <CreditPathApp />
  </AppProvider>
);

export default Index;
