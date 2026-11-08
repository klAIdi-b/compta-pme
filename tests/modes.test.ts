import { describe, expect, it } from 'vitest';
import { aMettreDeCote, ecranAffiche, genreSession, peutOuvrirAccueil, vueEleve, type SessionQualifiable } from '../src/ui/modes';

type S = SessionQualifiable & { id: string };
const travail: S = { role: 'eleve', id: 'travail' };
const apercu: S = { role: 'eleve', apercu: true, id: 'apercu' };
const corrige: S = { role: 'corrige', id: 'corrige' };

describe('genre de session', () => {
  it('se déduit du rôle et de l’aperçu (format enregistré inchangé)', () => {
    expect(genreSession(null)).toBe(null);
    expect(genreSession(travail)).toBe('travail');
    expect(genreSession(apercu)).toBe('apercu');
    expect(genreSession(corrige)).toBe('corrige');
    expect(genreSession({ role: 'corrige', apercu: true })).toBe('corrige');
  });

  it('l’aperçu voit l’exercice comme un élève, le corrigé non', () => {
    expect(vueEleve('travail')).toBe(true);
    expect(vueEleve('apercu')).toBe(true);
    expect(vueEleve('corrige')).toBe(false);
  });

  it('l’accueil ne s’ouvre que sur un travail d’élève', () => {
    expect(peutOuvrirAccueil(null)).toBe(true);
    expect(peutOuvrirAccueil('travail')).toBe(true);
    expect(peutOuvrirAccueil('apercu')).toBe(false);
    expect(peutOuvrirAccueil('corrige')).toBe(false);
  });
});

describe('mise de côté du travail de l’élève', () => {
  it('garde le travail actif', () => {
    expect(aMettreDeCote(travail, null)).toBe(travail);
  });
  it('ne remplace jamais un travail mis de côté par un aperçu ou un corrigé', () => {
    const ancien: S = { role: 'eleve', id: 'ancien' };
    expect(aMettreDeCote(apercu, ancien)).toBe(ancien);
    expect(aMettreDeCote(corrige, ancien)).toBe(ancien);
    expect(aMettreDeCote(null, ancien)).toBe(ancien);
  });
});

describe('écran affiché', () => {
  const base = { guide: false, enseignantOuvert: false, session: travail, accueilOuvert: false };
  it('suit la priorité guide > enseignant > accueil > logiciel', () => {
    expect(ecranAffiche({ ...base, guide: true, enseignantOuvert: true, accueilOuvert: true })).toBe('guide');
    expect(ecranAffiche({ ...base, enseignantOuvert: true, accueilOuvert: true })).toBe('enseignant');
    expect(ecranAffiche({ ...base, accueilOuvert: true })).toBe('accueil');
    expect(ecranAffiche(base)).toBe('logiciel');
  });
  it('sans session : accueil', () => {
    expect(ecranAffiche({ ...base, session: null })).toBe('accueil');
  });
  it('un aperçu ou un corrigé n’est jamais recouvert par l’accueil', () => {
    expect(ecranAffiche({ ...base, session: apercu, accueilOuvert: true })).toBe('logiciel');
    expect(ecranAffiche({ ...base, session: corrige, accueilOuvert: true })).toBe('logiciel');
  });
});
