import type { Metadata } from "next";
import LoginClient from "@/components/auth/LoginClient";

export const metadata: Metadata = {
  title: "Sign In — PeptoBuy",
  description: "Sign in to your PeptoBuy account.",
};

export default function LoginPage() {
  return <LoginClient />;
}
