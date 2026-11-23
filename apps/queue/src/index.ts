import { connectToDatabase } from "@cellsinbox/db";
import { MtaService } from "@cellsinbox/service";
import { env } from "@cellsinbox/env";

const POLL_INTERVAL_MS = env.QUEUE_POLL_INTERVAL_MS || 5000;

async function runWorker() {
  await connectToDatabase();
  console.log("[MTA Queue] Worker connected to MongoDB. Polling queue...");

  while (true) {
    try {
      const results = await MtaService.processQueueBatch(10);
      if (results.length > 0) {
        const successes = results.filter((r) => r.success).length;
        console.log(`[MTA Queue] Processed ${results.length} items (${successes} succeeded, ${results.length - successes} failed)`);
      }
    } catch (err) {
      console.error("[MTA Queue] Error in queue iteration:", err);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

runWorker().catch((err) => {
  console.error("[MTA Queue] Fatal queue worker failure:", err);
  process.exit(1);
});
