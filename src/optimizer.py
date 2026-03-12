import numpy as np
import joblib
from .green_score import calculate_optimization_potential, estimate_co2

class GreenOptimizer:
    def __init__(self, model_path='../models/best_model.pkl', scaler_path='../models/scaler.pkl'):
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
    
    def simulate_optimization(self, base_features_scaled, scenarios):
        \"\"\"Simulate scenarios: e.g., reduce temp by 2C, humidity -10%.
        
        scenarios: dict of {scenario_name: feature_indices_to_change, delta_values}
        \"\"\"
        results = {}
        base_pred = self.model.predict(base_features_scaled.reshape(1, -1))[0]
        
        for name, changes in scenarios.items():
            sim_features = base_features_scaled.copy()
            for idx, delta in changes:
                sim_features[idx] += delta  # e.g., lower temp = negative delta
            sim_pred = self.model.predict(sim_features.reshape(1, -1))[0]
            potential = calculate_optimization_potential(base_pred, sim_pred)
            co2_saved = estimate_co2(base_pred - sim_pred)
            results[name] = {
                'base_consumption': base_pred,
                'optimized_consumption': sim_pred,
                'reduction_pct': potential,
                'co2_saved_kg': co2_saved
            }
        return results
    
    def example_scenarios(self):
        \"\"\"Default scenarios.\"\"\"
        # Feature order from preprocessing (assume known)
        # Temp indices approx 0-6, humidity ~1,7,etc
        temp_reduce = [(0, -2.0), (2, -2.0)]  # Reduce T1, T2 by 2C (scaled)
        humidity_opt = [(1, -0.5), (3, -0.5)]  # Reduce RH by 0.5 (scaled)
        scenarios = {
            'temp_optimization': temp_reduce,
            'humidity_optimization': humidity_opt,
            'combined': temp_reduce + humidity_opt
        }
        return scenarios

# Example usage
if __name__ == '__main__':
    optimizer = GreenOptimizer()
    # Dummy base features (28 features)
    base_features = np.zeros(29)  # Adjust to actual
    scenarios = optimizer.example_scenarios()
    results = optimizer.simulate_optimization(base_features, scenarios)
    for name, res in results.items():
        print(f'{name}: {res[\"reduction_pct\"]:.1f}% reduction, CO2 saved: {res[\"co2_saved_kg\"]:.2f} kg')
