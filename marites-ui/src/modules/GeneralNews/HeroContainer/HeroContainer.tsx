import React from "react";
import { ArrowRightIcon } from "@heroicons/react/solid";
import Button from "components/ui/Button";
import Icon from "components/ui/Icon";
import { useRouter } from "next/router";

const HeroContainer: React.FC = () => {
  const router = useRouter();

  return (
    <div className="mx-4 my-12 md:mx-12 lg:mx-24 md:my-20 max-w-2xl">
      <p className="text-4xl mb-8 font-light">
        <span className="font-medium text-red-500">Personalise</span> your news
        articles using your public profile through our{" "}
        <span className="font-medium text-red-500">AI technology</span>
      </p>
      <Button onClick={() => router.push("/profiler")}>
        <span>How it works</span>
        <Icon Component={ArrowRightIcon} />
      </Button>
    </div>
  );
};

export default HeroContainer;
