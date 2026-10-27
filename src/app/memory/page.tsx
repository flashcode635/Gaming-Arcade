import type { Metadata } from "next";
import MemoryGame from "@/components/MemoryGame";

export const metadata: Metadata = {
  title: "Memory Match",
};

export default function Page() {
  return <MemoryGame />;
}
