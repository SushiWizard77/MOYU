require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const CodingProblem = require("../models/CodingProblem");
const codingProblemsData = require("./codingProblemsData");

// Non-destructive: only replaces coding problems with matching slugs,
// so students, attempts and other collections are left untouched.
const run = async () => {
  await connectDB();
  const slugs = codingProblemsData.map((p) => p.slug);
  await CodingProblem.deleteMany({ slug: { $in: slugs } });
  await CodingProblem.insertMany(codingProblemsData);
  const total = await CodingProblem.countDocuments();
  console.log(`✅ Seeded ${codingProblemsData.length} coding problems (total in DB: ${total})`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((error) => {
  console.error("SEED CODING ERROR:", error);
  process.exit(1);
});
