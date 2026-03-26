import React from "react";

export default function Datasheet({ config }) {
  const downloadImage = () => {
    const canvas = document.querySelector("canvas");
    const link = document.createElement("a");
    link.download = "model.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="datasheet">
      <h3>Technical Datasheet</h3>
      <p><b>Length:</b> {config.length}x</p>
      <p><b>Diameter:</b> {config.diameter}x</p>
      <p><b>Process Connection:</b> {config.processConnection}</p>

      <button onClick={downloadImage}>Download Image</button>
    </div>
  );
}