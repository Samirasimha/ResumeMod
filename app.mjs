import express from "express";
import docxRoutes from "./routes/docxCreation.routes.mjs";

const app = express();

app.listen(3001, () => {
  console.log("Server Started at 3001");
});

app.use("/docx", docxRoutes);
