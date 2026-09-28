/**
 * Pointer state shared between DOM listeners (attached by HeroScene to
 * its wrapper) and the render loop (NodeField). A single mutable object,
 * read once per frame, so no React state churn and no allocations.
 *
 * Coordinates are NDC relative to the wrapper element: x in [-1, 1]
 * left->right, y in [-1, 1] bottom->top.
 */

export interface InteractionState {
  /** Latest pointer position (NDC). */
  x: number;
  y: number;
  /** Pointer is over the wrapper (or a touch is in progress). */
  hovering: boolean;
  /** Primary button / touch is down and started on the wrapper. */
  dragging: boolean;
  /** Accumulated NDC travel since the render loop last consumed it. */
  dragDx: number;
  dragDy: number;
}

export function createInteractionState(): InteractionState {
  return { x: 0, y: 0, hovering: false, dragging: false, dragDx: 0, dragDy: 0 };
}

/**
 * Wires pointer listeners. Down starts on the element; move and up are on
 * window so a drag continues past the edge and hover works through
 * overlaid text that lives above the canvas. Returns a cleanup function.
 */
export function attachInteraction(element: HTMLElement, state: InteractionState): () => void {
  let lastX = 0;
  let lastY = 0;
  let activePointer: number | null = null;

  const toNdc = (clientX: number, clientY: number): boolean => {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    state.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    state.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    return state.x >= -1 && state.x <= 1 && state.y >= -1 && state.y <= 1;
  };

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (activePointer !== null) return;
    activePointer = e.pointerId;
    toNdc(e.clientX, e.clientY);
    lastX = state.x;
    lastY = state.y;
    state.hovering = true;
    state.dragging = true;
  };

  const onMove = (e: PointerEvent) => {
    if (activePointer !== null && e.pointerId !== activePointer) return;
    const inside = toNdc(e.clientX, e.clientY);
    if (state.dragging) {
      state.dragDx += state.x - lastX;
      state.dragDy += state.y - lastY;
      lastX = state.x;
      lastY = state.y;
      state.hovering = true;
    } else {
      state.hovering = inside && e.pointerType !== 'touch';
    }
  };

  const endDrag = (e: PointerEvent) => {
    if (e.pointerId !== activePointer) return;
    activePointer = null;
    state.dragging = false;
    if (e.pointerType === 'touch') state.hovering = false;
  };

  const onLeaveWindow = () => {
    if (!state.dragging) state.hovering = false;
  };

  element.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', endDrag, { passive: true });
  window.addEventListener('pointercancel', endDrag, { passive: true });
  document.addEventListener('pointerleave', onLeaveWindow);
  window.addEventListener('blur', onLeaveWindow);

  return () => {
    element.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    document.removeEventListener('pointerleave', onLeaveWindow);
    window.removeEventListener('blur', onLeaveWindow);
    state.hovering = false;
    state.dragging = false;
  };
}
