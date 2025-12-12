'use client';

import React, { useEffect, useState, FormEvent, useLayoutEffect, useRef } from 'react';
import { MapPin, Route, Mountain, Calendar } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import FavoriteButton from '../components/ButtonFav';
import HikeMap from '../components/hikes/HikeMap';
import CommentsSection, { Comment } from '../components/CommentsSection';
import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  Timestamp,
  serverTimestamp,
  DocumentData,
  DocumentSnapshot,
  getDoc,
} from 'firebase/firestore';
import { useAuth } from '../firebase/auth';
import WeatherBanner from '../components/hikes/WeatherBanner';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from '../components/animations/SplitText';

gsap.registerPlugin(ScrollTrigger);

interface Hike {
  id: string;
  title: string;
  description: string;
  region: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  distanceKm: number;
  elevationGainM: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  polyline?: [number, number][];
  itinerary?: { title: string; description: string }[];
  imageUrls?: string[];
  gpxPath?: string;
  createdBy?: string;
  createdByName?: string;
}

export default function HikeView() {
  const { id } = useParams<{ id: string }>();
  // Suppression de [userRating, setUserRating]
  const [hike, setHike] = useState<Hike | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Récupère l'état d'authentification

  const containerRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);
  const galleryRefs = useRef<(HTMLDivElement | null)[]>([]);

  // === CHARGEMENT DES DONNÉES DE LA RANDONNÉE + AUTEUR ===
  useEffect(() => {
    if (!id) return;

    const unsubHike = onSnapshot(doc(db, 'hikes', id), async (d: DocumentSnapshot<DocumentData>) => {
      if (!d.exists()) {
        setError('Randonnée introuvable');
        setLoading(false);
        return;
      }

      const data = { id: d.id, ...(d.data() as Omit<Hike, 'id'>) };

      // Récupération du nom de l'auteur
      if (data.createdBy) {
        try {
          const userDoc = await getDoc(doc(db, "users", data.createdBy));
          if (userDoc.exists()) {
            data.createdByName = userDoc.data().displayName || "Utilisateur inconnu";
          } else {
            data.createdByName = "Utilisateur inconnu";
          }
        } catch (err) {
          console.error("Erreur récupération nom auteur :", err);
          data.createdByName = "Utilisateur inconnu";
        }
      }

      setHike(data);
      setLoading(false);
    });

    return () => unsubHike();
  }, [id]);

  const addComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !id) return;
    const text = new FormData(e.currentTarget).get('text')?.toString()?.trim();
    if (!text) return;
    try {
      await addDoc(collection(db, 'hikes', id, 'comments'), {
        text,
        authorUid: user.uid,
        authorName: user.displayName || 'Anonyme',
        createdAt: serverTimestamp(),
      });
      e.currentTarget.reset();
    } catch (err) {
      console.error(err);
    }
  };

  // ANIMATION D'ENTRÉE (inchangé)
  useLayoutEffect(() => {
    if (loading || error || !hike) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          once: true,
        }
      });

      if (mainImageRef.current) {
        tl.fromTo(
          mainImageRef.current,
          { scale: 1.15, opacity: 0, filter: "brightness(0.7) blur(8px)" },
          { scale: 1, opacity: 1, filter: "brightness(1) blur(0px)", duration: 2.2, ease: "expo.out" }
        );
      }

      galleryRefs.current.forEach((el, i) => {
        if (el) {
          tl.fromTo(
            el,
            { opacity: 0, y: 80, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: "expo.out", delay: i * 0.08 },
            "-=1.8"
          );
        }
      });

      tl.addLabel("title", "-=1.6");

      tl.fromTo(
        ".info-block, .map-block, .comments-block",
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1.6, stagger: 0.2, ease: "expo.out" },
        "title+=0.4"
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading, error, hike]);


  if (loading) return <p className="p-6 text-center">Chargement…</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;
  if (!hike) return <p className="p-6 text-center">Randonnée introuvable</p>;

  const difficultyColors: Record<Hike['difficulty'], string> = {
    easy: 'bg-[var(--green)]',
    moderate: 'bg-[var(--yellow)]',
    hard: 'bg-[var(--red)]',
  };

  const mainImage = hike.imageUrls?.[0] || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60';
  const formatDate = (ts: Timestamp) =>
    ts.toDate().toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  const userName = user?.displayName?.trim() || user?.email?.split('@')[0] || 'Anonyme';

  return (
    <div ref={containerRef} className="w-full px-4 md:px-8 mt-25 space-y-12">

      {/* Header Image */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        <img
          ref={mainImageRef}
          src={mainImage}
          alt={hike.title}
          className="w-full h-80 md:h-[500px] object-cover"
          style={{ opacity: 0 }}
        />
        <div className="absolute top-4 right-4 z-10">
          {id && <FavoriteButton user={user} hikeId={id} />}
        </div>
      </div>

      {/* Galerie secondaire */}
      {hike.imageUrls && hike.imageUrls.length > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {hike.imageUrls.slice(1).map((url, i) => (
            <div
              key={i}
              ref={el => galleryRefs.current[i] = el}
              className="relative overflow-hidden rounded-xl shadow-lg group cursor-pointer"
            >
              <img
                src={url}
                alt={`photo-${i + 1}`}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      )}

      {/* Titre + Infos */}
      <div className="info-block bg-white shadow-xl rounded-2xl p-8 space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
          <SplitText
            text={hike.title}
            tag="span"
            splitType="words"
            from={{ opacity: 0, y: 60 }}
            to={{ opacity: 1, y: 0 }}
            duration={1.3}
            delay={200}
            ease="expo.out"
            textAlign="left"
          />
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-lg">
          <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-[#2C3E2E]" /> {hike.region}</div>
          <div className="flex items-center gap-2"><Route className="w-5 h-5 text-[#C46D52]" /> {hike.distanceKm} km</div>
          <div className="flex items-center gap-2"><Mountain className="w-5 h-5 text-[#7A9B76]" /> +{hike.elevationGainM} m</div>
          <span className={`px-3 py-2 rounded-full text-white font-bold text-sm ${difficultyColors[hike.difficulty]}`}>
            {hike.difficulty === 'easy' ? 'Facile' : hike.difficulty === 'moderate' ? 'Modérée' : 'Difficile'}
          </span>
        </div>

        <p className="text-lg text-gray-700 leading-relaxed">{hike.description}</p>

        <div className="text-sm text-gray-500 space-y-1">
          {hike.createdAt && <p><Calendar className="w-4 h-4 inline mr-2" />Créée le {formatDate(hike.createdAt)}</p>}
          {hike.updatedAt && <p><Calendar className="w-4 h-4 inline mr-2" />Mis à jour le {formatDate(hike.updatedAt)}</p>}
          {hike.createdByName && (
            <p className="text-gray-600 text-sm">
              Ajoutée par <span className="font-semibold">{hike.createdByName}</span>
            </p>
          )}
        </div>
      </div>

      {/* Carte */}
      <div className="map-block grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="h-96 lg:h-full min-h-96">
            <HikeMap gpxPath={hike.gpxPath || null} />
          </div>
        </div>

        {/* Itinéraire + météo */}
        <div className="space-y-8">
          {hike.itinerary && hike.itinerary.length > 0 && (
            <div className="bg-white shadow-xl rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">Itinerary</h2>
              <ol className="space-y-4 text-gray-700">
                {hike.itinerary.map((step, i) => (
                  <li key={i}>
                    <p className="font-semibold text-lg">{i + 1}. {step.title}</p>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <WeatherBanner
            city={hike.region}
            lat={hike.polyline?.[0]?.[0]}
            lon={hike.polyline?.[0]?.[1]}
          />
        </div>
      </div>

      {/* Commentaires */}
      <div className="comments-block">
        <CommentsSection
          comments={comments}
          canComment={!!user}
          hikeId={id!}
          userUid={user?.uid || ''}
          userName={userName}
        />
      </div>
    </div>
  );
}