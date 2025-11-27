import { Link } from 'react-router-dom'

interface HikeCardProps {
  id: string
  title: string
  image?: string
  difficulty: 'easy' | 'moderate' | 'hard'
  region?: string
}

export default function HikeCard({ id, title, image, difficulty, region }: HikeCardProps) {
  const displayedImage = image || '/images/home-bg.jpg'

  const difficultyColors: Record<HikeCardProps['difficulty'], string> = {
    easy: 'bg-[var(--green)]',
    moderate: 'bg-[var(--yellow)]',
    hard: 'bg-[var(--red)]',
  }

  return (
    <Link
      to={`/hikes/${id}`}
      className="group relative block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300"
    >
      <div className="relative w-full h-56">
        <img
          src={displayedImage}
          alt={`Image de la randonnée ${title}`}
          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <span
          className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold text-white rounded-full ${difficultyColors[difficulty]}`}
        >
          {difficulty === 'easy' ? 'Facile' : difficulty === 'moderate' ? 'Modérée' : 'Difficile'}
        </span>
      </div>

      <div className="p-5">
        <h2 className="text-xl font-bold text-[var(--dark)] mb-2">{title}</h2>
        {region && <p className=" text-sm text-gray-500">{region}</p>}

        <div className="flex items-center justify-between text-sm text-[var(--lavander)] group-hover:text-[var(--corail)] transition-colors">
          <span>See détails</span>
          <div className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--lavander)] text-white transition-all duration-300 group-hover:bg-[var(--corail)] group-hover:scale-110">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
