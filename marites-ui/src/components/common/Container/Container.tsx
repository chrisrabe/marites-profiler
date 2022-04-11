import React, { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => (
  <div className="p-4 sm:p-12 md:px-24 md:py-12 lg:px-32 lg:py-12">
    {children}
  </div>
);

export default Container;
