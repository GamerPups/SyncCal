import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import type { BodyType, CarPart } from '@/types'

interface CarModelProps {
  color: string
  bodyType: BodyType
  highlightedParts: CarPart[]
}

const BODY_DIMS: Record<BodyType, { length: number; height: number; width: number; cabinOffset: number; cabinScale: number }> = {
  sedan: { length: 4.2, height: 0.55, width: 1.8, cabinOffset: -0.3, cabinScale: 1 },
  suv: { length: 4.5, height: 0.75, width: 1.9, cabinOffset: -0.1, cabinScale: 1.15 },
  truck: { length: 5.2, height: 0.65, width: 1.9, cabinOffset: 0.8, cabinScale: 0.85 },
  coupe: { length: 4.0, height: 0.45, width: 1.85, cabinOffset: -0.4, cabinScale: 0.9 },
  hatchback: { length: 3.8, height: 0.6, width: 1.75, cabinOffset: -0.5, cabinScale: 1.05 },
}

function Wheel({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.x += delta * 2
  })
  return (
    <group ref={ref} position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.38, 0.38, 0.28, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.3, 16]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.9} />
      </mesh>
    </group>
  )
}

function HighlightMesh({
  geometry,
  position,
  rotation,
  scale,
  active,
}: {
  geometry: THREE.BufferGeometry
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  active: boolean
}) {
  return (
    <mesh geometry={geometry} position={position} rotation={rotation} scale={scale}>
      <meshStandardMaterial
        color={active ? '#ef4444' : '#ffffff'}
        emissive={active ? '#ef4444' : '#000000'}
        emissiveIntensity={active ? 0.6 : 0}
        transparent
        opacity={active ? 0.85 : 0}
        depthWrite={false}
      />
    </mesh>
  )
}

function CarBody({ color, bodyType, highlightedParts }: CarModelProps) {
  const dims = BODY_DIMS[bodyType]
  const paintColor = useMemo(() => new THREE.Color(color), [color])
  const isHighlighted = (part: CarPart) => highlightedParts.includes(part)

  const bodyGeo = useMemo(() => new THREE.BoxGeometry(dims.length, dims.height * 0.5, dims.width), [dims])
  const cabinGeo = useMemo(() => new THREE.BoxGeometry(dims.length * 0.55, dims.height * 0.7, dims.width * 0.92), [dims])
  const hoodGeo = useMemo(() => new THREE.BoxGeometry(dims.length * 0.35, dims.height * 0.25, dims.width * 0.95), [dims])
  const engineGeo = useMemo(() => new THREE.BoxGeometry(0.8, 0.4, 0.9), [])
  const exhaustGeo = useMemo(() => new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8), [])
  const radiatorGeo = useMemo(() => new THREE.BoxGeometry(0.05, 0.5, 1.2), [])

  const bodyY = dims.height * 0.35
  const cabinY = dims.height * 0.85

  return (
    <group>
      {/* Main body */}
      <mesh geometry={bodyGeo} position={[0, bodyY, 0]}>
        <meshStandardMaterial color={paintColor} roughness={0.15} metalness={0.85} envMapIntensity={1.2} />
      </mesh>

      {/* Cabin */}
      <mesh geometry={cabinGeo} position={[dims.cabinOffset * dims.cabinScale, cabinY, 0]}>
        <meshStandardMaterial color={paintColor} roughness={0.15} metalness={0.85} />
      </mesh>

      {/* Hood */}
      <mesh geometry={hoodGeo} position={[dims.length * 0.32, bodyY + dims.height * 0.12, 0]}>
        <meshStandardMaterial color={paintColor} roughness={0.12} metalness={0.88} />
      </mesh>

      {/* Windshield */}
      <mesh position={[dims.cabinOffset * 0.5, cabinY, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.05, dims.height * 0.55, dims.width * 0.85]} />
        <meshStandardMaterial color="#1e293b" roughness={0.05} metalness={0.3} transparent opacity={0.7} />
      </mesh>

      {/* Engine bay highlight */}
      <HighlightMesh
        geometry={engineGeo}
        position={[dims.length * 0.32, bodyY + 0.15, 0]}
        active={isHighlighted('engine') || isHighlighted('spark_plugs') || isHighlighted('ignition_coil') || isHighlighted('air_intake') || isHighlighted('maf_sensor') || isHighlighted('throttle_body')}
      />

      {/* Exhaust */}
      <mesh geometry={exhaustGeo} position={[-dims.length * 0.48, 0.15, dims.width * 0.35]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#555" roughness={0.6} metalness={0.7} />
      </mesh>
      <HighlightMesh
        geometry={exhaustGeo}
        position={[-dims.length * 0.48, 0.15, dims.width * 0.35]}
        rotation={[0, 0, Math.PI / 2]}
        active={isHighlighted('exhaust') || isHighlighted('catalytic_converter') || isHighlighted('o2_sensor')}
      />

      {/* Radiator / cooling */}
      <mesh geometry={radiatorGeo} position={[dims.length * 0.5, bodyY, 0]}>
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
      <HighlightMesh
        geometry={radiatorGeo}
        position={[dims.length * 0.5, bodyY, 0]}
        active={isHighlighted('cooling') || isHighlighted('radiator')}
      />

      {/* Battery / electrical box */}
      <mesh position={[dims.length * 0.25, bodyY + 0.2, dims.width * 0.3]}>
        <boxGeometry args={[0.3, 0.2, 0.25]} />
        <meshStandardMaterial color="#222" roughness={0.7} />
      </mesh>
      <HighlightMesh
        geometry={new THREE.BoxGeometry(0.32, 0.22, 0.27)}
        position={[dims.length * 0.25, bodyY + 0.2, dims.width * 0.3]}
        active={isHighlighted('battery') || isHighlighted('electrical') || isHighlighted('alternator') || isHighlighted('starter') || isHighlighted('abs_module')}
      />

      {/* Fuel tank area */}
      <HighlightMesh
        geometry={new THREE.BoxGeometry(0.6, 0.25, 1.0)}
        position={[-dims.length * 0.15, bodyY - 0.05, 0]}
        active={isHighlighted('fuel_system') || isHighlighted('evap_system')}
      />

      {/* Transmission */}
      <HighlightMesh
        geometry={new THREE.BoxGeometry(0.7, 0.3, 0.8)}
        position={[0, 0.25, 0]}
        active={isHighlighted('transmission')}
      />

      {/* Brake calipers */}
      {([
        [dims.length * 0.3, 0.38, dims.width * 0.5],
        [dims.length * 0.3, 0.38, -dims.width * 0.5],
        [-dims.length * 0.3, 0.38, dims.width * 0.5],
        [-dims.length * 0.3, 0.38, -dims.width * 0.5],
      ] as [number, number, number][]).map((pos, i) => (
        <HighlightMesh
          key={i}
          geometry={new THREE.BoxGeometry(0.15, 0.12, 0.08)}
          position={pos}
          active={isHighlighted('brakes')}
        />
      ))}

      {/* Headlights */}
      <mesh position={[dims.length * 0.48, bodyY + 0.05, dims.width * 0.35]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#fffacd" emissive="#fffacd" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[dims.length * 0.48, bodyY + 0.05, -dims.width * 0.35]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#fffacd" emissive="#fffacd" emissiveIntensity={0.3} />
      </mesh>

      {/* Taillights */}
      <mesh position={[-dims.length * 0.48, bodyY + 0.05, dims.width * 0.35]}>
        <boxGeometry args={[0.05, 0.15, 0.3]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-dims.length * 0.48, bodyY + 0.05, -dims.width * 0.35]}>
        <boxGeometry args={[0.05, 0.15, 0.3]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.4} />
      </mesh>

      {/* Wheels */}
      <Wheel position={[dims.length * 0.3, 0.38, dims.width * 0.5]} />
      <Wheel position={[dims.length * 0.3, 0.38, -dims.width * 0.5]} />
      <Wheel position={[-dims.length * 0.3, 0.38, dims.width * 0.5]} />
      <Wheel position={[-dims.length * 0.3, 0.38, -dims.width * 0.5]} />

      {/* Tire highlight */}
      <HighlightMesh
        geometry={new THREE.TorusGeometry(0.4, 0.12, 8, 24)}
        position={[dims.length * 0.3, 0.38, dims.width * 0.5]}
        rotation={[Math.PI / 2, 0, 0]}
        active={isHighlighted('tires')}
      />

      {/* Suspension */}
      <HighlightMesh
        geometry={new THREE.BoxGeometry(0.1, 0.3, 0.1)}
        position={[dims.length * 0.3, 0.2, dims.width * 0.45]}
        active={isHighlighted('suspension') || isHighlighted('steering')}
      />

      {/* A/C compressor */}
      <HighlightMesh
        geometry={new THREE.CylinderGeometry(0.15, 0.15, 0.25, 12)}
        position={[dims.length * 0.15, bodyY + 0.1, -dims.width * 0.25]}
        rotation={[Math.PI / 2, 0, 0]}
        active={isHighlighted('ac_compressor')}
      />
    </group>
  )
}

function Scene({ color, bodyType, highlightedParts }: CarModelProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[6, 3, 6]} fov={40} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      <spotLight position={[0, 8, 0]} angle={0.5} penumbra={0.5} intensity={0.6} />

      <CarBody color={color} bodyType={bodyType} highlightedParts={highlightedParts} />

      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={12} blur={2.5} far={4} />
      <Environment preset="city" />
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.8}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} metalness={0.1} />
      </mesh>
    </>
  )
}

interface Car3DViewerProps {
  color: string
  bodyType: BodyType
  highlightedParts?: CarPart[]
  className?: string
}

export function Car3DViewer({ color, bodyType, highlightedParts = [], className }: Car3DViewerProps) {
  return (
    <div className={className}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        <Scene color={color} bodyType={bodyType} highlightedParts={highlightedParts} />
      </Canvas>
    </div>
  )
}
