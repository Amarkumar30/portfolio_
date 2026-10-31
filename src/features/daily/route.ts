/**
 * GET handler for /api/daily: today's joke for the 404 page.
 * Runs on the server with the same day-long API cache, so visitors' browsers only ever call
 * this site. Re-exported from src/app/api/daily/route.ts.
 */
import { getDaily } from "./get-daily";

export async function GET() {
  const daily = await getDaily();

  return Response.json(daily ? { date: daily.date, joke: daily.joke } : null, {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=86400" },
  });
}
