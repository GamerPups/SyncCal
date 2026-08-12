export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/calendar/:path*", "/workspaces/:path*", "/settings/:path*"],
};
