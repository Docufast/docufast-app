import type { Metadata } from "next";
import SignInClient from "./SignInClient";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function SignInPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  return <SignInClient redirect={searchParams.redirect} />;
}
