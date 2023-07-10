import { json } from "@remix-run/node";

export const loader = () => {
  return json({ result: "B " });
};

export default function Profile() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h2>Content Page B</h2>
    </div>
  );
}
