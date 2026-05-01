import type { Metadata } from "next";
import SignupClient from "@/components/auth/SignupClient";

export const metadata: Metadata = {
  title: "Create Account — PeptoBuy",
  description: "Create your researcher account on PeptoBuy.",
};

export default function SignupPage() {
  return <SignupClient />;
}
