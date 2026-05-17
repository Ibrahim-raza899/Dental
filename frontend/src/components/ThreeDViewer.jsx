'use client';
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Html } from '@react-three/drei';

function InteractiveTooth({ position, color, label, details }) {
  const meshRef = useRef();

  useFrame(() => {
    meshRef.current.rotation.y += 0.002;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <cylinderGeometry args={[1, 0.8, 3, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      
      <Html position={[0, 2.5, 0]} center className="pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded-full text-xs whitespace-nowrap border border-white/20">
          {label}
        </div>
      </Html>
    </group>
  );
}

export default function ThreeDViewer() {
  return (
    <div className="w-full h-[500px] relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50">
      <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
        <h3 className="font-bold text-white">Interactive Pathology Viewer</h3>
        <p className="text-xs text-slate-300">Drag to rotate • Scroll to zoom</p>
      </div>
      
      <Canvas camera={{ position: [0, 2, 12], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
        
        <InteractiveTooth position={[-3, 0, 0]} color="#f8fafc" label="Healthy Incisor" />
        <InteractiveTooth position={[3, 0, 0]} color="#ef4444" label="Ameloblastoma Lesion" />

        <OrbitControls enableZoom={true} enablePan={true} autoRotate={false} />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
