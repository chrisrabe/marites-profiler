import React from "react";
import { UserInfo } from "types/userInfo";

interface UserInfoProps {
  userInfo?: UserInfo;
}

const UserInfoContent: React.FC<UserInfoProps> = ({ userInfo }) => {
  if (!userInfo) {
    return <></>;
  }

  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <h2 className="text-lg font-medium mb-10 mt-6">
        News keywords you may be interested in
      </h2>
      <div className="grid grid-flow-row auto-rows-max grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-8 max-h-96 overflow-y-auto overflow-x-hidden">
        {userInfo.interests.map((interest, i) => (
          <div
            key={`interest-${i}`}
            className="text-gray-300 font-light text-sm"
          >
            {interest}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserInfoContent;
