import React, { useEffect } from "react";
import AppLogo from "components/common/AppLogo";
import Container from "components/common/Container";
import Carousel from "components/ui/Carousel";
import { GeneralNewsProps } from "./container";
import HeroContainer from "./HeroContainer";
import NewsArticle from "components/common/NewsArticle";

const GeneralNews: React.FC<GeneralNewsProps> = ({
  recentNews,
  fetchRecentNews,
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
          {recentNews.map((article) => (
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
