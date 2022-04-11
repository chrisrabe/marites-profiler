import React from "react";

interface IconProps {
  className?: string;
  Component: (props: React.ComponentProps<"svg">) => JSX.Element;
}

const Icon: React.FC<IconProps> = ({ Component, className }) => (
  <Component className={`h-4 outline-none ${className}`} />
);

export default Icon;
