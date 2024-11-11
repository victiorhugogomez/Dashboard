import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import Statistics from "./components/Statistics";
import Graphs from "./components/Graphs";
import ConfigPanel from "./components/ConfigPanel";
import DynamicParams from "./components/DynamicParams";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [params, setParams] = useState({ selectedColumns: [], metric: "average" });

  return (
    <div className="App">
      {/* <header className="App-header">
       */}
      <header>
        <h1>Herramienta de Análisis de Lluvia y Escurrimiento</h1>
      </header>
      <main>
        <FileUpload setData={setData} />
        {data && (
          <>
            <DynamicParams
              columns={Object.keys(data[0])}
              applyParams={setParams}
            />
            <Statistics data={data} params={params} />
            <Graphs data={data} />
          </>
        )}
        <ConfigPanel data={data} />
      </main>
    </div>
  );
}

export default App;
