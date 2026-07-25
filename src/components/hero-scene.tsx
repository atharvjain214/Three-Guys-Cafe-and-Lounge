import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment, ContactShadows, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function CoffeeCup() {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.2}>
      {/* Cup body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.7, 1.2, 64]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Cup interior */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.72, 0.62, 1.0, 64]} />
        <meshStandardMaterial color="#3D2817" roughness={0.8} />
      </mesh>
      {/* Coffee surface */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.71, 0.71, 0.05, 64]} />
        <meshStandardMaterial color="#2C1810" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.35, 0.08, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Saucer */}
      <mesh position={[0, -0.65, 0]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.1, 0.05, 64]} />
        <meshStandardMaterial color="#D4A574" roughness={0.4} metalness={0.05} />
      </mesh>
    </group>
  );
}

function FloatingBean({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <mesh position={position} scale={scale} castShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <MeshDistortMaterial
          color="#6B4226"
          roughness={0.4}
          metalness={0.2}
          distort={0.2}
          speed={1.5}
        />
      </mesh>
    </Float>
  );
}

function ParticleField({ count = 50 }: { count?: number }) {
  const ref = React.useRef<THREE.Points>(null);
  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#D4A574" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function CameraRig() {
  const { camera } = useThree();
  useFrame((state) => {
    const x = state.pointer.x * 0.3;
    const y = state.pointer.y * 0.2;
    camera.position.x += (x - camera.position.x) * 0.05;
    camera.position.y += (y - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function useAdaptivePerformance() {
  const [dpr, setDpr] = React.useState<number>(1);
  const [particleCount, setParticleCount] = React.useState(50);

  React.useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
    const isLowEnd = cores <= 4 || memory <= 4;
    setDpr(isLowEnd ? 1 : Math.min(window.devicePixelRatio, 2));
    setParticleCount(isLowEnd ? 20 : 50);
  }, []);

  return { dpr, particleCount };
}

export function HeroScene() {
  const { dpr, particleCount } = useAdaptivePerformance();

  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#D4A574" />

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <CoffeeCup />
      </Float>

      <FloatingBean position={[-2, 1.5, -1]} scale={0.8} />
      <FloatingBean position={[2, -1, -0.5]} scale={1} />
      <FloatingBean position={[1.5, 1.8, -2]} scale={0.6} />
      <FloatingBean position={[-1.8, -1.5, -1.5]} scale={0.9} />

      <ParticleField count={particleCount} />

      <ContactShadows position={[0, -1, 0]} opacity={0.3} scale={6} blur={2} far={4} />
      <Environment preset="sunset" />

      <CameraRig />
    </Canvas>
  );
}
