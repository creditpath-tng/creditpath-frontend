const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-cp-text-med text-sm">Analysing your credit readiness…</p>
  </div>
);

export default LoadingScreen;
