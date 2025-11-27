import { useEffect, useState } from 'react'
import { collection, onSnapshot, DocumentData, QuerySnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import AnimatedSection from '../components/animations/AnimatedSection';
import HikeFilterAndList from '../components/hikes/HikeFiltrerList';
import HikesHeroSection from '../components/hikes/HikesHeroSection';

interface Hike {
  id: string
  title: string
  difficulty: 'easy' | 'moderate' | 'hard'
  region: string
  imageUrls: string[]
}

export default function HikeList() {
  const [hikes, setHikes] = useState<Hike[]>([])

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
      <HikesHeroSection
        mainTitle="all hikes"
        subtitle="Browse our complete collection of verified and tested routes, sorted by difficulty and region."
        backgroundImage="https://images.unsplash.com/photo-1544198365-f5d60b6d8190?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        buttonText="explore"
        buttonLink="#"
      />
      <HikeFilterAndList hikes={hikes} />
    </div>
  );
}