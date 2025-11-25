import { useState, useEffect } from "react";
import { collection, onSnapshot, DocumentData, QuerySnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import HikeCard from "../components/hikes/HikeCard";
import CardStacking from '../components/animations/CardStacking';
import MountainLine from "../components/animations/MountainLine";
import SwipeSection from '../components/SwipeSection';
import ImageGrid from '../components/ImgGrid';
import ScrollReveal from '../components/animations/ScrollReveal';
import HeroSection from '../components/HeroSection';
import FeaturedSection from '../components/FeaturedSection';
import HikeFeatureTiles from '../../HikeFeatureTiles';
import HikeTilesWithButton from '../../HikeFeatureTiles';


export default function Home() {
  const [hikes, setHikes] = useState<
    {
      id: string;
      title: string;
      difficulty: 'easy' | 'moderate' | 'hard';
      region: string;
      image: string;
    }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'hikes'), (snap: QuerySnapshot<DocumentData>) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        title: d.data().title,
        difficulty: d.data().difficulty,
        region: d.data().region,
        image: d.data().image,
      }));
      setHikes(data);
    });
    return () => unsub();
  }, []);

  // Filtrage des randonnées selon la recherche de l'utilisateur
  const filteredHikes = hikes.filter(
    (hike) =>
      hike.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hike.region.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full overflow-hidden">
      <HeroSection />

      <ImageGrid />

      <section className="relative min-h-screen bg-[#1c1c1c] text-white py-20 md:py-40">
        <div className="pin-container">
          <ScrollReveal>
            {[
              "Walk through endless valleys",
              { img: "/images/cerf.JPG", caption: "Valley of Silence" },
              "discover new trails",
              { img: "/images/hikeur.JPG" },
              "and breathe",
              { img: "/images/mountains.JPG", caption: "Cold Wind" },
              "the pure air."
            ]}
          </ScrollReveal>
        </div>
      </section>

      <HikeTilesWithButton hikes={filteredHikes} />

      <FeaturedSection />
    </div>
  );
};