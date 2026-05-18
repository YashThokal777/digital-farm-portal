import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const ThreeScene = () => {
  const sceneRef = useRef();
  const spheresRef = useRef([]);

  useEffect(() => {
    const scene = sceneRef.current;
    const spheres = spheresRef.current;

    // Create floating spheres animation
    spheres.forEach((sphere, index) => {
      gsap.set(sphere, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.5 + 0.5,
      });

      gsap.to(sphere, {
        duration: 10 + index * 2,
        x: `+=${Math.random() * 200 - 100}`,
        y: `+=${Math.random() * 200 - 100}`,
        rotation: 360,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    });

    // Parallax effect on mouse move
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;

      gsap.to(spheres, {
        duration: 1,
        x: `+=${x * 20}`,
        y: `+=${y * 20}`,
        ease: "power2.out",
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={sceneRef} className="three-scene">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          ref={(el) => (spheresRef.current[index] = el)}
          className={`floating-sphere sphere-${index + 1}`}
        />
      ))}
    </div>
  );
};

export default ThreeScene;
