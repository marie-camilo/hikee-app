import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from "react-hot-toast"
import { db } from "../../lib/firebase"
import {
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
  orderBy,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore'
import { useAuth } from '../../firebase/auth'
import Button from '../Button'
import HikeCard from '../hikes/HikeCard'
import SplitText from '../animations/SplitText'
import { gsap } from "gsap";

export default function MyHikes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hikes, setHikes] = useState<any[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'hikes'),
      where('createdBy', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        title: d.data().title,
        region: d.data().region,
        images: d.data().imageUrls || [],
        difficulty: d.data().difficulty || 'easy',
        createdAt: d.data().createdAt?.toDate(),
      }))
      setHikes(data)
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (containerRef.current && hikes.length > 0) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 0.6, ease: "power2.out" }
      )
    }
  }, [hikes])

  const handleDelete = async (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-4 bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700 shadow-lg text-white">
        <span className="font-medium">Êtes-vous sûr de vouloir supprimer cette randonnée ?</span>
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
            onClick={() => toast.dismiss(t.id)}
          >
            Annuler
          </button>
          <button
            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 transition"
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                await deleteDoc(doc(db, 'hikes', id))
                toast.success('Randonnée supprimée !')
              } catch (e) {
                console.error(e)
                toast.error('Erreur lors de la suppression')
              }
            }}
          >
            Supprimer
          </button>
        </div>
      </div>
    ), { position: 'top-center' })
  }


  if (!user) {
    return <p className="text-gray-600 p-6">You need to be logged in to see your hikes.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">
          <SplitText
            text="My Hikes"
            tag="span"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            duration={1.2}
            delay={50}
            ease="power2.out"
          />
        </h1>
        <Button
          onClick={() => navigate('/hikes/new')}
          className="flex items-center gap-2"
        >
          Add a Hike
        </Button>
      </div>

      {hikes.length === 0 ? (
        <p className="text-gray-500">You haven't created any hikes yet.</p>
      ) : (
        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hikes.map((h) => (
            <div key={h.id} className="flex flex-col bg-white rounded-2xl shadow-md">
              <HikeCard
                id={h.id}
                title={h.title}
                image={h.images?.[0]}
                difficulty={h.difficulty || 'easy'}
                region={h.region}
              />

              <div className="flex p-4 gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    navigate(`/hikes/edit/${h.id}`)
                  }}
                  variant="sage"
                  size="md"
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleDelete(h.id)
                  }}
                  variant="terracotta"
                  size="md"
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
