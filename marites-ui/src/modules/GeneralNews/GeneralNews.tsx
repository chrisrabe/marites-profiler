import React from "react";
import AppLogo from "components/common/AppLogo";
import Container from "components/common/Container";
import NewsArticle from "components/common/NewsArticle";
import Carousel from "components/ui/Carousel";
import { GeneralNewsProps } from "./container";

const GeneralNews: React.FC<GeneralNewsProps> = ({ recentNews }) => {
  return (
    <Container>
      <AppLogo variant="news" />
      <Carousel title="Recent News">
        {recentNews.map((news, i) => (
          <NewsArticle
            key={`article-${i}`}
            imageUrl={news.imageUrl}
            title={news.title}
            date={news.date}
          />
        ))}
      </Carousel>
    </Container>
  );
};

export default GeneralNews;
