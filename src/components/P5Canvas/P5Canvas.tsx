import dynamic from "next/dynamic";

export const P5Canvas = dynamic(
    async () =>  (await import('./ReactP5Wrapper')).ReactP5Wrapper,
    { ssr: false }
);