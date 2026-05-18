import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ThreeScene from './ThreeScene';
import '../styles/GlobalTheme.css';

const PageWrapper = ({ children, className = '', showBackground = true }) => {
  const wrapperRef = useRef();

  useEffect(() => {
    // Page entrance animation
    gsap.fromTo(wrapperRef.current, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  return (
    <div ref={wrapperRef} className={`page-wrapper ${className}`}>
      {showBackground && <ThreeScene />}
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
