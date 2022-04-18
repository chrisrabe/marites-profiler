import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import fetchJson from "service/fetchJson";
import { UserInfo } from "types/userInfo";

interface UserState {
  currentUser?: string;
  userInfo?: UserInfo;
  isFetchingUser?: boolean;
}

const initialState: UserState = {
  currentUser: undefined,
  userInfo: undefined,
};

export const fetchUser = createAsyncThunk(
  "users/fetchUser",
  async ({ username }: { username: string }, thunkApi) => {
    try {
      const resp = await fetchJson<{ data?: UserInfo }>(
        `/api/user?username=${username}`
      );
      return {
        username,
        userInfo: resp.data,
      };
    } catch (e) {
      thunkApi.rejectWithValue(e);
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUser.pending, (state, action) => {
      state.isFetchingUser = true;
      state.currentUser = undefined;
      state.userInfo = undefined;
    });
    builder.addCase(fetchUser.rejected, (state, action) => {
      state.isFetchingUser = false;
      state.currentUser = undefined;
      state.userInfo = undefined;
    });
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.isFetchingUser = false;
      if (action.payload) {
        const { userInfo, username } = action.payload;
        state.currentUser = username;
        state.userInfo = userInfo;
      }
    });
  },
});

export default userSlice.reducer;
