import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, DocumentData, QuerySnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import ImageGrid from '../components/ImgGrid';
import ScrollReveal from '../components/animations/ScrollReveal';
import HeroSection from '../components/HeroSection';
import FeaturedSection from '../components/FeaturedSection';
import HikeTilesWithButton from '../components/hikes/HikeFeatureTiles';


export default function Home() {
  const [hikes, setHikes] = useState<
    {
      id: string;
      title: string;
      difficulty: 'easy' | 'moderate' | 'hard';
      region: string;
      imageUrls: string[];
    }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const featuredRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'hikes'), (snap: QuerySnapshot<DocumentData>) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        title: d.data().title,
        difficulty: d.data().difficulty,
        region: d.data().region,
        imageUrls: d.data().imageUrls || [],
      }));
      setHikes(data);
    });
    return () => unsub();
  }, []);

  const filteredHikes = hikes.filter(
    (hike) =>
      hike.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hike.region.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full overflow-hidden">
      <HeroSection />
      <ImageGrid scrollToFeatured={() => {
        featuredRef.current?.scrollIntoView({ behavior: 'smooth' });
      }} />

      <section className="relative min-h-screen bg-[#1c1c1c] text-white py-20 md:py-40">
        <div className="pin-container">
          <ScrollReveal>
            {[
              "Walk through endless valleys",
              { img: "/images/just-chillin.webp", caption: "valley & chilling" },
              "discover new trails",
              { img: "/images/golden-hour.webp" },
              "and breathe",
              { img: "/images/friends-bivouac.webp", caption: "friends" },
              "the pure air."
            ]}
          </ScrollReveal>
        </div>
      </section>

      <HikeTilesWithButton hikes={filteredHikes} />

      <div ref={featuredRef}>
        <FeaturedSection />
      </div>
    </div>
  );
};