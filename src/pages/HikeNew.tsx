import { useForm, useFieldArray } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { db, storage } from '../lib/firebase'
import { useAuth } from '../firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useState, useRef, useEffect } from 'react'
import toast from "react-hot-toast"
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { FiTrash } from 'react-icons/fi'
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// === Schema Zod ===
const schema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  region: z.string().nonempty("La région est obligatoire"),
  difficulty: z.enum(['easy', 'moderate', 'hard']),
  distanceKm: z.number().positive("La distance doit être positive"),
  elevationGainM: z.number().nonnegative("Le dénivelé ne peut pas être négatif"),
  images: z.array(z.any()).min(1, "Ajoutez au moins une image"),
  gpx: z.any().optional(),
  itinerary: z.array(
    z.object({
      title: z.string().min(1, "Le titre de l'étape est obligatoire"),
      description: z.string().min(1, "La description de l'étape est obligatoire")
    })
  ).min(1, "Ajoutez au moins une étape")
});

type HikeFormData = z.infer<typeof schema>;

export default function HikeNew() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [gpxFile, setGpxFile] = useState<File | null>(null)
    const [gpxPolyline, setGpxPolyline] = useState<[number, number][]>([])

    const [showCustomRegion, setShowCustomRegion] = useState(false)

    const gpxInputRef = useRef<HTMLInputElement>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<HikeFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      itinerary: [{ title: '', description: '' }],
      distanceKm: 0.1,
      elevationGainM: 0
    }
  });


    const { fields, append, remove } = useFieldArray({ control, name: 'itinerary' });

    // ----------------- Gestion Images -----------------
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)

    // Limite à 5 images
    const totalFiles = imageFiles.length + files.length
    if (totalFiles > 5) {
      toast.error("Vous ne pouvez ajouter que 5 images maximum")
      return
    }

    const newFiles = [...imageFiles, ...files]
    setImageFiles(newFiles)
    setImagePreviews(newFiles.map(f => URL.createObjectURL(f)))
    setValue('images', newFiles)
  }

    const removeImage = (index: number) => {
        const newFiles = imageFiles.filter((_, i) => i !== index)
        setImageFiles(newFiles)
        setImagePreviews(newFiles.map(f => URL.createObjectURL(f)))
        setValue('images', newFiles)
    }

    // ----------------- Gestion GPX -----------------
    const handleGpxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return
        const file = e.target.files[0]
        setGpxFile(file)
        setValue('gpx', [file])

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            const coords: [number, number][] = []
            const parser = new DOMParser()
            const xml = parser.parseFromString(text, 'application/xml')
            const trkpts = Array.from(xml.getElementsByTagName('trkpt'))
            trkpts.forEach(pt => {
                const lat = parseFloat(pt.getAttribute('lat') || '0')
                const lon = parseFloat(pt.getAttribute('lon') || '0')
                coords.push([lat, lon])
            })
            setGpxPolyline(coords)
        }
        reader.readAsText(file)
    }

    const removeGpx = () => {
        setGpxFile(null)
        setGpxPolyline([])
        setValue('gpx', undefined)
    }

    // ----------------- Submit -----------------
  const onSubmit: SubmitHandler<HikeFormData> = async (data) => {
    if (!user) return toast.error('Vous devez être connecté !')
    setLoading(true)

    try {
      const hikeRef = await addDoc(collection(db, 'hikes'), {
        title: data.title,
        description: data.description,
        region: data.region,
        difficulty: data.difficulty,
        distanceKm: data.distanceKm,
        elevationGainM: data.elevationGainM,
        gpxPath: null,
        imageUrls: [],
        itinerary: data.itinerary,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        favoritesCount: 0
      })

      // ------------------ GPX ------------------
      let finalGpxPath = null

      if (gpxFile) {
        // Si l'utilisateur a ajouté un GPX
        finalGpxPath = `uploads/gpx/${user.uid}/${hikeRef.id}.gpx`
        const gpxRef = ref(storage, finalGpxPath)
        await uploadBytes(gpxRef, gpxFile)
      } else {
        const defaultGpxUrl = '/default.gpx'
        const response = await fetch(defaultGpxUrl)
        const blob = await response.blob()
        finalGpxPath = `uploads/gpx/${user.uid}/${hikeRef.id}-default.gpx`
        const gpxRef = ref(storage, finalGpxPath)
        await uploadBytes(gpxRef, blob)
      }

      // Mettre à jour Firestore avec le chemin GPX final
      await updateDoc(doc(db, 'hikes', hikeRef.id), { gpxPath: finalGpxPath, updatedAt: serverTimestamp() })

      // ------------------ Images ------------------
      const imageUrls: string[] = []
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        const path = `uploads/images/${user.uid}/${hikeRef.id}/${file.name}`
        const imageRef = ref(storage, path)
        await uploadBytes(imageRef, file)
        const url = await getDownloadURL(imageRef)
        imageUrls.push(url)
      }
      if (imageUrls.length) await updateDoc(doc(db, 'hikes', hikeRef.id), { imageUrls, updatedAt: serverTimestamp() })

      toast.success("Votre randonnée a bien été ajoutée !")
      navigate("/dashboard/hikes")
    } catch (err) {
      console.error(err)
      toast.error("Une erreur est survenue pendant l'ajout de la randonnée'")
    } finally {
      setLoading(false)
    }
  }

  const autoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const el = e.currentTarget;
        el.style.height = "auto"; // reset
        el.style.height = el.scrollHeight + "px";
    };

    return (
    <div className="min-h-screen  flex justify-center pt-32 pb-12">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-5xl p-6 space-y-6 bg-white rounded-xl shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Créer une nouvelle randonnée</h2>

          {/* Titre */}
          <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700">Titre</label>
              <input
                {...register('title')}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
                placeholder="Nom de la randonnée"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700">Description</label>
              <textarea
                {...register('description')}
                placeholder="Décrivez la randonnée..."
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none overflow-hidden transition"
                onInput={autoResize}
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
          </div>

          {/* Région et Difficulté */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700">Région</label>

              <select
                {...register('region')}
                onChange={(e) => {
                  setValue('region', e.target.value)
                  if (e.target.value !== 'other') {
                    setShowCustomRegion(false)
                  } else {
                    setShowCustomRegion(true)
                    setValue('region', '') // on vide pour que l'utilisateur tape
                  }
                }}
                className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BB4C9] transition text-gray-700"
              >
                <option value="">Choisir une région</option>
                <option value="Chamonix">Chamonix / Mont-Blanc</option>
                <option value="Vercors">Vercors</option>
                <option value="Chartreuse">Chartreuse</option>
                <option value="Belledonne">Belledonne</option>
                <option value="Bauges">Bauges</option>
                <option value="Queyras">Queyras</option>
                <option value="Écrins">Écrins</option>
                <option value="Vanoise">Vanoise</option>
                <option value="Maurienne">Maurienne</option>
                <option value="Tarentaise">Tarentaise</option>
                <option value="Oisans">Oisans</option>
                <option value="Briançonnais">Briançonnais</option>
                <option value="Val d’Aran">Val d’Aran (Espagne)</option>
                <option value="Pyrénées Centrales">Pyrénées Centrales</option>
                <option value="Corse">Corse (GR20)</option>
                <option value="Massif Central">Massif Central</option>
                <option value="Jura">Jura</option>
                <option value="Vosges">Vosges</option>
                <option value="other">Autre (préciser)</option>
              </select>

              {/* Champ personnalisé si "Autre" sélectionné */}
              {showCustomRegion && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                  <input
                    type="text"
                    placeholder="Précisez la région (ex: Dévoluy, Aiguilles Rouges...)"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BB4C9] transition"
                    onChange={(e) => setValue('region', e.target.value)}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Cette région sera utilisée pour afficher la météo. Choisissez un nom proche d’une ville si possible.
                  </p>
                </div>
              )}

              {errors.region && <p className="text-red-600 text-sm mt-1">{errors.region.message}</p>}
            </div>
              <div className="flex flex-col">
                  <label className="mb-2 font-semibold text-gray-700">Difficulté</label>
                  <select
                    {...register('difficulty')}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
                  >
                      <option value="easy">Facile</option>
                      <option value="moderate">Modérée</option>
                      <option value="hard">Difficile</option>
                  </select>
                  {errors.difficulty && <p className="text-red-600 text-sm mt-1">{errors.difficulty.message}</p>}
              </div>
          </div>

          {/* Distance & Dénivelé */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Dénivelé (m)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={5000}
                step={10}
                {...register('elevationGainM', { valueAsNumber: true })}
                className="w-full accent-[#2C3E2E]"
              />
              <span>{watch('elevationGainM')} m</span>
            </div>
            {errors.elevationGainM && <p className="text-red-600 text-sm mt-1">{errors.elevationGainM.message}</p>}
          </div>

          {/* Distance */}
          <div className="flex flex-col mb-4">
            <label className="mb-2 font-semibold text-gray-700">Distance (km)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0.1}
                max={500}
                step={0.1}
                {...register('distanceKm', { valueAsNumber: true })}
                className="w-full accent-[#2C3E2E]"
              />
              <span>{watch('distanceKm')?.toFixed(1)} km</span>
            </div>
            {errors.distanceKm && <p className="text-red-600 text-sm mt-1">{errors.distanceKm.message}</p>}
          </div>


          {/* Itinéraire */}
          <div className="flex flex-col space-y-4">
            <label className="font-semibold text-gray-700 flex items-center gap-2 mb-1">
              Itinéraire & étapes <span className="text-red-500">*</span>
            </label>
            <p className="text-gray-500 text-sm mb-3">
              Décrivez chaque étape de votre randonnée pour guider les randonneurs.
              Indiquez un titre et une description détaillée (points de repère, difficulté, conseils) pour que chaque étape soit claire et complète.
            </p>

            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col md:flex-row gap-2 mb-2 p-4 border rounded-lg shadow-sm bg-gray-50 items-center">

                {/* Titre de l'étape */}
                <textarea
                  {...register(`itinerary.${index}.title` as const, { required: "Le titre de l'étape est obligatoire" })}
                  placeholder="Titre de l'étape (obligatoire)"
                  className="flex-1 px-3 py-2 border rounded-lg resize-none overflow-hidden focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
                  onInput={autoResize}
                />
                {errors.itinerary?.[index]?.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.itinerary[index]?.title?.message}</p>
                )}

                {/* Description de l'étape */}
                <textarea
                  {...register(`itinerary.${index}.description` as const, { required: "La description de l'étape est obligatoire" })}
                  placeholder="Description de l'étape (obligatoire)"
                  className="flex-1 px-3 py-2 border rounded-lg resize-none overflow-hidden focus:outline-none focus:ring-1 focus:ring-gray-400 transition"
                  onInput={autoResize}
                />
                {errors.itinerary?.[index]?.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.itinerary[index]?.description?.message}</p>
                )}

                {/* Bouton supprimer */}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700 transition p-2 rounded-full cursor-pointer"
                  title="Supprimer cette étape"
                >
                  <FiTrash size={20} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ title: '', description: '' })}
              className="self-start bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer"
            >
              Ajouter étape
            </button>
          </div>

          {/* GPX & Map */}
          <div className="flex flex-col space-y-2">
              <label className="font-semibold text-gray-700">Fichier GPX</label>
              <div className="flex gap-2">
                  <button type="button" onClick={() => gpxInputRef.current?.click()} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition cursor-pointer">
                      {gpxFile ? `Sélectionné : ${gpxFile.name}` : 'Choisir un fichier GPX'}
                  </button>
                  {gpxFile && <button type="button" onClick={removeGpx} className="text-red-500">Supprimer</button>}
                  <input type="file" accept=".gpx" className="hidden" ref={gpxInputRef} onChange={handleGpxChange}/>
              </div>
              {gpxPolyline.length > 0 && (
                <div className="mt-2 h-48 rounded-lg overflow-hidden shadow-sm">
                    <MapContainer center={gpxPolyline[0]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                        <Polyline positions={gpxPolyline} pathOptions={{ color: 'blue' }}/>
                    </MapContainer>
                </div>
              )}
          </div>

          {/* Images */}
          <div className="flex flex-col space-y-2">
              <label className="font-semibold text-gray-700">Images</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className={`bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition cursor-pointer ${
                    imageFiles.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={imageFiles.length >= 5}
                >
                  Ajouter des images
                </button>
                  <input type="file" accept="image/*" multiple className="hidden" ref={imageInputRef} onChange={handleImageChange}/>
              </div>
              <div className="flex gap-2 overflow-x-auto py-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group">
                        <img src={src} alt={`preview-${i}`} className="w-24 h-24 object-cover rounded-lg"/>
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition"
                        >
                            ×
                        </button>
                    </div>
                  ))}
              </div>
          </div>

          <Button type="submit" disabled={loading}>
          {loading ? 'En cours...' : 'Créer la randonnée'}
          </Button>
      </form>
    </div>
    )
}
