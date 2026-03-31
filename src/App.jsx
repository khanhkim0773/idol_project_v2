import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { SpotLight } from '@react-three/drei'
import { useVideoStore } from './hooks/useVideoStore'
import { GreenScreenVideo } from './components/GreenScreenVideo'
import SelectThumbnail from './components/SelectThumbnail'
import * as THREE from 'three'
import { BlackScreenVideo } from './components/BlackScreenVideo'
import TikTokListener from './components/TikTokListener'
import ConnectForm from './components/ConnectForm'

const StageLights = () => {
  const spotLightRef1 = useRef()
  const spotLightRef2 = useRef()
  const mainSpotLightRef = useRef()

  const [target1] = useState(() => {
    const obj = new THREE.Object3D()
    obj.position.set(-1, -2, -5)
    return obj
  })
  const [target2] = useState(() => {
    const obj = new THREE.Object3D()
    obj.position.set(1, -2, -5)
    return obj
  })
  const [targetMain] = useState(() => {
    const obj = new THREE.Object3D()
    obj.position.set(0, -2, -5)
    return obj
  })

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Flashing effect and moving slightly
    if (spotLightRef1.current) {
      spotLightRef1.current.intensity = 4 + Math.sin(t * 6) * 4
      spotLightRef1.current.position.x = -4 + Math.sin(t * 2) * 2
    }
    if (spotLightRef2.current) {
      spotLightRef2.current.intensity = 4 + Math.cos(t * 7) * 4
      spotLightRef2.current.position.x = 4 + Math.cos(t * 1.5) * 2
    }
    // Main spotlight flickering slightly
    if (mainSpotLightRef.current) {
      mainSpotLightRef.current.intensity = 6 + Math.sin(t * 10) * 1.5
    }
  })

  return (
    <>
      <primitive object={target1} />
      <primitive object={target2} />
      <primitive object={targetMain} />

      <ambientLight intensity={8} color="#fff8e7" />

      {/* Main Center Light - Silver/White */}
      <SpotLight
        ref={mainSpotLightRef}
        penumbra={0.8}
        distance={25}
        angle={0.85}
        attenuation={10}
        anglePower={5}
        intensity={6}
        color="#f8f9fa"
        position={[0, 6, 2]}
        target={targetMain}
      />

      {/* Flashing Light 1 - Golden Yellow */}
      <SpotLight
        ref={spotLightRef1}
        penumbra={0.7}
        distance={20}
        angle={0.7}
        attenuation={10}
        anglePower={4}
        intensity={4}
        color="#ffd700"
        position={[-4, 5, 2]}
        target={target1}
      />

      {/* Flashing Light 2 - Warm Silver/Yellow */}
      <SpotLight
        ref={spotLightRef2}
        penumbra={0.7}
        distance={25}
        angle={0.7}
        attenuation={10}
        anglePower={4}
        intensity={4}
        color="#fff1ba"
        position={[4, 5, 2]}
        target={target2}
      />
    </>
  )
}

const App = () => {
  const selectedVideo = useVideoStore((state) => state.selectedVideo)

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black">
      {/* Background Image */}
      <img
        src="/images/background.png"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <StageLights />
          {selectedVideo && <BlackScreenVideo videoSrc={selectedVideo} />}
        </Canvas>
      </div>

      {/* UI Layer */}
      <ConnectForm />
      <TikTokListener />
      <SelectThumbnail />
    </div>
  )
}

export default App