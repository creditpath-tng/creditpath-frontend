import { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
}

const PhoneFrame = ({ children }: PhoneFrameProps) => {
  return (
    <div className="min-h-screen bg-cp-frame-bg flex items-start justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-cp-card overflow-y-auto shadow-xl">
        {children}
      </div>
    </div>
  );
};

export default PhoneFrame;
