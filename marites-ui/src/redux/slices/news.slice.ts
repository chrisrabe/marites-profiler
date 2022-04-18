import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { NewsArticle } from "types/newsArticle";
import config from "config";
import fetchJson from "../../service/fetchJson";

interface NewsState {
  recentNews: NewsArticle[];
  isFetchingNews?: boolean;
}

const initialState: NewsState = {
  recentNews: [],
};

export const fetchRecentNews = createAsyncThunk(
  "news/fetchRecentNews",
  async ({ keywords }: { keywords?: string[] }, thunkApi) => {
    try {
      // @TODO find a way to extend this to allow more keywords
      // grab the first 20 items
      const countryCode = config.defaultCountryCode;
      let url = `/api/news?countryCode=${countryCode}`;
      if (keywords) {
        let query =
          keywords?.length > config.maxKeywords
            ? keywords.slice(0, config.maxKeywords)
            : keywords;
        url += `&keywords=${encodeURIComponent(query.join(","))}`;
      }
      return await fetchJson<NewsArticle[]>(url);
    } catch (e) {
      thunkApi.rejectWithValue(e);
    }
  }
);

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchRecentNews.fulfilled, (state, action) => {
      state.isFetchingNews = false;
      state.recentNews = action.payload ?? [];
    });
    builder.addCase(fetchRecentNews.rejected, (state, action) => {
      state.isFetchingNews = false;
      state.recentNews = [];
    });
    builder.addCase(fetchRecentNews.pending, (state, action) => {
      state.isFetchingNews = true;
      state.recentNews = [];
    });
  },
});

export default newsSlice.reducer;
