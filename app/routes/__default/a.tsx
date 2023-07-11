import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

export { defaultShouldRevalidate as shouldRevalidate } from "~/slot-router/defaultShouldRevalidate";

export const loader = () => {
  return json({ result: "A" });
};

export default function General() {
  const data = useLoaderData<typeof loader>();
  console.log("A data: ", data);
  return (
    <div>
      <h2>Content Page A</h2>
      <Outlet />
    </div>
  );
}
