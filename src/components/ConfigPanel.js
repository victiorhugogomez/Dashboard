import React from "react";

function downloadCSV(data) {
  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(","));

  data.forEach((row) => {
    const values = headers.map((header) => row[header]);
    csvRows.push(values.join(","));
  });

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "datos_procesados.csv";
  link.click();
}

function ConfigPanel({ data }) {
  const handleExportWithStats = () => {
    if (data && data.length > 0) {
      downloadCSV(data);
    } else {
      alert("No hay datos para exportar.");
    }
  };

  return (
    <div>
      <h2>Configuración Avanzada</h2>
      <button onClick={handleExportWithStats}>Descargar Datos con Estadísticas</button>
    </div>
  );
}

export default ConfigPanel;
