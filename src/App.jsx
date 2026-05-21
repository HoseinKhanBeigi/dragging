import React, { useState, useRef, useEffect } from "react";

export default function DraggableBoxes() {
  const gap = 130;
  const follow = 0.18;
  const baseY = 300;

  const colors = ["#3b82f6", "#10b981", "#f59e0b"];

  const [boxes, setBoxes] = useState([baseY, baseY, baseY]);

  const pos = useRef([baseY, baseY, baseY]);
  const target = useRef([baseY, baseY, baseY]);
  const dragging = useRef(false);
  const activeBox = useRef(null);
  const offset = useRef(0);
  const animFrame = useRef(null);

  const moveRef = useRef(null);
  const endRef = useRef(null);

  const getY = (e) => (e.touches ? e.touches[0].clientY : e.clientY);

  function start(e, i) {
    const y = getY(e);
    dragging.current = true;
    activeBox.current = i;
    offset.current = y - pos.current[i];
  }

  moveRef.current = function (e) {
    if (!dragging.current || activeBox.current === null) return;
    const y = getY(e) - offset.current;
    pos.current[activeBox.current] = Math.max(y, baseY);
  };

  endRef.current = function () {
    dragging.current = false;
    for (let i = 0; i < 3; i++) {
      target.current[i] = pos.current[i];
    }
    activeBox.current = null;
  };

  function animate() {
    const active = activeBox.current;

    if (active !== null && dragging.current) {
      target.current[active] = pos.current[active];

      // Boxes below the active box
      for (let i = active + 1; i < 3; i++) {
        const prevPos = pos.current[i - 1];
        if (prevPos > baseY + gap * 0.7) {
          target.current[i] = prevPos + gap;
        } else {
          target.current[i] = baseY;
        }
      }

      // Boxes above the active box
      for (let i = active - 1; i >= 0; i--) {
        const nextPos = pos.current[i + 1];
        if (nextPos > baseY + gap * 0.7) {
          target.current[i] = nextPos - gap;
        } else {
          target.current[i] = baseY;
        }
      }
    }

    for (let i = 0; i < 3; i++) {
      if (i === active && dragging.current) continue;
      pos.current[i] += (target.current[i] - pos.current[i]) * follow;
    }

    setBoxes([...pos.current]);
    animFrame.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    animFrame.current = requestAnimationFrame(animate);

    const handleMove = (e) => moveRef.current(e);
    const handleEnd = () => endRef.current();

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
    document.addEventListener("touchcancel", handleEnd);

    return () => {
      cancelAnimationFrame(animFrame.current);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
    };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        background: "#111",
        position: "relative",
        overflow: "hidden",
        touchAction: "none",
      }}
    >
      {boxes.map((y, i) => (
        <div
          key={i}
          onMouseDown={(e) => start(e, i)}
          onTouchStart={(e) => start(e, i)}
          style={{
            position: "absolute",
            left: "50%",
            transform: `translate(-50%, ${y}px)`,
            width: 200,
            height: 100,
            background: colors[i],
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "bold",
            userSelect: "none",
            cursor:
              dragging.current && activeBox.current === i
                ? "grabbing"
                : "grab",
          }}
        >
          Box {i + 1}
        </div>
      ))}
    </div>
  );
}
