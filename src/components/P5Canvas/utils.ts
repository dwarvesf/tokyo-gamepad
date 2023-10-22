import p5 from "p5"
import diff from "microdiff";
import type { P5CanvasInstance, P5Wrapper, P5WrapperProps, SketchProps, Sketcher } from "./type";
import { MutableRefObject } from "react";

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
