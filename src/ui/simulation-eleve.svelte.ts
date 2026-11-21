// Simulateur, côté groupe (phase S5) : situation ouverte depuis l'accueil (fichier) ou par le lien de l'enseignant
// (en ligne). Rien n'est conservé dans le navigateur : le groupe rouvre son fichier ou son lien s'il ferme la page.

import type { SituationGroupe } from '../engine/simulation/situation';
import { lireLienGroupes, type ConfigEnLigne } from '../io/simulation-session';

class SimulationEleve {
  situation = $state<SituationGroupe | null>(null);
  /** Nom du fichier de décisions enregistré, une fois les décisions validées. */
  fichierEnregistre = $state<string | null>(null);
  /** Partie en ligne ouverte par le lien de l'enseignant (?partie=…&service=…&cle=…). */
  enLigne = $state<{ config: ConfigEnLigne; codePartie: string } | null>(null);

  constructor() {
    if (typeof location !== 'undefined') {
      const l = lireLienGroupes(location.search);
      if (l) this.enLigne = l;
    }
  }

  ouvrir(s: SituationGroupe) {
    this.situation = s;
    this.fichierEnregistre = null;
  }

  fermer() {
    this.situation = null;
    this.fichierEnregistre = null;
    if (this.enLigne) {
      this.enLigne = null;
      history.replaceState(null, '', location.pathname);
    }
  }
}

export const simulationEleve = new SimulationEleve();
