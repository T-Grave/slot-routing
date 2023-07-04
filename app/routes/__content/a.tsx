import { json } from "@remix-run/node";

export const loader = () => {
  return json({ result: "A" });
};

export default function General() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Content Page A</h1>
    </div>
  );
}
