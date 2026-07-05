import type { Variants, Transition } from "framer-motion";

export const easeOut: Transition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] };
export const easeInOut: Transition = { duration: 0.6, ease: [0.65, 0, 0.35, 1] };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeOut },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: easeOut },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: easeOut },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: easeOut },
};

export const slideInDown: Variants = {
  hidden: { opacity: 0, y: -32 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};

export const staggerContainer = (stagger = 0.1, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
};

export const hoverLift = {
  initial: { y: 0 },
  hover: { y: -6, transition: { duration: 0.3, ease: easeOut.ease } },
};

export const tapScale = {
  whileTap: { scale: 0.97 },
};
