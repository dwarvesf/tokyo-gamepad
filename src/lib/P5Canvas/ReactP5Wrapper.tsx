import { memo } from "react"
import { P5WrapperProps, P5WrapperPropsWithSketch, SketchProps } from "./type";
import { propsAreEqual } from "./utils";
import { ReactP5WrapperWithSketch } from "./ReactP5WrapperWithSketch";
const ReactP5Wrapper = memo(ReactP5WrapperGuard, propsAreEqual);

function ReactP5WrapperGuard<Props extends SketchProps = SketchProps>(
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


export { ReactP5Wrapper, ReactP5WrapperGuard}
export default ReactP5Wrapper