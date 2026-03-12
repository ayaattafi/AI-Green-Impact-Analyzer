# Description du Dataset Énergie

## Aperçu du Dataset

Le dataset "Energy Consumption" est un ensemble de données relatives à la consommation énergétique d'un bâtiment résidentiel situé en Belgique. Ce dataset contient des mesures collectées toutes les 10 minutes sur une période d'environ 4 mois (de janvier à mai 2016), avec un total de 19 735 enregistrements et 29 variables.

## Structure des Données

Le dataset comprend deux types de variables principales :

1. **Variables de consommation énergétique** :
   - **Appliances** : La consommation énergétique des appareils électroménagers en watt-heures (Wh) - variable cible
   - **Lights** : La consommation d'énergie de l'éclairage en watt-heures (Wh)

2. **Variables和环境ales intérieures** (9 capteurs de température et 9 capteurs d'humidité) :
   - Températures (T1 à T9) : Mesurées dans différentes pièces du bâtiment
   - Humidité relative (RH_1 à RH_9) : Pour chaque zone correspondante

3. **Variables météorologiques extérieures** :
   - **T_out** : Température extérieure
   - **RH_out** : Humidité relative extérieure
   - **Press_mm_hg** : Pression atmosphérique
   - **Windspeed** : Vitesse du vent
   - **Visibility** : Visibilité
   - **Tdewpoint** : Point de rosée

4. **Variables aléatoires** :
   - **rv1, rv2** : Deux variables aléatoires non corrélées utilisées pour tester les modèles

## Objectif

Ce dataset est principalement utilisé pour prédire la consommation énergétique des appareils électroménagers (variable "Appliances") en fonction des conditions environnementales et temporelles. Il permet de développer des modèles de regression pour l'optimisation de la consommation énergétique des bâtiments intelligents.

## Statistiques Clés

- **Consommation moyenne des appareils** : 97,69 Wh
- **Médiane** : 60 Wh
- **Écart-type** : 102,52 Wh
- **Minimum** : 10 Wh
- **Maximum** : 1080 Wh

Le dataset ne contient aucune valeur manquante ni ligne en double, ce qui en fait un ensemble de données propre et prêt pour l'analyse.
