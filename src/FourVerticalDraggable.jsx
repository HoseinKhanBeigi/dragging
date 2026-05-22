// import { useMemo } from "react";
// import { memo } from "react";
// import { useEffect, useRef, useState } from "react";

// const BOX_COUNT = 16;
// const BOX_HEIGHT = 128;
// const BOX_WIDTH = 328;
// const BASE_Y = 100;
// const GAP = 140;
// const FOLLOW_SPEED = 0.5;
// const OPEN_THRESHOLD = 0.002;
// const CLOSED_VISIBLE_COUNT = 3;
// const DRAGGING_VISIBLE_COUNT = 3;
// const DRAGGING_TOP_VISIBLE_COUNT = 2;
// const MOMENTUM_FRICTION = 0.92;
// const MIN_MOMENTUM_SPEED = 0.1;
// const MAX_MOMENTUM_SPEED = 8;


// function FourVerticalDraggable() {
//   const initialPositions = Array.from({ length: BOX_COUNT }, () => BASE_Y);
//   const [boxes, setBoxes] = useState(initialPositions);
//   const [activeIndex, setActiveIndex] = useState(null);
//   const pos = useRef([...initialPositions]);
//   const target = useRef([...initialPositions]);
//   const dragging = useRef(false);
//   const activeBox = useRef(null);
//   const pointerOffset = useRef(0);
//   const lastPointerY = useRef(0);
//   const lastPointerTime = useRef(0);
//   const pointerVelocity = useRef(0);
//   const momentumBox = useRef(null);
//   const momentumVelocity = useRef(0);
//   const frame = useRef(null);

//   useEffect(() => {
//     function getPointerY(event) {
//       return event.clientY;
//     }

//     function clampActiveY(nextY) {
//       const viewportHeight = window.innerHeight || 640;
//       return Math.min(
//         Math.max(nextY, BASE_Y),
//         viewportHeight - BOX_HEIGHT - 24,
//       );
//     }

//     function updateChain(active) {
//       target.current[active] = pos.current[active];

//       for (let i = active + 1; i < BOX_COUNT; i += 1) {
//         const previousY = pos.current[i - 1];
//         target.current[i] =
//           previousY > BASE_Y + GAP * OPEN_THRESHOLD ? previousY + GAP : BASE_Y;
//       }

//       for (let i = active - 1; i >= 0; i -= 1) {
//         const nextY = pos.current[i + 1];
//         target.current[i] =
//           nextY > BASE_Y + GAP * OPEN_THRESHOLD ? Math.max(nextY - GAP, BASE_Y) : BASE_Y;
//       }
//     }

//     function handlePointerMove(event) {
//       if (!dragging.current || activeBox.current === null) return;
//       event.preventDefault();

//       const index = activeBox.current;
//       const pointerY = getPointerY(event);
//       const now = performance.now();
//       const elapsed = Math.max(now - lastPointerTime.current, 16);

//       pointerVelocity.current =
//         ((pointerY - lastPointerY.current) / elapsed) * 16.67;
//       lastPointerY.current = pointerY;
//       lastPointerTime.current = now;

//       const nextY = pointerY - pointerOffset.current;
//       pos.current[index] = clampActiveY(nextY);
//     }

//     function handlePointerEnd() {
//       if (!dragging.current) return;

//       const releasedBox = activeBox.current;
//       dragging.current = false;

//       if (
//         releasedBox !== null &&
//         Math.abs(pointerVelocity.current) > MIN_MOMENTUM_SPEED
//       ) {
//         momentumBox.current = releasedBox;
//         momentumVelocity.current = Math.min(
//           Math.max(pointerVelocity.current, -MAX_MOMENTUM_SPEED),
//           MAX_MOMENTUM_SPEED,
//         );
//       } else {
//         for (let i = 0; i < BOX_COUNT; i += 1) {
//           target.current[i] = pos.current[i];
//         }

//         momentumBox.current = null;
//         setActiveIndex(null);
//       }

//       activeBox.current = null;
//     }

//     function animate() {
//       const active = dragging.current ? activeBox.current : momentumBox.current;

//       if (momentumBox.current !== null && !dragging.current) {
//         const index = momentumBox.current;
//         pos.current[index] = clampActiveY(pos.current[index] + momentumVelocity.current);
//         momentumVelocity.current *= MOMENTUM_FRICTION;

//         if (
//           Math.abs(momentumVelocity.current) < MIN_MOMENTUM_SPEED ||
//           pos.current[index] <= BASE_Y ||
//           pos.current[index] >= window.innerHeight - BOX_HEIGHT - 24
//         ) {
//           momentumBox.current = null;
//           momentumVelocity.current = 0;
//           setActiveIndex(null);

//           for (let i = 0; i < BOX_COUNT; i += 1) {
//             target.current[i] = pos.current[i];
//           }
//         }
//       }

//       if (active !== null) {
//         updateChain(active);
//       }

//       for (let i = 0; i < BOX_COUNT; i += 1) {
//         if (i === active && (dragging.current || momentumBox.current !== null)) {
//           continue;
//         }

//         pos.current[i] += (target.current[i] - pos.current[i]) * FOLLOW_SPEED;
//       }

//       setBoxes([...pos.current]);
//       frame.current = requestAnimationFrame(animate);
//     }

//     frame.current = requestAnimationFrame(animate);
//     window.addEventListener("pointermove", handlePointerMove, { passive: false });
//     window.addEventListener("pointerup", handlePointerEnd);
//     window.addEventListener("pointercancel", handlePointerEnd);

//     return () => {
//       cancelAnimationFrame(frame.current);
//       window.removeEventListener("pointermove", handlePointerMove);
//       window.removeEventListener("pointerup", handlePointerEnd);
//       window.removeEventListener("pointercancel", handlePointerEnd);
//     };
//   }, []);

//   function startDrag(event, index) {
//     dragging.current = true;
//     activeBox.current = index;
//     momentumBox.current = null;
//     momentumVelocity.current = 0;
//     pointerOffset.current = event.clientY - pos.current[index];
//     lastPointerY.current = event.clientY;
//     lastPointerTime.current = performance.now();
//     pointerVelocity.current = 0;
//     setActiveIndex(index);
//     event.currentTarget.setPointerCapture?.(event.pointerId);
//     event.preventDefault();
//   }

//   return (
//     <main
//       style={{
//         minHeight: "100vh",
//         background: "radial-gradient(circle at 50% 18%, #262626, #101010 46%, #070707)",
//         position: "relative",
//         overflow: "hidden",
//         touchAction: "none",
//         perspective: 900,
//         perspectiveOrigin: "50% 20%",
//       }}
//     >
//       {boxes.map((y, i) => {
//         const isDraggingMode =
//           activeIndex !== null && boxes[activeIndex] > BASE_Y + 2;
//         const lift = Math.min(Math.max((y - BASE_Y) / GAP, 0), 1);
//         const grow = Math.min(Math.max(lift / 0.8, 0), 1);
//         const closedEffect = (1 - grow) ** 2;
//         const stackRank = BOX_COUNT - 1 - i;
//         const isBaseStackCard = stackRank < CLOSED_VISIBLE_COUNT;
//         const isIncomingStackCard =
//           i + CLOSED_VISIBLE_COUNT < BOX_COUNT &&
//           boxes[i + CLOSED_VISIBLE_COUNT] > BASE_Y + GAP * 0.2;
//         const dragWindowStart = activeIndex - (DRAGGING_VISIBLE_COUNT - 1);
//         const topWindowStart = dragWindowStart - DRAGGING_TOP_VISIBLE_COUNT;
//         const topWindowEnd = dragWindowStart - 1;
//         const isDraggingStackCard =
//           isDraggingMode &&
//           i <= activeIndex &&
//           i >= activeIndex - (DRAGGING_VISIBLE_COUNT - 1);
//         const isDraggingTopStackCard =
//           isDraggingMode &&
//           i >= topWindowStart &&
//           i <= topWindowEnd &&
//           i + DRAGGING_VISIBLE_COUNT < BOX_COUNT &&
//           boxes[i + DRAGGING_VISIBLE_COUNT] > BASE_Y + GAP * 0.02;
//         const isStackCard = isDraggingMode
//           ? isDraggingStackCard || isDraggingTopStackCard
//           : isBaseStackCard || isIncomingStackCard;
//         const isRevealedFromStack = lift > 0.14;
//         const closedDepth = isStackCard ? closedEffect : 0;
//         const visualStackRank = isDraggingStackCard
//           ? activeIndex - i
//           : isDraggingTopStackCard
//           ? topWindowEnd - i
//           : isIncomingStackCard
//           ? CLOSED_VISIBLE_COUNT - 0.45
//           : stackRank;
//         const z = -visualStackRank * 54 * closedDepth;
//         const rotateX = -visualStackRank * 1.5 * closedDepth;
//         const closedPeek = isStackCard ? visualStackRank * 28 * closedDepth : 0;
//         const closedScale = isStackCard
//           ? 1 - visualStackRank * 0.055 * closedDepth
//           : 1;

//         return (
//           <div
//             key={i}
//             onPointerDown={(event) => startDrag(event, i)}
//             style={{
//               position: "absolute",
//               left: "50%",
//               width: BOX_WIDTH,
//               height: BOX_HEIGHT,
//               transform: `
//                 translate3d(-50%, ${y - closedPeek}px, ${z}px)
//                 rotateX(${rotateX}deg)
//                 scale(${closedScale})
//               `,
//               transformOrigin: "50% 100%",
//               background: "rgba(242, 244, 248, 0.84)",
//               borderRadius: 12,
//               border: "1px solid rgba(255, 255, 255, 0.48)",
//               backdropFilter: "blur(16px)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "#293241",
//               fontWeight: 700,
//               userSelect: "none",
//               cursor: activeIndex === i ? "grabbing" : "grab",
//               boxShadow: "0 16px 40px rgba(0, 0, 0, 0.32)",
//               opacity: isStackCard || (!isDraggingMode && isRevealedFromStack) ? 1 : 0,
//               pointerEvents:
//                 isStackCard || (!isDraggingMode && isRevealedFromStack)
//                   ? "auto"
//                   : "none",
//               zIndex: activeIndex === i
//                 ? BOX_COUNT + 1
//                 : isStackCard
//                   ? BOX_COUNT - visualStackRank
//                   : isIncomingStackCard
//                   ? BOX_COUNT - CLOSED_VISIBLE_COUNT
//                   : BOX_COUNT - stackRank,
//             }}
//           >
//             Box {i + 1}
//           </div>
//         );
//       })}
//     </main>
//   );
// }

// export default memo(FourVerticalDraggable);

import { useMemo } from "react";
import { memo } from "react";
import { useEffect, useRef, useState } from "react";

const BOX_COUNT = 16;
const BOX_HEIGHT = 128;
const BOX_WIDTH = 328;
const BASE_Y = 100;
const GAP = 140;
const FOLLOW_SPEED = 0.5;
const OPEN_THRESHOLD = 0.002;
const CLOSED_VISIBLE_COUNT = 3;
const MOMENTUM_FRICTION = 0.92;
const MIN_MOMENTUM_SPEED = 0.1;
const MAX_MOMENTUM_SPEED = 8;


function FourVerticalDraggable() {
  const initialPositions = Array.from({ length: BOX_COUNT }, () => BASE_Y);
  const [boxes, setBoxes] = useState(initialPositions);
  const [activeIndex, setActiveIndex] = useState(null);
  const pos = useRef([...initialPositions]);
  const target = useRef([...initialPositions]);
  const dragging = useRef(false);
  const activeBox = useRef(null);
  const pointerOffset = useRef(0);
  const lastPointerY = useRef(0);
  const lastPointerTime = useRef(0);
  const pointerVelocity = useRef(0);
  const momentumBox = useRef(null);
  const momentumVelocity = useRef(0);
  const frame = useRef(null);

  useEffect(() => {
    function getPointerY(event) {
      return event.clientY;
    }

    function clampActiveY(nextY) {
      const viewportHeight = window.innerHeight || 640;
      return Math.min(
        Math.max(nextY, BASE_Y),
        viewportHeight - BOX_HEIGHT - 24,
      );
    }

    function updateChain(active) {
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

    function handlePointerMove(event) {
      if (!dragging.current || activeBox.current === null) return;
      event.preventDefault();

      const index = activeBox.current;
      const pointerY = getPointerY(event);
      const now = performance.now();
      const elapsed = Math.max(now - lastPointerTime.current, 16);

      pointerVelocity.current =
        ((pointerY - lastPointerY.current) / elapsed) * 16.67;
      lastPointerY.current = pointerY;
      lastPointerTime.current = now;

      const nextY = pointerY - pointerOffset.current;
      pos.current[index] = clampActiveY(nextY);
    }

    function handlePointerEnd() {
      if (!dragging.current) return;

      const releasedBox = activeBox.current;
      dragging.current = false;

      if (
        releasedBox !== null &&
        Math.abs(pointerVelocity.current) > MIN_MOMENTUM_SPEED
      ) {
        momentumBox.current = releasedBox;
        momentumVelocity.current = Math.min(
          Math.max(pointerVelocity.current, -MAX_MOMENTUM_SPEED),
          MAX_MOMENTUM_SPEED,
        );
      } else {
        for (let i = 0; i < BOX_COUNT; i += 1) {
          target.current[i] = pos.current[i];
        }

        momentumBox.current = null;
        setActiveIndex(null);
      }

      activeBox.current = null;
    }

    function animate() {
      const active = dragging.current ? activeBox.current : momentumBox.current;

      if (momentumBox.current !== null && !dragging.current) {
        const index = momentumBox.current;
        pos.current[index] = clampActiveY(pos.current[index] + momentumVelocity.current);
        momentumVelocity.current *= MOMENTUM_FRICTION;

        if (
          Math.abs(momentumVelocity.current) < MIN_MOMENTUM_SPEED ||
          pos.current[index] <= BASE_Y ||
          pos.current[index] >= window.innerHeight - BOX_HEIGHT - 24
        ) {
          momentumBox.current = null;
          momentumVelocity.current = 0;
          setActiveIndex(null);

          for (let i = 0; i < BOX_COUNT; i += 1) {
            target.current[i] = pos.current[i];
          }
        }
      }

      if (active !== null) {
        updateChain(active);
      }

      for (let i = 0; i < BOX_COUNT; i += 1) {
        if (i === active && (dragging.current || momentumBox.current !== null)) {
          continue;
        }

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
    momentumBox.current = null;
    momentumVelocity.current = 0;
    pointerOffset.current = event.clientY - pos.current[index];
    lastPointerY.current = event.clientY;
    lastPointerTime.current = performance.now();
    pointerVelocity.current = 0;
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
        const grow = Math.min(Math.max(lift / 0.8, 0), 1);
        const closedEffect = (1 - grow) ** 2;
        const stackRank = BOX_COUNT - 1 - i;
        const isBaseStackCard = stackRank < CLOSED_VISIBLE_COUNT;
        const isIncomingStackCard =
          i + CLOSED_VISIBLE_COUNT < BOX_COUNT &&
          boxes[i + CLOSED_VISIBLE_COUNT] > BASE_Y + GAP * 0.2;
        const isStackCard = isBaseStackCard || isIncomingStackCard;
        const isRevealedFromStack = lift > 0.14;
        const closedDepth = isStackCard ? closedEffect : 0;
        const visualStackRank = isIncomingStackCard
          ? CLOSED_VISIBLE_COUNT - 0.45
          : stackRank;
        const z = -visualStackRank * 54 * closedDepth;
        const rotateX = -visualStackRank * 1.5 * closedDepth;
        const closedPeek = isStackCard ? visualStackRank * 28 * closedDepth : 0;
        const closedScale = isStackCard
          ? 1 - visualStackRank * 0.055 * closedDepth
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
              background: "rgba(242, 244, 248, 0.84)",
              borderRadius: 12,
              border: "1px solid rgba(255, 255, 255, 0.48)",
              backdropFilter: "blur(16px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#293241",
              fontWeight: 700,
              userSelect: "none",
              cursor: activeIndex === i ? "grabbing" : "grab",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.32)",
              opacity: isStackCard || isRevealedFromStack ? 1 : 0,
              pointerEvents: isStackCard || isRevealedFromStack ? "auto" : "none",
              zIndex: activeIndex === i
                ? BOX_COUNT + 1
                : isIncomingStackCard
                  ? BOX_COUNT - CLOSED_VISIBLE_COUNT
                  : BOX_COUNT - stackRank,
            }}
          >
            Box {i + 1}
          </div>
        );
      })}
    </main>
  );
}

export default memo(FourVerticalDraggable);

