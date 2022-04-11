import React, { ReactNode, useEffect, useState } from "react";

interface NoSSRProps {
  children: ReactNode;
}

const NoSSR: React.FC<NoSSRProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, [setIsMounted]);

  return <>{isMounted ? children : null}</>;
};

export default NoSSR;
