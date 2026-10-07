import { createFileRoute } from "@tanstack/react-router";
import { fetchNewsBundle } from "@/lib/scanner/news";

export const Route = createFileRoute("/api/news")({
  server: {
    handlers: {
      GET: async () => {
        const data = await fetchNewsBundle();
        return Response.json(data, {
          headers: {
            "Cache-Control": "public, max-age=60",
          },
        });
      },
    },
  },
});
