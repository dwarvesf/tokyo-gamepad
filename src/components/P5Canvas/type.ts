import type p5 from "p5";
import { PropsWithChildren, ReactNode } from "react";

export type SketchProps = { [key: string]: unknown };

export type  P5Wrapper= HTMLDivElement

export type P5CanvasInstance<Props extends SketchProps = SketchProps> = p5 & {
  updateWithProps?: (props: Props) => void
}

export type Sketcher<Props extends SketchProps=SketchProps> = (instance: P5CanvasInstance<Props>) => void

export type InputProps<Props extends SketchProps = SketchProps> = Props & {
  sketch?: Sketcher<Props>;
  fallback?: ReactNode;
}

// for P5Wrapper
export type P5WrapperProps<Props extends SketchProps = SketchProps> =
  PropsWithChildren<InputProps<Props>>;

// for P5WrapperGuard
export type P5WrapperPropsWithSketch<Props extends SketchProps = SketchProps> =
  P5WrapperProps<Props> & { sketch: Sketcher<Props> };

