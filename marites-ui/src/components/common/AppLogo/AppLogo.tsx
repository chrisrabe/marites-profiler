import React, { useMemo } from "react";

interface AppLogoProps {
  variant: "news" | "profiler";
}

const AppLogo: React.FC<AppLogoProps> = ({ variant }) => {
  const appColor = useMemo(
    () => (variant === "news" ? "bg-red-500" : "bg-purple-500"),
    [variant]
  );

  const appText = useMemo(
    () => (variant === "news" ? "News" : "Profiler"),
    [variant]
  );

  return (
    <div className="inline-flex space-x-2 items-center">
      <span className={`p-4 ${appColor} text-3xl font-medium`}>Marites</span>
      <span className="text-3xl font-medium">{appText}</span>
    </div>
  );
};

export default AppLogo;
