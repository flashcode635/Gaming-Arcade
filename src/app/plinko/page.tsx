import type { Metadata } from "next";
import Plinko from "@/components/Plinko";

export const metadata: Metadata = {
  title: "Plinko",
};

export default function Page() {
  return <Plinko />;
}
