import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

const Background = ({ imgSrc }) => {
  const texture = useLoader(TextureLoader, imgSrc);

  return (
    <mesh position={[0, 0, -6]} scale={[12, 20, 10]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} toneMapped={false} depthWrite={false} depthTest={false} />
    </mesh>
  );
};

export default Background;
