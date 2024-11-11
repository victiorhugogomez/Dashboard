import React from "react";

function Statistics({ data, params }) { // si funciona
  const { selectedColumns, metric } = params;
  let stats;

  // Función para calcular métricas básicas (promedio, mínimo, máximo)
// Función para limpiar los datos
function cleanData(data) {
  return data.map(entry => ({
    ...entry,
    Lluvia: parseFloat(entry["Lluvia"]?.replace(/"/g, '')),
    Escurrimiento: parseFloat(entry["Escurrimiento"]?.replace(/"/g, ''))
  }));
}

// Función para calcular las estadísticas avanzadas
function calculateAdvancedStatistics() {
  // Limpiar los datos antes de calcular las estadísticas
  // console.log('calculateAdvancedStatistics - data', data)
  const cleanedData = cleanData(data);
  // console.log('calculateAdvancedStatistics - cleanedData', cleanedData);

  const rain = cleanedData.map((item) => item.p_ens).filter((v) => !isNaN(v));
  const runoff = cleanedData.map((item) => item.Streamflow).filter((v) => !isNaN(v));

  // console.log('rain', rain);
  // console.log('runoff', runoff);

  if (rain.length === 0 || runoff.length === 0) {
    return {
      correlation: "No disponible",
      slope: "No disponible",
      intercept: "No disponible",
      rSquared: "No disponible",
      stdDevRain: "No disponible",
      stdDevRunoff: "No disponible"
    };
  }

  // Calcular promedios
  const avgRain = rain.reduce((a, b) => a + b, 0) / rain.length;
  const avgRunoff = runoff.reduce((a, b) => a + b, 0) / runoff.length;

  // Calcular desviación estándar
  const stdDevRain = Math.sqrt(rain.reduce((sum, x) => sum + Math.pow(x - avgRain, 2), 0) / rain.length);
  const stdDevRunoff = Math.sqrt(runoff.reduce((sum, x) => sum + Math.pow(x - avgRunoff, 2), 0) / runoff.length);

  // Calcular covarianza
  const covariance = rain.reduce((sum, x, i) => sum + (x - avgRain) * (runoff[i] - avgRunoff), 0) / rain.length;

  // Calcular correlación de Pearson
  const correlation = covariance / (stdDevRain * stdDevRunoff);

  // Regresión lineal: y = mx + b
  const slope = covariance / Math.pow(stdDevRain, 2);
  const intercept = avgRunoff - slope * avgRain;

  // Calcular R² (coeficiente de determinación)
  const rSquared = Math.pow(correlation, 2);

  return {
    correlation: correlation.toFixed(2),
    slope: slope.toFixed(2),
    intercept: intercept.toFixed(2),
    rSquared: rSquared.toFixed(2),
    stdDevRain: stdDevRain.toFixed(2),
    stdDevRunoff: stdDevRunoff.toFixed(2)
  };
}

// Ejemplo de uso en tu función principal
const calculateMetric = (key) => {
  // console.log('promedios....................................');
  const values = data
    .map((item) => parseFloat(item[key]))
    .filter((value) => !isNaN(value));

  if (values.length === 0) return "No disponible";

  if (metric === "min") return Math.min(...values).toFixed(2);
  if (metric === "max") return Math.max(...values).toFixed(2);

  stats = calculateAdvancedStatistics();
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2); // Promedio por defecto
};

  // const stats = calculateAdvancedStatistics();

  return (
    <div>
      <h2>Estadísticas</h2>
      {selectedColumns.length === 0 ? (
        <p>Selecciona al menos una columna para ver las estadísticas.</p>
      ) : (
        selectedColumns.map((col) => (
          <div key={col}>
            <h3>{col}</h3>
            <p>
              {metric.charAt(0).toUpperCase() + metric.slice(1)}:{" "}
              {calculateMetric(col)}
            </p>
          </div>
        ))
      )}

<h2>Estadísticas Avanzadas de Lluvia y Escurrimiento</h2>
  <p>Correlación de Pearson: {stats?.correlation ?? ''}</p>
  <p>Pendiente (Slope): {stats?.slope ?? ''}</p>
  <p>Ordenada al Origen (Intercept): {stats?.intercept ?? ''}</p>
  <p>Coeficiente de Determinación (R²): {stats?.rSquared ?? ''}</p>
  <p>Desviación Estándar de Lluvia: {stats?.stdDevRain ?? ''}</p>
  <p>Desviación Estándar de Escurrimiento: {stats?.stdDevRunoff ?? ''}</p>
    </div>
  );
}

export default Statistics;
