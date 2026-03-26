import React from "react";

export default function ConfigPanel({ config, setConfig }) {
  return (
    <div className="config">
      <h3>Configurator</h3>

      <label>Length</label>
      <input
        type="range"
        min="0.5"
        max="3"
        step="0.1"
        value={config.length}
        onChange={(e) =>
          setConfig({ ...config, length: parseFloat(e.target.value) })
        }
      />

      <label>Diameter</label>
      <input
        type="range"
        min="0.5"
        max="2"
        step="0.1"
        value={config.diameter}
        onChange={(e) =>
          setConfig({ ...config, diameter: parseFloat(e.target.value) })
        }
      />

      <label>Process Connection</label>
      <select
        value={config.processConnection}
        onChange={(e) =>
          setConfig({ ...config, processConnection: e.target.value })
        }
      >
        <option value="none">None</option>
        <option value="threaded">Threaded</option>
        <option value="flange">Flange</option>
      </select>
    </div>
  );
}