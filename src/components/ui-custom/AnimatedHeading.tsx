"use client";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";

function AnimatedWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const words = text.split(" ");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 },
    },
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, damping: 18, stiffness: 120 },
    },
    hidden: {
      opacity: 0,
      y: 24,
      transition: { type: "spring" as const, damping: 18, stiffness: 120 },
    },
  };

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          className="mr-[0.25em] inline-block"
          key={index}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function AnimatedHeading() {
  return (
    <h1 className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
      <AnimatedWords text="Building intelligent" />
      <br className="hidden sm:block" />
      <span className="text-gradient">
        <AnimatedWords text="software that ships." />
      </span>
    </h1>
  );
}

