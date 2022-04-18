import { UserInfo } from "types/userInfo";
import http from "./http";

export const getUserInfo = async (
  username: string
): Promise<UserInfo | undefined> => {
  try {
    const { data } = await http.get(`/user/${username}`);
    return data.data;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};
