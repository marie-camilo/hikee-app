'use client';

import { useState, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HikeCard from './HikeCard';

gsap.registerPlugin(ScrollTrigger);

interface Hike {
  id: string;
  title: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  region: string;
  imageUrls: string[];
}

export default function HikeFilterAndList({ hikes }: { hikes: Hike[] }) {
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const filteredHikes = hikes.filter(h =>
    (difficultyFilter === 'all' || h.difficulty === difficultyFilter) &&
    (regionFilter === 'all' || h.region === regionFilter)
  );

  const regions = Array.from(new Set(hikes.map(h => h.region)));

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, filtersRef.current?.children], { opacity: 0, y: 60 });

      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          once: true,
        }
      })
        .to(titleRef.current, { opacity: 1, y: 0, duration: 1.4, ease: "expo.out" })
        .to(filtersRef.current?.children || [], {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.08,
          ease: "expo.out"
        }, "-=1");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsContainerRef.current?.querySelectorAll('.hike-card-wrapper');

      if (!cards || cards.length === 0) return;

      if (!hasAnimated.current) {
        gsap.fromTo(cards,
          { opacity: 0, y: 180, scale: 0.88, filter: "brightness(0.7) blur(6px)" },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "brightness(1) blur(0px)",
            duration: 1.8,
            ease: "expo.out",
            stagger: { each: 0.14, from: "start", grid: "auto" },
            scrollTrigger: {
              trigger: cardsContainerRef.current,
              start: "top 80%",
              once: true,
            }
          }
        );
        hasAnimated.current = true;
      }
      else {
        gsap.fromTo(cards,
          { opacity: 0, y: 80, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.3,
            ease: "expo.out",
            stagger: { each: 0.11, from: "start", grid: "auto" }
          }
        );
      }
    }, cardsContainerRef);

    return () => ctx.revert();
  }, [filteredHikes]);

  return (
    <div ref={containerRef} className="px-4 md:px-8 py-12 min-h-screen mx-auto mt-24 w-full">

      <div className="mb-12">
        <h2 ref={titleRef} className="font-bold text-2xl md:text-3xl mb-6 uppercase tracking-tight text-[#4A4A4A]">
          browse by
        </h2>

        <div ref={filtersRef} className="space-y-4">
          <ul className="flex flex-wrap gap-3 mb-4">
            {['all', 'easy', 'moderate', 'hard'].map(diff => (
              <li
                key={diff}
                className={`cursor-pointer px-5 py-2.5 rounded-full font-semibold uppercase text-sm tracking-wider transition-all duration-300 transform hover:scale-102 border ${
                  difficultyFilter === diff
                    ? 'bg-[#dfddd7] text-[#4A4A4A] border-transparent'
                    : 'bg-white text-[#4A4A4A] border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setDifficultyFilter(diff)}
              >
                {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
              </li>
            ))}
          </ul>

          <ul className="flex flex-wrap gap-3">
            <li
              className={`cursor-pointer px-5 py-2.5 rounded-full font-semibold uppercase text-sm tracking-wider transition-all duration-300 transform hover:scale-102 border ${
                regionFilter === 'all'
                  ? 'bg-[#dfddd7] text-[#4A4A4A] border-transparent'
                  : 'bg-white text-[#4A4A4A] border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setRegionFilter('all')}
            >
              All regions
            </li>
            {regions.map(r => (
              <li
                key={r}
                className={`cursor-pointer px-5 py-2.5 rounded-full font-semibold uppercase text-sm tracking-wider transition-all duration-300 transform hover:scale-102 border ${
                  regionFilter === r
                    ? 'bg-[#dfddd7] text-[#4A4A4A] border-transparent'
                    : 'bg-white text-[#4A4A4A] border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setRegionFilter(r)}
              >
                {r}
              </li>
            ))}
          </ul>

        </div>
      </div>

      {filteredHikes.length > 0 ? (
        <div ref={cardsContainerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
          {filteredHikes.map(h => (
            <div key={h.id} className="hike-card-wrapper w-full">
              <HikeCard
                id={h.id}
                title={h.title}
                image={h.imageUrls?.[0]}
                difficulty={h.difficulty}
                region={h.region}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-20 text-lg">No hikes match your filter.</p>
      )}
    </div>
  );
}