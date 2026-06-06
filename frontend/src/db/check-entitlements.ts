import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import { reportEntitlements } from "./schema";

// Load environment variables
const envResult = config({ path: ".env.local" });
if (envResult.error) {
  config();
}

async function checkEntitlements() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  console.log("⏳ Connecting to database...");
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  console.log("\n📊 Checking current report entitlements...\n");

  const entitlements = await db.select().from(reportEntitlements);

  if (entitlements.length === 0) {
    console.log("✅ No entitlements found - all reports require payment");
  } else {
    console.log(`⚠️  Found ${entitlements.length} existing entitlement(s):\n`);
    entitlements.forEach((e, idx) => {
      console.log(`${idx + 1}. User: ${e.userId}`);
      console.log(`   Report Type: ${e.reportType}`);
      console.log(`   Order ID: ${e.orderId || "NULL"}`);
      console.log(`   Created: ${e.createdAt}`);
      console.log("");
    });

    console.log(
      "\n💡 These entitlements allow FREE report generation without payment!",
    );
    console.log(
      "   To require payment, delete these entitlements from the database.",
    );
  }

  await client.end();
}

checkEntitlements().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
