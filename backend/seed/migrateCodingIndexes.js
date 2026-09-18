require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const CodingCompletion = require("../models/CodingCompletion");

// Idempotent index repair for `codingcompletions`.
//
// The original schema declared the (user, challenge) uniqueness guard as
// `{ unique: true, sparse: true }`. MongoDB sparse indexes still index
// documents whose field is an explicit null, and `challenge` defaults to null
// for every standalone solve — so that index allowed only ONE non-challenge
// completion per student ("Total Solved" could never exceed 1 for auto-synced
// solves). The model now uses a partial index scoped to real ObjectIds.
//
// Mongoose never drops a stale index on its own, so this script removes the
// old one before syncing the corrected definition. Safe to re-run.
//
// Run: node seed/migrateCodingIndexes.js
const STALE_NAME = "user_1_challenge_1";

const run = async () => {
  await connectDB();
  const collection = mongoose.connection.collection("codingcompletions");

  const existing = await collection.indexes();
  const stale = existing.find((i) => i.name === STALE_NAME);
  let dropped = false;
  if (stale && (stale.sparse || !stale.partialFilterExpression)) {
    await collection.dropIndex(STALE_NAME);
    dropped = true;
    console.log(`🔧 Dropped stale index ${STALE_NAME} (sparse=${!!stale.sparse})`);
  }

  const created = await CodingCompletion.syncIndexes();
  console.log(`✅ Synced indexes on codingcompletions: ${created.join(", ") || "(none new)"}`);
  console.log(dropped ? "Dropped 1 stale index." : "No stale index found — nothing to drop.");
  const after = await collection.indexes();
  console.log(
    "Final: " +
      after.map((i) => i.name + (i.unique ? "(unique)" : "")).join(", ")
  );

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((error) => {
  console.error("MIGRATE CODING INDEXES ERROR:", error);
  process.exit(1);
});