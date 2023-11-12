import { P5CanvasInstance, P5Wrapper, P5WrapperPropsWithSketch, SketchProps } from "./type";
import { useRef, useMemo, useEffect } from "react";
import { removeCanvasInstance, createCanvasInstance } from "./utils";
import clsx from "clsx";

export function ReactP5WrapperWithSketch<Props extends SketchProps>(props: P5WrapperPropsWithSketch<Props>) {
  const { sketch, children, wrapperProps, ...rest } = props;
  const wrapperRef = useRef<P5Wrapper | null>(null);
  const canvasInstanceRef = useRef<P5CanvasInstance<Props> | null>(null);
  const handleResize = useRef<(_: number, __: number) => void>()

  const resizeObserver = useMemo(() => new ResizeObserver(entries => {
    handleResize.current?.(entries[0].contentRect.width, entries[0].contentRect.height)
  }), [handleResize])


  useEffect(() => {
    if (wrapperRef.current === null) {
      return;
    }
    resizeObserver.observe(wrapperRef.current)

    removeCanvasInstance(canvasInstanceRef);
    canvasInstanceRef.current = createCanvasInstance(
      sketch,
      wrapperRef.current
    );
    canvasInstanceRef.current.wrapper = wrapperRef.current
    handleResize.current = canvasInstanceRef.current.onWrapperResize
  }, [resizeObserver, sketch]);

  useEffect(() => {
    // Espect type of `rest` is Props type but typescript is not smart. 
    canvasInstanceRef.current?.updateWithProps?.(rest as unknown as Props);
  }, [rest]);

  useEffect(() => () => {
    removeCanvasInstance(canvasInstanceRef)
    if (wrapperRef.current) {
      resizeObserver.unobserve(wrapperRef.current)
    }
  }, [resizeObserver]);

  return (
    <div
        ref={wrapperRef}
        className={clsx("h-full w-full", wrapperProps?.className ?? "")}
      {...wrapperProps}
    >
      {children}
    </div>
  );
}