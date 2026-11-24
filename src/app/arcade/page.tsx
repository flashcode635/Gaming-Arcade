import type { Metadata } from "next";
import ArcadeHub from "@/components/arcade/ArcadeHub";

export const metadata: Metadata = {
  title: "Arcade",
  description: "Six neon games, one shared wallet. Pick a cabinet and play.",
};

export default function ArcadePage() {
  return <ArcadeHub />;
}
