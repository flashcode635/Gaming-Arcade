import type { Metadata } from "next";
import TicTacToe from "@/components/games/TicTacToe";

export const metadata: Metadata = {
  title: "Tic-Tac-Toe",
};

export default function Page() {
  return <TicTacToe />;
}
