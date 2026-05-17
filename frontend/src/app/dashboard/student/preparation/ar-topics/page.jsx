'use client';
import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Environment } from '@react-three/drei';
import { Box, RotateCcw } from 'lucide-react';

// Common Label Component
const Annotation = ({ position, text, explanation }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Html position={position} className="z-10" style={{ pointerEvents: 'auto' }}>
      <div 
        className={`bg-slate-900/90 backdrop-blur-md text-white rounded-lg border shadow-xl flex flex-col transition-all cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${isOpen ? 'p-4 w-56 border-amber-500/50 shadow-amber-500/20' : 'px-3 py-1.5 whitespace-nowrap items-center border-white/20 hover:border-amber-400/50'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-amber-400' : 'bg-blue-500 animate-pulse'}`}></div>
          <span className="text-xs font-bold">{text}</span>
        </div>
        {isOpen && (
          <div className="mt-2 text-[11px] text-slate-300 whitespace-normal leading-relaxed border-t border-white/10 pt-2 text-left">
            {explanation}
          </div>
        )}
      </div>
    </Html>
  );
};

// Generic Tooth Base (used in tooth-related models)
const BaseTooth = () => (
  <group>
    <mesh position={[0, -1.2, 0]}>
      <cylinderGeometry args={[0.15, 0.08, 1.2, 16]} />
      <meshStandardMaterial color="#e8d5b0" roughness={0.4} />
    </mesh>
    <mesh position={[0.2, -1.3, 0]} rotation={[0, 0, 0.3]}>
      <cylinderGeometry args={[0.12, 0.06, 1, 16]} />
      <meshStandardMaterial color="#e8d5b0" roughness={0.4} />
    </mesh>
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.55, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
      <meshStandardMaterial color="#f5f0e8" roughness={0.2} metalness={0.1} />
    </mesh>
    <mesh position={[0, 0.25, 0]}>
      <sphereGeometry args={[0.45, 32, 32]} />
      <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.15} transparent opacity={0.9} />
    </mesh>
  </group>
);

// 1. Ameloblastoma Model
function AmeloblastomaModel() {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      <BaseTooth />
      {/* Multilocular Mass */}
      <group position={[0.4, -1.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#8b5cf6" transparent opacity={0.6} emissive="#8b5cf6" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0.3, 0.2, 0.2]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#7c3aed" transparent opacity={0.6} emissive="#7c3aed" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[-0.2, -0.3, -0.2]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color="#9333ea" transparent opacity={0.6} emissive="#9333ea" emissiveIntensity={0.2} />
        </mesh>
      </group>
      
      <Annotation position={[0, 0.8, 0]} text="Unaffected Crown" explanation="The coronal portion of the tooth typically remains vital and unaffected by the ameloblastoma, which develops in the bone/root area." />
      <Annotation position={[-0.3, -1.2, 0]} text="Root Resorption" explanation="Ameloblastomas are locally aggressive and often cause characteristically smooth, 'knife-edge' root resorption of adjacent teeth." />
      <Annotation position={[1.2, -1.5, 0]} text="Multilocular 'Soap Bubble' Mass" explanation="The classic radiographic appearance is a multilocular radiolucency with bony septae resembling 'soap bubbles' or a 'honeycomb'." />
    </group>
  );
}

// 2. Odontogenic Cysts Model
function CystModel() {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      <BaseTooth />
      {/* Unilocular Cyst at Apex */}
      <mesh position={[0.1, -1.8, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.4} envMapIntensity={2} roughness={0.1} />
      </mesh>
      {/* Sclerotic Border */}
      <mesh position={[0.1, -1.8, 0]}>
        <sphereGeometry args={[0.52, 32, 32]} />
        <meshStandardMaterial color="#ffffff" wireframe transparent opacity={0.3} />
      </mesh>

      <Annotation position={[0, 0.8, 0]} text="Vital Crown" explanation="In dentigerous cysts, the crown is unerupted. In radicular cysts, the tooth is typically non-vital due to caries." />
      <Annotation position={[0.8, -1.8, 0]} text="Unilocular Radiolucency" explanation="Most cysts present as well-circumscribed, round, unilocular radiolucencies containing fluid." />
      <Annotation position={[-0.6, -2.1, 0]} text="Sclerotic Border" explanation="Cysts often exhibit a hyperostotic (sclerotic) bony border, indicating a slow-growing, benign process." />
    </group>
  );
}

// 3. Fibro-osseous Lesions Model
function FibroOsseousModel() {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      <BaseTooth />
      {/* Mottled Bone */}
      <mesh position={[0.1, -1.2, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#10b981" transparent opacity={0.3} wireframe />
      </mesh>
      {/* Internal dense spots */}
      <mesh position={[0.4, -1, 0.3]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.3, -1.5, -0.2]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <Annotation position={[1.0, -0.5, 0.8]} text="Ground Glass Appearance" explanation="Fibrous dysplasia replaces normal bone with fibrous tissue, creating a finely mottled, hazy, 'ground glass' or 'orange peel' radiopacity." />
      <Annotation position={[-1.0, -1.2, 0]} text="Poorly Defined Margins" explanation="Unlike cysts, fibro-osseous lesions like fibrous dysplasia blend seamlessly into surrounding normal bone without a distinct border." />
      <Annotation position={[0, -0.5, 0.8]} text="Loss of Lamina Dura" explanation="The lamina dura surrounding the tooth roots may become obscured or lost as the abnormal fibrous bone merges with it." />
    </group>
  );
}

// 4. Salivary Gland Tumors Model
function SalivaryGlandModel() {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Healthy Gland Lobules */}
      {[...Array(15)].map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1]}>
          <sphereGeometry args={[0.3 + Math.random() * 0.2, 16, 16]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.3} />
        </mesh>
      ))}
      {/* Tumor Mass */}
      <mesh position={[0.8, -0.5, 0.5]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.5} emissive="#f59e0b" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.8, -0.5, 0.5]}>
        <sphereGeometry args={[0.75, 16, 16]} />
        <meshStandardMaterial color="#ffffff" wireframe transparent opacity={0.3} />
      </mesh>

      <Annotation position={[-0.8, 0.8, 0]} text="Parotid Gland Lobules" explanation="The parotid gland is the most common site for salivary gland tumors, especially the benign Pleomorphic Adenoma." />
      <Annotation position={[1.8, -0.5, 0.5]} text="Painless Exophytic Mass" explanation="Tumors typically present as a firm, painless, slow-growing swelling over the angle of the mandible or preauricular region." />
      <Annotation position={[0.8, -1.4, 0.5]} text="Fibrous Capsule" explanation="Benign salivary tumors are usually well-encapsulated, though pleomorphic adenomas may have 'pseudopods' pushing through the capsule." />
    </group>
  );
}

// 5. Oral Mucosa Lesions Model
function MucosaModel() {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = 0.5;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Erythematous Base */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial color="#ef4444" roughness={0.6} side={2} />
      </mesh>
      {/* White Striations (Wickham Striae) */}
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 2, 0.02, (Math.random() - 0.5) * 2]} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}>
          <planeGeometry args={[1.5, 0.05]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} side={2} />
        </mesh>
      ))}

      <Annotation position={[0, -0.3, 1.5]} text="Erythematous Mucosal Base" explanation="Conditions like erosive lichen planus or erythroplakia present with a red, inflamed, often ulcerated mucosal base." />
      <Annotation position={[0, 0.3, -0.5]} text="Interlacing White Lines (Wickham Striae)" explanation="Classic presentation of reticular Lichen Planus featuring a lacework of white, hyperkeratotic lines on the buccal mucosa." />
    </group>
  );
}

const topicData = [
  { name: 'Ameloblastoma', desc: 'Most common odontogenic tumor. Locally aggressive neoplasm arising from odontogenic epithelium.', features: ['Follicular & plexiform patterns', 'Reverse polarization of nuclei', 'Stellate reticulum-like cells'], Component: AmeloblastomaModel },
  { name: 'Odontogenic Cysts', desc: 'Pathological cavities lined by odontogenic epithelium. Include dentigerous, OKC, and radicular cysts.', features: ['Epithelial lining variations', 'Keratin production in OKC', 'Cholesterol clefts in radicular'], Component: CystModel },
  { name: 'Fibro-osseous Lesions', desc: 'Group of conditions where normal bone is replaced by fibrous tissue and abnormal bone/cementum.', features: ['Fibrous dysplasia patterns', 'Cemento-ossifying fibroma', 'Periapical cemental dysplasia'], Component: FibroOsseousModel },
  { name: 'Salivary Gland Tumors', desc: 'Neoplasms of major and minor salivary glands. Pleomorphic adenoma most common benign.', features: ['Biphasic cell population', 'Chondromyxoid stroma', 'Cribriform pattern in ACC'], Component: SalivaryGlandModel },
  { name: 'Oral Mucosa Lesions', desc: 'Conditions affecting the oral mucous membranes including leukoplakia and lichen planus.', features: ['Wickham striae', 'Epithelial dysplasia grading', 'Civatte bodies'], Component: MucosaModel },
];

export default function ARTopicsPage() {
  const [activeTopic, setActiveTopic] = useState(topicData[0].name);
  const activeData = topicData.find(t => t.name === activeTopic);
  const ActiveModel = activeData.Component;

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <Box className="text-amber-400" /> 3D / AR Topic Explorer
      </h1>
      <p className="text-slate-400 mb-8">Interact with detailed 3D models and explore specific pathological features visually.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic Selector */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">Topics</h2>
          {topicData.map((topic) => (
            <button key={topic.name} onClick={() => setActiveTopic(topic.name)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${activeTopic === topic.name ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-800/30 border-white/5 text-slate-400 hover:bg-white/5'}`}>
              <p className="font-semibold text-sm">{topic.name}</p>
            </button>
          ))}
        </div>

        {/* 3D Viewer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel overflow-hidden border border-slate-700 shadow-2xl relative" style={{ height: '500px' }}>
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-slate-400">Loading Detailed 3D Model...</div>}>
              <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#8b5cf6" />
                <ActiveModel />
                <OrbitControls enablePan={true} minDistance={2} maxDistance={10} />
                <Environment preset="studio" />
              </Canvas>
            </Suspense>
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm text-xs text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10 shadow-lg">
              <RotateCcw className="w-4 h-4 text-amber-400" /> Left Click + Drag to rotate • Scroll to zoom
            </div>
          </div>

          {/* Topic Info */}
          {activeData && (
            <div className="glass-panel p-6 border-l-4 border-l-amber-500">
              <h2 className="text-2xl font-bold mb-3 text-white">{activeData.name}</h2>
              <p className="text-slate-300 mb-5 text-sm leading-relaxed">{activeData.desc}</p>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                <h3 className="text-sm font-bold text-amber-400 mb-3 uppercase tracking-wider">Key Histological / Clinical Features</h3>
                <ul className="space-y-3">
                  {activeData.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
