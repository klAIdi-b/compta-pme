// Vérification de la théorie enrichie (étape 3 du chantier « Théorie de référence », 24.11.2026) :
// arrondi aux 5 centimes des écritures, calculs écrits en toutes lettres (« a × b = c ») refaits un à un dans tous les
// textes, comptes nommés dans les réponses d'auto-vérification, renvois des modules Apprendre.
import { describe, expect, it } from 'vitest';
import { CHAPITRES, type Bloc, type LigneExemple } from '../src/data/theorie';
import { MODULES } from '../src/data/apprendre';
import { comptesDuNiveau, type Niveau } from '../src/engine/plan';
import { plan } from './fixtures';

const blocs = (c: (typeof CHAPITRES)[number]) => c.sections.flatMap((s) => s.blocs);

function lignesDe(b: Bloc): LigneExemple[] {
  if (b.type === 'ecritures') return b.exemples.flatMap((e) => e.lignes);
  if (b.type === 'exemple') return [...(b.lignes ?? []), ...(b.variante?.lignes ?? [])];
  if (b.type === 'contraste') return b.cas.flatMap((c) => c.lignes ?? []);
  return [];
}

/** Toutes les chaînes d'un chapitre (titres, textes, calculs, tableaux, questions et réponses). */
function textes(x: unknown, sortie: string[] = []): string[] {
  if (typeof x === 'string') sortie.push(x);
  else if (Array.isArray(x)) for (const y of x) textes(y, sortie);
  else if (x && typeof x === 'object') for (const y of Object.values(x)) textes(y, sortie);
  return sortie;
}

// ---------- Petit évaluateur d'expressions : 1'234.50, 8,1 %, 36 000, × ÷ + −, parenthèses ----------

const NOMBRE = /^\d{1,3}(?:'\d{3})+(?:\.\d+)?|^\d{1,3}(?:[  ]000)+|^\d+(?:[.,]\d+)?/;

/** Évalue `s` en entier ; null si ce n'est pas une expression. `ops` compte les opérateurs rencontrés. */
function evaluer(s: string, relatif = false): { valeur: number; ops: number } | null {
  let i = 0;
  let ops = 0;
  /** Le dernier terme lu était un pourcentage seul (« − 20 % ») : en mode relatif, il s'applique au montant qui précède. */
  let seul = false;
  const blancs = () => { while (i < s.length && /[\s ]/.test(s[i]!)) i++; };
  const facteur = (): number | null => {
    blancs();
    if (s[i] === '−' || s[i] === '-' || s[i] === '+') {
      const signe = s[i] === '+' ? 1 : -1;
      i++;
      const v = facteur();
      return v === null ? null : signe * v;
    }
    if (s[i] === '(') {
      i++;
      const v = somme();
      blancs();
      if (v === null || s[i] !== ')') return null;
      i++;
      return pourcent(v);
    }
    const m = NOMBRE.exec(s.slice(i));
    if (!m) return null;
    i += m[0].length;
    return pourcent(Number(m[0].replace(/['\s ]/g, '').replace(',', '.')));
  };
  const pourcent = (v: number): number => {
    const j = i;
    blancs();
    if (s[i] === '%') { i++; seul = true; return v / 100; }
    i = j;
    seul = false;
    return v;
  };
  const produit = (): number | null => {
    let v = facteur();
    for (;;) {
      if (v === null) return null;
      blancs();
      const op = s[i];
      if (op !== '×' && op !== '÷') return v;
      i++; ops++;
      const d = facteur();
      if (d === null) return null;
      v = op === '×' ? v * d : v / d;
      seul = false;
    }
  };
  const somme = (): number | null => {
    let v = produit();
    for (;;) {
      if (v === null) return null;
      blancs();
      const op = s[i];
      if (op !== '+' && op !== '−') return v;
      i++; ops++;
      const d = produit();
      if (d === null) return null;
      const part = relatif && seul ? v * d : d;
      v = op === '+' ? v + part : v - part;
      seul = false;
    }
  };
  const valeur = somme();
  blancs();
  return valeur !== null && i === s.length ? { valeur, ops } : null;
}

/** Plus longue fin de `s` qui est une expression. */
function finExpression(s: string, relatif = false) {
  const t = s.trimEnd();
  for (let d = 0; d < t.length; d++) {
    if (d > 0 && /[\d'.,]/.test(t[d - 1]!) && /[\d'.,]/.test(t[d]!)) continue; // pas au milieu d'un nombre
    const r = evaluer(t.slice(d), relatif);
    if (r) return r;
  }
  return null;
}

/** Plus long début de `s` qui est une expression (la ponctuation qui suit est ignorée). */
function debutExpression(s: string) {
  const t = s.trimStart();
  for (let f = t.length; f > 0; f--) {
    if (f < t.length && /\d/.test(t[f - 1]!) && /\d/.test(t[f]!)) continue;
    const r = evaluer(t.slice(0, f).replace(/[.,;:(\s]+$/, ''));
    if (r) return r;
  }
  return null;
}

const proches = (a: number, b: number) => Math.abs(a - b) <= 0.0501 || Math.abs(a - b) <= Math.abs(b) * 0.006;

/** Égalités fausses d'un texte : « gauche = droite » où les deux côtés se calculent et où le côté gauche est une opération. */
function egalitesFausses(texte: string): string[] {
  const fausses: string[] = [];
  const parts = texte.split('=');
  for (let k = 0; k + 1 < parts.length; k++) {
    const g = finExpression(parts[k]!);
    const d = debutExpression(parts[k + 1]!);
    if (!g || !d || g.ops === 0) continue;
    // Un résultat en pour cent peut suivre « × 100 » : on accepte les deux écritures.
    // « 500.00 − 20 % » se lit aussi « 500.00 moins 20 % de 500.00 » (échelle des prix).
    const g2 = finExpression(parts[k]!, true)!;
    if (!proches(g.valeur, d.valeur) && !proches(g.valeur, d.valeur * 100) && !proches(g.valeur * 100, d.valeur) && !proches(g2.valeur, d.valeur)) {
      fausses.push(`${parts[k]!.trim().slice(-60)} = ${parts[k + 1]!.trim().slice(0, 25)} (calculé : ${Math.round(g.valeur * 10000) / 10000})`);
    }
  }
  return fausses;
}

describe('théorie : vérification des contenus', () => {
  it("l'évaluateur reconnaît les écritures de calcul du cours", () => {
    expect(evaluer("585.00 × 8,1 %")?.valeur).toBeCloseTo(47.385, 6);
    expect(evaluer("24'000.00 × 3 × 150 ÷ 36 000")?.valeur).toBeCloseTo(300, 6);
    expect(evaluer("(200'000.00 + 40'000.00) ÷ 2")?.valeur).toBe(120000);
    expect(evaluer('3 mars + 30 jours')).toBeNull();
    expect(egalitesFausses("Rabais : 650.00 × 10 % = 65.00. Total : 650.00 − 65.00 = 585.00.")).toEqual([]);
    expect(egalitesFausses('(6.00 + 10.00) ÷ 200.00 × 100 = 8,0 %.')).toEqual([]);
    expect(egalitesFausses('PAC = 500.00 − 20 % = 400.00.')).toEqual([]);
    expect(egalitesFausses("2'000.00 × 8,1 % = 172.00.")).toHaveLength(1);
  });

  it('tous les calculs écrits dans la théorie sont justes (à 5 centimes ou 0,1 point près)', () => {
    let verifiees = 0;
    const fausses: string[] = [];
    for (const c of CHAPITRES) {
      for (const t of textes(c)) {
        const parts = t.split('=');
        for (let k = 0; k + 1 < parts.length; k++) if (finExpression(parts[k]!)?.ops && debutExpression(parts[k + 1]!)) verifiees++;
        for (const f of egalitesFausses(t)) fausses.push(`${c.id} — ${f}`);
      }
    }
    expect(fausses).toEqual([]);
    // Garde-fou : le contrôle porte bien sur plusieurs centaines de calculs.
    expect(verifiees).toBeGreaterThan(150);
  });

  it('les montants des écritures, des comptes en T et des bilans respectent les 5 centimes', () => {
    const rond = (francs: number) => Math.abs(Math.round(francs * 20) - francs * 20) < 1e-6;
    for (const c of CHAPITRES) for (const b of blocs(c)) {
      for (const l of lignesDe(b)) expect(rond(l.montant), `${c.id} — ${l.debit ?? ''}/${l.credit ?? ''} ${l.montant}`).toBe(true);
      if (b.type === 'compteT') for (const x of [...b.debit, ...b.credit]) expect(rond(x.montant), `${c.id} — ${x.libelle}`).toBe(true);
      if (b.type === 'bilan') for (const x of [...b.actif, ...b.passif]) expect(rond(x.montant), `${c.id} — ${x.libelle}`).toBe(true);
    }
  });

  it("une réponse d'auto-vérification qui donne une écriture « Débit / Crédit, montant » nomme des comptes du plan, disponibles à l'année du chapitre", () => {
    let controlees = 0;
    for (const c of CHAPITRES) {
      const intitules = comptesDuNiveau(plan, c.niveau).map((x) => x.intitule);
      const connu = (nom: string) => intitules.some((i) => i === nom || i.startsWith(`${nom} (`) || i.startsWith(`${nom},`));
      for (const b of blocs(c)) {
        if (b.type !== 'questions') continue;
        for (const q of b.items) {
          for (const m of q.reponse.matchAll(/([A-ZÉÀ][^/.:;]*?) \/ ([A-ZÉÀ][^/.:;]*?), [\d']+\.\d\d/g)) {
            controlees++;
            expect(connu(m[1]!.trim()), `${c.id} — débit « ${m[1]} » dans : ${q.reponse}`).toBe(true);
            expect(connu(m[2]!.trim()), `${c.id} — crédit « ${m[2]} » dans : ${q.reponse}`).toBe(true);
          }
        }
      }
    }
    expect(controlees).toBeGreaterThanOrEqual(10);
  });

  it("chaque module d'Apprendre renvoie à un chapitre qui existe et que l'élève de son année peut ouvrir", () => {
    const ordre: Niveau[] = ['CFC1', 'CFC2', 'MP'];
    for (const m of MODULES) {
      if (!m.chapitre) continue;
      const ch = CHAPITRES.find((c) => c.id === m.chapitre);
      expect(ch, `${m.id} → ${m.chapitre}`).toBeDefined();
      expect(ordre.indexOf(ch!.niveau), `${m.id} (${m.niveau}) → ${m.chapitre} (${ch!.niveau})`).toBeLessThanOrEqual(ordre.indexOf(m.niveau));
    }
  });
});
