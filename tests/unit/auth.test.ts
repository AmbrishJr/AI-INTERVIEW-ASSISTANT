import test from "node:test";
import assert from "node:assert/strict";
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "";
process.env.GROQ_API_KEY = "";
process.env.SESSION_SECRET = "isolated-regression-test-session-secret";
const { createApplication } = await import("../../server/app");
test("authentication lifecycle, API validation, and safe responses", async () => {
  const { httpServer } = await createApplication();
  await new Promise<void>((resolve) =>
    httpServer.listen(0, "127.0.0.1", resolve),
  );
  const address = httpServer.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}`;
  const request = (path: string, body?: unknown, cookie?: string) =>
    fetch(base + path, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  try {
    assert.equal((await request("/api/me")).status, 401);
    assert.equal(
      (await request("/api/register", { username: "  ", password: "abcdef" }))
        .status,
      400,
    );
    const registration = await request("/api/register", {
      username: "candidate",
      password: "practice123",
    });
    assert.equal(registration.status, 201);
    const created = await registration.json();
    assert.deepEqual(Object.keys(created.user).sort(), ["id", "username"]);
    assert.equal(
      (
        await request("/api/register", {
          username: "candidate",
          password: "practice123",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request("/api/login", {
          username: "candidate",
          password: "wrongpass",
        })
      ).status,
      401,
    );
    const login = await request("/api/login", {
      username: " candidate ",
      password: "practice123",
    });
    assert.equal(login.status, 200);
    const setCookie = login.headers.get("set-cookie")!;
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /SameSite=Lax/);
    const cookie = setCookie.split(";")[0];
    assert.equal((await request("/api/me", undefined, cookie)).status, 200);
    const protectedData = await (
      await request("/api/protected", undefined, cookie)
    ).json();
    assert.deepEqual(Object.keys(protectedData.user).sort(), [
      "id",
      "username",
    ]);
    assert.equal((await request("/api/news?limit=-3")).status, 400);
    assert.equal(
      (await request("/api/analytics/insights", { type: "general", data: {} }))
        .status,
      401,
    );
    assert.equal(
      (await request("/api/chat", { message: "Hello" })).status,
      503,
    );
    assert.equal(
      (
        await request(
          "/api/analytics/insights",
          { type: "general", data: {} },
          cookie,
        )
      ).status,
      503,
    );
    assert.equal((await request("/api/logout", {}, cookie)).status, 200);
    assert.equal((await request("/api/me", undefined, cookie)).status, 401);
  } finally {
    await new Promise<void>((resolve, reject) =>
      httpServer.close((e) => (e ? reject(e) : resolve())),
    );
  }
});
