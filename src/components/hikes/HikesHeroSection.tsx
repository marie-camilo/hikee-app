'use client';

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import SplitText from '../animations/SplitText';

interface ListHeroProps {
  mainTitle: string;
  subtitle: string;
  backgroundImage: string;
  buttonText?: string;
  buttonLink?: string;
}

const ListHeroSection: React.FC<ListHeroProps> = ({
                                                    mainTitle,
                                                    subtitle,
                                                    backgroundImage,
                                                    buttonText,
                                                    buttonLink,
                                                  }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "expo.out" }
      });

      tl.fromTo(imageRef.current,
        {
          scale: 1.12,
          opacity: 0,
          y: 100,
          filter: "brightness(0.8) blur(4px)"
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          filter: "brightness(1) blur(0px)",
          duration: 2.2,
        }
      );

      // 3. Sous-titre – entrée douce
      tl.to(textRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.4,
      }, "-=1.8");

      if (buttonRef.current) {
        tl.fromTo(buttonRef.current,
          {
            opacity: 0,
            y: 50,
            scale: 0.9,
            filter: "blur(6px)"
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.6,
            ease: "back.out(1.4)",
          },
          "-=1.2"
        );
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full pt-20 md:pt-28 pb-10 overflow-hidden">
      <div className="w-full px-4 md:px-8 lg:px-12 mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">

          <div className="flex flex-col w-full md:max-w-[50%]">
            <h1 className="w-full font-bold uppercase tracking-tight text-[#4A4A4A] mb-3 leading-none text-[12vw] sm:text-[9vw] md:text-[7vw]">
              <SplitText
                text={mainTitle}
                tag="span"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                duration={1.3}
                delay={80}
                ease="power2.out"
                textAlign="left"
              />
            </h1>

            <p
              ref={textRef}
              className="text-[#4A4A4A] text-base sm:text-lg md:text-xl font-medium opacity-0"
              style={{ transform: "translateY(30px)" }}
            >
              {subtitle}
            </p>
          </div>

          {buttonText && buttonLink && (
            <Link
              ref={buttonRef}
              to={buttonLink}
              className="mt-6 md:mt-0 px-6 py-3 border rounded-full text-sm font-semibold uppercase tracking-widest flex items-center transition-none opacity-0"
              style={{
                borderColor: '#4A4A4A',
                color: '#4A4A4A',
                backgroundColor: 'transparent',
              }}
            >
              {buttonText}
              <svg
                className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          )}
        </div>

        <div className="relative w-full overflow-hidden rounded-2xl h-[55vh] md:h-[60vh]">
          <img
            ref={imageRef}
            src={backgroundImage}
            alt={mainTitle}
            className="w-full h-full object-cover"
            style={{ opacity: 0, transform: "scale(1.12)" }}
          />
        </div>

      </div>
    </section>
  );
};

export default ListHeroSection;