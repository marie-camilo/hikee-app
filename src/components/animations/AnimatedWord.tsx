"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface AnimatedWordProps {
  children: string;
  variant?: "circle" | "underline" | "mountain" | "highlight" | "none";
  color?: string;
}

export default function AnimatedWord({
                                       children,
                                       variant = "underline",
                                       color = "#2C4A3A", // joli vert montagne
                                     }: AnimatedWordProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
      }
    );

    if (svgRef.current) {
      gsap.fromTo(
        svgRef.current.querySelector("path"),
        { strokeDasharray: 200, strokeDashoffset: 200 },
        {
          strokeDashoffset: 0,
          duration: 0.8,
          delay: 0.2,
          ease: "power2.out",
        }
      );
    }
  }, []);

  /* ---------- SVG DESIGNS ---------- */
  const renderSVG = () => {
    switch (variant) {
      case "circle":
        return (
          <svg
            ref={svgRef}
            className="absolute inset-0 -z-10"
            width="120%"
            height="160%"
            viewBox="0 0 120 60"
          >
            <path
              d="M15 30 Q 60 -5 105 30 Q 60 65 15 30Z"
              stroke={color}
              strokeWidth="3"
              fill="transparent"
              strokeLinecap="round"
            />
          </svg>
        );

      case "underline":
        return (
          <svg
            ref={svgRef}
            className="absolute bottom-0 left-0"
            width="100%"
            height="12"
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
          >
            <path
              d="M0 6 Q 25 1 50 6 T 100 6"
              stroke={color}
              strokeWidth="2"
              fill="transparent"
              strokeLinecap="round"
            />
          </svg>
        );

      case "mountain":
        return (
          <svg
            ref={svgRef}
            className="absolute bottom-0 left-0"
            width="100%"
            height="16"
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
          >
            <path
              d="M0 15 L25 5 L40 12 L55 3 L75 10 L100 6"
              stroke={color}
              strokeWidth="2"
              fill="transparent"
              strokeLinecap="round"
            />
          </svg>
        );

      case "highlight":
        return (
          <span
            className="absolute inset-0 -z-10 rounded-md"
            style={{
              backgroundColor: color + "33",
              transform: "scaleY(0.4)",
            }}
          ></span>
        );

      default:
        return null;
    }
  };

  return (
    <span className="relative inline-block px-1">
      {renderSVG()}
      <span ref={ref}>{children}</span>
    </span>
  );
}
