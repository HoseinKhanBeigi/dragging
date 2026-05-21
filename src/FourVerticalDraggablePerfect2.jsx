import { useEffect, useRef, useState } from "react";

const BOX_COUNT = 8;
const BOX_HEIGHT = 72;
const BOX_WIDTH = 220;
const BASE_Y = 120;
const GAP = 82;
const FOLLOW_SPEED = 0.18;
const OPEN_THRESHOLD = 0.7;
const CLOSED_VISIBLE_COUNT = 3;
const CLOSED_CORNER_COUNT = 2;

const colors = [
  "#2563eb",
  "#0891b2",
  "#059669",
  "#65a30d",
  "#d97706",
  "#ea580c",
  "#dc2626",
  "#9333ea",
];

export default function FourVerticalDraggable() {
  const initialPositions = Array.from({ length: BOX_COUNT }, () => BASE_Y);

  const [boxes, setBoxes] = useState(initialPositions);
  const [activeIndex, setActiveIndex] = useState(null);

  const pos = useRef([...initialPositions]);
  const target = useRef([...initialPositions]);
  const dragging = useRef(false);
  const activeBox = useRef(null);
  const pointerOffset = useRef(0);
  const frame = useRef(null);

  useEffect(() => {
    function getPointerY(event) {
      return event.clientY;
    }

    function handlePointerMove(event) {
      if (!dragging.current || activeBox.current === null) return;
      event.preventDefault();

      const index = activeBox.current;
      const nextY = getPointerY(event) - pointerOffset.current;
      pos.current[index] = Math.max(nextY, BASE_Y);
    }

    function handlePointerEnd() {
      dragging.current = false;

      for (let i = 0; i < BOX_COUNT; i += 1) {
        target.current[i] = pos.current[i];
      }

      activeBox.current = null;
      setActiveIndex(null);
    }

    function animate() {
      const active = activeBox.current;

      if (active !== null && dragging.current) {
        target.current[active] = pos.current[active];

        for (let i = active + 1; i < BOX_COUNT; i += 1) {
          const previousY = pos.current[i - 1];
          target.current[i] =
            previousY > BASE_Y + GAP * OPEN_THRESHOLD ? previousY + GAP : BASE_Y;
        }

        for (let i = active - 1; i >= 0; i -= 1) {
          const nextY = pos.current[i + 1];
          target.current[i] =
            nextY > BASE_Y + GAP * OPEN_THRESHOLD ? Math.max(nextY - GAP, BASE_Y) : BASE_Y;
        }
      }

      for (let i = 0; i < BOX_COUNT; i += 1) {
        if (i === active && dragging.current) continue;
        pos.current[i] += (target.current[i] - pos.current[i]) * FOLLOW_SPEED;
      }

      setBoxes([...pos.current]);
      frame.current = requestAnimationFrame(animate);
    }

    frame.current = requestAnimationFrame(animate);
    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);

    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
    };
  }, []);

  function startDrag(event, index) {
    dragging.current = true;
    activeBox.current = index;
    pointerOffset.current = event.clientY - pos.current[index];
    setActiveIndex(index);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 18%, #262626, #101010 46%, #070707)",
        position: "relative",
        overflow: "hidden",
        touchAction: "none",
        perspective: 900,
        perspectiveOrigin: "50% 20%",
      }}
    >
      {boxes.map((y, i) => {
        const lift = Math.min(Math.max((y - BASE_Y) / GAP, 0), 1);
        const z = -180 + i * 28 + lift * 180;
        const rotateX = (1 - lift) * (16 - i * 1.4);
        const stackRank = BOX_COUNT - 1 - i;
        const isVisibleCard = stackRank < CLOSED_VISIBLE_COUNT;
        const isCornerCard =
          stackRank >= CLOSED_VISIBLE_COUNT &&
          stackRank < CLOSED_VISIBLE_COUNT + CLOSED_CORNER_COUNT;
        const visibleAmount = isVisibleCard ? 1 : isCornerCard ? Math.max(0.24, lift) : lift;
        const closedPeek = (isVisibleCard || isCornerCard) && lift < 0.05
          ? stackRank * 14
          : 0;
        const closedScale = (isVisibleCard || isCornerCard) && lift < 0.05
          ? 1 - stackRank * 0.025
          : 1;

        return (
          <div
            key={i}
            onPointerDown={(event) => startDrag(event, i)}
            style={{
              position: "absolute",
              left: "50%",
              width: BOX_WIDTH,
              height: BOX_HEIGHT,
              transform: `
                translate3d(-50%, ${y - closedPeek}px, ${z}px)
                rotateX(${rotateX}deg)
                scale(${closedScale})
              `,
              transformOrigin: "50% 100%",
              background: colors[i],
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              userSelect: "none",
              cursor: activeIndex === i ? "grabbing" : "grab",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.32)",
              opacity: visibleAmount,
              pointerEvents: visibleAmount > 0.2 ? "auto" : "none",
              zIndex: activeIndex === i ? BOX_COUNT + 1 : i,
            }}
          >
            Box {i + 1}
          </div>
        );
      })}
    </main>
  );
}
