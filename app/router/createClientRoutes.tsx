import * as React from "react";
import type { DataRouteObject } from "react-router-dom";
import type {
  UNSAFE_RouteModules as RouteModules,
  UNSAFE_FutureConfig as FutureConfig,
  UNSAFE_EntryRoute as EntryRoute
  UNSAFE_RouteManifest as RouteManifest
} from "@remix-run/react";
import { RemixRoute, RemixRouteError } from "./RemixRoute";

export function createClientRoutes(
  manifest: RouteManifest<EntryRoute>,
  routeModulesCache: RouteModules,
  future: FutureConfig,
  parentId: string = "",
  routesByParentId: Record<
    string,
    Omit<EntryRoute, "children">[]
  > = groupRoutesByParentId(manifest),
  needsRevalidation?: Set<string>
): DataRouteObject[] {
  return (routesByParentId[parentId] || []).map((route) => {
    let hasErrorBoundary =
      future.v2_errorBoundary === true
        ? route.id === "root" || route.hasErrorBoundary
        : route.id === "root" ||
          route.hasCatchBoundary ||
          route.hasErrorBoundary;

    let dataRoute: DataRouteObject = {
      caseSensitive: route.caseSensitive,
      element: <RemixRoute id={route.id} />,
      errorElement: hasErrorBoundary ? (
        <RemixRouteError id={route.id} />
      ) : undefined,
      id: route.id,
      index: route.index,
      path: route.path,
      // handle gets added in via useMatches since we aren't guaranteed to
      // have the route module available here
      handle: undefined,
      loader: createDataFunction(route, routeModulesCache, false),
      action: createDataFunction(route, routeModulesCache, true),
      shouldRevalidate: createShouldRevalidate(
        route,
        routeModulesCache,
        needsRevalidation
      ),
    };
    let children = createClientRoutes(
      manifest,
      routeModulesCache,
      future,
      route.id,
      routesByParentId,
      needsRevalidation
    );
    if (children.length > 0) dataRoute.children = children;
    return dataRoute;
  });
}
