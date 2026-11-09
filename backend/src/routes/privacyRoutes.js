import express from "express";
import { testPrivacy } from "../controllers/privacyController.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    message: "Privacy route working. Use POST to scan."
  });
});

router.post("/test", testPrivacy);

export default router;