import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { useRef, useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'


const SAND_POSITIONS = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2
    const r = 0.08 + (i % 3) * 0.04
    return [ Math.cos(angle) * r, 0.28 - i * 0.055, Math.sin(angle) * r ]
})

function HourglassMesh({ scrollY }) {
    const groupRef = useRef()
    useFrame(({ clock }) => {
        if (!groupRef.current) return
        const t = clock.elapsedTime
        groupRef.current.rotation.y = t * 0.35 + scrollY * 0.0025
        groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.07
    })

    const mat = {
        metalness: 0.9,
        roughness: 0.06,
        transmission: 0.25,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide
    }

    return (
        <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.55}>
            <group ref={groupRef}>
                {/* TOP CONE */}
                <mesh position={[0,0.58,0]}>
                    <coneGeometry args={[0.5,1.1,48,1,true]} />
                    <meshPhysicalMaterial {...mat} color="#4c1d95" emissive="7c3aed" emissiveIntensity={0.55} />
                </mesh>
                {/* BOTTOM CONE */}
                <mesh postion={[0,-0.58,0]} rotation={[Math.PI,0,0]}>
                    <coneGeometry args={[0.5,1.1,48,1,true]} />
                    <meshPhysicalMaterial {...mat} color="#1e1b4b" emissive="#6d28d9" emissiveIntensity={0.45} />
                </mesh>
                {/* PINCH */}
                <mesh>
                    <sphereGeometry args={[0.09,16,16]} />
                    <meshBasicMaterial color="#e0d4ff" />
                </mesh>
                {/* GLOW */}
                <mesh>
                    <sphereGeometry args={[0.22,16,16]} />
                    <meshBasicMaterial color="#7c3aed" transparent opacity={0.12} />
                </mesh>
                {/* SAND PARTICLES */}
                {SAND_POSITIONS.map(([x,y,z], i) => (
                    <mesh key={i} position={[x,y,z]}>
                        <sphereGeometry args={[0.022,8,8]} />
                        <meshBasicMaterial color="#ddd6fe" />
                    </mesh>
                ))}
            </group>
        </Float>
    )
}


export default function FloatingHourglass() {
    const [scrollY, setScrollY] = useState(0)
    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '1.75rem',
                right: '1.75rem',
                width: 160,
                height: 160,
                zIndex: 10,
                pointerEvents: 'none'
            }}
            aria-hidden="true"
        >
            <Canvas
                camera={{ position: [0,0,3.2], fov:55 }}
                gl={{ alpha:true, antialias:true, powerPreference:'high-performance' }}
                style={{ background:'transparent' }}
                dpr={Math.min(window.devicePixelRatio, 2)}
            >
                <ambientLight intensity={0.35} />
                <pointLight position={[2,3,2]} intensity={2.2} color="#a78bfa" />
                <pointLight position={[-2,-2,1]} intensity={1.1} color="#60a5fa" />
                <pointLight position={[0,1,3]} intensity={0.6} color="#f0abfc" />
                <HourglassMesh scrollY={scrollY} />
            </Canvas>
        </div>
    )
}