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
        keywords,
      },
    });
    return data.sort((a: NewsArticle, b: NewsArticle) =>
      b.publishDate.localeCompare(a.publishDate)
    );
  } catch (e) {
    console.log(e);
    return [];
  }
};
