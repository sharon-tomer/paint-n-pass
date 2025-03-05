import React, { useState, useEffect } from "react";

interface OrientationDetectorProps {
  children: React.ReactNode;
}

const OrientationDetector: React.FC<OrientationDetectorProps> = ({
  children,
}) => {
  const [isLandscape, setIsLandscape] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;

      // Simple check for mobile devices
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };

    checkIfMobile();
  }, []);

  // Check orientation
  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeOrientation = window.matchMedia(
        "(orientation: landscape)"
      ).matches;
      setIsLandscape(isLandscapeOrientation);
    };

    // Initial check
    checkOrientation();

    // Add event listener for orientation changes
    const mediaQuery = window.matchMedia("(orientation: landscape)");
    const handleOrientationChange = (e: MediaQueryListEvent) => {
      setIsLandscape(e.matches);
    };

    // Add the listener based on browser support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleOrientationChange);
    } else {
      // For older browsers
      mediaQuery.addListener(handleOrientationChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleOrientationChange);
      } else {
        // For older browsers
        mediaQuery.removeListener(handleOrientationChange);
      }
    };
  }, []);

  // Return children if not mobile or if in landscape orientation
  if (!isMobile || isLandscape) {
    return <>{children}</>;
  }

  // Show rotate phone message in portrait mode on mobile
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center p-4">
        <div className="mb-4 inline-block animate-rotate-phone">
          {/* SVG placeholder for phone rotation animation */}
          <div className="w-16 h-16 border-2 border-black rounded-md relative transform rotate-0">
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-black rounded-full"></div>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2">Please Rotate Your Device</h3>
        <p className="text-gray-600">This game works best in landscape mode.</p>
      </div>
    </div>
  );
};

export default OrientationDetector;
