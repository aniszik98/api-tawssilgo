/**
 * Résout une valeur dans un objet à partir d'un chemin en notation pointée,
 * ex: getByPath(obj, "data.client.nom"). Utilisé pour appliquer le mapping
 * JSON configuré sur chaque intégration API externe.
 */
export function getByPath(obj: any, path: string): any {
  if (!path) return undefined;
  return path
    .split('.')
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}
