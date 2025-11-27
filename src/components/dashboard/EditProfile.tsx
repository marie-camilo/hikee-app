import { useState } from "react";
import { useAuth } from "../../firebase/auth";
import { updateProfile } from "firebase/auth";
import { auth, storage } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import Button from "../Button";
import SplitText from "../animations/SplitText";
import toast from "react-hot-toast";

const EditProfile = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email] = useState(user?.email || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoURL = user?.photoURL;

      if (avatar) {
        const avatarRef = ref(storage, `avatars/${user?.uid}`);
        const snapshot = await uploadBytes(avatarRef, avatar);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      await updateProfile(auth.currentUser!, {
        displayName,
        photoURL,
      });

      toast.success("Profile updated successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message ?? "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-10">
      <h2 className="text-3xl font-bold text-center">
        <SplitText
          text="Edit Your Profile"
          tag="span"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          duration={1.2}
          delay={50}
          ease="power2.out"
        />
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-10 bg-white p-8 rounded-2xl shadow-lg"
      >
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div>
            {avatar ? (
              <img
                src={URL.createObjectURL(avatar)}
                className="w-28 h-28 rounded-full object-cover border-4 border-slate-200 shadow"
              />
            ) : user?.photoURL ? (
              <img
                src={user.photoURL}
                className="w-28 h-28 rounded-full object-cover border-4 border-slate-200 shadow"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl">
                ?
              </div>
            )}
          </div>

          <label className="relative cursor-pointer bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 transition">
            <span>{avatar ? "Change Avatar" : "Upload Avatar"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-lg font-medium">Username</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="
              w-full bg-transparent outline-none border-b
              border-gray-300 pb-2
              focus:border-[var(--orange)]
              transition-all duration-200
              text-lg
            "
          />
        </div>

        <div className="space-y-2">
          <label className="text-lg font-medium">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="
              w-full bg-transparent border-b pb-2
              border-gray-300 text-gray-400
              cursor-not-allowed
            "
          />
        </div>

        <Button
          type="submit"
          variant="sunset"
          size="md"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </div>
  );
};

export default EditProfile;
