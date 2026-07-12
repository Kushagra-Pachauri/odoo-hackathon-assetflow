import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import allocationRoutes from "./routes/allocationRoutes.js";


const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/allocations", allocationRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

export default app;