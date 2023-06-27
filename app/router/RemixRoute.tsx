import { Outlet, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import {
  RemixCatchBoundary,
  RemixRootDefaultCatchBoundary,
  RemixRootDefaultErrorBoundary,
  V2_RemixRootDefaultErrorBoundary,
} from "@remix-run/react/dist/errorBoundaries";
import invariant from "tiny-invariant";
import { useRemixContext } from "./context";

export function RemixRoute({ id }: { id: string }) {
  let { routeModules, future } = useRemixContext();

  invariant(
    routeModules,
    "Cannot initialize 'routeModules'. This normally occurs when you have server code in your client modules.\n" +
      "Check this link for more details:\nhttps://remix.run/pages/gotchas#server-code-in-client-bundles"
  );

  let { default: Component, ErrorBoundary, CatchBoundary } = routeModules[id];

  // Default Component to Outlet if we expose boundary UI components
  if (
    !Component &&
    (ErrorBoundary || (!future.v2_errorBoundary && CatchBoundary))
  ) {
    Component = Outlet;
  }

  invariant(
    Component,
    `Route "${id}" has no component! Please go add a \`default\` export in the route module file.\n` +
      "If you were trying to navigate or submit to a resource route, use `<a>` instead of `<Link>` or `<Form reloadDocument>`."
  );

  return <Component />;
}

export function RemixRouteError({ id }: { id: string }) {
  let { future, routeModules } = useRemixContext();

  // This checks prevent cryptic error messages such as: 'Cannot read properties of undefined (reading 'root')'
  invariant(
    routeModules,
    "Cannot initialize 'routeModules'. This normally occurs when you have server code in your client modules.\n" +
      "Check this link for more details:\nhttps://remix.run/pages/gotchas#server-code-in-client-bundles"
  );

  let error = useRouteError();
  let { CatchBoundary, ErrorBoundary } = routeModules[id];

  if (future.v2_errorBoundary) {
    // Provide defaults for the root route if they are not present
    if (id === "root") {
      ErrorBoundary ||= V2_RemixRootDefaultErrorBoundary;
    }
    if (ErrorBoundary) {
      // TODO: Unsure if we can satisfy the typings here
      return <ErrorBoundary />;
    }
    throw error;
  }

  // Provide defaults for the root route if they are not present
  if (id === "root") {
    CatchBoundary ||= RemixRootDefaultCatchBoundary;
    ErrorBoundary ||= RemixRootDefaultErrorBoundary;
  }

  if (isRouteErrorResponse(error)) {
    let tError = error;
    if (!!tError?.error && tError.status !== 404 && ErrorBoundary) {
      // Internal framework-thrown ErrorResponses
      return <ErrorBoundary error={tError.error} />;
    }
    if (CatchBoundary) {
      // User-thrown ErrorResponses
      return <RemixCatchBoundary catch={error} component={CatchBoundary} />;
    }
  }

  if (error instanceof Error && ErrorBoundary) {
    // User- or framework-thrown Errors
    return <ErrorBoundary error={error} />;
  }

  throw error;
}
