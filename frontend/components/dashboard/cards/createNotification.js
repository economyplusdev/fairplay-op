// Notification.js
"use client";

import { useEffect, useState } from "react";

export default function Notification({ message, type, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  const handleAnimationEnd = () => {
    if (!visible) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center justify-between p-4 mb-4 text-sm text-white rounded-lg shadow-lg transform transition-transform duration-300 ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      } ${visible ? "animate-slide-in" : "animate-slide-out"}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <span>{message}</span>
      <button onClick={handleClose} className="ml-4 text-lg font-bold focus:outline-none">
        &times;
      </button>
    </div>
  );
}
