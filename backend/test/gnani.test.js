import { describe, it } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import {
  sttRest,
  ttsRest,
  normalizeLanguageCode,
  GnaniAuthError,
  GnaniInvalidInputError,
  GnaniTimeoutError,
  GnaniNetworkError,
  GnaniRateLimitError,
} from "../src/services/gnani/index.js";

describe("Gnani Services Suite", () => {
  describe("Language Code Normalization", () => {
    it("maps shorthand Telugu codes to te-IN", () => {
      assert.equal(normalizeLanguageCode("te"), "te-IN");
      assert.equal(normalizeLanguageCode("te-in"), "te-IN");
      assert.equal(normalizeLanguageCode("te-IN"), "te-IN");
    });

    it("maps Hindi and English codes to hi-IN and en-IN", () => {
      assert.equal(normalizeLanguageCode("hi"), "hi-IN");
      assert.equal(normalizeLanguageCode("en"), "en-IN");
    });

    it("maps auto to indic-auto", () => {
      assert.equal(normalizeLanguageCode("auto"), "indic-auto");
      assert.equal(normalizeLanguageCode("indic-auto"), "indic-auto");
    });
  });

  describe("Input Validation & Typed Errors", () => {
    it("throws GnaniAuthError when API key is missing", async () => {
      await assert.rejects(
        async () => {
          await sttRest(Buffer.from("dummy"), { apiKey: "" });
        },
        (err) => err instanceof GnaniAuthError && err.stage === "STT"
      );

      await assert.rejects(
        async () => {
          await ttsRest("dummy text", { apiKey: "" });
        },
        (err) => err instanceof GnaniAuthError && err.stage === "TTS"
      );
    });

    it("throws GnaniInvalidInputError on empty audio or empty text", async () => {
      await assert.rejects(
        async () => {
          await sttRest(Buffer.alloc(0), { apiKey: "fake-key" });
        },
        (err) => err instanceof GnaniInvalidInputError && err.stage === "STT"
      );

      await assert.rejects(
        async () => {
          await ttsRest("   ", { apiKey: "fake-key" });
        },
        (err) => err instanceof GnaniInvalidInputError && err.stage === "TTS"
      );
    });
  });

  describe("HTTP Server Mock & Retry Behavior", () => {
    it("retries on transient 500 error and succeeds on 2nd attempt", async () => {
      let callCount = 0;
      const server = http.createServer((req, res) => {
        callCount++;
        if (callCount === 1) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Temporary downstream outage" }));
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: true,
              request_id: "test-req-123",
              transcript: "హలో వరల్డ్",
              model: "gnani-prisma-v2.5",
            })
          );
        }
      });

      await new Promise((resolve) => server.listen(0, resolve));
      const port = server.address().port;
      const endpoint = `http://127.0.0.1:${port}/stt`;

      try {
        const result = await sttRest(Buffer.from("RIFFdummyWAVE"), {
          apiKey: "test-key",
          endpoint,
          maxRetries: 2,
          backoffBaseMs: 50,
          timeoutMs: 2000,
        });

        assert.equal(callCount, 2, "Should have retried once after 500");
        assert.equal(result.transcript, "హలో వరల్డ్");
        assert.equal(result.requestId, "test-req-123");
        assert.ok(result.durationMs >= 0);
      } finally {
        server.close();
      }
    });

    it("does not retry on 401 Auth Error", async () => {
      let callCount = 0;
      const server = http.createServer((req, res) => {
        callCount++;
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "Invalid API Key" } }));
      });

      await new Promise((resolve) => server.listen(0, resolve));
      const port = server.address().port;
      const endpoint = `http://127.0.0.1:${port}/tts`;

      try {
        await assert.rejects(
          async () => {
            await ttsRest("హలో", {
              apiKey: "bad-key",
              endpoint,
              maxRetries: 3,
            });
          },
          (err) => err instanceof GnaniAuthError && err.statusCode === 401
        );
        assert.equal(callCount, 1, "Should not retry on 401");
      } finally {
        server.close();
      }
    });

    it("throws GnaniTimeoutError when request exceeds timeoutMs", async () => {
      const server = http.createServer((req, res) => {
        // Intentionally hang without responding
      });

      await new Promise((resolve) => server.listen(0, resolve));
      const port = server.address().port;
      const endpoint = `http://127.0.0.1:${port}/tts`;

      try {
        await assert.rejects(
          async () => {
            await ttsRest("హలో", {
              apiKey: "test-key",
              endpoint,
              maxRetries: 0,
              timeoutMs: 150,
            });
          },
          (err) => err instanceof GnaniTimeoutError && err.stage === "TTS"
        );
      } finally {
        server.close();
      }
    });
  });
});
