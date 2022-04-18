import React, { useEffect } from "react";
import AppLogo from "components/common/AppLogo";
import Container from "components/common/Container";
import NewsArticle from "components/common/NewsArticle";
import { GeneralNewsProps } from "./container";
import HeroContainer from "./HeroContainer";
import Skeleton from "react-loading-skeleton";

const GeneralNews: React.FC<GeneralNewsProps> = ({
  recentNews,
  fetchRecentNews,
  isFetchingNews,
}) => {
  useEffect(() => {
    fetchRecentNews();
  }, [fetchRecentNews]);

  return (
    <Container>
      <AppLogo variant="news" />
      <HeroContainer />
      <div className="flex flex-col items-center lg:items-start">
        <h2 className="text-lg mb-4 font-medium">Recent News</h2>
        <div className="grid grid-flow-row auto-rows-max grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-8">
          {isFetchingNews
            ? new Array(4).fill(0).map((_, i) => (
                <div key={`article-loading-${i}`} className="w-80 h-48">
                  <Skeleton
                    height="100%"
                    width="100%"
                    highlightColor="#ef4444"
                    baseColor="#111827"
                  />
                </div>
              ))
            : recentNews.map((article) => (
                <div key={article.title}>
                  <NewsArticle article={article} />
                </div>
              ))}
        </div>
      </div>
    </Container>
  );
};

export default GeneralNews;
