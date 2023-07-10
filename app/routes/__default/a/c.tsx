import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
export { defaultShouldRevalidate as shouldRevalidate } from "~/router/defaultShouldRevalidate";

export const loader = () => {
  return json({ result: "C" });
};

export default function C() {
  const data = useLoaderData<typeof loader>();
  console.log("C data: ", data);
  return (
    <div>
      <h3>Content Page A-Test</h3>
    </div>
  );
}
