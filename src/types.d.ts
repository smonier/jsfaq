/// <reference types="vite/client" />

declare module "@jahia/javascript-modules-library" {
  function jahiaComponent<
    TProps = Record<string, unknown>,
    TContext = Record<string, unknown>
  >(
    config: Record<string, unknown>,
    component: (props: TProps, context: TContext) => import("react").JSX.Element | Promise<import("react").JSX.Element>
  ): void;
}

declare module "*.json" {
  const value: Record<string, string>;
  export default value;
}
