import pandas as pd
import numpy as np
import argparse
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os

def load_data(file_path):
    df = pd.read_csv(file_path)
    print(f'Data loaded: {df.shape}')
    print(f'Missing: {df.isnull().sum().sum()}, Duplicates: {df.duplicated().sum()}')
    return df

def clean_data(df):
    print(f'Cleaning: duplicates={df.duplicated().sum()}, missing={df.isnull().sum().sum()}')
    df = df.drop_duplicates()
    df = df.dropna()
    # Outlier removal using IQR for target
    Q1 = df['Appliances'].quantile(0.25)
    Q3 = df['Appliances'].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    initial = len(df)
    df = df[(df['Appliances'] >= lower) & (df['Appliances'] <= upper)]
    print(f'After cleaning/outliers: {df.shape} (removed {initial-len(df)})')
    return df

def feature_engineering(df):
    print('Original columns:', df.columns.tolist())
    # Extract time features from NSM (minutes since midnight)
    if 'NSM' in df.columns:
        df['hour'] = (df['NSM'] // 60).astype(int)
    else:
        print("NSM column not found, skipping hour feature")
        df['hour'] = 0
    if 'Day_of_week' in df.columns:
        df['day_of_week'] = df['Day_of_week']
    else:
        print("Day_of_week column not found, skipping")
        df['day_of_week'] = 0
    if 'Week' in df.columns:
        df['week'] = df['Week']
    else:
        print("Week column not found, skipping month feature")
        df['month'] = 1
        df['week'] = 1
    # Month: approximate from week (data ~20 weeks, 5 months)
    df['month'] = np.clip(((df['week'] - 1) // 4) + 1, 1, 12).astype(int)
# Month: approximate from week (data ~20 weeks, 5 months)
    if 'Week' in df.columns:
        df['month'] = np.clip(((df['Week'] - 1) // 4) + 1, 1, 12).astype(int)
    else:
        print("Week column not found, setting default month")
        df['month'] = 1
    
    # Mean temp (average of kitchen, living, etc.)
    temp_cols = [col for col in df.columns if col.startswith('T')]
    df['mean_temp'] = df[temp_cols].mean(axis=1)
    
    # Temp delta (outside vs inside)
    df['delta_temp'] = df['T1'] - df['T_out']
    
    # Select features (drop NSM, lights, rv1 rv2 if present)
    feature_cols = ['T1', 'RH_1', 'T2', 'RH_2', 'T3', 'RH_3', 'T4', 'RH_4', 
                    'T5', 'RH_5', 'T6', 'RH_6', 'T7', 'RH_7', 'T8', 'RH_8', 
                    'T9', 'RH_9', 'T_out', 'Press_mm_hg', 'RH_out', 'Windspeed', 
                    'Visibility', 'Tdew', 'hour', 'day_of_week', 'month', 
                    'mean_temp', 'delta_temp']
    
    available_cols = [col for col in feature_cols if col in df.columns]
    df = df[available_cols + ['Appliances']]
    print(f'After feature eng (5 new): {df.shape}, used cols: {available_cols}')
    return df, available_cols

def scale_data(df, feature_cols):
    scaler = StandardScaler()
    X = df[feature_cols]
    y = df['Appliances']
    X_scaled = scaler.fit_transform(X)
    joblib.dump(scaler, 'models/scaler.pkl')
    print('Scaler saved')
    return X_scaled, y, scaler

def main(args):
    os.makedirs('data/processed', exist_ok=True)
    df = load_data('data/energydata_complete.csv')
    df = clean_data(df)
    df, feature_cols = feature_engineering(df)
    df.to_csv('data/processed/energydata_processed.csv', index=False)
    X, y, scaler = scale_data(df, feature_cols)
    print('Preprocessing complete. X shape:', X.shape)
    train_X, test_X, train_y, test_y = train_test_split(X, y, test_size=0.2, random_state=42)
    np.save('data/processed/train_X.npy', train_X)
    np.save('data/processed/train_y.npy', train_y)
    np.save('data/processed/test_X.npy', test_X)
    np.save('data/processed/test_y.npy', test_y)
    print('Data split and saved')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', default='data/energydata_complete.csv')
    parser.add_argument('--output', default='data/processed/energydata_processed.csv')
    args = parser.parse_args()
    main(args)

