import dynamic from "next/dynamic";

export const GoogleProvider = dynamic(
  () => import("@react-oauth/google").then((mod) => mod.GoogleOAuthProvider),
  { ssr: false },
);
