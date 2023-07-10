import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export const loader = () => {
  return json({ result: "A" });
};

export default function General() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h2>Content Page A</h2>
      <Outlet />
    </div>
  );
}
