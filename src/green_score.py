import numpy as np

def calculate_green_score(actual_consumption, predicted_consumption, max_consumption=1000):
    \"\"\"Calculate Green Score (0-100) based on prediction accuracy and efficiency.
    
    Score = 100 * (1 - RMSE/mean_actual) * efficiency_factor
    Efficiency based on relative to max.
    \"\"\"
    rmse = np.sqrt(np.mean((actual_consumption - predicted_consumption)**2))
    mean_actual = np.mean(actual_consumption)
    accuracy_factor = 1 - (rmse / mean_actual)
    
    # Efficiency factor: lower consumption better
    efficiency_factor = np.clip(1 - np.mean(actual_consumption) / max_consumption, 0, 1)
    
    green_score = 100 * accuracy_factor * efficiency_factor
    return np.clip(green_score, 0, 100)

def estimate_co2(consumption_kwh, emission_factor=0.5):
    \"\"\"Estimate CO2 emissions kg per kWh (average grid factor).\"\"\"
    return consumption_kwh * emission_factor

def calculate_optimization_potential(pred_consumption, optimized_pred):
    \"\"\"% reduction in consumption.\"\"\"
    return (pred_consumption - optimized_pred) / pred_consumption * 100

if __name__ == '__main__':
    # Example
    actual = np.array([20, 30, 25])
    pred = np.array([22, 28, 24])
    score = calculate_green_score(actual, pred)
    co2 = estimate_co2(np.mean(actual))
    print(f'Green Score: {score:.2f}')
    print(f'CO2: {co2:.2f} kg')
