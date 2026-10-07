import { createFileRoute } from "@tanstack/react-router";
import { runScan } from "@/lib/scanner/scan";

export const Route = createFileRoute("/api/scan")({
  server: {
    handlers: {
      GET: async () => {
        const data = await runScan();
        return Response.json(data, {
          headers: {
            "Cache-Control": "public, max-age=4",
          },
        });
      },
    },
  },
});
