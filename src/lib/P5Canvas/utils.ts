import p5 from "p5"
import diff from "microdiff";
import type { P5CanvasInstance, P5Wrapper, P5WrapperProps, SketchProps, Sketcher, TouchHandler, P5Touch, AutoResizeEnhancedSketcher, MobileTouchEnhancedSketcher, AutoUpdatePropsEnhacnedSKetcher } from "./type";
import { MutableRefObject } from "react";
import { Vector } from "p5";

export function propsAreEqual<Props extends SketchProps = SketchProps>(
  previous: P5WrapperProps<Props>,
  next: P5WrapperProps<Props>
) {
  const differences = diff(previous, next);

  return differences.length === 0;
}

export function createCanvasInstance<Props extends SketchProps = SketchProps>(
  sketch: Sketcher<Props>,
  wrapper: P5Wrapper
): P5CanvasInstance<Props> {
  return new p5(sketch, wrapper);
}

export function removeCanvasInstance<Props extends SketchProps = SketchProps>(
  canvasInstanceRef: MutableRefObject<P5CanvasInstance<Props> | null>
) {
  canvasInstanceRef.current?.remove();
  canvasInstanceRef.current = null;
}

export const createAutoUpdatePropsSketcher = <Props extends SketchProps=SketchProps> (
  func: AutoUpdatePropsEnhacnedSKetcher<Props>
): AutoUpdatePropsEnhacnedSKetcher<Props> => {
  return (p5) => {
    func(p5)
    const originalUpdateProps = p5.updateWithProps
    p5.updateWithProps = (passedProps) => {
      p5.props = passedProps
      originalUpdateProps?.(passedProps)
    }
  }
}

// NOTE: Modify methods of provided sketcher to handling auto resize automatically
export const createAutoResizeSketcher = <Props extends SketchProps=SketchProps>(func: AutoResizeEnhancedSketcher<Props>) : AutoResizeEnhancedSketcher<Props> => {
  return (p5) => {
    func(p5)
    const originalwrapperResize = p5.onWrapperResize
    p5.onWrapperResize = (w: number, h: number) => {
      p5.resizeCanvas(w, h)
      p5.props?.onResize?.(w, h)
      originalwrapperResize?.(w, h) // update joystick
    }

    const originSetup = p5.setup
    p5.setup = () => {
      // Enhanced setup
      p5.resizeCanvas(p5.wrapper?.offsetWidth ?? 0, p5.wrapper?.offsetHeight ?? 0)
      p5.props?.onLoad?.(p5)
      // User define 
      originSetup?.()
    }
  }
}

// NOTE: Modify provided sketcher to handling touch event manager for mobile Devices.
export const createMobileTouchManagerSketcher = <Props extends SketchProps=SketchProps>(func: MobileTouchEnhancedSketcher<Props>) : MobileTouchEnhancedSketcher<Props> => {
  return (p5) =>  {
    let prevTouches = [] as P5Touch[]
    const handlers: Array<TouchHandler> = []

    const touchLeaveHandlers: {
      [touchId: number]: (_: Vector) => void
    } = {}

    let touchActiveHandlers: {
      handlerkey: string,
      touchId: number,
      onDrag: (_: Vector) => void
    }[] = []

    p5.registerTouchHandler = (handler: TouchHandler) => {
      handlers.push(handler)
    }

    function handlingTouch() {
      const touches = p5.touches as P5Touch[]
      const touchIds = new Set(touches.map(t => t.id))
      const prevTouchIds = new Set(prevTouches.map(t => t.id))
      // Filter touches that is currently active, and deactive compare to previous tick
      const deactiveTouches = prevTouches.filter(t => !touchIds.has(t.id))
      const activeTouches = touches.filter(t => !prevTouchIds.has(t.id))
  
      //  on Touch Start
      activeTouches.forEach((touch) => {
        // Find event hanlder that will be active
        const activeHandlers = handlers.filter(({activator, key}) => (
          touch.x >= 0 && touch.y >= 0 // Only handle Touch that inside the canvas
          && !touchActiveHandlers.find(h => h.handlerkey === key)
          && activator(p5.createVector(touch.x, touch.y))
        ))
  
        activeHandlers.forEach(h => {
          // get onLeave handler
          touchActiveHandlers.push({
            handlerkey: h.key,
            touchId: touch.id,
            onDrag: h.onDrag ?? ((_: Vector) => {}),
          })
          h.onStart?.(p5.createVector(touch.x, touch.y))
          if (h.onLeave) {
            touchLeaveHandlers[touch.id] = h.onLeave
          }
        })
      })
  
      //  on Touch Stop
      deactiveTouches.forEach(t => {
        touchLeaveHandlers[t.id]?.(p5.createVector(t.x, t.y))
        delete touchLeaveHandlers[t.id]
        touchActiveHandlers = touchActiveHandlers.filter(h => h.touchId !== t.id)
      })
  
      touchActiveHandlers.forEach(h => {
        const t = touches.find(t => t.id === h.touchId)
        const touchPos = p5.createVector(t?.x, t?.y)
        const prevTouch = prevTouches.find(t => t.id === h.touchId)
        const prevTouchPos = p5.createVector(prevTouch?.x, prevTouch?.y)
        if (t && prevTouchPos.dist(touchPos) > 0) {
          h.onDrag(p5.createVector(t.x, t.y))
        }
      })
  
      // Store prev touch
      prevTouches = touches
    }

    // Take the original method and add more logic
    func(p5)
    const originalDraw = p5.draw
    p5.draw = () => {
      // Invoke registered Callback on active event.
      handlingTouch()
      originalDraw?.()
    }
  }
}
