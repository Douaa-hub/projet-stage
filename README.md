# Application de gestion des autorisations de sortie et des réclamations

## Sujet du projet

Conception et développement d'une application web de gestion des autorisations de sortie des employés et de traitement des réclamations des gardiens avec système de workflow de validation.

## Objectifs

- Permettre aux employés de soumettre des demandes de sortie à valider par leurs responsables.
- Offrir une plateforme aux agents de sécurité pour saisir leurs réclamations.
- Transmettre ces réclamations au service RH et aux responsables concernés via un circuit de validation automatisé.
- Assurer le suivi des actions entreprises en réponse aux réclamations.

## Technologies utilisées

- Frontend : React.js
- Backend : Node.js avec Express.js
- Base de données : MySQL
- Authentification : JWT (JSON Web Token)
- Gestion des workflows : système de validation automatisé

## Fonctionnalités principales

- Authentification des utilisateurs (employés, responsables, agents de sécurité, RH)
- Gestion des demandes de sortie
- Gestion des réclamations
- Circuit de validation automatisé avec notifications
- Dashboard personnalisé selon le rôle utilisateur

## Installation et lancement

### Prérequis

- Node.js et npm installés
- MySQL installé et configuré

### Installation

1. Cloner le dépôt  
`git clone https://github.com/Douaa-hub/projet-stage.git`

2. Installer les dépendances backend  
`cd backend`  
`npm install`

3. Installer les dépendances frontend  
`cd ../frontend`  
`npm install`

4. Configurer la base de données

5. Lancer le backend  
`cd ../backend`  
`npm start`

6. Lancer le frontend  
`cd ../frontend`  
`npm run dev`

---


