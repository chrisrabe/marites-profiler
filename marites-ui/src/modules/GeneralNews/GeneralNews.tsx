import React, { useEffect } from "react";
import AppLogo from "components/common/AppLogo";
import Container from "components/common/Container";
import Carousel from "components/ui/Carousel";
import { GeneralNewsProps } from "./container";
import HeroContainer from "./HeroContainer";
import NewsArticle from "../../components/common/NewsArticle";

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
      <Carousel title="Recent News">
        {recentNews.map((article) => (
          <NewsArticle key={article.title} article={article} />
        ))}
      </Carousel>
    </Container>
  );
};

export default GeneralNews;
