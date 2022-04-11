import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NewsState {
  recentNews: any[];
}

const initialState: NewsState = {
  recentNews: [],
};

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    setRecentNews(state, action: PayloadAction<any[]>) {
      state.recentNews = action.payload;
    },
  },
});

const { setRecentNews } = newsSlice.actions;

export default newsSlice.reducer;
