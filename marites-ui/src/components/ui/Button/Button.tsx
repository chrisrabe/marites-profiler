import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "underline" | "outlined";
  children: ReactNode;
}

const buttonStyleMap = {
  default: "bg-red-500 hover:bg-red-500 rounded text-white",
  underline: "text-gray-100 text-sm underline",
  outlined: "border border-red-600 text-red-500 rounded",
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  variant = "default",
}) => {
  const buttonStyle = buttonStyleMap[variant];

  return (
    <motion.button
      onClick={onClick}
      className={`${buttonStyle} py-2 px-6 disabled:opacity-50 cursor-pointer inline-flex space-x-5 items-center justify-center`}
      whileHover={!disabled ? { scale: 1.1 } : undefined}
      whileTap={!disabled ? { scale: 0.8 } : undefined}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

export default Button;
