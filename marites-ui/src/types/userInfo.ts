export interface User {
  name: string;
  username: string;
}

export interface UserInfo {
  following: User[];
  interests: string[];
}
