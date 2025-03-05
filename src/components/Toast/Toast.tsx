import React, { useEffect, useState } from "react";
import { Player } from "../../types";

interface ToastProps {
  message: string;
  type?: "info" | "success" | "warning" | "error";
  duration?: number;
  show: boolean;
  onClose: () => void;
  player?: Player;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  duration = 3000,
  show,
  onClose,
  player,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  // Determine background color based on type and player
  let bgColor = "bg-blue-500";
  let textColor = "text-white";

  if (player) {
    bgColor = player === 1 ? "bg-red-100" : "bg-purple-100";
    textColor = player === 1 ? "text-red-800" : "text-purple-800";
  } else {
    switch (type) {
      case "success":
        bgColor = "bg-green-500";
        break;
      case "warning":
        bgColor = "bg-yellow-500";
        break;
      case "error":
        bgColor = "bg-red-500";
        break;
      default:
        bgColor = "bg-blue-500";
    }
  }

  return (
    <div
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50
        px-4 py-3 rounded-lg shadow-lg
        flex items-center ${bgColor} ${textColor}
        ${isVisible ? "animate-enter" : "animate-leave"}
      `}
      role="alert"
    >
      <div className="mr-2">
        {player && (
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{
              backgroundColor: player === 1 ? "#cf3f3f" : "#6539a0",
              display: "inline-block",
            }}
          ></div>
        )}
      </div>
      <div className="font-medium">{message}</div>
    </div>
  );
};

export default Toast;
