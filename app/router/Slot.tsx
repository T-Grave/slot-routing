import {
  UNSAFE_DataRouterContext,
  UNSAFE_DataRouterStateContext,
} from "react-router";

import { useRoutesImpl } from "./hooks";
import * as React from "react";
import invariant from "tiny-invariant";

interface SlotProps {
  name: string;
  location: Partial<Location> | string;
}

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

export default function Slot({
  name,
  location,
}: SlotProps): React.ReactElement {
  const dataRouter = useDataRouterContext();
  const dataRouterState = useDataRouterStateContext();

  if (typeof window === "undefined") {
    // console.log(dataRouterState);
  }

  // TODO: Probably cleaner if we can pull the necesary logic in here out to our own function,
  // as much of it is not needed for our purposes + it might change upstream and keeping it in sync will be an issue
  const renderedSlotRoute = useRoutesImpl(
    dataRouter.router.routes || [],
    location,
    dataRouterState,
    true
  );

  return (
    <>
      <span>{renderedSlotRoute}</span>
    </>
  );
}
