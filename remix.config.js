/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  // routes: async (defineRoutes) => {
  //   return defineRoutes((route) => {
  //     const contentRoutes = () => {
  //       route("a", "routes/a.tsx");
  //       route("b", "routes/b.tsx");
  //     };
  //     contentRoutes();
  //     route("/*", "layouts/default.tsx");
  //     route("/special-layout/*", "layouts/special-layout.tsx");
  //   });
  // },
  serverModuleFormat: "cjs",
  unstable_dev: true,
  future: {
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: false,
  },
};
