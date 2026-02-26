# AI Green Impact Analyzer

Prototype intelligent d'analyse de consommation énergétique permettant d'estimer l'empreinte carbone d'une infrastructure numérique, de générer un Green Score et de simuler des scénarios d'optimisation énergétique.

## Objectif global

Concevoir un système end-to-end capable de :

- Prédire la consommation énergétique d'une infrastructure (bâtiment / système IT simulé)
- Estimer les émissions de CO₂ associées à partir de facteurs d'émission
- Générer un score écologique intelligent
- Simuler des stratégies d'optimisation énergétique ("what-if scenarios")

Résultat attendu :
Un rapport complet comprenant consommation prédite, émissions CO₂ estimées et recommandations d'optimisation.

## Module 1 — GreenImpact (Prédiction)

### Objectifs

- Construire un mod��le de régression pour prédire la consommation énergétique
- Comparer une approche baseline (moyenne historique) vs modèles ML
- Analyser l'impact des variables environnementales (température, humidité, etc.)
- Évaluer les performances via MAE, RMSE et R²

### Données utilisées

Dataset : Appliances Energy Prediction
Variables principales :

- Consommation énergétique (target)
- Température intérieure / extérieure
- Humidité
- Conditions environnementales
- Variables temporelles

### Résultat

- Consommation énergétique prédite
- Estimation des émissions CO₂ (kWh → kg CO₂)
- Green Score (0–100)

## Module 2 — GreenOptimizer (Simulation)

### Objectifs

- Identifier les facteurs influençant fortement la consommation
- Proposer des stratégies d'optimisation énergétique
- Simuler la réduction des émissions après amélioration

### Exemples de simulation

- Réduction de la consommation de 20%
- Optimisation des plages horaires énergivores
- Ajustement des paramètres environnementaux

Exemple :

Une réduction de 15% de la consommation permet de diminuer les émissions de 120 kg CO₂/an et d'améliorer le Green Score de 68 à 82.

## Architecture

- API (FastAPI)
- Service de prédiction énergétique
- Service d'estimation carbone
- Service de simulation
- Frontend React (Dashboard interactif)
- Tracking des expériences avec MLflow
- Conteneurisation Docker

## Valeur ajoutée

- Approche prédictive + simulation dynamique
- Interprétabilité des variables influentes
- Application concrète au Green IT
- Prototype déployable et scalable