import React, { useState, useEffect, useCallback } from "react";
import { Scatter, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Zoom
} from "chart.js";
import zoomPlugin from 'chartjs-plugin-zoom';
import * as tf from "@tensorflow/tfjs";

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, PointElement, LineElement, Tooltip, Legend, zoomPlugin);

function Graphs({ data }) {
  const [predictedData, setPredictedData] = useState([]);
  const [regressionValues, setRegressionValues] = useState([]);

  const trainModel = useCallback(async () => {
    console.log('trainModel')
    console.log('data',data)
    const inputs = data
      .map((item) => [parseFloat(item["Year"]), parseFloat(item["Month"]), parseFloat(item["Day"]), parseFloat(item["p_ens"])])
      .filter((input) => input.every((value) => !isNaN(value)));
      console.log('trainModel_inputs',inputs)
    const outputs = data.map((item) => parseFloat(item["Streamflow"])).filter((y) => !isNaN(y));
    console.log('trainModel_outputs',outputs)
    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = tf.tensor1d(outputs);
    console.log('trainModel_inputTensor',inputTensor)
    console.log('trainModel_outputTensor',outputTensor)

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [4] }));
    console.log('trainModel_model',model)
    model.compile({
      optimizer: tf.train.sgd(0.01),
      loss: "meanSquaredError",
    });
    console.log('trainModel_compilado')
    await model.fit(inputTensor, outputTensor, { epochs: 100 });
    console.log('trainModel_fitProcessComplete')
    const predictedYs = model.predict(inputTensor);
    const predictedValues = await predictedYs.array();
    console.log('trainModel_predictedYs',predictedYs)
    console.log('trainModel_predictedValues',predictedValues)

    // Asegurar que los valores predichos se correspondan con el índice de tiempo
    setPredictedData(predictedValues.map((y, i) => ({ x: i, y })));
    setPredictedDataf(predictedValues.map((y, i) => ({ x: i, y })));

    inputTensor.dispose();
    outputTensor.dispose();
    predictedYs.dispose();
  }, [data]);

  useEffect(() => {
    console.log('train model useffect')
    trainModel();
  }, [trainModel]);

  // Calcular la regresión lineal una vez y almacenarla en `regressionValues`
  useEffect(() => {
    console.log('general useffect')
    const scatterPoints = data
      .map((item) => ({
        x: parseFloat(item["p_ens"]),
        y: parseFloat(item["Streamflow"]),
      }))
      .filter((point) => !isNaN(point.x) && !isNaN(point.y));

    const { slope, intercept } = calculateLinearRegression(scatterPoints);

    const values = scatterPoints.map((point, i) => ({
      x: i,
      y: slope * point.x + intercept,
    }));

    setRegressionValues(values);
  }, [data]);

  const setPredictedDataf =(data)=>{
    console.log('IA predicted data',data)
  }

  const prepareScatterData = () => ({
    datasets: [
      {
        label: "Relación Lluvia vs Escurrimiento",
        data: data
          .map((item) => ({
            x: parseFloat(item["p_ens"]),
            y: parseFloat(item["Streamflow"]),
          }))
          .filter((point) => !isNaN(point.x) && !isNaN(point.y)),
        backgroundColor: "rgba(75, 192, 192, 1)",
      },
    ],
  });

  const prepareRegressionData = () => {
    const scatterPoints = data
      .map((item) => ({
        x: parseFloat(item["p_ens"]),
        y: parseFloat(item["Streamflow"]),
      }))
      .filter((point) => !isNaN(point.x) && !isNaN(point.y));

    const { slope, intercept } = calculateLinearRegression(scatterPoints);

    const regressionLine = [
      { x: Math.min(...scatterPoints.map((p) => p.x)), y: slope * Math.min(...scatterPoints.map((p) => p.x)) + intercept },
      { x: Math.max(...scatterPoints.map((p) => p.x)), y: slope * Math.max(...scatterPoints.map((p) => p.x)) + intercept },
    ];

    const regressionScatterPoints = scatterPoints.map((point) => ({
      x: point.x,
      y: slope * point.x + intercept,
    }));

    return {
      datasets: [
        {
          label: "Línea de Regresión",
          data: regressionLine,
          type: "line",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
        },
        {
          label: "Puntos Calculados por Regresión",
          data: regressionScatterPoints,
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          pointRadius: 5,
          type: "scatter",
        },
      ],
    };
  };

  const calculateLinearRegression = (points) => {
    const n = points.length;
    const sumX = points.reduce((acc, point) => acc + point.x, 0);
    const sumY = points.reduce((acc, point) => acc + point.y, 0);
    const sumXY = points.reduce((acc, point) => acc + point.x * point.y, 0);
    const sumX2 = points.reduce((acc, point) => acc + point.x * point.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  const prepareAIPredictionData = () => ({
    datasets: [
      {
        label: "Datos Originales",
        data: data
          .map((item) => ({
            x: parseFloat(item["p_ens"]),
            y: parseFloat(item["Streamflow"]),
          }))
          .filter((point) => !isNaN(point.x) && !isNaN(point.y)),
        backgroundColor: "rgba(75, 192, 192, 1)",
      },
      {
        label: "Predicción con IA",
        data: predictedData,
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "rgba(54, 162, 235, 0.8)",
        type: "line",
        fill: false,
        pointRadius: 0,
      },
    ],
  });

  const prepareComparisonData = () => {
    const observedData = data
      .map((item, i) => ({
        x: i,
        y: parseFloat(item["Streamflow"]),
      }))
      .filter((point) => !isNaN(point.y));

    return {
      datasets: [
        {
          label: "Datos Observados",
          data: observedData,
          borderColor: "rgba(0, 0, 0, 0.8)",
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
          type: "line",
        },
        {
          label: "Predicción Regresión Lineal",
          data: regressionValues,
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
          type: "line",
        },
        {
          label: "Predicción con IA",
          data: predictedData,
          borderColor: "rgba(54, 162, 235, 0.8)",
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
          type: "line",
        },
      ],
    };
  };

  const linearOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Índice de Tiempo (horas)" },
      },
      y: {
        type: "linear",
        title: { display: true, text: "Escurrimiento (m³/s)" },
      },
    },
  };

  const logOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        title: { display: true, text: "Índice de Tiempo (horas)" },
        min: 0,
        suggestedMax: predictedData.length,
      },
      y: {
        type: "logarithmic",
        title: { display: true, text: "Escurrimiento (m³/s)" },
        min: 1,
      },
    },
  };

  return (
    <div>
      <h2>Gráfica de Relación</h2>
      <Scatter data={prepareScatterData()} options={linearOptions} />

      <h2>Gráfica de Regresión Lineal con Puntos Calculados</h2>
      <Scatter data={prepareRegressionData()} options={logOptions} />

      <h2>Gráfica de Predicción con IA</h2>
      <Scatter data={prepareAIPredictionData()} options={linearOptions} />

      <h2>Gráfica Comparativa de Predicciones y Datos Observados</h2>
      <Line data={prepareComparisonData()} options={logOptions} />
    </div>
  );
}

export default Graphs;
