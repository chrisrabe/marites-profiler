import React, { ReactNode, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import useMediaQuery from "hooks/useMediaQuery";

interface CarouselProps {
  children: ReactNode[];
}

const slideToSize = {
  md: 2,
  lg: 2,
  xl: 3,
  xxl: 4,
};

const Carousel: React.FC<CarouselProps> = ({ children }) => {
  const lg = useMediaQuery("(min-width: 992px)");
  const xl = useMediaQuery("(min-width: 1450px)");
  const xxl = useMediaQuery("(min-width: 1800px)");

  const slidesPerView = useMemo(() => {
    if (xxl) {
      return slideToSize.xxl;
    } else if (xl) {
      return slideToSize.xl;
    } else {
      return slideToSize.lg;
    }
  }, [lg, xl, xxl]);

  return (
    <>
      {!lg ? (
        <ul className="space-y-4 w-full flex flex-col items-center">
          {children.map((child, i) => (
            <li key={`slide-${i}`}>{child}</li>
          ))}
        </ul>
      ) : (
        <Swiper slidesPerView={slidesPerView}>
          {children.map((child, i) => (
            <SwiperSlide key={`slide-${i}`}>{child}</SwiperSlide>
          ))}
        </Swiper>
      )}
    </>
  );
};

export default Carousel;
