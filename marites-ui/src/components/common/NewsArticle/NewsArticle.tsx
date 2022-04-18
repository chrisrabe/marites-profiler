import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { NewsArticle } from "types/newsArticle";
import config from "config";
import dayjs from "dayjs";

interface NewsArticleProps {
  article: NewsArticle;
}

function removeTags(str: string) {
  if (str === null || str === "") return false;
  else str = str.toString();

  // Regular expression to identify HTML tags in
  // the input string. Replacing the identified
  // HTML tag with a null string.
  return str.replace(/(<([^>]+)>)/gi, "");
}

const NewsArticle: React.FC<NewsArticleProps> = ({ article }) => {
  const [imageSrc, setImageSrc] = useState(
    article.image ?? config.defaultImage
  );
  const imageProxy = `https://res.cloudinary.com/demo/image/fetch/${imageSrc}`;

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="cursor-pointer drop-shadow relative"
      onClick={() => window.open(article.url, "_blank")?.focus()}
    >
      <div className="object-cover w-80 h-48 relative">
        <div className="w-full h-full">
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
        <motion.div
          className="w-full h-full absolute left-0 top-0 bg-gray-900 overflow-hidden p-4 flex items-center"
          whileHover={{ opacity: 1 }}
          initial={{ opacity: 0 }}
        >
          <p className="text-sm font-light line-clamp-4">
            {article.description
              ? removeTags(article.description)
              : article.title}
          </p>
        </motion.div>
      </div>
      <div className="flex flex-col mt-4 w-80 h-20 relative">
        <h3 className="text-base font-medium text-gray-300 line-clamp-2">
          {article.title}
        </h3>
        <p className="absolute text-xs font-light text-gray-400 bottom-0">
          {dayjs(article.publishDate).format("D MMMM YYYY")}
        </p>
      </div>
    </motion.button>
  );
};

export default NewsArticle;
