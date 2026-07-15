import type { Metadata } from "next";
import ClarityApp from "./ClarityApp";

export const metadata: Metadata = {
  title: "Clarity",
  description: "Know your water. Shared aquarium care, water testing, maintenance, and history.",
};

export default function Home() {
  return <ClarityApp />;
}
