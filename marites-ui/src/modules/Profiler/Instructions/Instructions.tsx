import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper";

import "swiper/css/autoplay";

const steps = [
  {
    text: "We discover your interests using your digital profile through targeted sentimental analysis.",
    keywords: ["targeted sentimental analysis"],
  },
  {
    text: "This means that our profiler extracts subjects and topics from your posts and identifies how you feel about them.",
    keywords: ["subjects and topics", "identifies how you feel about them"],
  },
  {
    text: "After, we personalise your experience by providing articles that are related to your interests.",
    keywords: ["personalise your experience"],
  },
  {
    text: "Our profiler can assist businesses in automating the personalisation processes.",
    keywords: ["automating the personalisation processes"],
  },
  {
    text: "This results in better user experience, and instant customised recommendations as soon as a user registers.",
    keywords: ["better user experience", "instant customised recommendations"],
  },
  {
    text: "To get started, please enter your Twitter username",
    keywords: ["enter your Twitter username"],
  },
];

const highlightKeywords = (step: { text: string; keywords: string[] }) => {
  let newText = step.text;
  for (const words of step.keywords) {
    newText = newText.replace(
      words,
      `<span class="font-medium text-purple-500">${words}</span>`
    );
  }
  return newText;
};

const Instructions: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="my-12 mx-2 md:my-28 md:mx-32 lg:mx-48">
      <h2 className="text-center mb-8 font-medium text-sm text-gray-300">
        How it works
      </h2>
      <Swiper
        className="max-w-2xl"
        modules={[Autoplay]}
        centeredSlides
        autoplay={{ delay: 7000 }}
        onAutoplay={(swiper) => {
          setActiveIndex(swiper.activeIndex);
        }}
      >
        {steps.map((step) => (
          <SwiperSlide key={step.text}>
            <p
              className="text-2xl font-light text-center"
              dangerouslySetInnerHTML={{ __html: highlightKeywords(step) }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="inline-flex space-x-2 w-full items-center justify-center mt-2 md:mt-6">
        {new Array(steps.length).fill(0).map((_, i) => (
          <div
            key={`circle-${i}`}
            className={`rounded-full h-2 w-2 ${
              activeIndex === i ? "bg-purple-500" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Instructions;
