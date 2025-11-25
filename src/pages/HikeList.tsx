import { useEffect, useState } from 'react'
import { collection, onSnapshot, DocumentData, QuerySnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import AnimatedSection from '../components/animations/AnimatedSection';
import HikeFilterAndList from '../components/HikeFiltrerList';

interface Hike {
  id: string
  title: string
  difficulty: 'easy' | 'moderate' | 'hard'
  region: string
  imageUrls: string[]
}

export default function HikeList() {
  const [hikes, setHikes] = useState<Hike[]>([])

  // La logique de récupération des données reste ici
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'hikes'),
      (snap: QuerySnapshot<DocumentData>) => {
        const data = snap.docs.map(d => {
          const docData = d.data()
          return {
            id: d.id,
            title: docData.title,
            difficulty: docData.difficulty,
            region: docData.region,
            imageUrls: docData.imageUrls || [],
          }
        })
        setHikes(data as Hike[])
      }
    )
    return () => unsub()
  }, [])

  // Conservez les sections pour AnimatedSection
  const heroSections = [
    {
      title: 'Discover New',
      image: '/images/cerf.JPG'
    },
    {
      title: 'Viewpoints & Hikes',
      image: '/images/connexion-img.jpg'
    },
    {
      title: 'Explore Nature',
      image: '/images/hikeur.JPG'
    },
    {
      title: 'Start Your Adventure.',
      image: '/images/mountains.JPG'
    }
  ]

  return (
    <div className="w-full overflow-hidden">
      {/* AnimatedSection ne se rend JAMAIS à nouveau, car ses props ne changent pas */}
      <AnimatedSection sections={heroSections} />

      {/* Le composant de la liste des filtres gère les changements d'état en interne */}
      <HikeFilterAndList hikes={hikes} />
    </div>
  );
}