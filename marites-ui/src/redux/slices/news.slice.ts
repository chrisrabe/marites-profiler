import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { NewsArticle } from "types/newsArticle";
import config from "config";

interface NewsState {
  recentNews: NewsArticle[];
  isFetchingNews?: boolean;
}

const initialState: NewsState = {
  recentNews: [],
};

export const fetchRecentNews = createAsyncThunk(
  "news/fetchRecentNews",
  async (_, thunkApi) => {
    try {
      const countryCode = config.defaultCountryCode;
      const resp = await fetch(`/api/news?countryCode=${countryCode}`).then(
        (r) => r.json()
      );
      return resp;
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
      state.recentNews = action.payload;
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
