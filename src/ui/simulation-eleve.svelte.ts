// Simulateur, côté groupe (phase S5, échange par fichier) : situation ouverte depuis l'accueil. Rien n'est conservé
// dans le navigateur : le groupe rouvre son fichier de situation s'il ferme la page.

import type { SituationGroupe } from '../engine/simulation/situation';

class SimulationEleve {
  situation = $state<SituationGroupe | null>(null);
  /** Nom du fichier de décisions enregistré, une fois les décisions validées. */
  fichierEnregistre = $state<string | null>(null);

  ouvrir(s: SituationGroupe) {
    this.situation = s;
    this.fichierEnregistre = null;
  }

  fermer() {
    this.situation = null;
    this.fichierEnregistre = null;
  }
}

export const simulationEleve = new SimulationEleve();
