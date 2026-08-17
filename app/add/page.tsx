import { Suspense } from "react";
import AddFlow from "@/components/AddFlow";

export const metadata = {
  title: "Add your work — MERGED.",
  description: "Paste a GitHub profile or a merged patch and join the board.",
};

export default function AddPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <AddFlow />
    </Suspense>
  );
}
