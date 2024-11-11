import React, { useState } from "react";

function DynamicParams({ columns, applyParams }) {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [metric, setMetric] = useState("average");

  const handleColumnChange = (col) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((item) => item !== col) : [...prev, col]
    );
  };

  const handleApply = () => {
    applyParams({ selectedColumns, metric });
  };

  return (
    <div>
      <h2>Parámetros Dinámicos</h2>
      <div>
        <h3>Seleccionar Columnas:</h3>
        {columns.map((col) => (
          <label key={col}>
            <input
              type="checkbox"
              checked={selectedColumns.includes(col)}
              onChange={() => handleColumnChange(col)}
            />
            {col}
          </label>
        ))}
      </div>
      <div>
        <h3>Métrica:</h3>
        <select value={metric} onChange={(e) => setMetric(e.target.value)}>
          <option value="average">Promedio</option>
          <option value="min">Mínimo</option>
          <option value="max">Máximo</option>
        </select>
      </div>
      <button onClick={handleApply}>Aplicar Parámetros</button>
    </div>
  );
}

export default DynamicParams;
