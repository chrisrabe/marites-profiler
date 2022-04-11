import React from "react";
import AppLogo from "components/common/AppLogo";
import Container from "components/common/Container";
import NewsArticle from "components/common/NewsArticle";
import { Swiper, SwiperSlide } from "swiper/react";

const sampleNews = {
  title: "Amazing programmer wins Tigergraph hacking challenge!",
  imageUrl:
    "https://images.unsplash.com/photo-1648854055715-c53aa7531f14?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  date: "11 April 2022",
};

const GeneralNews: React.FC = () => {
  return (
    <Container>
      <AppLogo variant="news" />
      <Swiper spaceBetween={50} slidesPerView={2}>
        <SwiperSlide>
          <NewsArticle
            imageUrl={sampleNews.imageUrl}
            title={sampleNews.title}
            date={sampleNews.date}
          />
        </SwiperSlide>
        <SwiperSlide>
          <NewsArticle
            imageUrl={sampleNews.imageUrl}
            title={sampleNews.title}
            date={sampleNews.date}
          />
        </SwiperSlide>
        <SwiperSlide>
          <NewsArticle
            imageUrl={sampleNews.imageUrl}
            title={sampleNews.title}
            date={sampleNews.date}
          />
        </SwiperSlide>
        <SwiperSlide>
          <NewsArticle
            imageUrl={sampleNews.imageUrl}
            title={sampleNews.title}
            date={sampleNews.date}
          />
        </SwiperSlide>
        <SwiperSlide>
          <NewsArticle
            imageUrl={sampleNews.imageUrl}
            title={sampleNews.title}
            date={sampleNews.date}
          />
        </SwiperSlide>
      </Swiper>
    </Container>
  );
};

export default GeneralNews;
