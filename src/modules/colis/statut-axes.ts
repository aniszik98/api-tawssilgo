// ─────────────────────────────────────────────────────────────────────────────
// Modèle à 2 axes indépendants (etape_livraison / etape_paiement).
//
// `statut` est DÉRIVÉ des 2 axes (règle identique au pull SQL_TAWSSILGO.sql et
// aux apps : apps/*/index.html cLv/cPay/deriveStatut). L'intégration Laravel
// pousse un statut GROSSIER (`statut`) et met le vrai statut dans le
// commentaire « Statut mis à jour vers <status> » : on reconstruit les axes à
// partir de ce libellé brut.
// ─────────────────────────────────────────────────────────────────────────────

// Statut brut Laravel (champ `status` de leurs livraisons) → axe livraison.
export const STATUT_LARAVEL_VERS_LIVRAISON: Record<string, string> = {
  en_attente: 'en_attente',
  prise_en_charge_ramassage: 'attribue',
  ramasse: 'attribue',
  vers_station: 'livre',
  en_transit: 'en_transit',
  prise_en_charge_livraison: 'en_livraison',
  livre: 'livree',
  annule: 'annulee',
  // Valeurs déjà internes (idempotence si un appelant envoie nos libellés).
  attribue: 'attribue',
  en_livraison: 'en_livraison',
  livree: 'livree',
  annulee: 'annulee',
  retour: 'retour',
  envoi_point: 'envoi_point',
  recu: 'recu',
  probleme: 'probleme',
  echange: 'echange',
};

// Statut brut Laravel de paiement (champ `payment_status`) → axe paiement.
export const STATUT_LARAVEL_VERS_PAIEMENT: Record<string, string> = {
  paid: 'cloturee',
  in_transit: 'en_interne',
  available: 'disponible',
  ouv: 'ouv',
  // Valeurs déjà internes (idempotence).
  payee: 'payee',
  cloturee: 'cloturee',
  en_interne: 'en_interne',
  disponible: 'disponible',
};

// Livraison en exception : prime sur le paiement dans la dérivation.
export const STATUTS_EXCEPTION = [
  'retour',
  'envoi_point',
  'recu',
  'probleme',
  'echange',
];

/**
 * Dérive le `statut` consolidé à partir des 2 axes (règle canonique).
 *   · livraison en exception → statut = exception
 *   · sinon → statut = paiement s'il a commencé, sinon livraison
 */
export function deriveStatut(
  etapeLivraison?: string | null,
  etapePaiement?: string | null,
): string {
  const lv = etapeLivraison || 'en_attente';
  if (STATUTS_EXCEPTION.includes(lv)) return lv;
  return etapePaiement && etapePaiement !== 'ouv' ? etapePaiement : lv;
}

/**
 * Extrait le statut brut Laravel depuis le commentaire d'historique
 * « Statut mis à jour vers <status> ». Renvoie null si absent.
 */
export function extraireStatutLaravel(
  commentaire?: string | null,
): string | null {
  if (!commentaire) return null;
  const m = commentaire.match(/statut\s+mis\s+à\s+jour\s+vers\s+([a-z_]+)/i);
  return m ? m[1].toLowerCase() : null;
}
