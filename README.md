# AI-Green-Impact-Analyzer
Prototype intelligent qui estime l'empreinte carbone numérique d'une entreprise, génère un Green Score et propose des recommandations avec simulation d'optimisation, via une architecture end-[...]

# AI Green Impact Analyzer

Prototype d'assistant intelligent d'analyse environnementale numérique combinant :

* Prédiction de l'empreinte carbone digitale (GreenImpact)
* Optimisation et simulation écologique (GreenOptimizer)

## Objectif global

Concevoir un prototype end-to-end permettant :

1. D'estimer l'impact environnemental numérique d'une entreprise
2. De générer un score écologique intelligent
3. De recommander des actions d'optimisation personnalisées
4. De simuler l'impact de scénarios d'amélioration ("what-if")

Résultat attendu :
Un rapport complet comprenant score écologique, émissions CO₂ estimées et recommandations personnalisées.

# Module 1 — GreenImpact (Prédiction)

## Objectifs

* Construire un modèle de prédiction des émissions CO₂ digitales
* Comparer une approche baseline (formule standard carbone) vs modèle ML
* Intégrer des variables contextuelles (pays, type cloud, taille entreprise, etc.)
* Évaluer les performances via métriques de régression

## Données utilisées (exemples)

Dataset 1 : Données d'activité numérique

* Nombre d'emails envoyés/jour
* Volume stockage cloud (GB)
* Trafic web mensuel
* Nombre de serveurs
* Consommation énergétique IT
* Nombre d'employés
* Type d'hébergement (cloud/local)
* Pays (mix énergétique)

## Modèles possibles

* Baseline : calcul carbone via formule standard
* Random Forest Regressor
* XGBoost Regressor
* Linear Regression (comparaison)

## Métriques

* MAE
* RMSE
* R²

### Résultat attendu :

* Estimation des émissions CO₂ annuelles
* Green Score (0–100)

# Module 2 — GreenOptimizer (Recommandation & Simulation)

## Objectifs

* Identifier les variables les plus polluantes
* Générer des recommandations écologiques personnalisées
* Simuler des scénarios d'amélioration

## Exemples de recommandations

* Réduire les emails internes de 30%
* Optimiser le stockage cloud (suppression données inutiles)
* Migrer vers un cloud alimenté par énergie renouvelable
* Compresser les fichiers multimédia
* Réduire serveurs physiques

## Simulation dynamique

Exemple :

> Si vous réduisez le trafic web de 20%, vos émissions diminuent de 85 kg CO₂/an.
> Votre score écologique passe de 64 à 78.

### Résultat attendu :

* Rapport comparatif Avant / Après
* Score optimisé
* Gain carbone estimé

# Architecture (Vue d'ensemble)

Le projet est organisé en couches pour séparer les responsabilités :

* API (FastAPI) expose les endpoints
* Services orchestrent la logique métier
* ML contient les modèles et pipelines
* Data gère ingestion, nettoyage et features

Flux type :

1. Requête entreprise → API
2. Service GreenImpact → modèle ML → Score + CO₂
3. Service GreenOptimizer → recommandations + simulation
4. API renvoie rapport complet

# Structure du projet

backend/
app/
main.py                # Point d'entrée FastAPI
api/
v1/
routes/
health.py
green.py
core/                  # Configuration
models/                # Modèles domain
schemas/               # Schémas Pydantic
services/
green_score.py
green_optimizer.py
ml/
impact_model.py
pipelines/
etl.py
tests/

frontend/
(React + Vite)

data/
raw/
processed/
features/

# Endpoints initiaux

* GET /api/v1/health
* POST /api/v1/green/estimate
* POST /api/v1/green/simulate

# Interface Frontend

Dashboard interactif :

* Green Score (gauge chart)
* Emissions CO₂ estimées
* Graphiques comparatifs
* Bouton "Simuler un scénario"
* Rapport téléchargeable

# Technologies utilisées

* Python
* FastAPI
* Scikit-learn / XGBoost
* MLflow (tracking expériences)
* React + Vite
* Docker
* Pandas / NumPy

# Valeur ajoutée du projet

* Approche analytique + prédictive
* Comparaison baseline vs ML
* Simulation dynamique
* Impact environnemental réel
* Alignement avec Green IT & ESG