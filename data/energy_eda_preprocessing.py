"""
Energy Consumption Dataset - EDA, Preprocessing & Feature Engineering
=======================================================================
This script performs comprehensive data analysis, preprocessing, 
and feature engineering on the energy consumption dataset.
"""

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

# =============================================================================
# 1. DATA LOADING
# =============================================================================
print("=" * 70)
print("1. DATA LOADING")
print("=" * 70)

# Load the dataset
data_path = r"C:\SDIA A 2\python\energydata_complete.csv"
df = pd.read_csv(data_path)

print(f"\nDataset Shape: {df.shape}")
print(f"Number of Rows: {df.shape[0]}")
print(f"Number of Columns: {df.shape[1]}")
print(f"\nColumn Names:\n{df.columns.tolist()}")

# =============================================================================
# 2. BASIC DATA INFO
# =============================================================================
print("\n" + "=" * 70)
print("2. BASIC DATA INFO")
print("=" * 70)

print("\n--- Data Types ---")
print(df.dtypes)

print("\n--- First 5 Rows ---")
print(df.head())

print("\n--- Dataset Info ---")
print(df.info())

# =============================================================================
# 3. DATA CLEANING
# =============================================================================
print("\n" + "=" * 70)
print("3. DATA CLEANING")
print("=" * 70)

# Check for missing values
print("\n--- Missing Values ---")
missing = df.isnull().sum()
missing_pct = (missing / len(df)) * 100
missing_df = pd.DataFrame({'Missing Count': missing, 'Missing %': missing_pct})
print(missing_df[missing_df['Missing Count'] > 0])
if missing_df['Missing Count'].sum() == 0:
    print("No missing values found!")

# Check for duplicates
print("\n--- Duplicate Rows ---")
duplicates = df.duplicated().sum()
print(f"Number of duplicate rows: {duplicates}")
if duplicates > 0:
    df = df.drop_duplicates()
    print(f"Duplicates removed. New shape: {df.shape}")
else:
    print("No duplicate rows found.")

# =============================================================================
# 4. STATISTICAL ANALYSIS
# =============================================================================
print("\n" + "=" * 70)
print("4. STATISTICAL ANALYSIS")
print("=" * 70)

print("\n--- Descriptive Statistics ---")
print(df.describe())

print("\n--- Numerical Features Summary ---")
numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
print(f"Number of numerical columns: {len(numerical_cols)}")

print("\n--- Target Variable (Appliances) Statistics ---")
print(f"Mean: {df['Appliances'].mean():.2f}")
print(f"Median: {df['Appliances'].median():.2f}")
print(f"Std: {df['Appliances'].std():.2f}")
print(f"Min: {df['Appliances'].min()}")
print(f"Max: {df['Appliances'].max()}")
print(f"25%: {df['Appliances'].quantile(0.25):.2f}")
print(f"75%: {df['Appliances'].quantile(0.75):.2f}")

# =============================================================================
# 5. FEATURE ENGINEERING
# =============================================================================
print("\n" + "=" * 70)
print("5. FEATURE ENGINEERING")
print("=" * 70)

# Convert date to datetime
df['date'] = pd.to_datetime(df['date'])

# 5.1 Time-based features
print("\n--- 5.1 Time-based Features ---")
df['hour'] = df['date'].dt.hour
df['day'] = df['date'].dt.day
df['month'] = df['date'].dt.month
df['dayofweek'] = df['date'].dt.dayofweek
df['weekofyear'] = df['date'].dt.isocalendar().week.astype(int)
df['is_weekend'] = (df['dayofweek'] >= 5).astype(int)

# Time of day categories
def get_time_period(hour):
    if 6 <= hour < 12:
        return 'morning'
    elif 12 <= hour < 18:
        return 'afternoon'
    elif 18 <= hour < 22:
        return 'evening'
    else:
        return 'night'

df['time_period'] = df['hour'].apply(get_time_period)

# Create hour categories for encoding
df['hour_category'] = pd.cut(df['hour'], 
                               bins=[0, 6, 12, 18, 24], 
                               labels=['night', 'morning', 'afternoon', 'evening'],
                               include_lowest=True)

print(f"Created time features: hour, day, month, dayofweek, weekofyear, is_weekend, time_period, hour_category")

# 5.2 Temperature features
print("\n--- 5.2 Temperature Features ---")
temp_cols = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9']

# Average temperature across all sensors
df['avg_temp'] = df[temp_cols].mean(axis=1)

# Temperature spread (max - min)
df['temp_spread'] = df[temp_cols].max(axis=1) - df[temp_cols].min(axis=1)

# Temperature standard deviation
df['temp_std'] = df[temp_cols].std(axis=1)

# Temperature differences between rooms
df['temp_diff_1_2'] = df['T1'] - df['T2']
df['temp_diff_3_4'] = df['T3'] - df['T4']
df['temp_diff_5_6'] = df['T5'] - df['T6']
df['temp_diff_7_8'] = df['T7'] - df['T8']

# Indoor vs outdoor temperature difference
df['indoor_outdoor_temp_diff'] = df['avg_temp'] - df['T_out']

print(f"Created temperature features: avg_temp, temp_spread, temp_std, temp_diff_*, indoor_outdoor_temp_diff")

# 5.3 Humidity features
print("\n--- 5.3 Humidity Features ---")
humidity_cols = ['RH_1', 'RH_2', 'RH_3', 'RH_4', 'RH_5', 'RH_6', 'RH_7', 'RH_8', 'RH_9']

# Average humidity
df['avg_humidity'] = df[humidity_cols].mean(axis=1)

# Humidity spread
df['humidity_spread'] = df[humidity_cols].max(axis=1) - df[humidity_cols].min(axis=1)

# Humidity standard deviation
df['humidity_std'] = df[humidity_cols].std(axis=1)

# Indoor vs outdoor humidity
df['indoor_outdoor_humidity_diff'] = df['avg_humidity'] - df['RH_out']

print(f"Created humidity features: avg_humidity, humidity_spread, humidity_std, indoor_outdoor_humidity_diff")

# 5.4 Energy consumption features
print("\n--- 5.4 Energy Consumption Features ---")

# Total energy (appliances + lights)
df['total_energy'] = df['Appliances'] + df['lights']

# Energy ratio
df['energy_ratio'] = df['lights'] / (df['Appliances'] + 1)  # Add 1 to avoid division by zero

# Log transformation of Appliances
df['log_appliances'] = np.log1p(df['Appliances'])

print(f"Created energy features: total_energy, energy_ratio, log_appliances")

# 5.5 Weather features
print("\n--- 5.5 Weather Features ---")

# Wind chill factor (simplified)
df['wind_chill'] = 13.12 + 0.6215 * df['T_out'] - 11.37 * (df['Windspeed'] ** 0.16) + 0.3965 * df['T_out'] * (df['Windspeed'] ** 0.16)

# Visibility categories
df['low_visibility'] = (df['Visibility'] < 40).astype(int)

# Pressure categories
df['high_pressure'] = (df['Press_mm_hg'] > df['Press_mm_hg'].median()).astype(int)

print(f"Created weather features: wind_chill, low_visibility, high_pressure")

# 5.6 Interaction features
print("\n--- 5.6 Interaction Features ---")

# Temperature-Humidity interaction
df['temp_humidity_interaction'] = df['avg_temp'] * df['avg_humidity']

# Hour-Temperature interaction
df['hour_temp_interaction'] = df['hour'] * df['avg_temp']

# Hour-Humidity interaction
df['hour_humidity_interaction'] = df['hour'] * df['avg_humidity']

# Weekend-Energy interaction
df['weekend_energy'] = df['is_weekend'] * df['Appliances']

print(f"Created interaction features: temp_humidity_interaction, hour_temp_interaction, hour_humidity_interaction, weekend_energy")

# 5.7 Lag features (for time series)
print("\n--- 5.7 Lag Features ---")
# Previous hour appliances consumption
df['appliances_lag_1'] = df['Appliances'].shift(1)
df['appliances_lag_2'] = df['Appliances'].shift(2)

# Rolling statistics
df['appliances_rolling_mean_3'] = df['Appliances'].rolling(window=3).mean()
df['appliances_rolling_std_3'] = df['Appliances'].rolling(window=3).std()

print(f"Created lag features: appliances_lag_1, appliances_lag_2, appliances_rolling_mean_3, appliances_rolling_std_3")

# 5.8 Random Variable features (rv1, rv2)
print("\n--- 5.8 Random Variable Features ---")
df['rv1_rv2_diff'] = abs(df['rv1'] - df['rv2'])
df['rv1_rv2_ratio'] = df['rv1'] / (df['rv2'] + 1)

print(f"Created RV features: rv1_rv2_diff, rv1_rv2_ratio")

# =============================================================================
# 6. ENCODE CATEGORICAL VARIABLES
# =============================================================================
print("\n" + "=" * 70)
print("6. ENCODING CATEGORICAL VARIABLES")
print("=" * 70)

# One-hot encode time_period
df = pd.get_dummies(df, columns=['time_period'], prefix='period')

# One-hot encode hour_category
df = pd.get_dummies(df, columns=['hour_category'], prefix='hour_cat')

print("Encoded categorical variables: time_period, hour_category")

# =============================================================================
# 7. FINAL DATASET SUMMARY
# =============================================================================
print("\n" + "=" * 70)
print("7. FINAL DATASET SUMMARY")
print("=" * 70)

print(f"\nFinal Dataset Shape: {df.shape}")
print(f"\nNew Features Added: {df.shape[1] - 29} (original had 29 columns)")

print("\n--- New Columns ---")
original_cols = ['date', 'Appliances', 'lights', 'T1', 'RH_1', 'T2', 'RH_2', 'T3', 'RH_3', 
                 'T4', 'RH_4', 'T5', 'RH_5', 'T6', 'RH_6', 'T7', 'RH_7', 'T8', 'RH_8', 
                 'T9', 'RH_9', 'T_out', 'Press_mm_hg', 'RH_out', 'Windspeed', 
                 'Visibility', 'Tdewpoint', 'rv1', 'rv2']
new_cols = [col for col in df.columns if col not in original_cols]
print(new_cols)

print("\n--- Data Types After Feature Engineering ---")
print(df.dtypes)

# =============================================================================
# 8. SAVE PROCESSED DATA
# =============================================================================
print("\n" + "=" * 70)
print("8. SAVING PROCESSED DATA")
print("=" * 70)

# Save to CSV
output_path = r"C:\SDIA A 2\python\energydata_processed.csv"
df.to_csv(output_path, index=False)
print(f"\nProcessed data saved to: {output_path}")

# =============================================================================
# 9. CORRELATION ANALYSIS
# =============================================================================
print("\n" + "=" * 70)
print("9. CORRELATION ANALYSIS")
print("=" * 70)

# Select only numeric columns for correlation
numeric_df = df.select_dtypes(include=[np.number])

# Correlation with target (Appliances)
print("\n--- Top 15 Features Correlated with Appliances ---")
corr_with_target = numeric_df.corr()['Appliances'].drop('Appliances').sort_values(ascending=False)
print(corr_with_target.head(15))

print("\n--- Bottom 5 Features Correlated with Appliances ---")
print(corr_with_target.tail(5))

# Save correlation results
corr_df = pd.DataFrame(corr_with_target)
corr_df.to_csv(r"C:\SDIA A 2\python\correlation_with_appliances.csv")
print("\nCorrelation results saved to: correlation_with_appliances.csv")

# =============================================================================
# 10. FINAL REPORT
# =============================================================================
print("\n" + "=" * 70)
print("10. FINAL SUMMARY REPORT")
print("=" * 70)

print(f"""
Dataset Processing Complete!
============================

Original Shape: {df.shape[0]} rows × 29 columns
Final Shape: {df.shape[0]} rows × {df.shape[1]} columns

New Features Created:
- Time-based: hour, day, month, dayofweek, weekofyear, is_weekend, time_period, hour_category
- Temperature: avg_temp, temp_spread, temp_std, temp_diff_*, indoor_outdoor_temp_diff
- Humidity: avg_humidity, humidity_spread, humidity_std, indoor_outdoor_humidity_diff
- Energy: total_energy, energy_ratio, log_appliances
- Weather: wind_chill, low_visibility, high_pressure
- Interaction: temp_humidity_interaction, hour_temp_interaction, hour_humidity_interaction, weekend_energy
- Lag: appliances_lag_1, appliances_lag_2, appliances_rolling_mean_3, appliances_rolling_std_3
- Random Variables: rv1_rv2_diff, rv1_rv2_ratio

Files Saved:
- Processed data: energydata_processed.csv
- Correlation analysis: correlation_with_appliances.csv
""")

print("=" * 70)
print("SCRIPT COMPLETED SUCCESSFULLY!")
print("=" * 70)
