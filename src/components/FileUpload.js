import React, { useState } from "react";

function FileUpload({ setData }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        let text = e.target.result;
        // console.log("Original text:", text);
  
        // Reemplaza las comas decimales con puntos solo en las columnas de Streamflow y p_ens
        // y elimina las comillas dobles de esos valores
        text = text.replace(/"(\d+),(\d+)"/g, (_, intPart, decimalPart) => `${intPart}.${decimalPart}`);
        // console.log("Text after cleaning Streamflow and p_ens:", text);
  
        const rows = text.split("\n").map((row) => row.split(",").map(cell => cell.trim())); // Agrega .trim() aquí
        const [headers, ...data] = rows;
        // console.log("Original data:", data);
        let formattedData = data.map((row) =>
          headers.reduce((acc, header, idx) => {
            let value = row[idx];
  
            // Verifica si la columna es "Streamflow" o "p_ens" para procesarla como flotante
            if (header === "Streamflow" || header === "p_ens") {
              // Convierte a flotante
              acc[header] = parseFloat(value);
            } else {
              // Para las demás columnas, convierte a número si es posible, sino, deja como está
              acc[header] = isNaN(value) ? value : parseFloat(value);
            }
  
            return acc;
          }, {})
        );
        // console.log("formattedData:", formattedData);
        // Filtrar por rango de fechas
        if (startDate && endDate) {
          formattedData = formattedData.filter((item) => {
            const date = new Date(item["Year"], item["Month"] - 1, item["Day"]);
            return date >= new Date(startDate) && date <= new Date(endDate);
          });
        }
  
        setData(formattedData);
      };
      reader.readAsText(file);
    }
  };
  
  

  return (
    <div>
      <h2>Subir Archivo</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <div>
        <label>
          Fecha de Inicio:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          Fecha de Fin:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

export default FileUpload;
