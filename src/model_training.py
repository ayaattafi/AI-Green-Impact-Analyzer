import mlflow
import mlflow.sklearn
import mlflow.xgboost
from mlflow.tracking import MlflowClient
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb
import joblib
import os
import argparse

def load_data():
    train_X = np.load('data/processed/train_X.npy')
    train_y = np.load('data/processed/train_y.npy')
    test_X = np.load('data/processed/test_X.npy')
    test_y = np.load('data/processed/test_y.npy')
    print(f'Train shape: {train_X.shape}, Test shape: {test_X.shape}')
    return train_X, train_y, test_X, test_y

def train_baseline(train_y):
    baseline_pred = np.full_like(train_y, train_y.mean())
    mae = mean_absolute_error(train_y, baseline_pred)
    rmse = np.sqrt(mean_squared_error(train_y, baseline_pred))
    r2 = r2_score(train_y, baseline_pred)
    return {'mae': mae, 'rmse': rmse, 'r2': r2}

def train_rf(train_X, train_y, test_X, test_y):
    rf = RandomForestRegressor(random_state=42, n_jobs=-1)
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5]
    }
    grid = GridSearchCV(rf, param_grid, cv=3, scoring='neg_mean_absolute_error')
    grid.fit(train_X, train_y)
    pred = grid.best_estimator_.predict(test_X)
    mae = mean_absolute_error(test_y, pred)
    rmse = np.sqrt(mean_squared_error(test_y, pred))
    r2 = r2_score(test_y, pred)
    print(f'RF Best params: {grid.best_params_}')
    print(f'RF Test MAE: {mae:.4f}, RMSE: {rmse:.4f}, R2: {r2:.4f}')
    return grid.best_estimator_, {'mae': mae, 'rmse': rmse, 'r2': r2}

def train_xgb(train_X, train_y, test_X, test_y):
    xgb_model = xgb.XGBRegressor(random_state=42, n_jobs=-1)
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [4, 6],
        'learning_rate': [0.1, 0.2]
    }
    grid = GridSearchCV(xgb_model, param_grid, cv=3, scoring='neg_mean_absolute_error')
    grid.fit(train_X, train_y)
    pred = grid.best_estimator_.predict(test_X)
    mae = mean_absolute_error(test_y, pred)
    rmse = np.sqrt(mean_squared_error(test_y, pred))
    r2 = r2_score(test_y, pred)
    print(f'XGB Best params: {grid.best_params_}')
    print(f'XGB Test MAE: {mae:.4f}, RMSE: {rmse:.4f}, R2: {r2:.4f}')
    return grid.best_estimator_, {'mae': mae, 'rmse': rmse, 'r2': r2}

def main(args):
    os.makedirs('models', exist_ok=True)
    
    # Load data
    train_X, train_y, test_X, test_y = load_data()
    
    mlflow.set_experiment("GreenImpact_Models")
    with mlflow.start_run(run_name="Model_Training"):
        # Baseline
        baseline_metrics = train_baseline(train_y)
        mlflow.log_metrics({'baseline_mae': baseline_metrics['mae'], 
                           'baseline_rmse': baseline_metrics['rmse'], 
                           'baseline_r2': baseline_metrics['r2']})
        
        # Random Forest
        rf_model, rf_metrics = train_rf(train_X, train_y, test_X, test_y)
        mlflow.log_metrics({'rf_mae': rf_metrics['mae'], 
                           'rf_rmse': rf_metrics['rmse'], 
                           'rf_r2': rf_metrics['r2']})
        mlflow.sklearn.log_model(rf_model, "rf_model")
        joblib.dump(rf_model, 'models/rf_model.pkl')
        
        # XGBoost
        xgb_model, xgb_metrics = train_xgb(train_X, train_y, test_X, test_y)
        mlflow.log_metrics({'xgb_mae': xgb_metrics['mae'], 
                           'xgb_rmse': xgb_metrics['rmse'], 
                           'xgb_r2': xgb_metrics['r2']})
        mlflow.xgboost.log_model(xgb_model, "xgb_model")
        joblib.dump(xgb_model, 'models/xgb_model.pkl')
        
        # Save best (compare RMSE)
        if xgb_metrics['rmse'] < rf_metrics['rmse']:
            best_model = xgb_model
            best_name = 'xgb'
        else:
            best_model = rf_model
            best_name = 'rf'
        joblib.dump(best_model, 'models/best_model.pkl')
        print(f'Best model saved: {best_name}')
        
        mlflow.log_param('best_model', best_name)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    args = parser.parse_args()
    main(args)

