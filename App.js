import React, { useState } from "react";
import ModelViewer from "./ModelViewer";
import ConfigPanel from "./ConfigPanel";
import Datasheet from "./Datasheet";

export default function App() {
  const [config, setConfig] = useState({
    length: 1,
    diameter: 1,
    processConnection: "none",
  });

  return (
    <div className="app">
      <div className="viewer">
        <ModelViewer config={config} />
      </div>

      <div className="panel">
        <ConfigPanel config={config} setConfig={setConfig} />
        <Datasheet config={config} />
      </div>
    </div>
  );
}