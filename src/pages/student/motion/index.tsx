// src/pages/student/components/motion/index.tsx
import React from "react";
import { motion, MotionProps } from "framer-motion";
import { fadeInVariants, scaleVariants } from "./variants";
import { ANIMATION_DURATION } from "./constants";
import { useCountAnimation } from "./hooks";

// Re-export dla wygody
export { AnimatePresence, motion } from "framer-motion";
export { useCountAnimation } from "./hooks";
export { ANIMATION_DURATION } from "./constants";

// ===== KOMPONENTY =====

interface AnimatedCardProps extends MotionProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  index = 0, 
  className = "",
  ...motionProps 
}) => {
  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedProgressProps {
  value: number;
  className?: string;
  barClassName?: string;
  height?: string;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({ 
  value, 
  className = "bg-gray-100 rounded-full overflow-hidden",
  barClassName = "h-full bg-gray-900",
  height = "h-2"
}) => {
  return (
    <div className={`${height} ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ 
          duration: ANIMATION_DURATION.slow, 
          ease: "easeOut"
        }}
        className={barClassName}
      />
    </div>
  );
};

interface AnimatedButtonProps extends MotionProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  className = "",
  ...motionProps
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={className}
      transition={{ duration: ANIMATION_DURATION.fast }}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
};

interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  className = "",
  duration = ANIMATION_DURATION.slow,
  prefix = "",
  suffix = ""
}) => {
  const displayValue = useCountAnimation(value, duration);

  return (
    <span className={className}>
      {prefix}{displayValue.toLocaleString('pl-PL')}{suffix}
    </span>
  );
};