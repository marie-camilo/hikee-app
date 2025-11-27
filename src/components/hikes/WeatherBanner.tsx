// components/hikes/WeatherBanner.tsx
import React, { useEffect, useState } from 'react'
import { DropletsIcon, WindIcon, MapPin } from 'lucide-react'

interface WeatherData {
  temp: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
}

interface Props {
  city: string
  lat?: number
  lon?: number
}

export default function WeatherBanner({ city, lat, lon }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-EN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  // Mapping des régions : villes reconnues par OpenWeatherMap
  const CITY_MAPPING: Record<string, string> = {
    'Chamonix': 'Chamonix-Mont-Blanc',
    'Vercors': 'Villard-de-Lans',
    'Chartreuse': 'Saint-Pierre-de-Chartreuse',
    'Belledonne': 'Allevard',
    'Bauges': 'Lescheraines',
    'Queyras': 'Abriès',
    'Écrins': 'Vallouise-Pelvoux',
    'Vanoise': 'Pralognan-la-Vanoise',
    'Maurienne': 'Saint-Jean-de-Maurienne',
    'Tarentaise': 'Moutiers',
    'Oisans': 'Bourg-d\'Oisans',
    'Briançonnais': 'Briançon',
    'Val d’Aran': 'Vielha',
    'Pyrénées Centrales': 'Luchon',
    'Corse': 'Bastia',
    'Massif Central': 'Le Mont-Dore',
    'Jura': 'Les Rousses',
    'Vosges': 'Gérardmer',
  }

  useEffect(() => {
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
    if (!API_KEY) {
      setError('Clé API manquante')
      setLoading(false)
      return
    }

    const fetchWeather = async () => {
      try {
        let url = ''

        // Priorité absolue : coordonnées GPS
        if (lat && lon) {
          url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
        }
        // Sinon : mapping intelligent
        else {
          const mappedCity = CITY_MAPPING[city] || city
          url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(mappedCity)},FR&appid=${API_KEY}&units=metric&lang=fr`
        }

        const res = await fetch(url)
        if (!res.ok) {
          // Si erreur 404 → on essaie avec "France" en dur
          if (res.status === 404 && !lat && !lon) {
            const fallbackUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},France&appid=${API_KEY}&units=metric&lang=fr`
            const fallbackRes = await fetch(fallbackUrl)
            if (!fallbackRes.ok) throw new Error('Not found')
            const data = await fallbackRes.json()
            setWeatherFromData(data)
            return
          }
          throw new Error(`Erreur ${res.status}`)
        }

        const data = await res.json()
        setWeatherFromData(data)

      } catch (err) {
        console.log('Météo indisponible pour', city)
        setError('Météo indisponible dans cette zone')
      } finally {
        setLoading(false)
      }
    }

    const setWeatherFromData = (data: any) => {
      setWeather({
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
      })
    }

    fetchWeather()
  }, [city, lat, lon])

  if (loading) {
    return (
      <div className="bg-[#dfddd7] rounded-xl p-5">
        <div className="animate-pulse flex items-center gap-6">
          <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#dfddd7] border border-orange-300 rounded-xl p-5 opacity-80">
        <div className="flex items-center gap-3 text-orange-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-[#69665e]">{error}</p>
        </div>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="bg-[#dfddd7] rounded-xl p-5 shadow-md transition-all duration-300 hover:shadow-xl border border-transparent hover:border-[#8BB4C9]/20">
      <div className="flex flex-col md:flex-row md:items-center gap-5">

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-white/50">
            <img src={weather.icon} alt={weather.description} className="w-20 h-20" />
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl text-[#69665e] font-bold leading-none">
                {weather.temp}
              </span>
              <span className="text-2xl text-[#4A4A4A]">°C</span>
            </div>
            <p className="text-[#4A4A4A] text-sm capitalize mt-1">
              {weather.description}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-2 md:border-l md:border-[#8BB4C9] md:border-opacity-30 md:pl-5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#69665e]" />
            <span className="text-[#69665e] text-lg font-semibold">{city}</span>
          </div>
          <div className="text-[#4A4A4A] text-sm capitalize">
            {formattedDate}
          </div>
        </div>

        <div className="flex md:flex-col gap-6 md:gap-3 md:border-l md:border-[#8BB4C9] md:border-opacity-30 md:pl-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#8BB4C9]/20 rounded-lg flex items-center justify-center">
              <DropletsIcon className="w-5 h-5 text-[#8BB4C9]" />
            </div>
            <div>
              <p className="text-[#4A4A4A] text-xs">Humidity</p>
              <p className="text-[#69665e] font-semibold">{weather.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F5F3EF]/80 rounded-lg flex items-center justify-center">
              <WindIcon className="w-5 h-5 text-[#bab6ab]" />
            </div>
            <div>
              <p className="text-[#4A4A4A] text-xs">Wind</p>
              <p className="text-[#69665e] font-semibold">{Math.round(weather.windSpeed * 3.6)} km/h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}