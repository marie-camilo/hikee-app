import { useEffect, useState, useRef } from 'react'
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../firebase/auth'
import HikeCard from '../hikes/HikeCard'
import SplitText from '../animations/SplitText'
import { gsap } from 'gsap'

export default function Favorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    async function fetchFavorites() {
      try {
        const q = query(
          collection(db, 'favorites'),
          where('userId', '==', user.uid)
        )

        const snap = await getDocs(q)
        const hikes: any[] = []

        for (const fav of snap.docs) {
          const { hikeId } = fav.data()
          if (!hikeId) continue
          const hikeDoc = await getDoc(doc(db, 'hikes', hikeId))
          if (hikeDoc.exists()) {
            const data = hikeDoc.data()
            hikes.push({
              id: hikeDoc.id,
              title: data.title,
              region: data.region,
              difficulty: data.difficulty || 'easy',
              imageUrls: data.imageUrls || [],
              createdAt: data.createdAt?.toDate(),
            })
          }
        }

        setFavorites(hikes)
      } catch (err) {
        console.error('Error fetching favorites:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [user])

  // --- ANIMATION ---
  useEffect(() => {
    if (containerRef.current && favorites.length > 0) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 0.6, ease: "power2.out" }
      )
    }
  }, [favorites])

  if (!user) return <p className="p-6 text-gray-600">You need to log in to see your favorites.</p>
  if (loading) return <p className="p-6 text-gray-600">Loading…</p>
  if (favorites.length === 0) return <p className="p-6 text-gray-500">No favorites yet.</p>

  return (
    <div className="space-y-6 p-6">
      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-4">
        <SplitText
          text="My Favorite Hikes"
          tag="span"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          duration={1.2}
          delay={50}
          ease="power2.out"
        />
      </h1>

      {/* FAVORITE HIKES */}
      <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map(h => (
          <div key={h.id} className="flex flex-col bg-white rounded-2xl shadow-md">
            <HikeCard
              id={h.id}
              title={h.title}
              image={h.imageUrls?.[0]} // <-- IMAGE corrigée
              difficulty={h.difficulty || 'easy'}
              region={h.region}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
