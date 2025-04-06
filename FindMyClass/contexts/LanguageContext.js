import React, { createContext, useContext, useState } from 'react';

// Base Translations for common keys (English)
const baseTranslations = {
  settings: 'Settings',
  account: 'Account',
  changeEmail: 'Change Email',
  changePassword: 'Change Password',
  deleteAccount: 'Delete Account',
  appearance: 'Appearance',
  changeMode: 'Change Mode',
  language: 'Language',
  appLanguage: 'App Language',
  about: 'About',
  version: 'Version 1.0.0',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  profile: 'Profile',
  schedule: 'Schedule',
  map: 'Map',
  home: 'Home',

  // Card Titles
  sgwMap: 'SGW Map',
  loyMap: 'LOY Map',
  mySchedule: 'My Schedule',
  security: 'Security',

  // Profile Screen
  welcome: 'Welcome',
  addPhoto: 'Add Photo',
  changePhoto: 'Change Photo',
  viewSchedule: 'View My Schedule',
  pleaseLogin: 'Please log in to access your profile.',
  login: 'Go to Login',
  permissionError: 'Camera roll permission is required.',
  photoAccessError: 'Please allow access to your photos.',
  imageError: 'An error occurred while picking the image.',

  // Schedule Screen
  syncCalendar: 'Sync Calendar',
  syncInProgress: 'Syncing calendar...',
  lastSynced: 'Last synced: ',
  syncComplete: 'Sync Complete',
  syncFailed: 'Sync Failed',
  noEvents: 'No events found.',

  // About
  aboutText: 'This app was created for the SOEN 390 MiniCapstone project during Winter 2025 at Concordia University.',
  team: 'Team Members:',
  
  // SearchBar Component
  searchPlaceholder: 'Search for buildings, locations...',
  
  // BuildingMap Component
  getDirections: 'Get Directions',
  placesNearby: 'Places Nearby',
  nearby: 'Nearby',
  noResults: 'No results found.',
  oops: 'Oops!',
  gotIt: 'Got it',
  kmAway: 'km away',
  noAddress: 'No address available',
  
};

// Translations for English and French
const translations = {
  English: {
    ...baseTranslations,
  },
  French: {
    ...baseTranslations,
    settings: 'Paramètres',
    account: 'Compte',
    changeEmail: "Changer l'email",
    changePassword: 'Changer le mot de passe',
    deleteAccount: 'Supprimer le compte',
    appearance: 'Apparence',
    changeMode: 'Changer le mode',
    language: 'Langue',
    appLanguage: "Langue de l'application",
    about: 'À propos',
    version: 'Version 1.0.0',
    privacy: 'Politique de confidentialité',
    terms: "Conditions d'utilisation",
    profile: 'Profil',
    schedule: 'Horaire',
    map: 'Carte',
    home: 'Accueil',

    // Card Titles
    sgwMap: 'Carte SGW',
    loyMap: 'Carte Loyola',
    mySchedule: 'Mon Horaire',
    security: 'Sécurité',

    // Profile Screen
    welcome: 'Bienvenue',
    addPhoto: 'Ajouter une photo',
    changePhoto: 'Changer la photo',
    viewSchedule: 'Voir mon horaire',
    pleaseLogin: 'Veuillez vous connecter pour accéder à votre profil.',
    login: 'Aller à la connexion',
    permissionError: "L'accès à la galerie est requis.",
    photoAccessError: "Veuillez autoriser l'accès à vos photos.",
    imageError: 'Une erreur est survenue lors du choix de la photo.',

    // Schedule Screen
    syncCalendar: 'Synchroniser le calendrier',
    syncInProgress: 'Synchronisation du calendrier...',
    lastSynced: 'Dernière synchronisation: ',
    syncComplete: 'Synchronisation terminée',
    syncFailed: 'Échec de la synchronisation',
    noEvents: 'Aucun événement trouvé.',

    // About
    aboutText: "Cette application a été créée pour le projet MiniCapstone SOEN 390 pendant l'hiver 2025 à l'Université Concordia.",
    team: "Membres de l'équipe :",
    
    // SearchBar Component
    searchPlaceholder: 'Rechercher des bâtiments, des lieux...',
    
    // BuildingMap Component
    getDirections: 'Obtenir des directions',
    placesNearby: 'Lieux à proximité',
    nearby: 'À proximité',
    noResults: 'Aucun résultat trouvé.',
    oops: 'Oups !',
    gotIt: 'Compris',
    kmAway: 'km de distance',
    noAddress: 'Pas d\'adresse disponible',
    
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('English');  // Default to English

  // Toggle between English and French
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'English' ? 'French' : 'English'));
  };

  const t = translations[language];  // Get the current translations based on selected language

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => useContext(LanguageContext);