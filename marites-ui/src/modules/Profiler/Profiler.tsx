import React from "react";
import Container from "components/common/Container";
import AppLogo from "components/common/AppLogo";
import Instructions from "./Instructions";

const Profiler: React.FC = () => {
  return (
    <Container>
      <AppLogo variant="profiler" />
      <Instructions />
    </Container>
  );
};

export default Profiler;
