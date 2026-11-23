import { createFileRoute } from "@tanstack/react-router";
import { ListenApp } from "@/components/listen-app";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <ListenApp />;
}
