import { type ShouldRevalidateFunction } from "@remix-run/react";
import { slotPathsChanged } from "./slotPathsChanged";

export const defaultShouldRevalidate: ShouldRevalidateFunction = (args) => {
  const { currentUrl, nextUrl, defaultShouldRevalidate } = args;
  if (slotPathsChanged(currentUrl, nextUrl)) {
    return false;
  }

  return defaultShouldRevalidate;
};
