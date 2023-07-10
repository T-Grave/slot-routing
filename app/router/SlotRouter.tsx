import {
  UNSAFE_RemixContext as RemixContext,
  PATCHED_createClientRoutes as createClientRoutes,
  PATCHED_RemixErrorBoundary as RemixErrorBoundary,
  PATCHED_RemixRootDefaultErrorBoundary as RemixRootDefaultErrorBoundary,
} from "@remix-run/react";
import type { Router } from "@remix-run/router";
import { useEffect, type ReactElement } from "react";
import * as React from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

export interface RemixBrowserProps {
  path: string;
}

declare global {
  interface ImportMeta {
    hot: any;
  }
}

export function SlotRouter(_props: RemixBrowserProps): ReactElement | null {
  const { path } = _props;
  const [router, setRouter] = React.useState<Router | undefined>();

  useEffect(() => {
    // if (!router) {
    let routes = createClientRoutes(
      window.__remixManifest.routes,
      window.__remixRouteModules,
      window.__remixContext.future
    );
    console.log(routes);

    let hydrationData = window.__remixContext.state;
    if (hydrationData && hydrationData.errors) {
      hydrationData = {
        ...hydrationData,
        errors: null, //deserializeErrors(hydrationData.errors),
      };
    }

    const r = createMemoryRouter(routes, {
      initialEntries: [path],
      hydrationData,
      future: {
        // Pass through the Remix future flag to avoid a v1 breaking change in
        // useNavigation() - users can control the casing via the flag in v1.
        // useFetcher still always uppercases in the back-compat layer in v1.
        // In v2 we can just always pass true here and remove the back-compat
        // layer
        v7_normalizeFormMethod:
          window.__remixContext.future.v2_normalizeFormMethod,
      },
    });

    setRouter(r);

    // let initialUrl = window.__remixContext.url;
    // let hydratedUrl = window.location.pathname + window.location.search;
    // if (initialUrl !== hydratedUrl) {
    //   let errorMsg =
    //     `Initial URL (${initialUrl}) does not match URL at time of hydration ` +
    //     `(${hydratedUrl}), reloading page...`;
    //   console.error(errorMsg);
    //   window.location.reload();
    // }
    // }
  }, []);

  // console.log(
  //   "[RemixBrowser] NO ROUTER - window.__remixRouteModules",
  //   window.__remixRouteModules
  // );

  // const [searchParams] = useSearchParams();
  // const slotPath = searchParams.get("slot-sidebar");

  // React.useLayoutEffect(() => {
  //   router?.navigate(path + searchParams.toString());-`
  // }, [path, router]);

  // let [location, setLocation] = React.useState(router?.state.location);

  // React.useLayoutEffect(() => {
  //   return router?.subscribe((newState) => {
  //     if (newState.location !== location) {
  //       setLocation(newState.location);
  //     }
  //   });
  // }, [location, router]);

  // We need to include a wrapper RemixErrorBoundary here in case the root error
  // boundary also throws and we need to bubble up outside of the router entirely.
  // Then we need a stateful location here so the user can back-button navigate
  // out of there

  const location = path;

  useEffect(() => {
    router?.navigate(path);
  }, [path, router]);

  if (!location || !router) return null;

  return (
    <RemixContext.Provider
      value={{
        manifest: window.__remixManifest,
        routeModules: window.__remixRouteModules,
        future: window.__remixContext.future,
      }}
    >
      <RemixErrorBoundary
        location={location}
        component={RemixRootDefaultErrorBoundary}
      >
        <RouterProvider
          router={router}
          fallbackElement={null}
          future={{ v7_startTransition: true }}
        />
      </RemixErrorBoundary>
    </RemixContext.Provider>
  );
}
