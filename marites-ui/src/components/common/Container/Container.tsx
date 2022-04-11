import React, { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => (
  <div className="px-4 sm:px-12 py-12 md:px-24 lg:px-32">{children}</div>
);

export default Container;
