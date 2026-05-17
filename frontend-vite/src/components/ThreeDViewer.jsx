import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';

function ToothPlaceholder({ position, color, label }) {
  const meshRef = useRef();

  // Simple rotation animation
  useFrame(() => {
    meshRef.current.rotation.y += 0.005;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        {/* Using a rounded box or cylinder to represent a tooth structure */}
        <cylinderGeometry args={[1, 0.8, 3, 32]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
      </mesh>
      <Text position={[0, 2, 0]} fontSize={0.5} color="white">
        {label}
      </Text>
    </group>
  );
}

export default function ThreeDViewer() {
  return (
    <div className="glass-panel" style={{ width: '100%', height: '500px', position: 'relative' }}>
      <h3 style={{ position: 'absolute', top: '10px', left: '20px', zIndex: 10 }}>Interactive 3D Structure View</h3>
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        
        {/* Placeholder Tooth Models */}
        <ToothPlaceholder position={[-2, 0, 0]} color="#f1f5f9" label="Incisor" />
        <ToothPlaceholder position={[2, 0, 0]} color="#e2e8f0" label="Molar" />

        <OrbitControls enableZoom={true} enablePan={true} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
