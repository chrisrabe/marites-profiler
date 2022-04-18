import { combineReducers } from "@reduxjs/toolkit";

import newsReducer from "../slices/news.slice";
import userReducer from "../slices/user.slice";

export default combineReducers({
  news: newsReducer,
  users: userReducer,
});
