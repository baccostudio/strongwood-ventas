export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { status: "ok", service: "strongwood-ventas" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
