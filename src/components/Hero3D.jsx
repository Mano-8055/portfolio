import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

/* ─── Seeded random for consistent particle positions ─────────────── */
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function Particles({ count = 60, isDark }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const seed = i * 12.345 + 67.89;
      const r = 3 + seededRandom(seed) * 2;
      const theta = seededRandom(seed + 1) * Math.PI * 2;
      const phi = Math.acos(2 * seededRandom(seed + 2) - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const accent = isDark ? [0.91, 0.66, 0.22] : [0.77, 0.5, 0.06];
    const metal = isDark ? [0.72, 0.71, 0.67] : [0.54, 0.53, 0.5];
    for (let i = 0; i < count; i++) {
      const seed = i * 12.345 + 67.89 + 1000;
      const c = seededRandom(seed) < 0.3 ? accent : metal;
      arr[i * 3] = c[0];
      arr[i * 3 + 1] = c[1];
      arr[i * 3 + 2] = c[2];
    }
    return arr;
  }, [count, isDark]);

  const ref = useRef();
  const time = useRef(0);

  useFrame((_, dt) => {
    time.current += dt;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const y = pos[i * 3 + 1];
      pos[i * 3 + 1] = y + Math.sin(time.current * 0.5 + i) * 0.002;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Rotating Icosahedron ──────────────────────────────────────── */
function HeroIcosahedron({ isDark }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((_, dt) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += dt * 0.12;
    meshRef.current.rotation.y += dt * 0.08;
  });

  const accent = isDark ? "#E8A838" : "#C47F10";
  const metal = isDark ? "#B8B4AA" : "#8A8680";
  const wireColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  return (
    <group>
      {/* Main solid icosahedron */}
      <mesh
        ref={meshRef}
        scale={hovered ? 1.1 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[1.8, 0]} />
        <meshStandardMaterial
          color={metal}
          metalness={0.3}
          roughness={0.6}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh>
        <icosahedronGeometry args={[1.82, 0]} />
        <meshBasicMaterial
          color={wireColor}
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Accent edges */}
      <mesh>
        <icosahedronGeometry args={[1.85, 0]} />
        <meshBasicMaterial
          color={accent}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Floating accent ring */}
      <mesh
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[2.2, 2.3, 32]} />
        <meshBasicMaterial
          color={accent}
          side={2}
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  );
}

/* ─── Ambient glow ──────────────────────────────────────────────── */
function AmbientGlow({ isDark }) {
  const accent = isDark ? "#E8A838" : "#C47F10";
  const metal = isDark ? "#B8B4AA" : "#8A8680";
  return (
    <>
      <hemisphereLight intensity={0.6} groundColor={isDark ? "#111" : "#eee"} />
      <directionalLight position={[5, 10, 7]} intensity={1.2} />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} />
      <pointLight position={[3, 3, 5]} color={accent} intensity={0.4} decay={2} />
      <pointLight position={[-3, -3, -5]} color={metal} intensity={0.3} decay={2} />
    </>
  );
}

/* ─── Interactive 3D Scene ──────────────────────────────────────── */
function Hero3DScene({ isDark }) {
  return (
    <>
      <AmbientGlow isDark={isDark} />
      <HeroIcosahedron isDark={isDark} />
      <Particles count={80} isDark={isDark} />
    </>
  );
}

/* ─── Canvas Wrapper ────────────────────────────────────────────── */
export default function Hero3DCanvas({ isDark, className = "" }) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const checkWebGL = () => {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch {
      return false;
    }
  };

  const hasWebGL = typeof window !== "undefined" ? checkWebGL() : true;

  if (prefersReduced || !hasWebGL) {
    return (
      <div
        className={`hero-3d-fallback ${className}`}
        style={{ width: "100%", aspectRatio: "1 / 1", maxWidth: "420px" }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 300 300" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? "#E8A838" : "#C47F10"} />
              <stop offset="100%" stopColor={isDark ? "#B8B4AA" : "#8A8680"} />
            </linearGradient>
          </defs>
          <circle cx="150" cy="150" r="120" fill="none" stroke="url(#grad)" strokeWidth="2" opacity="0.4" />
          <polygon
            points="150,30 250,150 150,210 50,150"
            fill="none"
            stroke={isDark ? "#E8A838" : "#C47F10"}
            strokeWidth="1.5"
            opacity="0.6"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`hero-3d-canvas ${className}`} style={{ width: "100%", aspectRatio: "1 / 1", maxWidth: "420px" }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 35 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        style={{ width: "100%", height: "100%", display: "block" }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
        fallback={<div className="hero-3d-loading" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="hero-3d-spinner" style={{ "--accent": isDark ? "#E8A838" : "#C47F10" }} /></div>}
      >
        <Hero3DScene isDark={isDark} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.3}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
        />
      </Canvas>
    </div>
  );
}