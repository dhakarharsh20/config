import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Thermocouple({ config }) {
  const { scene } = useGLTF("/model.glb");
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    ref.current.scale.y = config.length;
    ref.current.scale.x = config.diameter;
    ref.current.scale.z = config.diameter;
  }, [config]);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.002;
  });

  return <primitive ref={ref} object={scene} />;
}

function ProcessConnection({ type }) {
  if (type === "none") return null;

  let geometry;

  if (type === "flange") {
    geometry = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 32);
  } else if (type === "threaded") {
    geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
  }

  const material = new THREE.MeshStandardMaterial({ color: "#999" });

  return (
    <mesh geometry={geometry} material={material} position={[0, -2, 0]} />
  );
}

export default function ModelViewer({ config }) {
  return (
    <Canvas camera={{ position: [5, 5, 10] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <Thermocouple config={config} />
      <ProcessConnection type={config.processConnection} />
      <OrbitControls />
    </Canvas>
  );
}