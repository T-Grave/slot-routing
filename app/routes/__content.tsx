import { Link, Outlet } from "@remix-run/react";
import Slot from "~/router/Slot";

export default function Default() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Default Layout</h1>
      <nav>
        <Link to={`/a`}>Open A inside main</Link>
        <br />
        <Link to={`?sidebar=/a`}>Open A inside sidebar</Link>
        <br />
        <Link to={`/b`}>Open B inside main</Link>
        <br />
        <Link to={`?sidebar=/b`}>Open B inside sidebar</Link>
      </nav>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
        <div style={{ flex: 1 }}>
          {/* <Slot location={`/a`} name="sidepane" /> */}
        </div>
      </div>
    </div>
  );
}
