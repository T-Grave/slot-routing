import { Link, Outlet, useLocation, useSearchParams } from "@remix-run/react";
import Slot from "~/router/Slot";
import { SlotRouter } from "~/router/SlotRouter";

export default function DefaultLayout() {
  // const location = useLocation();
  const [searchParams] = useSearchParams();
  const sidebar = searchParams.get("slot-sidebar");

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
        {/* {sidebar ? <Slot location={sidebar} name="sidebar" /> : "empty"} */}
        {sidebar ? <SlotRouter path={sidebar} /> : "empty"}
      </div>
    </div>
  );
}
