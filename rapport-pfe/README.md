# Rapport GREENLY — projet LaTeX (template ISI)

Ce dossier est un rapport complet, basé sur le template officiel [ISI-LaTeX-Template](https://github.com/stoufa/ISI-LaTeX-Template), rédigé à partir de l'analyse réelle du projet GREENLY (code source dans `ml-service/` et `src/`).

## Importer dans Overleaf

1. Compressez ce dossier (`rapport-pfe/`) en `.zip`.
2. Sur [Overleaf](https://www.overleaf.com) : **New Project → Upload Project** → sélectionnez le `.zip`.
3. Overleaf doit utiliser `main.tex` comme fichier racine (vérifiez dans **Menu → Main document**).
4. Compilateur : **pdfLaTeX** (par défaut). La bibliographie utilise `biblatex` avec le backend `bibtex` (déjà configuré dans `tpl/isipfe.cls`) — ne changez pas le compilateur de bibliographie vers Biber.
5. Cliquez sur **Recompile**. Il faut généralement compiler 2 à 3 fois de suite (LaTeX standard) pour que le sommaire, la bibliographie et les renvois (`\ref`) se mettent à jour correctement.

## ⚠️ Champs à compléter avant la soutenance

Ouvrez **`global_config.tex`** et remplacez tous les `[À COMPLÉTER]` par vos informations réelles :
- votre nom (`\author`)
- le nom de vos encadrants (`\proFramerName`, `\academicFramerName`)
- l'année universitaire (`\collegeYear`)

## Ce qui a été rédigé

- **4 chapitres complets** basés sur le code réel du projet (pas de contenu générique) : contexte/état de l'art, spécification des besoins (Scrum, backlog, Gantt), conception IA (diagrammes UML, dataset, entraînement, évaluation), Business Intelligence (KPI, tableaux de bord, prévision).
- **Tous les diagrammes UML** (cas d'utilisation, classes, séquence, activité, composants, déploiement, ERD) sont dessinés directement en **TikZ** — aucune image externe requise, tout est natif LaTeX.
- **5 graphiques réels** dans `img/bi-*.png`, générés à partir des vraies métriques du projet (`ml-service/models/metrics.json`) et d'une exécution réelle de l'algorithme de prévision (`ml-service/app/forecasting.py`).
- **Bibliographie** (`biblio.bib`) avec des sources réelles et vérifiables (EPA, UCI, Poore & Nemecek 2018, papers XGBoost/LightGBM/CatBoost/Random Forest, Scrum Guide).

## Point important

Je n'ai pas d'installation LaTeX locale pour compiler ce projet moi-même. J'ai donc fait une relecture manuelle rigoureuse (équilibrage des accolades, des environnements `\begin`/`\end`, cohérence des `\label`/`\ref`/`\cite`, caractères spéciaux `%`, `&`, `_` échappés) et corrigé plusieurs bugs trouvés lors de cette relecture (macro `\stereo` non définie, package `amsmath` manquant pour les formules, noms de fichiers image avec underscore). **Compilez une première fois sur Overleaf et signalez-moi toute erreur résiduelle** — je la corrigerai immédiatement.
