import express from "express";

import {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
} from "../controllers/assetController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================
CREATE ASSET
Admin Only
=========================================
*/
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  createAsset
);

/*
=========================================
GET ALL ASSETS
Logged In Users
=========================================
*/
router.get(
  "/",
  requireAuth,
  getAssets
);

/*
=========================================
GET SINGLE ASSET
Logged In Users
=========================================
*/
router.get(
  "/:id",
  requireAuth,
  getAssetById
);

/*
=========================================
UPDATE ASSET
Admin Only
=========================================
*/
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  updateAsset
);

/*
=========================================
DELETE ASSET
Admin Only
=========================================
*/
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  deleteAsset
);

export default router;