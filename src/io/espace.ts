// Espace de stockage du navigateur. Le site de prévisualisation (compilé avec VITE_APERCU=1, publié dans le
// sous-dossier « apercu ») garde ses données à part : un essai de l'enseignant n'y touche jamais le travail d'un élève.
export const APERCU = import.meta.env?.VITE_APERCU === '1';
export const ESPACE = APERCU ? 'compta-pme-apercu' : 'compta-pme';
