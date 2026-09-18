require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const CodingChallenge = require("../models/CodingChallenge");
const CodingCompletion = require("../models/CodingCompletion");
const User = require("../models/User");
const codingChallengesData = require("./codingChallengesData");

// Non-destructive: only inserts/updates the starter track. Existing
// completions are never touched, and an admin-edited challenge is only
// refreshed when its slug matches. If a different challenge already owns a
// dayNumber, that day is skipped instead of failing on the unique index.
const run = async () => {
  await connectDB();
  const admin = await User.findOne({ role: "admin" }).select("_id").lean();
  let created = 0;
  let updated = 0;
  const skipped = [];

  for (const item of codingChallengesData) {
    const existing = await CodingChallenge.findOne({ slug: item.slug }).select("_id").lean();
    const dayOwner = await CodingChallenge.findOne({ dayNumber: item.dayNumber }).select("slug").lean();
    if (dayOwner && dayOwner.slug !== item.slug) {
      skipped.push(`day ${item.dayNumber} (held by ${dayOwner.slug})`);
      continue;
    }
    const doc = {
      title: item.title,
      slug: item.slug,
      difficulty: item.difficulty,
      url: "https://leetcode.com/problems/" + item.slug + "/",
      dayNumber: item.dayNumber,
      category: item.category,
      roadmap: item.roadmap || "",
      isActive: true,
    };
    await CodingChallenge.updateOne(
      { slug: item.slug },
      { $set: doc, $setOnInsert: { createdBy: admin ? admin._id : null } },
      { upsert: true, runValidators: true }
    );
    if (existing) updated += 1;
    else created += 1;
  }

  const total = await CodingChallenge.countDocuments();
  console.log(`✅ Coding challenges seeded — created ${created}, updated ${updated}, total in DB: ${total}`);
  if (skipped.length) console.log(`⚠️  skipped ${skipped.length}: ${skipped.join(", ")}`);
  const completions = await CodingCompletion.countDocuments();
  console.log(`ℹ️  student completions left untouched: ${completions}`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((error) => {
  console.error("SEED CODING CHALLENGES ERROR:", error);
  process.exit(1);
});