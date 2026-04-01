import { useEffect, useRef, useMemo } from "react";
import { VideoTexture, DoubleSide, Color } from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uThresholdBlack;
  uniform float uSmoothingBlack;
  uniform float uThresholdGreen;
  uniform float uSmoothingGreen;
  
  // Uniform cho Reflection
  uniform float uClipY;
  uniform float uReflectSpace;
  
  // Các uniform cho hiệu ứng Aura
  uniform vec3 uAuraColor;
  uniform float uAuraSize;
  uniform float uAuraIntensity;
  
  varying vec2 vUv;

  float getBrightness(vec3 color) {
    return (color.r + color.g + color.b) / 3.0;
  }

  float getSaturation(vec3 color) {
    float maxC = max(max(color.r, color.g), color.b);
    float minC = min(min(color.r, color.g), color.b);
    return maxC - minC;
  }

  float getAlpha(vec2 uv) {
    // Tránh việc texture lặp lại ở viền (clamp-to-edge) làm xuất hiện viền hình chữ nhật
    if (uv.x < 0.01 || uv.x > 0.99 || uv.y < 0.01 || uv.y > 0.99) {
      return 0.0;
    }
    
    vec4 color = texture2D(uTexture, uv);

    // --- Xử lý nền đen ---
    float brightness = getBrightness(color.rgb);
    float saturation = getSaturation(color.rgb);
    float mask = brightness * 0.7 + saturation * 0.3;
    float alphaBlack = smoothstep(
      uThresholdBlack - uSmoothingBlack,
      uThresholdBlack + uSmoothingBlack,
      mask
    );

    // --- Xử lý nền xanh ---
    float greenness = color.g - max(color.r, color.b);
    float alphaGreen = 1.0 - smoothstep(
      uThresholdGreen - uSmoothingGreen,
      uThresholdGreen + uSmoothingGreen,
      greenness
    );
    alphaGreen = pow(alphaGreen, 1.5); // làm gọn viền

    return min(alphaBlack, alphaGreen);
  }

  void main() {
    // 1. Remap UV để tạo không gian bên dưới cho reflection
    // uReflectSpace (ví dụ 0.25) dành 25% chiều cao mesh bên dưới cho bóng, 75% bên trên cho video gốc
    vec2 mappedUv = vUv;
    mappedUv.y = (vUv.y - uReflectSpace) / (1.0 - uReflectSpace);

    vec4 color = texture2D(uTexture, mappedUv);
    
    float alpha = getAlpha(mappedUv);

    // Xử lý viền (Aura)
    float auraAlpha = 0.0;
    int samples = 12; // Số lượng mẫu xung quanh
    float radius = uAuraSize; // Bán kính viền
    float twopi = 6.28318530718;
    
    if (uAuraSize > 0.0) {
        for (int i = 0; i < samples; i++) {
            float angle = float(i) * twopi / float(samples);
            vec2 offset = vec2(cos(angle), sin(angle)) * radius;
            // Áp dụng scale tỷ lệ ngược lại cho Y để viền aura không bị móp/méo
            offset.y *= (1.0 - uReflectSpace);
            auraAlpha += getAlpha(mappedUv + offset);
        }
        auraAlpha /= float(samples);
        auraAlpha = clamp(auraAlpha * uAuraIntensity, 0.0, 1.0);
        auraAlpha = smoothstep(0.0, 0.8, auraAlpha);
    }
    
    // Aura chỉ xuất hiện ở vùng ngoài nhân vật
    float finalAuraAlpha = auraAlpha * (1.0 - alpha);

    // Khử viền xanh (chỉ áp dụng nhẹ vùng viền)
    vec3 finalColor = color.rgb;
    finalColor.g = min(finalColor.g, max(finalColor.r, finalColor.b));

    // Phối màu: alpha của nhân vật quyết định màu finalColor, ngược lại là aura
    vec3 outColor = mix(uAuraColor, finalColor, alpha);
    float outAlpha = max(alpha, finalAuraAlpha);

    // --- HIỆU ỨNG REFLECTION ---
    // if (mappedUv.y < uClipY) {
    //     vec2 refUv = vec2(mappedUv.x, 2.0 * uClipY - mappedUv.y);
        
    //     // Thêm distortion nhẹ (ví dụ như mặt sàn bóng/nước)
    //     refUv.x += sin(mappedUv.y * 100.0) * ((uClipY - mappedUv.y) * 0.02);

    //     float refAlphaSrc = getAlpha(refUv);
        
    //     if (refAlphaSrc > 0.0) {
    //         vec4 rColor = texture2D(uTexture, refUv);
    //         rColor.g = min(rColor.g, max(rColor.r, rColor.b));
            
    //         float dist = uClipY - mappedUv.y;
    //         float fade = smoothstep(1.3, 0.0, dist); // mờ dần trong khoảng 1.3 UV
            
    //         float finalRefAlpha = refAlphaSrc * fade * 0.4; // Opacity thấp hơn
            
    //         // Blend: Nhân vật chính (outColor, outAlpha) đè lên Reflection
    //         vec3 blendedColor = mix(rColor.rgb, outColor, outAlpha);
    //         outAlpha = outAlpha + finalRefAlpha * (1.0 - outAlpha);
    //         outColor = blendedColor;
    //     }
    // }

    // Nếu rỗng hoàn toàn thì discard
    if (outAlpha < 0.02) discard;

    gl_FragColor = vec4(outColor, outAlpha);
  }
`;

export const BlackScreenVideo = ({ videoSrc }) => {
  const meshRef = useRef();
  const videoRef = useRef();
  const textureRef = useRef();

  const uniforms = useMemo(
    () => ({
      uTexture: { value: null },
      uThresholdBlack: { value: 0.09 },
      uSmoothingBlack: { value: 0.08 },
      uThresholdGreen: { value: 0.4 },
      uSmoothingGreen: { value: 0.06 },
      uClipY: { value: 0.1 }, // Vị trí giới hạn dọc cho reflection
      uReflectSpace: { value: 0 }, // % không gian dự phòng bên dưới cho bóng kéo dài (25%)
      // uAuraColor: { value: new Color(0x33ffff) }, // Màu glow (Sáng xanh lục/lam)
      // uAuraSize: { value: 0.000 }, // Kích cỡ glow
      uAuraIntensity: { value: 3.5 }, // Độ sáng rõ của glow
    }),
    [],
  );

  useEffect(() => {
    if (!videoSrc) return;

    // tạo video
    const video = document.createElement("video");
    video.src = videoSrc;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = false; // QUAN TRỌNG
    video.playsInline = true;
    video.preload = "auto";

    const texture = new VideoTexture(video);

    videoRef.current = video;
    textureRef.current = texture;

    // ẩn mesh trước khi load xong
    if (meshRef.current) {
      meshRef.current.visible = false;
    }

    // khi video có frame đầu
    const handleLoaded = () => {
      video.play().catch((err) => {
        console.error(
          "Autoplay failed. User interaction is required to play video with sound.",
          err,
        );
      });

      uniforms.uTexture.value = texture;

      if (meshRef.current) {
        // 1️⃣ Scale mesh theo tỉ lệ video
        const aspect = video.videoWidth / video.videoHeight;
        const width = 6; // Chiều rộng mong muốn trên scene
        meshRef.current.scale.set(width, width / aspect, 1);

        meshRef.current.visible = true;
        meshRef.current.material.needsUpdate = true;
      }
    };

    video.addEventListener("loadeddata", handleLoaded);

    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.removeEventListener("loadeddata", handleLoaded);

      texture.dispose();
    };
  }, [videoSrc, uniforms]);

  return (
    <mesh
      ref={meshRef}
      renderOrder={1}
      position={[0, -2.5, -6]}
      scale={[5, 16, 1]}
    >
      <planeGeometry args={[1.4, 1.5, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={DoubleSide}
        uniforms={uniforms}
      />
    </mesh>
  );
};
