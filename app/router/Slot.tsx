import {
  UNSAFE_DataRouterContext as DataRouterContext,
  UNSAFE_DataRouterStateContext as DataRouterStateContext,
  useSearchParams,
} from "react-router-dom";

import { UNSAFE_useRoutesImpl as useRoutesImpl } from "react-router";

import * as React from "react";
import invariant from "tiny-invariant";

function useDataRouterContext() {
  let context = React.useContext(DataRouterContext);
  invariant(
    context,
    "You must render this element inside a <DataRouterContext.Provider> element"
  );
  return context;
}

function useDataRouterStateContext() {
  let context = React.useContext(DataRouterStateContext);
  invariant(
    context,
    "You must render this element inside a <DataRouterStateContext.Provider> element"
  );
  return context;
}

interface SlotProps {
  name: string;
}

export default function Slot({ name }: SlotProps): React.ReactElement | null {
  const [searchParams] = useSearchParams();

  const pathname = searchParams.get(`slot-${name}`) ?? undefined;

  const dataRouter = useDataRouterContext();
  const dataRouterState = useDataRouterStateContext();

  // TODO: Probably cleaner if we can pull the necesary logic in here out to our own function,
  // as much of it is not needed for our purposes + it might change upstream and keeping it in sync will be an issue
  const renderedSlotRoute = useRoutesImpl(
    dataRouter.router.routes || [],
    pathname,
    dataRouterState,
    name
  );

  if (!pathname) return null;

  return <>{renderedSlotRoute}</>;
}
