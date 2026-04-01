import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { SpotLight } from "@react-three/drei";
import * as THREE from "three";
import { useVideoStore } from "../hooks/useVideoStore";
import TikTokListener from "../components/TikTokListener";
import SelectThumbnail from "../components/SelectThumbnail";
import { BlackScreenVideo } from "../components/BlackScreenVideo";
import Background from "../components/Background";

const StageLights = () => {
  const spotLightRef1 = useRef();
  const spotLightRef2 = useRef();
  const mainSpotLightRef = useRef();

  const [target1] = useState(() => {
    const obj = new THREE.Object3D();
    obj.position.set(-1, -2, -5);
    return obj;
  });
  const [target2] = useState(() => {
    const obj = new THREE.Object3D();
    obj.position.set(1, -2, -5);
    return obj;
  });
  const [targetMain] = useState(() => {
    const obj = new THREE.Object3D();
    obj.position.set(0, -2, -5);
    return obj;
  });

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Flashing effect and moving slightly
    if (spotLightRef1.current) {
      spotLightRef1.current.intensity = 4 + Math.sin(t * 6) * 4;
      spotLightRef1.current.position.x = -4 + Math.sin(t * 2) * 2;
    }
    if (spotLightRef2.current) {
      spotLightRef2.current.intensity = 4 + Math.cos(t * 7) * 4;
      spotLightRef2.current.position.x = 4 + Math.cos(t * 1.5) * 2;
    }
    // Main spotlight flickering slightly
    if (mainSpotLightRef.current) {
      mainSpotLightRef.current.intensity = 6 + Math.sin(t * 10) * 1.5;
    }
  });

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
  );
};

const HomePage = () => {
  const selectedVideo = useVideoStore((state) => state.selectedVideo);

  return (
    <>
      <div className="flex justify-between w-full p-2 h-full">
        <SelectThumbnail />
        <div className=" flex items-center justify-center z-0 pointer-events-none">
          <div className="relative w-[380px] h-[740px] flex items-center justify-center">
            <div className="absolute inset-0 rounded-[3.5rem] animate-pulse bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 blur-[30px] opacity-70"></div>
            <div className="relative w-[360px] h-[720px] rounded-[3rem] overflow-hidden pointer-events-auto border-4 border-white/80  bg-black">
              <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                {/* <StageLights /> */}
                <Background imgSrc="/images/background.png" />
                {selectedVideo && <BlackScreenVideo videoSrc={selectedVideo} />}
              </Canvas>

              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10"></div>
              <div className="absolute -top-1/4 -right-1/2 w-full h-[150%] bg-white/5 -rotate-45 blur-sm pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* UI Layer */}
        <TikTokListener />
      </div>
    </>
  );
};

export default HomePage;
