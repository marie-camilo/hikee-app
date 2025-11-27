'use client';

import { useState, useEffect, useRef } from "react";
import { auth, googleProvider } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
  signOut,
  updateProfile
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { addUserToFirestore } from "../utils/firestoreUtils";
import Button from "../components/Button";
import { Mail, Phone, MapPin } from "lucide-react";
import { gsap } from "gsap";

export default function LogIn() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const navigate = useNavigate();

  // Refs pour animation
  const leftTitleRef = useRef<HTMLHeadingElement>(null);
  const leftDescRef = useRef<HTMLParagraphElement>(null);
  const leftContactsRef = useRef<HTMLUListElement>(null);
  const leftSocialsRef = useRef<HTMLDivElement>(null);
  const rightTitleRef = useRef<HTMLHeadingElement>(null);
  const rightDescRef = useRef<HTMLParagraphElement>(null);

  // Split text helper
  const splitText = (text: string) => text.split(" ").map((word, i) => (
    <span key={i} className="inline-block mr-1">{word}</span>
  ));

  // GSAP animations
  useEffect(() => {
    // Colonne gauche
    if (leftTitleRef.current) {
      const words = Array.from(leftTitleRef.current.querySelectorAll("span"));
      gsap.fromTo(words, { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: "power3.out" });
    }
    if (leftDescRef.current) {
      const words = Array.from(leftDescRef.current.querySelectorAll("span"));
      gsap.fromTo(words, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.03, duration: 0.5, ease: "power3.out" });
    }
    if (leftContactsRef.current) {
      const items = Array.from(leftContactsRef.current.querySelectorAll("li"));
      gsap.fromTo(items, { x: -50, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power3.out" });
    }
    if (leftSocialsRef.current) {
      const socials = Array.from(leftSocialsRef.current.querySelectorAll("span"));
      gsap.fromTo(socials, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: "power3.out" });
    }

    // Colonne droite
    if (rightTitleRef.current) {
      const words = Array.from(rightTitleRef.current.querySelectorAll("span"));
      gsap.fromTo(words, { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: "power3.out" });
    }
    if (rightDescRef.current) {
      const words = Array.from(rightDescRef.current.querySelectorAll("span"));
      gsap.fromTo(words, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.03, duration: 0.5, ease: "power3.out" });
    }
  }, [isSignUp]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await addUserToFirestore(user, user.displayName || undefined);
      setUser(user);
      navigate("/dashboard");
    } catch {
      setError("Error signing in with Google");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });
        await addUserToFirestore(user, name);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await addUserToFirestore(user, user.displayName || undefined);
      }
      setUser(userCredential.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[var(--background)]">
      {/* Left Column */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between p-8">
        <div className="space-y-10">
          <h2 ref={leftTitleRef} className="text-5xl font-extrabold text-[var(--slate)] mt-15">
            {splitText("Welcome Back!")}
          </h2>
          <p ref={leftDescRef} className="text-xl text-[var(--slate)] max-w-md">
            {splitText("Explore new trails, track your adventures, and share your love for the outdoors with Hikee.")}
          </p>
          <ul ref={leftContactsRef} className="space-y-6 text-[var(--slate)]">
            <li className="flex flex-col gap-1">
              <div className="flex items-center gap-3 text-lg font-semibold"><Mail className="w-6 h-6" /> Chat to us</div>
              <span className="text-base text-gray-500">contact@hikee.com</span>
            </li>
            <li className="flex flex-col gap-1">
              <div className="flex items-center gap-3 text-lg font-semibold"><MapPin className="w-6 h-6" /> Visit us</div>
              <span className="text-base text-gray-500">1234 Trail St, Denver, CO</span>
            </li>
            <li className="flex flex-col gap-1">
              <div className="flex items-center gap-3 text-lg font-semibold"><Phone className="w-6 h-6" /> Call us</div>
              <span className="text-base text-gray-500">+1 (555) 123-4567</span>
            </li>
          </ul>
        </div>

        <div ref={leftSocialsRef} className="flex flex-col gap-2 mt-8">
          <span className="text-[var(--slate)] font-semibold text-lg">Socials</span>
          <div className="flex gap-6 text-[var(--slate)] text-md font-medium">
            <span className="hover:text-[var(--moss)] cursor-pointer">Twitter</span>
            <span className="hover:text-[var(--moss)] cursor-pointer">GitHub</span>
            <span className="hover:text-[var(--moss)] cursor-pointer">LinkedIn</span>
          </div>
        </div>
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-3xl md:h-[90vh] bg-[var(--moss)] rounded-3xl p-8 md:p-16 flex flex-col justify-start">
          {user ? (
            <div className="text-left text-white">
              <p className="mb-4">Logged in as: {user.displayName || user.email}</p>
              <Button onClick={handleSignOut} className="w-full">Sign out</Button>
            </div>
          ) : (
            <>
              <h1 ref={rightTitleRef} className="text-4xl md:text-5xl font-extrabold text-white mb-4 flex flex-wrap">
                {splitText(isSignUp ? "Join the Adventure." : "Good to see you again.")}
              </h1>
              <p ref={rightDescRef} className="text-white/80 text-lg md:text-xl mb-6 flex flex-wrap">
                {splitText(
                  isSignUp
                    ? "Create your Hikee account to start tracking trails and sharing adventures with fellow hikers."
                    : "Log in to access your hikes, save favorites, and explore new trails effortlessly."
                )}
              </p>

              <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 mb-6 w-full">
                {isSignUp && (
                  <div className="border-b border-white/50 py-2">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-transparent text-white placeholder-white focus:outline-none"
                    />
                  </div>
                )}
                <div className="border-b border-white/50 py-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent text-white placeholder-white focus:outline-none"
                  />
                </div>
                <div className="border-b border-white/50 py-2">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-transparent text-white placeholder-white focus:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="sage"
                  size="md"
                  arrow
                  className="mt-4"
                >
                  {isSignUp ? "Start Hiking with Hikee" : "Access Your Trails"}
                </Button>
              </form>

              <p className="text-left text-white mb-4">
                {isSignUp ? "Already have an account?" : "New to Hikee?"}{" "}
                <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="underline font-semibold">
                  {isSignUp ? "Log in" : "Create Account"}
                </button>
              </p>

              <div className="flex items-center mb-4">
                <hr className="flex-grow border-white/50" />
                <span className="mx-3 text-white/70 text-sm">or</span>
                <hr className="flex-grow border-white/50" />
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white text-[var(--moss)] font-bold rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span>Continue with Google</span>
              </button>

              {error && <p className="text-red-200 text-left mt-4">{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
