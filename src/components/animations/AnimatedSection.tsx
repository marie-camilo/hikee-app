"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(Observer, SplitText);

interface Section {
  title: string;
  image: string;
}

interface AnimatedSectionProps {
  sections: Section[];
}

export default function AnimatedSection({ sections }: AnimatedSectionProps) {
  const sectionRefs = useRef<HTMLDivElement[]>([]);
  const outerRefs = useRef<HTMLDivElement[]>([]);
  const innerRefs = useRef<HTMLDivElement[]>([]);
  const headingRefs = useRef<HTMLHeadingElement[]>([]);
  const splitHeadings = useRef<any[]>([]);
  const currentIndex = useRef(-1);
  const animating = useRef(false);
  const observerInstance = useRef<any>(null);

  useEffect(() => {
    // initialisation des sections
    gsap.set(sectionRefs.current, { autoAlpha: 0, zIndex: 0 });
    gsap.set(outerRefs.current, { yPercent: 100 });
    gsap.set(innerRefs.current, { yPercent: -100 });

    // SplitText
    splitHeadings.current = headingRefs.current.map(
      (heading) =>
        new SplitText(heading, { type: "chars,words,lines", linesClass: "clip-text" })
    );

    // rendre la première section visible dès le départ
    if (sectionRefs.current[0]) {
      gsap.set(sectionRefs.current[0], { autoAlpha: 1, zIndex: 1 });
      gsap.set([outerRefs.current[0], innerRefs.current[0]], { yPercent: 0 });
      gsap.set(sectionRefs.current[0].querySelector(".bg"), { yPercent: 0 });

      // lancer l'animation du texte dès le chargement
      gsap.fromTo(
        splitHeadings.current[0].chars,
        { autoAlpha: 0, yPercent: 150 },
        {
          autoAlpha: 1,
          yPercent: 0,
          duration: 1,
          ease: "power2",
          stagger: { each: 0.02, from: "random" }
        }
      );
    }

    const wrap = gsap.utils.wrap(0, sections.length);

    function gotoSection(index: number, direction: number) {
      index = wrap(index);
      animating.current = true;
      const fromTop = direction === -1;
      const dFactor = fromTop ? -1 : 1;
      const tl = gsap.timeline({
        defaults: { duration: 1.25, ease: "power1.inOut" },
        onComplete: () => {
          animating.current = false;
          // libérer le scroll sur la dernière section
          if (currentIndex.current === sections.length - 1 && observerInstance.current) {
            observerInstance.current.kill();
            observerInstance.current = null;
            document.body.style.overflowY = "auto";
          }
        },
      });

      if (currentIndex.current >= 0) {
        gsap.set(sectionRefs.current[currentIndex.current], { zIndex: 0 });
        tl.to(
          sectionRefs.current[currentIndex.current].querySelector(".bg"),
          { yPercent: -15 * dFactor }
        ).set(sectionRefs.current[currentIndex.current], { autoAlpha: 0 });
      }

      gsap.set(sectionRefs.current[index], { autoAlpha: 1, zIndex: 1 });
      tl.fromTo(
        [outerRefs.current[index], innerRefs.current[index]],
        { yPercent: (i) => (i ? -100 * dFactor : 100 * dFactor) },
        { yPercent: 0 },
        0
      )
        .fromTo(
          sectionRefs.current[index].querySelector(".bg"),
          { yPercent: 15 * dFactor },
          { yPercent: 0 },
          0
        )
        .fromTo(
          splitHeadings.current[index].chars,
          { autoAlpha: 0, yPercent: 150 * dFactor },
          {
            autoAlpha: 1,
            yPercent: 0,
            duration: 1,
            ease: "power2",
            stagger: { each: 0.02, from: "random" },
          },
          0.2
        );

      currentIndex.current = index;
    }

    // désactiver scroll initial
    document.body.style.overflowY = "hidden";

    observerInstance.current = Observer.create({
      type: "wheel,touch,pointer",
      wheelSpeed: -1,
      onDown: () => !animating.current && gotoSection(currentIndex.current - 1, -1),
      onUp: () => !animating.current && gotoSection(currentIndex.current + 1, 1),
      tolerance: 10,
      preventDefault: true,
    });

    currentIndex.current = 0;

    return () => {
      if (observerInstance.current) observerInstance.current.kill();
      document.body.style.overflowY = "auto";
    };
  }, [sections]);

  return (
    <div className="relative w-full h-screen overflow-hidden black-section">
      {sections.map((section, i) => (
        <div
          key={i}
          ref={(el) => { if (el) sectionRefs.current[i] = el; }}
          className="absolute inset-0 w-full h-full"
        >
          <div ref={(el) => { if (el) outerRefs.current[i] = el; }} className="w-full h-full overflow-hidden">
            <div ref={(el) => { if (el) innerRefs.current[i] = el; }} className="w-full h-full overflow-hidden">
              <div
                className="bg flex items-center justify-center w-full h-full absolute top-0 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.1)), url(${section.image})`,
                }}
              >
                <h2
                  ref={(el) => { if (el) headingRefs.current[i] = el; }}
                  className="section-heading text-white text-center text-4xl md:text-6xl lg:text-8xl font-semibold"
                >
                  {section.title}
                </h2>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
