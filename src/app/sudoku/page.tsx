import type { Metadata } from "next";
import Sudoku from "@/components/sudoku/Sudoku";

export const metadata: Metadata = {
  title: "Sudoku",
};

export default function Page() {
  return <Sudoku />;
}
