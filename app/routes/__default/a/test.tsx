import { json } from "@remix-run/node";

export const loader = () => {
  return json({ result: "A-test" });
};

export default function test() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h3>Content Page A-Test</h3>
    </div>
  );
}
