import express from "express";
import multer from "multer";
import { processAudio, voiceMessage } from "../controllers/voiceController.js";

const router = express.Router();

// Configure memory storage for streaming audio uploads (up to 25MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

router.post("/process-audio", upload.single("audio"), processAudio);
router.post("/message", voiceMessage);

export default router;
