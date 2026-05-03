"use client"

import { useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Grid, Center, Points, PointMaterial } from "@react-three/drei"
import * as random from 'maath/random/dist/maath-random.esm'
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, Box, Sparkles, Wand2, Scan } from "lucide-react"

// --- 3D Scene Output ---
function ApartmentModel({ isScanning }: { isScanning: boolean }) {
    const meshRef = useRef<any>(null)

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Gentle rotation
            meshRef.current.rotation.y += delta * 0.05
        }
    })

    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color="#f0f0f0" />
            </mesh>

            {/* Room Box */}
            <Center>
                <group ref={meshRef}>
                    {/* Walls */}
                    <mesh position={[0, 1, -2]} castShadow receiveShadow>
                        <boxGeometry args={[4, 3, 0.2]} />
                        {isScanning ? <meshStandardMaterial wireframe color="green" /> : <meshStandardMaterial color="#e2e8f0" />}
                    </mesh>
                    <mesh position={[-2, 1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[4, 3, 0.2]} />
                        {isScanning ? <meshStandardMaterial wireframe color="green" /> : <meshStandardMaterial color="#e2e8f0" />}
                    </mesh>

                    {/* Furniture */}
                    <mesh position={[0, 0, 0]} castShadow>
                        <boxGeometry args={[1, 0.5, 2]} />
                        {isScanning ? <meshStandardMaterial wireframe color="cyan" /> : <meshStandardMaterial color="#475569" />}
                    </mesh>
                </group>
            </Center>
        </group>
    )
}

function ScanningParticles() {
    const ref = useRef<any>()
    // @ts-ignore
    const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 3 }))

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 10
        ref.current.rotation.y -= delta / 15
    })

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#00ff00"
                    size={0.05}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    )
}


export function Ai3DViewer() {
    const [stage, setStage] = useState<'idle' | 'analyzing' | 'generating' | 'complete'>('idle')
    const [logs, setLogs] = useState<string[]>([])
    const [progress, setProgress] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    // Effect to handle logs during generation
    useEffect(() => {
        if (stage === 'analyzing') {
            const steps = [
                "Gemini 3 Pro: Initializing Neural Radiance Fields...",
                "Analyzing 2D images for depth cues...",
                "Detecting 14 wall segments...",
                "Identifying furniture: Sofa, Table, Lamp...",
                "Estimating light sources (Ambient + Directional)..."
            ]

            let i = 0
            const interval = setInterval(() => {
                if (i < steps.length) {
                    setLogs(prev => [...prev, steps[i]])
                    setProgress(prev => prev + 15)
                    i++
                } else {
                    clearInterval(interval)
                    setStage('generating')
                }
            }, 800)
            return () => clearInterval(interval)
        }

        if (stage === 'generating') {
            const steps = [
                "Constructing Mesh Geometry...",
                "Synthesizing 4K Textures...",
                "Baking Global Illumination...",
                "Optimizing for WebGL..."
            ]
            let i = 0
            const interval = setInterval(() => {
                if (i < steps.length) {
                    setLogs(prev => [...prev, steps[i]])
                    setProgress(prev => prev + 5) // Slow crawl to 100
                    i++
                } else {
                    clearInterval(interval)
                    setProgress(100)
                    setTimeout(() => setStage('complete'), 500)
                }
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [stage])

    const startGeneration = () => {
        setStage('analyzing')
        setLogs([])
        setProgress(0)
    }

    return (
        <div
            ref={containerRef}
            className={`relative w-full rounded-2xl overflow-hidden bg-black transition-all ${isFullscreen ? 'h-screen' : 'h-[500px]'}`}
        >
            {/* IDLE STATE */}
            {stage === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-br from-neutral-900 to-neutral-800">
                    <Wand2 size={48} className="mb-4 text-[#ff385c]" />
                    <h3 className="text-2xl font-bold mb-2">Generate 3D Tour</h3>
                    <p className="text-gray-400 mb-6 max-w-md text-center">
                        Use our experimental <strong>Gemini 3 Pro</strong> AI to turn listing photos into an interactive 3D model.
                    </p>
                    <Button
                        onClick={startGeneration}
                        size="lg"
                        className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-6 text-lg rounded-full"
                    >
                        <Sparkles className="mr-2 h-5 w-5 text-[#ff385c]" />
                        Generate AI Model
                    </Button>
                </div>
            )}

            {/* LOADING STATE - NOW WITH 3D SCANNING VISUALS */}
            {(stage === 'analyzing' || stage === 'generating') && (
                <div className="absolute inset-0 bg-black relative">
                    {/* Background Scanning Animation */}
                    <div className="absolute inset-0 z-0 opacity-50">
                        <Canvas camera={{ position: [0, 0, 5] }}>
                            <ScanningParticles />
                            <ambientLight />
                        </Canvas>
                    </div>

                    <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end bg-black/60 font-mono text-green-400 pointer-events-none">
                        {/* Simulated Terminal */}
                        <div className="flex-1 overflow-hidden relative">
                            <div className="absolute bottom-0 left-0 right-0 space-y-2">
                                {logs.map((log, i) => (
                                    <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2">
                                        <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
                                        <span>{">"}</span>
                                        <span>{log}</span>
                                    </div>
                                ))}
                                <div className="animate-pulse">_</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6">
                            <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase tracking-widest">
                                <span>Creating Digital Twin</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* COMPLETE STATE (3D Viewer) */}
            {stage === 'complete' && (
                <div className="w-full h-full relative bg-neutral-100">
                    <Canvas shadows camera={{ position: [4, 4, 4], fov: 50 }}>
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                        <Environment preset="city" />
                        <ApartmentModel isScanning={false} />
                        <OrbitControls autoRotate={false} />
                        <Grid position={[0, -0.51, 0]} args={[20, 20]} cellColor="#e2e8f0" sectionColor="#cbd5e1" />
                    </Canvas>

                    {/* UI Overlays */}
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <Button
                            size="icon"
                            variant="secondary"
                            className="bg-white/80 backdrop-blur"
                            onClick={toggleFullscreen}
                        >
                            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </Button>
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-lg border text-sm font-medium flex gap-4 items-center whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <Box size={16} />
                            Drag to rotate
                        </div>
                        <div className="w-[1px] h-4 bg-gray-300" />
                        <div className="flex items-center gap-2 text-[#ff385c]">
                            <Sparkles size={14} />
                            Generated by AI
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
