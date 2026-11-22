# Compta PME

Application pédagogique de comptabilité en partie double, plan comptable PME suisse, pour les formations
commerciales (CFC employé·e de commerce, maturité professionnelle).

Fonctionne entièrement dans le navigateur, y compris hors ligne : aucune donnée d'élève n'est envoyée en ligne.
Les échanges entre enseignant et élèves se font par fichiers.

## Développement

```bash
npm install
npm run dev     # serveur local
npm test        # tests du moteur comptable
npm run build   # site statique dans dist/
```

Les règles du projet sont décrites dans [CLAUDE.md](CLAUDE.md) ; le plan de diffusion dans
[docs/diffusion-publique.md](docs/diffusion-publique.md).

## Licences

- Code : licence MIT, voir [LICENSE](LICENSE).
- Contenus pédagogiques (exercices, dossiers, théorie, guide) : CC BY-NC-SA 4.0, voir
  [LICENCE-CONTENUS.md](LICENCE-CONTENUS.md).
