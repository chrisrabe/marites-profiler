import React from "react";
import Image from "next/image";

interface NewsArticleProps {
  imageUrl: string;
  title: string;
  date: string;
}

const NewsArticle: React.FC<NewsArticleProps> = ({ imageUrl, title, date }) => {
  return (
    <div>
      <div className="object-cover w-96 h-48 relative">
        <Image
          src={imageUrl}
          layout="fill"
          alt="Sample image"
          objectFit="cover"
        />
      </div>
      <div className="flex flex-col mt-4 w-96 h-20 relative">
        <h3 className="text-base font-medium text-gray-300 line-clamp-2">
          {title}
        </h3>
        <p className="absolute text-xs font-light text-gray-400 bottom-0">
          {date}
        </p>
      </div>
    </div>
  );
};

export default NewsArticle;
