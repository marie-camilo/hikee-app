import { useEffect, useState, useCallback, useRef } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../firebase/auth";
import Button from "../Button";
import { useNavigate } from "react-router-dom";
import SplitText from '../animations/SplitText';
import { StarsIcon, Map as MapIcon } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { gsap } from "gsap";

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myHikes, setMyHikes] = useState<HikeData[]>([]);
  const [favorites, setFavorites] = useState<FavoriteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalKm, setTotalKm] = useState(0);

  const totalKmRef = useRef<HTMLSpanElement>(null);
  const hikesCountRef = useRef<HTMLSpanElement>(null);
  const favCountRef = useRef<HTMLSpanElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const hikesQ = query(
        collection(db, "hikes"),
        where("createdBy", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const hikesSnap = await getDocs(hikesQ);
      const hikesData = hikesSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        distanceKm: d.data().distanceKm || 0,
        createdAt: d.data().createdAt,
      })) as HikeData[];
      setMyHikes(hikesData);

      const kmSum = hikesData.reduce((acc, h) => acc + (h.distanceKm || 0), 0);
      setTotalKm(kmSum);

      const favQ = query(collection(db, "favorites"), where("userId", "==", user.uid));
      const favSnap = await getDocs(favQ);
      const favHikesPromises = favSnap.docs.map(async (fav) => {
        const { hikeId } = fav.data();
        if (!hikeId) return null;
        const hikeDocQuery = query(collection(db, "hikes"), where("__name__", "==", hikeId));
        const hikeDocSnap = await getDocs(hikeDocQuery);
        return hikeDocSnap.empty ? null : { id: hikeDocSnap.docs[0].id, ...hikeDocSnap.docs[0].data() } as FavoriteData;
      });
      const favHikes = (await Promise.all(favHikesPromises)).filter(h => h !== null) as FavoriteData[];
      setFavorites(favHikes);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!loading) {
      // Count Up animation
      if (totalKmRef.current) {
        gsap.fromTo(totalKmRef.current, { innerText: 0 }, { innerText: totalKm, duration: 1.5, snap: { innerText: 1 }, ease: "power1.out" });
      }
      if (hikesCountRef.current) {
        gsap.fromTo(hikesCountRef.current, { innerText: 0 }, { innerText: myHikes.length, duration: 1.2, snap: { innerText: 1 }, ease: "power1.out" });
      }
      if (favCountRef.current) {
        gsap.fromTo(favCountRef.current, { innerText: 0 }, { innerText: favorites.length, duration: 1.2, snap: { innerText: 1 }, ease: "power1.out" });
      }

      // Cards fade in
      if (cardsRef.current) {
        gsap.fromTo(cardsRef.current.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: "power2.out" }
        );
      }

      // Charts fade in
      if (chartsRef.current) {
        gsap.fromTo(chartsRef.current.children,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, stagger: 0.3, duration: 1, ease: "power2.out" }
        );
      }

      // Recent Hikes
      if (recentRef.current) {
        gsap.fromTo(recentRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: "power2.out" }
        );
      }
    }
  }, [loading, totalKm, myHikes.length, favorites.length]);

  if (!user) return <p className="p-6 text-[var(--slate)]">Log in to view your dashboard.</p>;
  if (loading) return <p className="p-6 text-[var(--slate)]">Loading...</p>;

  const recentHikes = myHikes.slice(0, 3);

  const kmGoal = 100;
  const kmPercentage = totalKm > 0 ? Math.min(100, Math.round((totalKm / kmGoal) * 100)) : 0;
  const progressStroke = 2 * Math.PI * 45;
  const offset = progressStroke - (kmPercentage / 100) * progressStroke;

  const kmPerMonth = (() => {
    const map = new Map<string, number>();
    myHikes.forEach(hike => {
      const date = hike.createdAt?.toDate();
      if (!date) return;
      const month = date.toLocaleString("en-US", { month: "short" });
      map.set(month, (map.get(month) || 0) + hike.distanceKm);
    });
    return Array.from(map, ([month, km]) => ({ month, km }));
  })();

  // Chart Components
  // MountainChart – Version fixe et sans warning
  const MountainChart = ({ data }: { data: { month: string; km: number }[] }) => (
    <div className="bg-[#fcfcfc] rounded-2xl p-6 shadow-xl h-full">
      <h2 className="text-xl font-bold text-[var(--forest-dark)] mb-4">
        Monthly Distance Overview
      </h2>

      {/* Hauteur fixe + min-h pour éviter le -1px */}
      <div className="w-full h-64 min-h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mountainColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="#7A9B76" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#7A9B76" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#E8E4DD"/>
            <XAxis dataKey="month" stroke="#4A4A4A" tickLine={false}/>
            <YAxis stroke="#4A4A4A" tickLine={false}/>
            <Tooltip />
            <Area
              type="monotone"
              dataKey="km"
              stroke="#7A9B76"
              strokeWidth={3}
              fill="url(#mountainColor)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

// HikesPerMonthChart – Même fix
  const HikesPerMonthChart = ({ data }: { data: { month: string; km: number }[] }) => (
    <div className="bg-[#fcfcfc] rounded-2xl p-6 shadow-xl h-full">
      <h2 className="text-xl font-bold text-[var(--forest-dark)] mb-4">
        Hikes Per Month
      </h2>

      <div className="w-full h-64 min-h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#E8E4DD"/>
            <XAxis dataKey="month" stroke="#4A4A4A" tickLine={false}/>
            <YAxis stroke="#4A4A4A" tickLine={false}/>
            <Tooltip />
            <Bar dataKey="km" fill="#7A9B76" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 px-4 md:px-8 pb-12" style={{
      '--forest-dark': '#2C3E2E',
      '--stone': '#F5F3EF',
      '--sand': '#E8E4DD',
      '--slate': '#4A4A4A',
      '--terracotta': '#D87855',
      '--sage': '#7A9B76',
    } as React.CSSProperties}>

      {/* HERO */}
      <header className="pt-6">
        <h1 className="w-full font-bold uppercase tracking-tight text-[var(--forest-dark)] leading-none text-[12vw] sm:text-[9vw] md:text-[5vw]">
          <SplitText
            text={`Welcome, ${user.displayName?.split(' ')[0] || 'Hiker'}!`}
            tag="span"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            duration={1.2}
            delay={80}
            ease="power2.out"
            textAlign="left"
          />
        </h1>
        <p className="text-[var(--slate)] text-base sm:text-lg font-medium mt-2">
          An overview of your hiking and bivouac stats.
        </p>
      </header>

      {/* KPI CARDS */}
      <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="bg-[var(--forest-dark)] text-[var(--stone)] rounded-2xl p-6 shadow-xl lg:col-span-1">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold">Total Distance Goal</h2>
          </div>
          <div className="flex items-center justify-start gap-6">
            <div className="relative w-[100px] h-[100px] flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-[var(--sand)] opacity-30"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-[var(--sage)] transition-all duration-1000"
                  strokeWidth="10"
                  strokeDasharray={progressStroke}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                />
              </svg>
              <span className="text-2xl font-bold">{kmPercentage}%</span>
            </div>
            <div>
              <p ref={totalKmRef} className="text-4xl font-extrabold text-[var(--sage)]">{totalKm} km</p>
              <p className="text-sm text-[var(--sand)] mt-1">Hiked this season</p>
            </div>
          </div>
        </div>

        <div className="bg-[#fcfcfc] text-[var(--forest-dark)] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Hikes Logged</h2>
            <MapIcon className="w-6 h-6 text-[var(--forest-dark)]"/>
          </div>
          <p ref={hikesCountRef} className="text-5xl font-extrabold text-[var(--terracotta)]">{myHikes.length}</p>
          <p className="text-sm text-[var(--slate)] mt-2">Total number of trails added</p>
        </div>

        <div className="bg-[#fcfcfc] text-[var(--forest-dark)] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Favorite Trails</h2>
            <StarsIcon className="w-6 h-6 text-[var(--terracotta)] fill-[var(--terracotta)]"/>
          </div>
          <p ref={favCountRef} className="text-5xl font-extrabold text-[var(--terracotta)]">{favorites.length}</p>
          <p className="text-sm text-[var(--slate)] mt-2">Trails saved to your favorites</p>
        </div>
      </div>

      {/* CHARTS */}
      <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MountainChart data={kmPerMonth} />
        <HikesPerMonthChart data={kmPerMonth} />
      </div>

      <hr className="border-[var(--sand)]"/>

      {/* RECENT HIKES */}
      <div className="bg-[#fcfcfc] rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--forest-dark)]">Recent Expeditions</h2>
          <Button
            variant="terracotta"
            size="md"
            arrow
            onClick={() => navigate("/dashboard/hikes")}
          >
            See All
          </Button>
        </div>
        <ul className="space-y-6">
          {recentHikes.map((hike, index) => (
            <li
              key={hike.id}
              className="relative flex items-start gap-4 p-4 bg-[var(--sand)] rounded-xl transition-shadow duration-300 hover:shadow-lg cursor-pointer"
              onClick={() => navigate(`/hikes/${hike.id}`)}
            >
              <div className="relative pt-1">
                {index < recentHikes.length - 1 && (
                  <div className="absolute left-1/2 top-4 bottom-[-1.5rem] w-0.5 bg-[var(--sand)] transform -translate-x-1/2"></div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-[var(--slate)] uppercase tracking-wider mb-1">
                  {hike.createdAt?.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </p>
                <h3 className="text-lg font-semibold text-[var(--forest-dark)]">{hike.title}</h3>
                <p className="text-sm text-[var(--slate)] mt-1 flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-[var(--sage)]"/>
                  {hike.distanceKm.toFixed(1)} km
                </p>
              </div>
            </li>
          ))}
          {myHikes.length === 0 && (
            <li className="text-[var(--slate)]/60 p-4">
              You haven't logged any expeditions yet. Start hiking!
            </li>
          )}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button
          variant="sage"
          size="lg"
          arrow
          onClick={() => navigate("/hikes/new")}
        >
          Add a New Hike
        </Button>

        <Button
          variant="moss"
          size="lg"
          onClick={() => navigate("/dashboard/hikes")}
        >
          View All Hikes
        </Button>
      </div>

    </div>
  );
}
