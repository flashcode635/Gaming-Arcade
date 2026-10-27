import type { Metadata } from "next";
import Minesweeper from "@/components/Minesweeper";

export const metadata: Metadata = {
  title: "Minesweeper",
};

export default function Page() {
  return <Minesweeper />;
}
