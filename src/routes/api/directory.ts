import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/directory")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { loadDirectory } = await import("@/lib/rcforb/directory.server");
          const entries = await loadDirectory();
          return Response.json({ entries });
        } catch {
          return Response.json(
            { error: "The public station list could not be loaded." },
            { status: 502 },
          );
        }
      },
    },
  },
});
