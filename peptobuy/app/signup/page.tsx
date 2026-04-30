import type { Metadata } from "next";
import SignupClient from "@/components/auth/SignupClient";

export const metadata: Metadata = {
  title: "Create Account — PeptoBuy",
  description: "Join PeptoBuy and get access to premium performance supplements.",
};

export default function SignupPage() {
  return <SignupClient />;
}
