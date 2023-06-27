import { useContext } from "react";
import {
  UNSAFE_DataRouterContext,
  UNSAFE_DataRouterStateContext,
  matchRoutes,
  useNavigation,
} from "react-router";
// import { UNSAFE_useRoutesImpl as useRoutesImpl } from "react-router";
import { useRoutesImpl } from "./hooks";
import * as React from "react";
import { UNSAFE_RemixContext as RemixContext } from "@remix-run/react";
import invariant from "tiny-invariant";

interface SlotProps {
  name: string;
  location: Partial<Location> | string;
}

let isHydrated = false;

function useDataRouterContext() {
  let context = React.useContext(UNSAFE_DataRouterContext);
  invariant(
    context,
    "You must render this element inside a <DataRouterContext.Provider> element"
  );
  return context;
}

function useDataRouterStateContext() {
  let context = React.useContext(UNSAFE_DataRouterStateContext);
  invariant(
    context,
    "You must render this element inside a <DataRouterStateContext.Provider> element"
  );
  return context;
}

function useRemixContext() {
  return React.useContext(RemixContext);
}

export interface SafeHtml {
  __html: string;
}
export function createHtml(html: string): SafeHtml {
  return { __html: html };
}

export type ScriptProps = Omit<
  React.HTMLProps<HTMLScriptElement>,
  | "children"
  | "async"
  | "defer"
  | "src"
  | "type"
  | "noModule"
  | "dangerouslySetInnerHTML"
  | "suppressHydrationWarning"
>;
export interface SlotScriptsProps {
  scriptProps?: ScriptProps;
  location: Partial<Location> | string;
}

export function Scripts(props: SlotScriptsProps) {
  const { scriptProps, location } = props;

  let remixContext = useRemixContext();
  let { static: isStatic, router } = useDataRouterContext();

  let matches = matchRoutes(router.routes, location) ?? [];

  const manifest = remixContext?.manifest;

  React.useEffect(() => {
    isHydrated = true;
  }, []);

  let initialScripts = React.useMemo(() => {
    let routeModulesScript =
      !isStatic || !manifest
        ? " "
        : `
  ${matches
    .map(
      (match, index) =>
        `import * as route${index} from ${JSON.stringify(
          manifest.routes[match.route.id].module
        )};`
    )
    .join("\n")}
    setTimeout(() => {
      console.log("[SlotScripts] update remixRouteModules", window.__remixRouteModules)
      window.__remixRouteModules = Object.assign({}, window.__remixRouteModules, {${matches
        .map(
          (match, index) => `${JSON.stringify(match.route.id)}:route${index}`
        )
        .join(",")}});
    }, 10)`;

    // console.log("routeModulesScript", routeModulesScript);

    return (
      <>
        <script
          {...scriptProps}
          suppressHydrationWarning
          dangerouslySetInnerHTML={createHtml(routeModulesScript)}
          type="module"
          async
        />
      </>
    );
    // disabled deps array because we are purposefully only rendering this once
    // for hydration, after that we want to just continue rendering the initial
    // scripts as they were when the page first loaded
    // eslint-disable-next-line
  }, []);

  // avoid waterfall when importing the next route module
  // let nextMatches = React.useMemo(() => {
  //   if (navigation.location) {
  //     // FIXME: can probably use transitionManager `nextMatches`
  //     let matches = matchRoutes(router.routes, navigation.location);
  //     invariant(
  //       matches,
  //       `No routes match path "${navigation.location.pathname}"`
  //     );
  //     return matches;
  //   }

  //   return [];
  // }, [navigation.location, router.routes]);

  // let routePreloads = matches
  //   .concat(nextMatches)
  //   .map((match) => {
  //     let route = manifest.routes[match.route.id];
  //     return (route.imports || []).concat([route.module]);
  //   })
  //   .flat(1);

  // let preloads = isHydrated ? [] : manifest.entry.imports.concat(routePreloads);

  return isHydrated ? null : (
    <>
      {/* <link
        rel="modulepreload"
        href={manifest.entry.module}
        crossOrigin={props.crossOrigin}
      /> */}
      {initialScripts}
    </>
  );
}

export default function Slot({
  name,
  location,
}: SlotProps): React.ReactElement {
  const dataRouter = useContext(UNSAFE_DataRouterContext);
  const dataRouterState =
    useContext(UNSAFE_DataRouterStateContext) ?? dataRouter?.router.state;

  if (typeof window === "undefined") {
    // console.log(dataRouterState);
  }

  const matches = matchRoutes(dataRouter?.router.routes ?? [], location);
  if (typeof window !== "undefined")
    console.log(
      "[Slot] window.__remixRouteModules",
      window.__remixRouteModules
    );
  console.log("[Slot] matches", matches);

  // TODO: Probably cleaner if we can pull the necesary logic in here out to our own function,
  // as much of it is not needed for our purposes + it might change upstream and keeping it in sync will be an issue
  const renderedSlotRoute = useRoutesImpl(
    dataRouter?.router.routes || [],
    location,
    dataRouterState,
    true
  );

  // console.log(renderedSlotRoute);

  // console.log(name, location, dataRouter, dataRouterState);
  return (
    <>
      <Scripts location={location} />
      <span>{renderedSlotRoute}</span>
    </>
  );
}
