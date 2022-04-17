import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { NewsArticle } from "types/newsArticle";
import config from "config";

interface NewsArticleProps {
  article: NewsArticle;
}

const NewsArticle: React.FC<NewsArticleProps> = ({ article }) => {
  const [imageSrc, setImageSrc] = useState(
    article.image ?? config.defaultImage
  );
  const imageProxy = `https://res.cloudinary.com/demo/image/fetch/${imageSrc}`;

  return (
    <motion.div
      whileHover={{ scale: 0.95 }}
      whileTap={{ scale: 0.9 }}
      className="cursor-pointer"
    >
      <div className="object-cover w-80 md:w-96 h-48 relative">
        <Image
          src={imageProxy}
          layout="fill"
          alt="Sample image"
          objectFit="cover"
          onError={() => {
            setImageSrc(config.defaultImage);
          }}
        />
      </div>
      <div className="flex flex-col mt-4 w-80 md:w-96 h-20 relative">
        <h3 className="text-base font-medium text-gray-300 line-clamp-2">
          {article.title}
        </h3>
        <p className="absolute text-xs font-light text-gray-400 bottom-0">
          {article.publishDate}
        </p>
      </div>
    </motion.div>
  );
};

export default NewsArticle;
