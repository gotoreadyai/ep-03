// src/pages/student/components/motion/hooks.ts
import React from "react";
import { ANIMATION_DURATION } from "./constants";

export const useCountAnimation = (value: number, duration: number = ANIMATION_DURATION.slow) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const previousValue = React.useRef(0);

  React.useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      
      const currentValue = Math.floor(
        startValue + (endValue - startValue) * easeProgress
      );
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);

  return displayValue;
};