import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import toast from "react-hot-toast";
import Button from "../../components/Button";

type Tab = "hikes" | "comments";

export default function AdminDashboard() {
  const [hikes, setHikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("hikes");

  // Fetch all data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const hikesQ = query(collection(db, "hikes"), orderBy("createdAt", "desc"));
        const hikesSnap = await getDocs(hikesQ);
        const hikesData = hikesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setHikes(hikesData);

        const commentsSnap = await getDocs(collection(db, "comments"));
        const commentsData: any[] = [];
        for (const hike of hikesSnap.docs) {
          const hikeId = hike.id;
          const commentsSnap = await getDocs(collection(db, "hikes", hikeId, "comments"));
          commentsSnap.forEach(doc => {
            commentsData.push({ id: doc.id, hikeId, ...doc.data() });
          });
        }
        setComments(commentsData);
      } catch (e) {
        console.error(e);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Delete functions
  const handleDeleteHike = async (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span>Supprimer cette randonnée ?</span>
        <div className="flex justify-end gap-2 mt-1">
          <button className="bg-gray-200 px-3 py-1 rounded" onClick={() => toast.dismiss(t.id)}>Annuler</button>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteDoc(doc(db, "hikes", id));
                setHikes(prev => prev.filter(h => h.id !== id));
                toast.success("Randonnée supprimée !");
              } catch (e) {
                console.error(e);
                toast.error("Erreur lors de la suppression");
              }
            }}
          >
            Supprimer
          </button>
        </div>
      </div>
    ), { position: "top-center" });
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteDoc(doc(db, "comments", id));
      setComments(prev => prev.filter(c => c.id !== id));
      toast.success("Commentaire supprimé !");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la suppression du commentaire");
    }
  };

  if (loading) return <p className="p-6">Chargement…</p>;

  return (
    <div className="pt-36 px-12 pb-20 space-y-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          className={`px-4 py-2 font-semibold cursor-pointer ${activeTab === "hikes" ? "border-b-2 border-y-orange-400 text-orange-400" : "text-gray-500"}`}
          onClick={() => setActiveTab("hikes")}
        >
          Randonnées
        </button>
        <button
          className={`px-4 py-2 font-semibold cursor-pointer ${activeTab === "comments" ? "border-b-2 border-orange-400 text-orange-400" : "text-gray-500"}`}
          onClick={() => setActiveTab("comments")}
        >
          Commentaires
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "hikes" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hikes.length === 0 ? (
            <p className="text-gray-500">Aucune randonnée trouvée.</p>
          ) : (
            hikes.map(hike => (
              <div key={hike.id} className="bg-white shadow-md hover:shadow-lg rounded-xl p-5 flex flex-col justify-between transition">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{hike.title}</h3>
                  <p className="text-gray-400 mb-3">{hike.region}</p>
                </div>
                <Button
                  variant="terracotta"
                  size="md"
                  onClick={() => handleDeleteHike(hike.id)}
                >
                  Supprimer
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "comments" && (
        <>
          {comments.length === 0 ? (
            <p className="text-gray-500">Aucun commentaire trouvé.</p>
          ) : (
            <ul className="space-y-3 min-h-[300px]">
              {comments.map(c => (
                <li
                  key={c.id}
                  className="bg-white shadow rounded-xl p-4 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium">{c.text}</p>
                    <p className="text-gray-400 text-sm">Par : {c.userName || c.userId}</p>
                  </div>
                  <Button
                    variant="terracotta"
                    size="sm"
                    onClick={() => handleDeleteComment(c.id)}
                  >
                    Supprimer
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
