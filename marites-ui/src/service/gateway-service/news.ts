import http from "./http";
import { NewsArticle } from "types/newsArticle";

export const getNewsArticles = async (
  countryCode: string,
  keywords?: string
): Promise<NewsArticle[]> => {
  try {
    const { data } = await http.get("/news", {
      params: {
        countryCode,
        keywords: keywords ? encodeURIComponent(keywords) : undefined,
      },
    });
    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
};
