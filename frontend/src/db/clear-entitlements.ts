import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import { reportEntitlements } from "./schema";
import * as readline from "readline";

// Load environment variables
const envResult = config({ path: ".env.local" });
if (envResult.error) {
  config();
}

async function clearEntitlements() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  console.log("⏳ Connecting to database...");
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  console.log("\n📊 Checking current report entitlements...\n");

  const entitlements = await db.select().from(reportEntitlements);

  if (entitlements.length === 0) {
    console.log("✅ No entitlements found - nothing to clear");
    await client.end();
    return;
  }

  console.log(`⚠️  Found ${entitlements.length} existing entitlement(s):\n`);
  entitlements.forEach((e, idx) => {
    console.log(`${idx + 1}. User: ${e.userId}`);
    console.log(`   Report Type: ${e.reportType}`);
    console.log(`   Order ID: ${e.orderId || "NULL"}`);
    console.log(`   Created: ${e.createdAt}`);
    console.log("");
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question(
      "\n⚠️  Do you want to DELETE all these entitlements? (yes/no): ",
      resolve,
    );
  });

  rl.close();

  if (answer.toLowerCase() !== "yes") {
    console.log("\n❌ Cancelled - no changes made");
    await client.end();
    return;
  }

  console.log("\n🗑️  Deleting all entitlements...");
  const deleted = await db.delete(reportEntitlements);

  console.log(`✅ Successfully deleted all report entitlements`);
  console.log("   All reports now require payment to generate");

  await client.end();
}

clearEntitlements().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
