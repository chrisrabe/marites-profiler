import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NewsArticle } from "types/newsArticle";

const sampleNews: NewsArticle = {
  title: "Amazing programmer wins Tigergraph hacking challenge!",
  imageUrl:
    "https://images.unsplash.com/photo-1648854055715-c53aa7531f14?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  date: "11 April 2022",
};

interface NewsState {
  recentNews: NewsArticle[];
}

const initialState: NewsState = {
  recentNews: [
    sampleNews,
    sampleNews,
    sampleNews,
    sampleNews,
    sampleNews,
    sampleNews,
    sampleNews,
    sampleNews,
    sampleNews,
    sampleNews,
    sampleNews,
    sampleNews,
    sampleNews,
  ],
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
