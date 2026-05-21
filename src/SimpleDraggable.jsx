import { useState, useRef, useEffect } from "react";

export default function SimpleDraggable() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const boxRef = useRef(null);

  const startDrag = (event) => {
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const rect = boxRef.current.getBoundingClientRect();

    dragging.current = true;
    offset.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const onMove = (event) => {
    if (!dragging.current) return;
    event.preventDefault();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    setPosition({
      x: clientX - offset.current.x,
      y: clientY - offset.current.y,
    });
  };

  const stopDrag = () => {
    dragging.current = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", stopDrag);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", stopDrag);
    };
  }, []);

  return (
    <div
      ref={boxRef}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      style={{
        width: 160,
        height: 100,
        background: "#10b981",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        position: "absolute",
        left: position.x,
        top: position.y,
        cursor: "grab",
        userSelect: "none",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.2)",
      }}
    >
      Drag me
    </div>
  );
}
