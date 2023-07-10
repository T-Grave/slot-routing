import { type ShouldRevalidateFunction } from "@remix-run/react";
import { slotPathsChanged } from "./slotPathChanged";

export const defaultShouldRevalidate: ShouldRevalidateFunction = (args) => {
  const { currentUrl, nextUrl, defaultShouldRevalidate } = args;
  if (slotPathsChanged(currentUrl, nextUrl)) {
    console.log("OH NO IT CHANGED");
    return false;
  }

  return defaultShouldRevalidate;
};
