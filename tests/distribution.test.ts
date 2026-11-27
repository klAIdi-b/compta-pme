// Phase V3 (maquette validée le 27.11.2026) : lien autonome, archive ZIP de Classroom, ajustement des points, fichier de
// retour à l'élève, fichier de classe.
import { describe, expect, it } from 'vitest';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { corrigerCopie } from '../src/engine/notation';
import { corrigeBouclement } from '../src/engine/correction-bouclement';
import { appliquerAjustements, pointsAccordes } from '../src/engine/ajustements';
import { exerciceDansAdresse, lienExercice, lireExerciceDuLien, tailleQr } from '../src/io/lien-exercice';
import { crc32, creerZip, lireZip } from '../src/io/zip';
import { creerRetour, exporterRetour, importerRetour } from '../src/io/retour';
import { ajouterCopies, ajouterProgressions, classeVide, cleCopie, exporterClasse, importerClasse, lireListeClasse } from '../src/io/classe';
import { exporterCopie, importerCopie, type Copie } from '../src/io/fichiers';
import type { Dossier } from '../src/engine/dossier';
import { plan } from './fixtures';

/** Copie de Léa (maquettes V2 et V3) : opérations 8, 12 et 14 fausses, bouclement juste. */
function dossierLea(): Dossier {
  const erreurs: Record<string, { debit: string | null; credit: string | null; montant: number }[]> = {
    '8': [{ debit: '1520', credit: '1020', montant: 160000 }],
    '12': [{ debit: '6600', credit: '2000', montant: 65000 }],
    '14': [
      { debit: '4200', credit: null, montant: 300000 },
      { debit: null, credit: '1000', montant: 100000 },
      { debit: null, credit: '2010', montant: 200000 },
    ],
  };
  let d = creerDossier(demoCfc1, plan);
  for (const [i, c] of demoCfc1.corrige!.entries()) {
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: demoCfc1.debut, piece: c.piece, libelle: `Pièce ${c.piece}`, lignes: erreurs[c.piece] ?? c.lignes });
    if (!r.ok) throw new Error(r.erreurs.join(' '));
    d = r.valeur;
  }
  const r = ajouterEcriture(d, { id: 'E99', date: demoCfc1.fin, piece: 'B1', libelle: 'Bouclement', lignes: corrigeBouclement(d, demoCfc1)!.lignes });
  if (!r.ok) throw new Error(r.erreurs.join(' '));
  return r.valeur;
}

const copieDe = (prenom: string, nom: string, d: Dossier, exporteLe: string): Copie =>
  importerCopie(exporterCopie({ eleve: { prenom, nom, classe: '1CA' }, exerciceId: demoCfc1.id, exerciceTitre: demoCfc1.titre, mode: demoCfc1.mode, dossier: d, suivi: {} }, new Date(exporteLe)));

describe('lien autonome', () => {
  it('contient l’exercice après « # » et se relit à l’identique, corrigé compris en entraînement', async () => {
    const lien = await lienExercice('https://exemple.ch/compta-pme/', demoCfc1);
    expect(lien.startsWith('https://exemple.ch/compta-pme/#ex=')).toBe(true);
    const ex = await lireExerciceDuLien(exerciceDansAdresse(lien.slice(lien.indexOf('#')))!);
    expect(ex.id).toBe(demoCfc1.id);
    expect(ex.operations).toEqual(demoCfc1.operations);
    expect(ex.corrige).toEqual(demoCfc1.corrige);
    expect(tailleQr(lien).possible).toBe(true);
  });

  it('en évaluation, le corrigé n’est pas dans le lien', async () => {
    const lien = await lienExercice('https://exemple.ch/', { ...demoCfc1, mode: 'evaluation' });
    const ex = await lireExerciceDuLien(exerciceDansAdresse(lien.slice(lien.indexOf('#')))!);
    expect(ex.corrige).toBeUndefined();
  });

  it('refuse un lien abîmé avec un message clair', async () => {
    const lien = await lienExercice('https://exemple.ch/', demoCfc1);
    const coupe = exerciceDansAdresse(lien.slice(lien.indexOf('#')))!.slice(0, 200);
    await expect(lireExerciceDuLien(coupe)).rejects.toThrow(/lien est incomplet/);
    expect(exerciceDansAdresse('#journal')).toBe(null);
  });
});

describe('archive ZIP de Classroom', () => {
  it('relit les fichiers stockés et compressés, et écarte un fichier abîmé', async () => {
    const e = new TextEncoder();
    const texte = e.encode('{"copie":"Léa"}'.repeat(20));
    // Archive avec un fichier compressé (deflate), construite comme le fait Classroom.
    const z = new Uint8Array(await new Response(new Blob([texte]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
    const stocke = creerZip([{ nom: 'Dossier/Martin Lea.compta-copie.json', donnees: texte }, { nom: 'Rossier.compta-copie.json', donnees: texte }]);
    // Le second fichier devient compressé : on réécrit son contenu, sa méthode et ses tailles.
    const v = new DataView(stocke.buffer);
    const tailleCentrale = v.getUint32(stocke.length - 22 + 12, true);
    const debutCentral = v.getUint32(stocke.length - 22 + 16, true);
    const premierLocal = 30 + e.encode('Dossier/Martin Lea.compta-copie.json').length + texte.length;
    const nom2 = e.encode('Rossier.compta-copie.json');
    const local2 = new Uint8Array(30 + nom2.length);
    const vl = new DataView(local2.buffer);
    vl.setUint32(0, 0x04034b50, true);
    vl.setUint16(8, 8, true);
    vl.setUint32(14, crc32(texte), true);
    vl.setUint32(18, z.length, true);
    vl.setUint32(22, texte.length, true);
    vl.setUint16(26, nom2.length, true);
    local2.set(nom2, 30);
    const central = stocke.slice(debutCentral, debutCentral + tailleCentrale);
    const vc = new DataView(central.buffer);
    const c2 = 46 + e.encode('Dossier/Martin Lea.compta-copie.json').length;
    vc.setUint16(c2 + 10, 8, true);
    vc.setUint32(c2 + 20, z.length, true);
    vc.setUint32(c2 + 24, texte.length, true);
    const fin = stocke.slice(stocke.length - 22);
    const nouveauDebut = premierLocal + local2.length + z.length;
    new DataView(fin.buffer).setUint32(16, nouveauDebut, true);
    const archive = new Uint8Array([...stocke.slice(0, premierLocal), ...local2, ...z, ...central, ...fin]);
    const r = await lireZip(archive);
    expect(r.ecartes).toEqual([]);
    expect(r.fichiers.map((f) => f.nom)).toEqual(['Dossier/Martin Lea.compta-copie.json', 'Rossier.compta-copie.json']);
    for (const f of r.fichiers) expect(new TextDecoder().decode(f.donnees)).toBe(new TextDecoder().decode(texte));
    // CRC faux : le fichier est écarté, les autres sont lus.
    const i = premierLocal - texte.length;
    archive[i] = archive[i]! ^ 0xff;
    const r2 = await lireZip(archive);
    expect(r2.ecartes).toEqual(['Dossier/Martin Lea.compta-copie.json']);
    expect(r2.fichiers).toHaveLength(1);
    await expect(lireZip(new Uint8Array(40))).rejects.toThrow(/archive ZIP/);
  });
});

describe('ajustement des points', () => {
  it('copie de Léa : 1,5 point accordé à l’opération 14, note 5,5 au lieu de 5', () => {
    const c = corrigerCopie(demoCfc1, dossierLea());
    expect(c.points).toBe(15.5);
    const a = appliquerAjustements(c, { '14': { points: 1.5, commentaire: ' Bon découpage. ' }, '12': { commentaire: 'Autres dettes ?' } });
    expect(a.points).toBe(16.5);
    expect(a.note).toBe(5.5);
    expect(a.noteCalculee).toBe(5);
    const op14 = a.operations.find((o) => o.piece === '14')!;
    expect(op14).toMatchObject({ points: 1.5, calcules: 0.5, ajuste: true, commentaire: 'Bon découpage.' });
    expect(a.operations.find((o) => o.piece === '12')).toMatchObject({ points: 0, ajuste: false, commentaire: 'Autres dettes ?' });
  });

  it('ramène les points au demi-point, entre 0 et le barème', () => {
    expect(pointsAccordes(1.3, 2)).toBe(1.5);
    expect(pointsAccordes(5, 2)).toBe(2);
    expect(pointsAccordes(-1, 2)).toBe(0);
    expect(pointsAccordes(NaN, 2)).toBe(0);
  });
});

describe('fichier de retour à l’élève', () => {
  const copie = copieDe('Léa', 'Martin', dossierLea(), '2026-12-14T15:00:00Z');
  const c = appliquerAjustements(corrigerCopie(demoCfc1, copie.dossier), { '14': { points: 1.5, commentaire: 'Bon découpage.' } });

  it('donne note, points, statuts et commentaires, sans les solutions par défaut', () => {
    const r = importerRetour(exporterRetour(creerRetour(copie, demoCfc1, c, false, new Date('2026-12-15T10:00:00Z'))));
    expect(r.note).toBe(5.5);
    expect(r.points).toBe(16.5);
    expect(r.operations.find((o) => o.piece === '14')).toMatchObject({ points: 1.5, ajuste: true, commentaire: 'Bon découpage.' });
    expect(r.operations.some((o) => o.solution)).toBe(false);
    expect(r.exercice.corrige).toBeUndefined();
    expect(r.copie.dossier.ecritures).toEqual(copie.dossier.ecritures);
  });

  it('joint les écritures attendues « avec les solutions »', () => {
    const r = importerRetour(exporterRetour(creerRetour(copie, demoCfc1, c, true)));
    expect(r.operations.find((o) => o.piece === '8')?.solution).toEqual(demoCfc1.corrige!.find((x) => x.piece === '8')!.lignes);
  });

  it('refuse un autre fichier', () => {
    expect(() => importerRetour(exporterCopie(copie))).toThrow(/copie corrigée/);
  });
});

describe('fichier de classe', () => {
  it('lit la liste collée depuis un tableur, un CSV ou une simple liste de noms', () => {
    expect(lireListeClasse('Nom\tPrénom\nMartin\tLéa\nRossier\tNoah\n\nmartin\tlea')).toEqual([
      { nom: 'Martin', prenom: 'Léa' },
      { nom: 'Rossier', prenom: 'Noah' },
    ]);
    expect(lireListeClasse('Nom;Prénom\r\n"Dupraz";"Inès"')).toEqual([{ nom: 'Dupraz', prenom: 'Inès' }]);
    expect(lireListeClasse('Weber Tom\nDe Luca Anna Maria')).toEqual([
      { nom: 'Weber', prenom: 'Tom' },
      { nom: 'De', prenom: 'Luca Anna Maria' },
    ]);
  });

  it('garde la copie la plus récente par élève et par exercice, ajoute les élèves absents de la liste', () => {
    const d = dossierLea();
    let k = classeVide('1CA');
    k = { ...k, eleves: lireListeClasse('Martin\tLéa\nFavre\tChloé') };
    k = ajouterCopies(k, [copieDe('Léa', 'Martin', d, '2026-12-14T15:00:00Z'), copieDe('Noah', 'Rossier', d, '2026-12-14T16:00:00Z')], demoCfc1.id);
    k = ajouterCopies(k, [copieDe('Léa', 'Martin', d, '2026-12-13T09:00:00Z')], demoCfc1.id);
    expect(k.eleves.map((e) => e.nom)).toEqual(['Martin', 'Favre', 'Rossier']);
    expect(k.copies).toHaveLength(2);
    expect(k.copies.find((c) => c.eleve.nom === 'Martin')!.exporteLe).toBe('2026-12-14T15:00:00.000Z');
  });

  it('se relit à l’identique, ajustements et progressions compris', () => {
    const copie = copieDe('Léa', 'Martin', dossierLea(), '2026-12-14T15:00:00Z');
    let k = ajouterCopies(classeVide('1CA'), [copie], demoCfc1.id);
    k = { ...k, ajustements: { [cleCopie(copie)]: { '14': { points: 1.5, commentaire: 'Bon découpage.' } } } };
    k = ajouterProgressions(k, [{ eleve: { prenom: 'Léa', nom: 'Martin', classe: '1CA' }, exporteLe: '2026-12-10T10:00:00Z', progression: { bilan: { meilleur: 9, maitrise: true } as never } }]);
    const relue = importerClasse(exporterClasse(k));
    expect(relue.nom).toBe('1CA');
    expect(relue.copies[0]!.dossier.ecritures).toEqual(copie.dossier.ecritures);
    expect(relue.ajustements).toEqual(k.ajustements);
    expect(relue.progressions).toHaveLength(1);
    expect(() => importerClasse('{"format":"compta-pme/copie"}')).toThrow(/fichier de classe/);
  });
});
