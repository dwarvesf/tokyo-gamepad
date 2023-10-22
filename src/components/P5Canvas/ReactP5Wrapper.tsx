import { memo, useEffect, useRef } from "react"
import { P5CanvasInstance, P5Wrapper, P5WrapperProps, P5WrapperPropsWithSketch, SketchProps } from "./type";
import { createCanvasInstance, propsAreEqual, removeCanvasInstance } from "./utils";
import { cn } from "@/lib/utils";

export const ReactP5Wrapper = memo(ReactP5WrapperGuard, propsAreEqual);

export function ReactP5WrapperGuard<Props extends SketchProps = SketchProps>(
  props: P5WrapperProps<Props>
) {
  const { sketch, fallback } = props;

  if (sketch === undefined) {
    console.error("[ReactP5Wrapper] The `sketch` prop is required.");

    return fallback !== undefined ? <>{fallback}</> : null;
  }

  return (
    <ReactP5WrapperWithSketch
      /** @see https://github.com/P5-wrapper/react/issues/207 */
      {...(props as unknown as P5WrapperPropsWithSketch<Props>)}
    />
  );
}

export function ReactP5WrapperWithSketch<
  Props extends SketchProps = SketchProps
>(props: P5WrapperPropsWithSketch<Props> & {wrapperClassName?: string}) {
  const { sketch, children, ...rest } = props;
  const wrapperRef = useRef<P5Wrapper | null>(null);
  const canvasInstanceRef = useRef<P5CanvasInstance<Props> | null>(null);

  useEffect(() => {
    if (wrapperRef.current === null) {
      return;
    }

    removeCanvasInstance(canvasInstanceRef);
    canvasInstanceRef.current = createCanvasInstance(
      sketch,
      wrapperRef.current
    );
  }, [sketch]);

  useEffect(() => {
    /** @see https://github.com/P5-wrapper/react/issues/207 */
    canvasInstanceRef.current?.updateWithProps?.(rest as unknown as Props);
  }, [rest]);

  useEffect(() => () => removeCanvasInstance(canvasInstanceRef), []);

  return (
    <div ref={wrapperRef} className={cn("h-full w-full", props.wrapperClassName)}>
      {children}
    </div>
  );
}