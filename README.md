# Hikee 🏔️

Hikee est une plateforme de **randonnées** qui permet de découvrir, répertorier et gérer des randonnées en France et en Europe. Le site est conçu pour offrir une expérience fluide et immersive grâce à des animations modernes.  
Projet FullStack codé avec **React, TypeScript et Firebase**.
Le site est disponible juste ici : https://hikee.marie-camilo.fr/

---

## 📖 Table des matières
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture du projet](#-architecture-du-projet)
- [Installation](#-installation)

---

## Fonctionnalités

- Cartes interactives avec tracés GPX (Leaflet/Mapbox)
- Import de fichiers GPX
- Fiches randonnées : distance, dénivelé, difficulté, photos
- Recherche & filtres (niveau et localisation)
- Authentification (création de compte, connexion)
- Back office utilisateurs avec suivi des randonnées et statistiques globales
- Gestion des favoris ⭐
- CRUD complet (randonnées, commentaires)
- Back-office admin (validation et modération des contenus)

### Pour les utilisateurs

- Créer un **compte personnel** et se connecter
- Accéder à un **back office personnel** pour gérer ses randonnées :
    - CRUD complet (Créer, Lire, Mettre à jour, Supprimer ses randonnées)
    - Modifier les informations de son profil
    - Changer sa **photo de profil**
- Mettre des **randonnées en favoris** pour un accès rapide
- Upload de **plusieurs photos** pour chaque randonnée (5 maximum par randonnées)
- Upload de **tracés GPX** pour suivre les parcours
- Ajouter des **commentaires** et répondre aux commentaires

### Espace d'administration

- Gestion complète via un **compte admin** :
    - Supprimer ou cacher des randonnées
    - Supprimer ou cacher des commentaires

### Expérience utilisateur

- Interface fluide et responsive sur tous les devices
- Animations interactives et smooth scrolling avec **GSAP** et **FramerMotion**

---

## 🚀 Stack technique

### Frontend
- [React](https://fr.react.dev/) + [Vite.js](https://nextjs.org/](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)

### Backend
- [Firebase & Firestore](https://firebase.google.com/)

### Animations
- [GSAP](https://gsap.com/)
- [FramerMotion]([https://lenis.darkroom.engineering/](https://motion.dev/))

---

## Architecture du projet

```text
hikee-app/
├── public/
│   ├── images/          # Images statiques (illustrations, screenshots…)
│   ├── logo/            # Logos et variantes
│   └── video/           # Vidéos hero / fond
│
└── src/
    ├── assets/
    │   └── fonts/       # Polices personnalisées
    │
    ├── components/      # Tous les composants réutilisables
    │   ├── animations/  # Wrappers GSAP, ScrollTrigger, parallax…
    │   ├── cursor/      # Curseur personnalisé animé
    │   ├── dashboard/   # Composants spécifiques au tableau de bord
    │   └── hikes/       # Cards, fiches randonnée, galerie photos…
    │
    ├── firebase/        # Config Firebase + services (auth, firestore, storage)
    │
    ├── hooks/           # Hooks personnalisés (useAuth, useHikes, useGSAP…)
    │
    ├── lib/             # Fonctions utilitaires globales
    │
    ├── pages/           # Pages Next.js (App Router ou Pages Router)
    │   └── admin/       # Pages du back-office admin
    │
    ├── routes/          # Gestion des routes protégées / middleware (si App Router)
    │
    ├── types/           # Interfaces & types TypeScript globaux
    │
    └── utils/           # Helpers divers (formatage dates, GPX parser, etc.)
```

---

## Installation

### Cloner le projet
```bash
git clone https://github.com/votre-utilisateur/hikee.git
cd hikee
```

### Prérequis

- Node.js >= 18
- npm ou yarn
- Compte Firebase avec Firestore et Storage configurés

### Installer les dépendances
```bash
npm install 
```

### Configurer Firebase
- Créer un projet Firebase sur https://console.firebase.google.com/
- Ajouter Firestore, Authentication (email/password) et Storage
- Copier vos clés Firebase dans src/lib/firebase.ts

### Lancer le projet en mode développement
```bash
npm run dev
```
### Scripts

- dev: "Lancer le projet en mode développement"
- build: "Construire le projet pour production"
- start: "Lancer le serveur en production"


