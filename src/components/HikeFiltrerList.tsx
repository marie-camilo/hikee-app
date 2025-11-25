import { useState } from 'react'
import HikeCard from './hikes/HikeCard';

interface Hike {
  id: string
  title: string
  difficulty: 'easy' | 'moderate' | 'hard'
  region: string
  imageUrls: string[]
}

interface HikeFilterAndListProps {
  hikes: Hike[]
}

export default function HikeFilterAndList({ hikes }: HikeFilterAndListProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [regionFilter, setRegionFilter] = useState<string>('all')

  const filteredHikes = hikes.filter(h =>
    (difficultyFilter === 'all' || h.difficulty === difficultyFilter) &&
    (regionFilter === 'all' || h.region === regionFilter)
  )

  const regions = Array.from(new Set(hikes.map(h => h.region)))

  return (
    <div className="px-8 py-8 bg-[var(--white)] min-h-screen mx-auto mt-24">
      {/* Filter buttons */}
      <div className="mb-8">
        <h2 className="font-bold text-2xl md:text-3xl mb-4 uppercase tracking-tight">
          browse by
        </h2>

        {/* Difficulty filters */}
        <ul className="flex flex-wrap gap-4 mb-4">
          {['all', 'easy', 'moderate', 'hard'].map(diff => (
            <li
              key={diff}
              className={`cursor-pointer px-4 py-2 border border-[#4A4A4A] uppercase font-bold rounded-md transition-all hover:-translate-y-1 ${
                difficultyFilter === diff ? 'bg-[#4A4A4A] text-white' : 'bg-white text-[#4A4A4A]'
              }`}
              onClick={() => setDifficultyFilter(diff)}
            >
              {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
            </li>
          ))}
        </ul>

        {/* Region filters */}
        <ul className="flex flex-wrap gap-4">
          <li
            className={`cursor-pointer px-4 py-2 border border-[#4A4A4A] uppercase font-bold rounded-md transition-all hover:-translate-y-1 ${
              regionFilter === 'all' ? 'bg-[#4A4A4A] text-white' : 'bg-white text-[#4A4A4A]'
            }`}
            onClick={() => setRegionFilter('all')}
          >
            All regions
          </li>
          {regions.map(r => (
            <li
              key={r}
              className={`cursor-pointer px-4 py-2 border border-[#4A4A4A] uppercase font-bold rounded-md transition-all hover:-translate-y-1 ${
                regionFilter === r ? 'bg-[#4A4A4A] text-white' : 'bg-white text-[#4A4A4A]'
              }`}
              onClick={() => setRegionFilter(r)}
            >
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* List of hikes */}
      {filteredHikes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {filteredHikes.map(h => (
            <div className="w-full max-w-m h-100" key={h.id}>
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
        <p className="text-center text-gray-500 mt-10">Aucune randonnée ne correspond à vos filtres.</p>
      )}
    </div>
  )
}