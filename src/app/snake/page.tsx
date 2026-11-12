import type { Metadata } from "next";
import Snake from "@/components/games/Snake";

export const metadata: Metadata = {
  title: "Snake",
};

export default function Page() {
  return <Snake />;
}
