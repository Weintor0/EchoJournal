const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const entryRoutes = require("./routes/entries");
const authRoutes = require("./routes/auth");

app.use("/auth", authRoutes);
app.use("/entries", entryRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
