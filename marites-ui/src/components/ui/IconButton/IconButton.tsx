import React from "react";
import { motion } from "framer-motion";

interface IconButtonProps {
  id: string;
  Icon: (props: React.ComponentProps<"svg">) => JSX.Element;
  onClick?: () => void;
  rotateOnHover?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  id,
  Icon,
  onClick,
  rotateOnHover = false,
}) => {
  return (
    <div className="flex items-center">
      <motion.button
        className="cursor-pointer"
        whileHover={
          rotateOnHover ? { rotate: 180, scale: 1.1 } : { scale: 1.1 }
        }
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        data-tip
        data-for={`${id}-tooltip`}
      >
        <Icon className="h-6 text-gray-400 hover:text-red-600 outline-none" />
      </motion.button>
    </div>
  );
};

export default IconButton;
