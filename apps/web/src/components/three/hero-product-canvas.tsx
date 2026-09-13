'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import type { Group } from 'three';

function FloatingProducts() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  const products = [
    { position: [0, 0.3, 0] as [number, number, number], scale: 1.1, color: '#ffffff' },
    { position: [-1.4, 0.1, 0.5] as [number, number, number], scale: 0.65, color: '#e0e7ff' },
    { position: [1.3, -0.1, 0.3] as [number, number, number], scale: 0.7, color: '#f8fafd' },
    { position: [0.5, -0.8, -0.4] as [number, number, number], scale: 0.55, color: '#eef3fa' },
    { position: [-0.6, 0.7, -0.5] as [number, number, number], scale: 0.5, color: '#ddd6fe' },
  ];

  return (
    <group ref={groupRef}>
      {products.map((product, index) => (
        <Float
          key={index}
          speed={1.5 + index * 0.2}
          rotationIntensity={0.2}
          floatIntensity={0.4}
        >
          <Sphere args={[product.scale, 32, 32]} position={product.position}>
            <MeshDistortMaterial
              color={product.color}
              roughness={0.15}
              metalness={0.3}
              distort={0.15}
              speed={1.5}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-3, 2, 2]} intensity={0.8} color="#4f46e5" />
      <pointLight position={[3, -1, 1]} intensity={0.6} color="#38bdf8" />
    </>
  );
}

export function HeroProductCanvas() {
  return (
    <div className="relative aspect-square w-full">
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-ambient" />
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        className="rounded-full"
        aria-hidden
      >
        <SceneLighting />
        <FloatingProducts />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
