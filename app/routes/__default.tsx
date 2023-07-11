import { Link, Outlet } from "@remix-run/react";
import Slot from "~/slot-router/Slot";

export default function Index() {
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
      }}
    >
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 20,
          borderRight: "1px solid #ccc",
        }}
      >
        <Link to={`/a`}>Open A inside main</Link>
        <Link to={`?slot-sidebar=/a`}>Open A inside sidebar</Link>
        <Link to={`?slot-sidebar=/a/c`}>Open A-C inside sidebar</Link>
        <Link to={`/b`}>Open B inside main</Link>
        <Link to={`?slot-sidebar=/b`}>Open B inside sidebar</Link>
      </nav>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 2,
          padding: 20,
        }}
      >
        <h1>Default Layout</h1>
        <div>
          <Outlet />
        </div>
      </div>
      <div
        style={{
          padding: 20,
          flex: 1,
          borderLeft: "1px solid #ccc",
          height: "100%",
        }}
      >
        <Slot name="sidebar" />
      </div>
    </div>
  );
}
