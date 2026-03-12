## Description du Projet

Ce projet vise à développer un **prototype intelligent d'analyse de consommation énergétique** permettant d'estimer l'empreinte carbone d'une infrastructure numérique et de simuler des stratégies d'optimisation énergétique.

Le système combine **Machine Learning prédictif** et **simulation énergétique** afin d'aider les entreprises à comprendre et réduire l'impact environnemental de leur infrastructure IT.

L'objectif est de construire un **pipeline complet de Data Science**, allant de l'analyse exploratoire des données jusqu'au déploiement d'une application capable de :

- prédire la consommation énergétique
- estimer les émissions de CO₂
- générer un **Green Score**
- simuler des scénarios d'optimisation énergétique

---

## Objectifs

### Module 1 — GreenImpact (Prediction)

Analyser et prédire la consommation énergétique à partir de variables environnementales.

**Objectifs :**

- Construire un modèle de **régression** pour prédire la consommation énergétique  
- Comparer un **baseline model** (moyenne historique) avec des modèles Machine Learning  
- Identifier les variables influentes (température, humidité, conditions environnementales)  
- Évaluer les performances avec :  
  - MAE  
  - RMSE  
  - R² Score  

**Résultats attendus :**

- Consommation énergétique prédite  
- Estimation des émissions CO₂  
- Génération d'un **Green Score (0–100)**  

---

### Module 2 — GreenOptimizer (Simulation)

Analyser les facteurs influençant la consommation et simuler des stratégies d'amélioration.

**Objectifs :**

- Identifier les variables ayant le plus d'impact sur la consommation  
- Simuler des scénarios d'optimisation énergétique  
- Estimer la réduction des émissions de CO₂  

**Exemples de simulations :**

- Réduction de la consommation de **20%**
- Optimisation des plages horaires énergivores
- Ajustement des paramètres environnementaux

**Exemple de résultat :**

Une réduction de **15% de la consommation énergétique** permet :

- une diminution de **120 kg CO₂/an**
- une amélioration du **Green Score de 68 à 82**

---

## Dataset

**Dataset utilisé :** Appliances Energy Prediction – 19 735 lignes, 28 features

### Description

Ce dataset contient des **mesures environnementales et énergétiques** permettant de prédire la consommation énergétique d'un bâtiment.

### Variables principales

**Target :**

- `energy_consumption (kWh)`

**Features :**

**Température :**

- `temperature_kitchen`
- `temperature_living_room`
- `temperature_outside`

**Humidité :**

- `humidity_kitchen`
- `humidity_living_room`

**Variables environnementales :**

- `pressure`
- `wind_speed`
- `visibility`
- `dew_point`

**Variables temporelles :**

- `hour`
- `day_of_week`
- `month` 

---
# Roadmap 
## Phase 1 : Exploration & Préparation (S1)
- [ ] Valider le dataset (Appliances Energy Prediction, UCI)  
- [ ] Créer structure GitHub (`data/`, `notebooks/`, `src/`, `api/`, `frontend/`)  
- [ ] Rédiger README et documentation  
- [ ] Analyse exploratoire (EDA) : distributions, corrélations, visualisations  

## Phase 2 : Pipeline Machine Learning (S2-3)
- [ ] Nettoyage des données : doublons, valeurs manquantes, outliers  
- [ ] Feature engineering : 5 nouvelles features (`hour`, `day_of_week`, `month`, `mean_temp`, `delta_temp`)  
- [ ] Split train/test & normalisation (StandardScaler)  
- [ ] Modélisation ML : Random Forest & XGBoost  
- [ ] Optimisation hyperparamètres (GridSearchCV) & tracking MLflow  
- [ ] Évaluation des performances (MAE, RMSE, R²)  

## Phase 3 : Déploiement & Interface (S4-7)
- [ ] Développement API FastAPI  
- [ ] Dashboard interactif React  
- [ ] Conteneurisation Docker  
- [ ] Déploiement final & tests  
- [ ] Optionnel : CI/CD

 ##  Installation
 ### Cloner le repository
      
      git clone https://github.com/ayaattafi/AI-Green-Impact-Analyzer.git
