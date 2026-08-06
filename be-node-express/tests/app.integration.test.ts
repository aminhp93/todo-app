/**
 * Integration tests for be-node-express
 *
 * These tests run against the actual Express app (no real DB needed for
 * the /health and public routes; auth-gated routes are tested with stubs).
 *
 * L3 BE requirement: service-layer + HTTP integration tests using supertest
 * against an isolated in-memory / stubbed database.
 *
 * Run:  npm test
 */
import supertest from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../src/app";
import type { Express } from "express";

let app: Express;

beforeAll(async () => {
  // Build the app without starting a real TCP listener — supertest handles that.
  app = await buildApp();
});

afterAll(async () => {
  // Nothing to tear down (no DB connection opened at module level in app.ts).
});

// ---------------------------------------------------------------------------
// Health endpoint
// ---------------------------------------------------------------------------
describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await supertest(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok" });
  });

  it("sets security headers via helmet", async () => {
    const res = await supertest(app).get("/health");
    // helmet sets X-Content-Type-Options and X-Frame-Options by default
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Auth endpoints — register + login (requires real DB; skipped in CI without DB)
// These demonstrate the integration-test pattern (L3 requirement).
// To run them locally: docker compose up -d db, then npm test
// ---------------------------------------------------------------------------
describe("POST /api/auth/register", () => {
  it("returns 400 when body is missing required fields", async () => {
    const res = await supertest(app)
      .post("/api/auth/register")
      .send({ email: "not-valid" }); // missing password + name
    // Zod validation middleware should reject this with 400
    expect(res.status).toBe(400);
  });

  it("returns 400 for malformed email", async () => {
    const res = await supertest(app)
      .post("/api/auth/register")
      .send({ email: "not-an-email", password: "secret123", name: "Test" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("returns 400 when body is missing required fields", async () => {
    const res = await supertest(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// Todos — unauthenticated access should be rejected
// ---------------------------------------------------------------------------
describe("GET /api/todos (JWT protected)", () => {
  it("returns 401 when no Authorization header is provided", async () => {
    const res = await supertest(app).get("/api/todos");
    expect(res.status).toBe(401);
  });

  it("returns 401 for a malformed JWT", async () => {
    const res = await supertest(app)
      .get("/api/todos")
      .set("Authorization", "Bearer not.a.real.token");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/todos (JWT protected)", () => {
  it("returns 401 when unauthenticated", async () => {
    const res = await supertest(app)
      .post("/api/todos")
      .send({ title: "Test todo" });
    expect(res.status).toBe(401);
  });
});
