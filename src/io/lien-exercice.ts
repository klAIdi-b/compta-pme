// Lien autonome vers un exercice (phase V3, maquette validée le 27.11.2026, écrans V3.1 et V3.2) : l'exercice est placé,
// compressé, après le signe « # » de l'adresse. Le navigateur n'envoie jamais cette partie de l'adresse au serveur :
// l'exercice voyage dans le lien sans être hébergé nulle part. Le contenu est celui du fichier distribué aux élèves
// (`exporterExercice`) : corrigé absent en évaluation, encodé en entraînement et en évaluation formative.
// Compression native du navigateur (CompressionStream), sans dépendance.

import type { Exercice } from '../engine/exercice';
import { ErreurFichier, exporterExercice, importerExercice } from './fichiers';

const CLE = 'ex=';
/** Capacité d'un code QR en mode octets, niveau de correction L (version 40) : 2'953 octets. Marge comprise. */
export const LIMITE_QR = 2900;
/** Au-delà, un code QR reste lisible de près mais devient difficile à scanner depuis le fond d'une classe. */
export const CONFORT_QR = 1000;

async function transformer(octets: Uint8Array, flux: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const sortie = new Blob([octets as BlobPart]).stream().pipeThrough(flux);
  return new Uint8Array(await new Response(sortie).arrayBuffer());
}

function versBase64Url(octets: Uint8Array): string {
  let bin = '';
  for (const o of octets) bin += String.fromCharCode(o);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function depuisBase64Url(texte: string): Uint8Array {
  const b64 = texte.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** Partie de l'adresse après « # » qui contient l'exercice (sans le « # »). */
export async function fragmentExercice(ex: Exercice): Promise<string> {
  const json = JSON.stringify(JSON.parse(exporterExercice(ex)));
  const z = await transformer(new TextEncoder().encode(json), new CompressionStream('deflate-raw'));
  return CLE + versBase64Url(z);
}

/** Lien complet à donner aux élèves. `base` : adresse du site, sans « # » (par exemple https://…/compta-pme/). */
export async function lienExercice(base: string, ex: Exercice): Promise<string> {
  return `${base.replace(/#.*$/, '')}#${await fragmentExercice(ex)}`;
}

/** L'adresse porte-t-elle un exercice ? Rend le contenu encodé (sans « ex= »), ou null. */
export function exerciceDansAdresse(hash: string): string | null {
  const h = hash.replace(/^#/, '');
  return h.startsWith(CLE) ? h.slice(CLE.length) : null;
}

/** Lit l'exercice d'un lien. Un lien abîmé ou incomplet lève `ErreurFichier` avec un message clair. */
export async function lireExerciceDuLien(contenu: string): Promise<Exercice> {
  let texte: string;
  try {
    texte = new TextDecoder().decode(await transformer(depuisBase64Url(contenu.trim()), new DecompressionStream('deflate-raw')));
  } catch {
    throw new ErreurFichier("Ce lien est incomplet : l'exercice n'a pas pu être lu. Demandez le lien à votre enseignant ou ouvrez le fichier du devoir.");
  }
  try {
    return importerExercice(texte);
  } catch (e) {
    throw e instanceof ErreurFichier ? e : new ErreurFichier("Ce lien ne contient pas un exercice Compta PME.");
  }
}

/** Le lien tient-il dans un code QR ? `confortable` : lisible depuis le fond d'une classe. */
export function tailleQr(lien: string): { possible: boolean; confortable: boolean } {
  const octets = new TextEncoder().encode(lien).length;
  return { possible: octets <= LIMITE_QR, confortable: octets <= CONFORT_QR };
}
