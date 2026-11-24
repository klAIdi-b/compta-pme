// Dialogues du logiciel (confirmation, message) : remplacent confirm() et alert() du navigateur, avec le même
// comportement pour l'appelant (une réponse oui / non), mais dans la charte et avec un bouton d'action nommé.
// Le composant Dialogue.svelte, monté une fois dans App.svelte, affiche la demande courante.

export interface DemandeDialogue {
  titre: string;
  /** Paragraphes d'explication. */
  texte?: string[];
  /** Libellé du bouton d'action : il dit ce qui va se passer (« Supprimer l'écriture »). */
  confirmer?: string;
  annuler?: string;
  /** Action qui efface ou ferme quelque chose : bouton rouge, focus sur « Annuler ». */
  danger?: boolean;
  /** Simple message : un seul bouton. */
  information?: boolean;
}

class Dialogues {
  courante = $state.raw<(DemandeDialogue & { resoudre: (ok: boolean) => void }) | null>(null);

  /** Pose une question ; la promesse rend true si l'utilisateur confirme, false s'il annule (bouton, Échap). */
  demander(d: DemandeDialogue): Promise<boolean> {
    return new Promise((resoudre) => {
      this.courante?.resoudre(false);
      this.courante = { ...d, resoudre };
    });
  }

  /** Affiche un message à lire, fermé par un seul bouton. */
  informer(titre: string, texte: string[] = []): Promise<boolean> {
    return this.demander({ titre, texte, information: true, confirmer: 'Compris' });
  }

  repondre(ok: boolean) {
    const c = this.courante;
    this.courante = null;
    c?.resoudre(ok);
  }
}

export const dialogue = new Dialogues();
