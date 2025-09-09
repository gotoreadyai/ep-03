// src/pages/student/components/motion/constants.ts
export const ANIMATION_DURATION = {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5
} as const;

export const ANIMATION_DELAY = {
    stagger: 0.05,
} as const;

export const EASING = {
    default: [0.4, 0, 0.2, 1], // Standardowe ease-out
} as const;