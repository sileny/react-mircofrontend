import { registerApplication, start } from "single-spa";

// 注册应用
// registerApplication(
//   "@single-spa/welcome",
//   () =>
//     System.import(
//       "https://unpkg.com/single-spa-welcome/dist/single-spa-welcome.js"
//     ),
//   // activeWhen: ["/"],
//   (location) => {
//     return location.pathname === "/";
//   }
// );

registerApplication({
  name: "@test/main",
  app: () => System.import("@test/main"),
  activeWhen: ["/main"],
});

registerApplication(
  "@test/navbar",
  () => System.import("@test/navbar"),
  location => true,
);

start({
  urlRerouteOnly: true,
});
