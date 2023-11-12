import type p5 from "p5";
import { HTMLProps, PropsWithChildren, ReactNode } from "react";
import { Vector } from "p5";

// Props that ReactP5Wrapper take in.
// These Props will passed in to `updateWithProps` method in its Sketcher on changed.
export type SketchProps = {
  [key: string]: unknown
}

export type  P5Wrapper= HTMLDivElement

// Extended P5 Canvas instance type
export type P5CanvasInstance<Props extends SketchProps = SketchProps> = p5 & {
  updateWithProps?: (_: Props) => void
  wrapper?: P5Wrapper
  onWrapperResize?: (_: number, __: number) => void
  props?: Props
}

// Base Sketcher
export type Sketcher<Props extends SketchProps=SketchProps> = (_: P5CanvasInstance<Props>) => void

// Extend P5CanvaInstance for working with `createMobileTouchManagerSketcher`
export type MobileTouchP5CanvasInstance<Props extends SketchProps=SketchProps> = P5CanvasInstance<Props> & {
  registerTouchHandler?: (_: TouchHandler) => void
}
export type MobileTouchEnhancedSketcher<Props extends SketchProps=SketchProps> = (_: MobileTouchP5CanvasInstance<Props>) => void

// Extend P5CanvaInstance for working with `createAutoUpdatePropSketcher`
export type AutoUpdatePropsP5CanvasInstance<Props extends SketchProps=SketchProps> = P5CanvasInstance<Props> & {
  props?: Props
}
export type AutoUpdatePropsEnhacnedSKetcher<Props extends SketchProps=SketchProps> = (_: AutoUpdatePropsP5CanvasInstance<Props>) => void

// Extend Base Sketcher Props for working with createAutoResizeSketcher
export type AutoResizeSketchProps<Props extends SketchProps = SketchProps> = Props & {
  onLoad?: (_: P5CanvasInstance<Props>) => void
  onResize?: (_: number, __: number) => void
}
export type AutoResizeEnhancedSketcher<Props extends AutoResizeSketchProps=AutoResizeSketchProps> = Sketcher<AutoResizeSketchProps<Props>>


// Input props of P5Wrapper
export type InputProps<Props extends SketchProps = SketchProps> = Props & {
  sketch?: Sketcher<Props>;
  fallback?: ReactNode;
  wrapperProps?: HTMLProps<P5Wrapper>
}

export type P5WrapperProps<Props extends SketchProps = SketchProps> =
  PropsWithChildren<InputProps<Props>>;

// for P5WrapperGuard
export type P5WrapperPropsWithSketch<Props extends SketchProps = SketchProps> =
  P5WrapperProps<Props> & { sketch: Sketcher<Props> };

export type TouchHandler = {
  key: string,
  activator: (_: Vector) => boolean,
  onLeave?: (_: Vector) => void,
  onStart?: (_: Vector) => void,
  onDrag?: (_: Vector) => void
}

export interface P5Touch {
  id: number
  x: number
  y: number 
  winX: number
  winY: number
}

