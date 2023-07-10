import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
export { defaultShouldRevalidate as shouldRevalidate } from "~/router/defaultShouldRevalidate";

export const loader = () => {
  return json({ result: "B" });
};

export default function Profile() {
  const data = useLoaderData<typeof loader>();
  console.log("B data: ", data);
  return (
    <div>
      <h2>Content Page B</h2>
    </div>
  );
}
