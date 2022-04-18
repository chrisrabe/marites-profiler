import React, { useMemo } from "react";
import { UserInfo } from "types/userInfo";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/ui/Icon";
import { ArrowRightIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";

interface UserWelcomeProps {
  username: string;
  userInfo?: UserInfo;
}

const UserWelcome: React.FC<UserWelcomeProps> = ({ userInfo, username }) => {
  const router = useRouter();

  const displayedInterest = useMemo(() => {
    if (!userInfo) {
      return "";
    }
    const start = userInfo.interests.length / 2;
    const max = 5;
    return userInfo.interests.slice(start, start + max).join(", ");
  }, [userInfo]);

  return (
    <div className="mx-4 my-12 md:mx-12 lg:mx-24 md:my-20 max-w-2xl">
      <p className="text-4xl mb-3 font-light">
        Welcome <span className="font-medium text-red-500">@{username}</span>!
      </p>
      <div className="mb-8">
        {userInfo ? (
          <div>
            <p className="text-3xl mb-1 font-light text-gray-300">
              Here are your personalised news!
            </p>
            <p className="text-3xl mb-4 font-light text-gray-300">
              We picked up that you may like news about{" "}
              <span className="font-medium text-red-500">
                {displayedInterest},
              </span>{" "}
              and more!
            </p>
          </div>
        ) : (
          <div>
            <p className="text-3xl mb-1 font-light text-gray-300">
              Looks like we&apos;re still gathering information about you.
            </p>
            <p className="text-3xl mb-4 font-light text-gray-300">
              This process takes{" "}
              <span className="font-medium text-red-500">
                around 30 minutes
              </span>
              . Please browse our news or come back after a while!
            </p>
          </div>
        )}
      </div>
      <Button onClick={() => router.push("/profiler")}>
        <span>Analyse another</span>
        <Icon Component={ArrowRightIcon} />
      </Button>
    </div>
  );
};

export default UserWelcome;
