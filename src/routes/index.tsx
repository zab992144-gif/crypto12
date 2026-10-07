import { createFileRoute } from "@tanstack/react-router";
import { ScannerDashboard } from "@/components/scanner/dashboard";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ScannerDashboard />;
}
