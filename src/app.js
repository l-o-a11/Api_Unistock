require("dotenv").config();
const { connectDatabase } = require("./Config/database");
const app = require("./server");
const PORT = process.env.PORT || 3000;

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Unistock API  →  http://localhost:${PORT}`);
  });
});