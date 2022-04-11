import { combineReducers } from "@reduxjs/toolkit";

import newsReducer from "../slices/news.slice";

export default combineReducers({
  news: newsReducer,
});
