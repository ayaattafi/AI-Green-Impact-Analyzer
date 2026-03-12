## Description du Projet

Ce projet vise à développer un **prototype intelligent d'analyse de consommation énergétique** permettant d'estimer l'empreinte carbone d'une infrastructure numérique et de simuler des stratégies d'optimisation énergétique.

Le système combine **Machine Learning prédictif** et **simulation énergétique** afin d'aider les entreprises à comprendre et réduire l'impact environnemental de leur infrastructure IT.

**Fonctionnalités principales :**
- Prédiction de consommation énergétique (Random Forest, XGBoost)
- Estimation CO₂ (0.5 kg/kWh)
- Green Score (0-100 basé sur précision + efficacité)
- Simulations d'optimisation (temp/humidity adjustments)
- API FastAPI + Dashboard React + Docker

## Installation & Utilisation

### Prérequis
- Python 3.12
- Node.js 18+
- Docker (optionnel)

### 1. Setup Backend
```bash
# Virtual env
python -m venv venv
venv\\Scripts\\activate  # Windows
pip install -r requirements.txt

# Run preprocessing & training
cd notebooks
jupyter notebook 01_eda.ipynb  # Explore data
jupyter notebook 02_modeling.ipynb  # Train models (creates models/)
jupyter notebook 03_optimization.ipynb  # Simulations

# Start API
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```
Visit `http://localhost:8000/docs` for API docs.

### 2. Setup Frontend
```bash
cd frontend
npm install
npm start
```
Visit `http://localhost:3000` (proxies to API).

### 3. Docker (API only)
```bash
docker build -t green-impact .
docker run -p 8000:8000 green-impact
```

### 4. MLflow (optionnel)
```bash
mlflow ui
```
View at `http://localhost:5000`.

## Structure
```
.
├── data/          # Raw & processed data
├── notebooks/     # EDA, modeling, opt
├── src/           # Preprocessing, models, utils
├── api/           # FastAPI
├── frontend/      # React dashboard
├── models/        # Trained models
├── requirements.txt
├── Dockerfile
└── README.md
```

## Roadmap Status
Phase 1-3 implemented. Run notebooks to train (models auto-save). Full stack ready.

**Demo**: Train models, start API, frontend for interactive predictions/optimizations.

Enjoy reducing your green impact!

