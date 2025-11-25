'use client';
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useImageParallax } from '../../hooks/useParallax';

gsap.registerPlugin(ScrollTrigger);

interface TextContent {
  text: string;
  alignment: 'left' | 'right';
}

interface MountainLineProps {
  images: string[];
  textContent?: TextContent;
}

const DESKTOP_IMAGE_STYLES = [
  { size: 'w-[540px] h-[620px]', offset: '-translate-y-[250px] -translate-x-[110px]' },
  { size: 'w-[430px] h-[530px]', offset: '-translate-y-[750px] translate-x-[110px]' },
  { size: 'w-[560px] h-[380px]', offset: '-translate-y-[980px] -translate-x-[130px]' },
];

const MOBILE_IMAGE_STYLES = [
  { size: 'w-[280px] h-[320px]', offset: '' },
  { size: 'w-[260px] h-[300px]', offset: '' },
  { size: 'w-[300px] h-[200px]', offset: '' },
];

const PARALLAX_CONFIGS = [
  { speed: 15, scale: 1.25 },
  { speed: 10, scale: 1.2 },
  { speed: 20, scale: 1.3 },
];

const MountainLine: React.FC<MountainLineProps> = ({ images, textContent }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const numItems = Math.min(images.length, 3);

  const parallax0 = useImageParallax(PARALLAX_CONFIGS[0]);
  const parallax1 = useImageParallax(PARALLAX_CONFIGS[1]);
  const parallax2 = useImageParallax(PARALLAX_CONFIGS[2]);
  const parallaxRefs = [parallax0, parallax1, parallax2];

  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* Responsive */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const imageStyles = isMobile ? MOBILE_IMAGE_STYLES : DESKTOP_IMAGE_STYLES;

  useEffect(() => {
    if (isMobile) return;

    const path = pathRef.current;
    if (!path) return;

    const length = path.getTotalLength();

    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
      opacity: 1,
    });

    const anim = gsap.to(path, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: svgRef.current,
        start: 'top center',
        end: 'bottom bottom',
        scrub: 3,
      },
    });

    return () => anim.kill();
  }, [isMobile]);

  /* Text reveal animations */
  useEffect(() => {
    textRefs.current.forEach((el) => {
      if (!el) return;

      gsap.fromTo(
        el,
        { opacity: 0, y: 40, skewY: 4 },
        {
          opacity: 1,
          y: 0,
          skewY: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }, []);

  const desktopPath =
    'M800.014 0.482666L720.514 21.9827L701.514 89.9827L600.514 67.9827L574.014 172.983L486.514 203.983L442.514 293.983L288.514 346.483L170.014 325.483L12.0144 339.983L0.514404 456.983L67.0144 561.483V675.483H188.514L256.014 744.983L352.014 768.483L406.014 874.483L352.014 951.983L424.514 1040.48L574.014 996.483L765.514 1024.48L965.014 996.483';

  return (
    <section className="white-section relative w-full bg-[#F5F3EF] pt-[10vh] pb-[6vh] md:pb-[1vh] overflow-visible z-20">
      <svg
        ref={svgRef}
        className="hidden md:block absolute inset-0 mx-auto w-[60%] z-0"
        viewBox="0 0 954 1831"
        preserveAspectRatio="xMidYMid meet"
      >
        <path d={desktopPath} stroke="#8fa182" strokeWidth="2.5" opacity="0.25" fill="none" />
        <path ref={pathRef} d={desktopPath} stroke="#4c6b48" strokeWidth="2.5" fill="none" />
      </svg>

      <div className={`relative z-10 flex flex-col ${isMobile ? 'gap-[12vh]' : 'gap-[34vh]'}`}>

        {/* Limiter à 3 éléments */}
        {images.slice(0, numItems).map((src, i) => {
          const style = imageStyles[i % imageStyles.length];
          const { containerRef, imageRef } = parallaxRefs[i];

          // Déterminer l'alignement du conteneur parent (image + texte)
          const containerAlign =
            isMobile
              ? i % 2 === 0 ? 'items-start px-6' : 'items-end px-6'
              : i % 2 === 0 ? 'items-end pl-24' : 'items-start pr-24';

          // Déterminer l'alignement du texte (si textContent existe)
          const textAlignmentClass = textContent?.alignment === 'right' ? 'text-right' : 'text-left';

          return (
            <div key={i} className={`flex flex-col ${containerAlign} relative`}>

              {/* Image */}
              <div
                ref={!isMobile ? containerRef : null}
                className={`overflow-hidden rounded-2xl shadow-2xl ${style.size} ${style.offset}`}
              >
                <img
                  ref={!isMobile ? imageRef : null}
                  src={src}
                  alt={textContent?.text.substring(0, 50) || `Image de randonnée ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.06]"
                />
              </div>

              {/* Bloc de texte : Affiché SEULEMENT si i === 0 ET si textContent a été fourni */}
              {i === 0 && textContent && (
                <div
                  ref={(el) => (textRefs.current[i] = el)}
                  className={`
                    mt-8 md:mt-12
                    opacity-0 translate-y-4
                    text-slate-700/90
                    px-8 md:px-16
                    max-w-2xl
                    text-base md:text-lg
                    leading-relaxed
                    ${textAlignmentClass}
                  `}
                >
                  {textContent.text}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </section>
  );
};

export default MountainLine;