import React from "react";
import invariant from "tiny-invariant";
import {
  UNSAFE_RemixContext as RemixContext,
  UNSAFE_RemixContextObject as RemixContextObject,
} from "@remix-run/react";
export function useRemixContext(): RemixContextObject {
  let context = React.useContext(RemixContext);
  invariant(context, "You must render this element inside a <Remix> element");
  return context;
}
