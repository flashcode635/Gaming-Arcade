import type { Metadata } from "next";
import Sudoku from "@/components/games/Sudoku";

export const metadata: Metadata = {
  title: "Sudoku",
};

export default function Page() {
  return <Sudoku />;
}
