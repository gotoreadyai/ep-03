// src/pages/student/components/motion/variants.ts
import { Variants } from "framer-motion";
import { ANIMATION_DURATION, ANIMATION_DELAY, EASING } from "./constants";

export const fadeInVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20
  },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * ANIMATION_DELAY.stagger,
      duration: ANIMATION_DURATION.normal,
      ease: EASING.default
    }
  })
};

export const scaleVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95
  },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * ANIMATION_DELAY.stagger,
      duration: ANIMATION_DURATION.fast,
      ease: EASING.default
    }
  })
};