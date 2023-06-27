import * as React from "react";
import type {
  Location,
  Router as RemixRouter,
  RevalidationState,
} from "@remix-run/router";
import {
  Action as NavigationType,
  UNSAFE_invariant as invariant,
  joinPaths,
  matchRoutes,
  parsePath,
  UNSAFE_warning as warning,
} from "@remix-run/router";

import type { RouteObject, RouteMatch, DataRouteMatch } from "react-router";

import {
  useLocation,
  useRouteError,
  UNSAFE_LocationContext as LocationContext,
  UNSAFE_NavigationContext as NavigationContext,
  UNSAFE_RouteContext as RouteContext,
  UNSAFE_DataRouterContext as DataRouterContext,
  isRouteErrorResponse,
} from "react-router";

const __DEV__ = true;

export const RouteErrorContext = React.createContext<any>(null);

if (__DEV__) {
  RouteErrorContext.displayName = "RouteError";
}

export interface RouteContextObject {
  outlet: React.ReactElement | null;
  matches: RouteMatch[];
  isDataRoute: boolean;
}

const warningOnce = (...args: any) => {
  console.warn(...args);
};
/**
 * Returns true if this component is a descendant of a <Router>.
 *
 * @see https://reactrouter.com/hooks/use-in-router-context
 */
export function useInRouterContext(): boolean {
  return React.useContext(LocationContext) != null;
}

/**
 * Returns the element of the route that matched the current location, prepared
 * with the correct context to render the remainder of the route tree. Route
 * elements in the tree must render an <Outlet> to render their child route's
 * element.
 *
 * @see https://reactrouter.com/hooks/use-routes
 */
export function useRoutes(
  routes: RouteObject[],
  locationArg?: Partial<Location> | string
): React.ReactElement | null {
  return useRoutesImpl(routes, locationArg);
}

// Internal implementation with accept optional param for RouterProvider usage
export function useRoutesImpl(
  routes: RouteObject[],
  locationArg?: Partial<Location> | string,
  dataRouterState?: RemixRouter["state"],
  slot?: boolean
): React.ReactElement | null {
  invariant(
    useInRouterContext(),
    // TODO: This error is probably because they somehow have 2 versions of the
    // router loaded. We can help them understand how to avoid that.
    `useRoutes() may be used only in the context of a <Router> component.`
  );

  let { navigator } = React.useContext(NavigationContext);
  let { matches: parentMatches } = React.useContext(RouteContext);
  let routeMatch = parentMatches[parentMatches.length - 1];
  let parentParams = routeMatch ? routeMatch.params : {};
  // NOTE ROBIN
  // If rendered within a slot, do not treat the calling parent as the parentPathname, as slots are absolute.
  let parentPathname = routeMatch && !slot ? routeMatch.pathname : "/";
  let parentPathnameBase = routeMatch && !slot ? routeMatch.pathnameBase : "/";
  let parentRoute = routeMatch && routeMatch.route;

  if (__DEV__) {
    // You won't get a warning about 2 different <Routes> under a <Route>
    // without a trailing *, but this is a best-effort warning anyway since we
    // cannot even give the warning unless they land at the parent route.
    //
    // Example:
    //
    // <Routes>
    //   {/* This route path MUST end with /* because otherwise
    //       it will never match /blog/post/123 */}
    //   <Route path="blog" element={<Blog />} />
    //   <Route path="blog/feed" element={<BlogFeed />} />
    // </Routes>
    //
    // function Blog() {
    //   return (
    //     <Routes>
    //       <Route path="post/:id" element={<Post />} />
    //     </Routes>
    //   );
    // }
    // let parentPath = (parentRoute && parentRoute.path) || "";
    // warningOnce(
    //   parentPathname,
    //   !parentRoute || parentPath.endsWith("*"),
    //   `You rendered descendant <Routes> (or called \`useRoutes()\`) at ` +
    //     `"${parentPathname}" (under <Route path="${parentPath}">) but the ` +
    //     `parent route path has no trailing "*". This means if you navigate ` +
    //     `deeper, the parent won't match anymore and therefore the child ` +
    //     `routes will never render.\n\n` +
    //     `Please change the parent <Route path="${parentPath}"> to <Route ` +
    //     `path="${parentPath === "/" ? "*" : `${parentPath}/*`}">.`
    // );
  }

  let locationFromContext = useLocation();

  let location;
  if (locationArg) {
    let parsedLocationArg =
      typeof locationArg === "string" ? parsePath(locationArg) : locationArg;

    // invariant(
    //   parentPathnameBase === "/" ||
    //     parsedLocationArg.pathname?.startsWith(parentPathnameBase),
    //   `When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, ` +
    //     `the location pathname must begin with the portion of the URL pathname that was ` +
    //     `matched by all parent routes. The current pathname base is "${parentPathnameBase}" ` +
    //     `but pathname "${parsedLocationArg.pathname}" was given in the \`location\` prop.`
    // );

    location = parsedLocationArg;
  } else {
    location = locationFromContext;
  }

  let pathname = location.pathname || "/";
  let remainingPathname =
    parentPathnameBase === "/"
      ? pathname
      : pathname.slice(parentPathnameBase.length) || "/";

  // NOTE ROBIN
  // useRoutesImpl renders the entire pathway, including the root.
  // We want to avoid this, as we already have the root rendered (<html><bdy>...).
  let matches =
    matchRoutes(routes, { pathname: remainingPathname })?.filter(
      (match) => match.pathname !== parentPathname
    ) ?? null;

  // console.log(matches, routes, remainingPathname);

  if (__DEV__) {
    warning(
      parentRoute || matches != null,
      `No routes matched location "${location.pathname}${location.search}${location.hash}" `
    );

    warning(
      matches == null ||
        matches[matches.length - 1].route.element !== undefined ||
        matches[matches.length - 1].route.Component !== undefined,
      `Matched leaf route at location "${location.pathname}${location.search}${location.hash}" ` +
        `does not have an element or Component. This means it will render an <Outlet /> with a ` +
        `null value by default resulting in an "empty" page.`
    );
  }

  console.log("[useRoutesImpl]", matches);

  let renderedMatches = _renderMatches(
    matches &&
      matches.map((match) =>
        Object.assign({}, match, {
          params: Object.assign({}, parentParams, match.params),
          pathname: joinPaths([
            parentPathnameBase,
            // Re-encode pathnames that were decoded inside matchRoutes
            navigator.encodeLocation
              ? navigator.encodeLocation(match.pathname).pathname
              : match.pathname,
          ]),
          pathnameBase:
            match.pathnameBase === "/"
              ? parentPathnameBase
              : joinPaths([
                  parentPathnameBase,
                  // Re-encode pathnames that were decoded inside matchRoutes
                  navigator.encodeLocation
                    ? navigator.encodeLocation(match.pathnameBase).pathname
                    : match.pathnameBase,
                ]),
        })
      ),
    parentMatches,
    dataRouterState
  );

  // When a user passes in a `locationArg`, the associated routes need to
  // be wrapped in a new `LocationContext.Provider` in order for `useLocation`
  // to use the scoped location instead of the global location.
  if (locationArg && renderedMatches) {
    return (
      <LocationContext.Provider
        value={{
          location: {
            pathname: "/",
            search: "",
            hash: "",
            state: null,
            key: "default",
            ...location,
          },
          navigationType: NavigationType.Pop,
        }}
      >
        {renderedMatches}
      </LocationContext.Provider>
    );
  }

  return renderedMatches;
}

function DefaultErrorComponent() {
  let error = useRouteError();
  let message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
    ? error.message
    : JSON.stringify(error);
  let stack = error instanceof Error ? error.stack : null;
  let lightgrey = "rgba(200,200,200, 0.5)";
  let preStyles = { padding: "0.5rem", backgroundColor: lightgrey };
  let codeStyles = { padding: "2px 4px", backgroundColor: lightgrey };

  let devInfo = null;
  if (__DEV__) {
    console.error(
      "Error handled by React Router default ErrorBoundary:",
      error
    );

    devInfo = (
      <>
        <p>💿 Hey developer 👋</p>
        <p>
          You can provide a way better UX than this when your app throws errors
          by providing your own <code style={codeStyles}>ErrorBoundary</code> or{" "}
          <code style={codeStyles}>errorElement</code> prop on your route.
        </p>
      </>
    );
  }

  return (
    <>
      <h2>Unexpected Application Error!</h2>
      <h3 style={{ fontStyle: "italic" }}>{message}</h3>
      {stack ? <pre style={preStyles}>{stack}</pre> : null}
      {devInfo}
    </>
  );
}

const defaultErrorElement = <DefaultErrorComponent />;

type RenderErrorBoundaryProps = React.PropsWithChildren<{
  location: Location;
  revalidation: RevalidationState;
  error: any;
  component: React.ReactNode;
  routeContext: RouteContextObject;
}>;

type RenderErrorBoundaryState = {
  location: Location;
  revalidation: RevalidationState;
  error: any;
};

export class RenderErrorBoundary extends React.Component<
  RenderErrorBoundaryProps,
  RenderErrorBoundaryState
> {
  constructor(props: RenderErrorBoundaryProps) {
    super(props);
    this.state = {
      location: props.location,
      revalidation: props.revalidation,
      error: props.error,
    };
  }

  static getDerivedStateFromError(error: any) {
    return { error: error };
  }

  static getDerivedStateFromProps(
    props: RenderErrorBoundaryProps,
    state: RenderErrorBoundaryState
  ) {
    // When we get into an error state, the user will likely click "back" to the
    // previous page that didn't have an error. Because this wraps the entire
    // application, that will have no effect--the error page continues to display.
    // This gives us a mechanism to recover from the error when the location changes.
    //
    // Whether we're in an error state or not, we update the location in state
    // so that when we are in an error state, it gets reset when a new location
    // comes in and the user recovers from the error.
    if (
      state.location !== props.location ||
      (state.revalidation !== "idle" && props.revalidation === "idle")
    ) {
      return {
        error: props.error,
        location: props.location,
        revalidation: props.revalidation,
      };
    }

    // If we're not changing locations, preserve the location but still surface
    // any new errors that may come through. We retain the existing error, we do
    // this because the error provided from the app state may be cleared without
    // the location changing.
    return {
      error: props.error || state.error,
      location: state.location,
      revalidation: props.revalidation || state.revalidation,
    };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(
      "React Router caught the following error during render",
      error,
      errorInfo
    );
  }

  render() {
    return this.state.error ? (
      <RouteContext.Provider value={this.props.routeContext}>
        <RouteErrorContext.Provider
          value={this.state.error}
          children={this.props.component}
        />
      </RouteContext.Provider>
    ) : (
      this.props.children
    );
  }
}

interface RenderedRouteProps {
  routeContext: RouteContextObject;
  match: RouteMatch<string, RouteObject>;
  children: React.ReactNode | null;
}

function RenderedRoute({ routeContext, match, children }: RenderedRouteProps) {
  let dataRouterContext = React.useContext(DataRouterContext);

  // Track how deep we got in our render pass to emulate SSR componentDidCatch
  // in a DataStaticRouter
  if (
    dataRouterContext &&
    dataRouterContext.static &&
    dataRouterContext.staticContext &&
    (match.route.errorElement || match.route.ErrorBoundary)
  ) {
    dataRouterContext.staticContext._deepestRenderedBoundaryId = match.route.id;
  }

  return (
    <RouteContext.Provider value={routeContext}>
      {children}
    </RouteContext.Provider>
  );
}

export function _renderMatches(
  matches: RouteMatch[] | null,
  parentMatches: RouteMatch[] = [],
  dataRouterState: RemixRouter["state"] | null = null
): React.ReactElement | null {
  if (matches == null) {
    if (dataRouterState?.errors) {
      // Don't bail if we have data router errors so we can render them in the
      // boundary.  Use the pre-matched (or shimmed) matches
      matches = dataRouterState.matches as DataRouteMatch[];
    } else {
      return null;
    }
  }

  let renderedMatches = matches;

  // If we have data errors, trim matches to the highest error boundary
  let errors = dataRouterState?.errors;
  if (errors != null) {
    let errorIndex = renderedMatches.findIndex(
      (m) => m.route.id && errors?.[m.route.id]
    );
    invariant(
      errorIndex >= 0,
      `Could not find a matching route for errors on route IDs: ${Object.keys(
        errors
      ).join(",")}`
    );
    renderedMatches = renderedMatches.slice(
      0,
      Math.min(renderedMatches.length, errorIndex + 1)
    );
  }

  return renderedMatches.reduceRight((outlet, match, index) => {
    let error = match.route.id ? errors?.[match.route.id] : null;
    // Only data routers handle errors
    let errorElement: React.ReactNode | null = null;
    if (dataRouterState) {
      errorElement = match.route.errorElement || defaultErrorElement;
    }
    let matches = parentMatches.concat(renderedMatches.slice(0, index + 1));
    let getChildren = () => {
      let children: React.ReactNode;
      if (error) {
        children = errorElement;
      } else if (match.route.Component) {
        // Note: This is a de-optimized path since React won't re-use the
        // ReactElement since it's identity changes with each new
        // React.createElement call.  We keep this so folks can use
        // `<Route Component={...}>` in `<Routes>` but generally `Component`
        // usage is only advised in `RouterProvider` when we can convert it to
        // `element` ahead of time.
        children = <match.route.Component />;
      } else if (match.route.element) {
        children = match.route.element;
      } else {
        children = outlet;
      }
      return (
        <RenderedRoute
          match={match}
          routeContext={{
            outlet,
            matches,
            isDataRoute: dataRouterState != null,
          }}
          children={children}
        />
      );
    };
    // Only wrap in an error boundary within data router usages when we have an
    // ErrorBoundary/errorElement on this route.  Otherwise let it bubble up to
    // an ancestor ErrorBoundary/errorElement
    return dataRouterState &&
      (match.route.ErrorBoundary || match.route.errorElement || index === 0) ? (
      <RenderErrorBoundary
        location={dataRouterState.location}
        revalidation={dataRouterState.revalidation}
        component={errorElement}
        error={error}
        children={getChildren()}
        routeContext={{ outlet: null, matches, isDataRoute: true }}
      />
    ) : (
      getChildren()
    );
  }, null as React.ReactElement | null);
}
