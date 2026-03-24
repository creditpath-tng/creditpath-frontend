import { useNavigation } from "@/hooks/useNavigation";

const WelcomeScreen = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-primary px-6 pt-14 pb-10 text-primary-foreground">
        <p className="text-sm font-medium tracking-wide opacity-80 mb-1">
          CREDITPATH
        </p>
        <h1 className="text-2xl font-bold leading-tight">
          Your Credit
          <br />
          Journey Starts Here
        </h1>
        <p className="text-sm mt-3 opacity-75 leading-relaxed">
          Understand your credit readiness and get personalised steps to build a
          strong financial future.
        </p>
      </div>

      {/* Persona Cards */}
      <div className="flex-1 px-5 py-6 space-y-3">
        <p className="text-sm font-semibold text-cp-text-dark mb-1">
          Choose a profile to explore:
        </p>

        <PersonaCard
          name="Aishah"
          desc="Fresh grad, first job, wants a credit card"
          emoji="👩‍🎓"
          onClick={() => navigateTo("loading")}
        />
        <PersonaCard
          name="Haziq"
          desc="Freelancer, irregular income, building credit"
          emoji="💻"
          onClick={() => navigateTo("loading")}
        />
        <PersonaCard
          name="Priya"
          desc="Student, no credit history yet"
          emoji="📚"
          onClick={() => navigateTo("loading")}
        />
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 pt-2">
        <p className="text-xs text-cp-text-light text-center leading-relaxed">
          By TNG Digital · Educational purposes only
        </p>
      </div>
    </div>
  );
};

const PersonaCard = ({
  name,
  desc,
  emoji,
  onClick,
}: {
  name: string;
  desc: string;
  emoji: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow text-left"
  >
    <span className="text-3xl">{emoji}</span>
    <div>
      <p className="font-semibold text-cp-text-dark">{name}</p>
      <p className="text-sm text-cp-text-med">{desc}</p>
    </div>
  </button>
);

export default WelcomeScreen;
