import React, { useMemo, useState } from "react";
import Modal from "react-modal";
import { UserInfo } from "types/userInfo";
import Button from "components/ui/Button";
import Icon from "components/ui/Icon";
import { ArrowRightIcon, XIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import UserInfoContent from "./UserInfoContent";
import IconButton from "components/ui/IconButton";

// @TODO code here looks disgusting. Refactor when you have time.

interface UserWelcomeProps {
  username: string;
  userInfo?: UserInfo;
}

if (Modal.defaultStyles?.overlay?.backgroundColor) {
  Modal.defaultStyles.overlay.backgroundColor = "rgba(0,0,0,0.5)";
  Modal.defaultStyles.overlay.padding = "2em";
  Modal.defaultStyles.overlay.display = "flex";
  Modal.defaultStyles.overlay.justifyContent = "center";
  Modal.defaultStyles.overlay.alignItems = "center";
}

const UserWelcome: React.FC<UserWelcomeProps> = ({ userInfo, username }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

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
          userInfo.interests.length === 0 ? (
            <div>
              <p className="text-3xl mb-1 font-light text-gray-300">
                Looks like we can&apos;t find anything about you.{" "}
                <span className="font-medium text-red-500">
                  Your account may be set to private.
                </span>{" "}
                It&apos;s okay though!
              </p>
            </div>
          ) : (
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
          )
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
      <div className="flex flex-col space-y-4">
        {userInfo && userInfo.interests.length > 0 && (
          <div>
            <Button onClick={() => setIsOpen(true)}>
              <span>What else did you find?</span>
              <Icon Component={ArrowRightIcon} />
            </Button>
            <Modal
              isOpen={isOpen}
              onRequestClose={() => setIsOpen(false)}
              shouldCloseOnOverlayClick
              className="bg-gray-900 py-4 px-10 md:px-14"
            >
              <IconButton id="close" Icon={XIcon} />
              <UserInfoContent userInfo={userInfo} />
              <div className="w-full flex justify-center mb-8">
                <Button onClick={() => setIsOpen(false)}>Got it</Button>
              </div>
            </Modal>
          </div>
        )}
        <div>
          <Button
            variant={userInfo ? "underline" : "default"}
            onClick={() => router.push("/profiler")}
          >
            <span>Analyse another</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserWelcome;
