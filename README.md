# Hikee 🏔️

Hikee est une plateforme de **randonnées** qui permet de découvrir, répertorier et gérer des randonnées en France et en Europe. Le site est conçu pour offrir une expérience fluide et immersive grâce à des animations modernes.  
Projet FullStack codé avec **React, TypeScript et Firebase**.
Le site est disponible juste ici : https://hikee.marie-camilo.fr/

---

## 📖 Table des matières
- [📋 Suivi du projet](#-suivi-du-projet)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture du projet](#-architecture-du-projet)
- [Installation](#-installation)

---

## 📋 Suivi du projet

Le suivi des tâches et l’organisation du projet sont disponibles sur Trello :  
[Trello Board](https://trello.com/b/zuXba9GL/cartorando)

![Trello Rando & Bivouac](trello-board.png)

---

## Fonctionnalités

- Carte interactive (Leaflet/Mapbox)
- Fiches randonnées : distance, dénivelé, difficulté, photos
- Recherche & filtres (niveau, durée, localisation)
- Authentification (création de compte, connexion)
- Gestion des favoris ⭐
- Ajout de randonnées/bivouacs par les utilisateurs connectés
- Back-office admin (validation et modération)
- Import de fichiers GPX

### Pour les utilisateurs

- Créer un **compte personnel** et se connecter
- Accéder à un **dashboard personnel** pour gérer ses randonnées :
    - CRUD complet (Créer, Lire, Mettre à jour, Supprimer ses randonnées)
    - Modifier les informations de son profil
    - Changer sa **photo de profil**
- Mettre des **randonnées en favoris** pour un accès rapide
- Upload de **plusieurs photos** pour chaque randonnée
- Upload de **tracés GPX** pour suivre les parcours
- Ajouter des **commentaires** et répondre aux commentaires

### Espace d'administration

- Gestion complète via un **compte admin** :
    - Supprimer ou cacher des randonnées
    - Supprimer ou cacher des commentaires

### Expérience utilisateur

- Interface fluide et moderne, responsive sur tous les devices
- Animations interactives et smooth scrolling avec **GSAP** et **Lenis**
- Effet **parallax** sur les sections hero pour une immersion visuelle

---

## 🚀 Stack technique

### Frontend
- [React](https://fr.react.dev/) + [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)

### Backend
- [Firebase & Firestore](https://firebase.google.com/)

### Animations
- [GSAP](https://gsap.com/)
- [Lenis](https://lenis.darkroom.engineering/)
- [FramerMotion]([https://lenis.darkroom.engineering/](https://motion.dev/))

---

## Architecture du projet

```text
├─ src/
│  ├─ components/  # Composants réutilisables (cards, animations, etc.)
│  ├─ pages/       # Pages principales (HikeList, Dashboard, Admin, etc.)
│  ├─ lib/         # Configuration Firebase et helpers
│  ├─ hooks/       # Hooks personnalisés
│  └─ assets/      # Images, icônes, etc.
├─ public/
├─ package.json
└─ README.md
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


