import React, { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';

function App() {
  const [features, setFeatures] = useState(Array(29).fill(20));
  const [prediction, setPrediction] = useState(null);
  const [co2, setCo2] = useState(null);
  const [scenarios, setScenarios] = useState(null);

  const handlePredict = async () => {
    try {
      const res = await axios.post('http://localhost:8000/predict', { features });
      setPrediction(res.data.predicted_consumption_kwh);
      setCo2(res.data.co2_kg);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOptimize = async () => {
    const opt_scenarios = {
      'temp_opt': [[0, -2], [2, -2]],
      'humidity_opt': [[1, -5], [3, -5]],
      'combined': [[0, -2], [1, -5]]
    };
    try {
      const res = await axios.post('http://localhost:8000/optimize', { base_features: features, scenarios: opt_scenarios });
      setScenarios(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const data = scenarios ? Object.entries(scenarios.scenarios || {}).map(([key, val]) => ({
    scenario: key,
    reduction: val.reduction_pct,
    co2_saved: val.co2_saved_kg
  })) : [];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>AI Green Impact Analyzer</h1>
      <p>Enter environmental features (temps, RH, etc.) to predict energy consumption and optimize.</p>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Predict Energy</h3>
          <label>Features (29 values):</label><br/>
          <textarea 
            value={features.join(', ')} 
            onChange={(e) => setFeatures(e.target.value.split(',').map(Number))} 
            rows={5} cols={50}
            placeholder="e.g. 20,45,20,44,... (temps, RH, etc)"
          />
          <br/>
          <button onClick={handlePredict}>Predict</button>
          {prediction && (
            <div>
              <h4>Result:</h4>
              <p>Consumption: {prediction.toFixed(2)} kWh</p>
              <p>CO2: {co2.toFixed(2)} kg</p>
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h3>Optimize</h3>
          <button onClick={handleOptimize}>Run Simulations</button>
          {data.length > 0 && (
            <div>
              <BarChart width={400} height={300} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scenario" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reduction" fill="#82ca9d" name="Reduction %" />
                <Bar dataKey="co2_saved" fill="#8884d8" name="CO2 Saved kg" />
              </BarChart>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

