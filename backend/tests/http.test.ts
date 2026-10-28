import { describe, expect, it } from "vitest";

import { defaultStatblock } from "~/shared";
import "../src/server";

const baseURL = `http://localhost:${process.env.port ?? "5000"}`;

describe("basic http requests", async () => {
	// Is the server responding?
	it("server responding", async () => {
		expect(await fetch(`${baseURL}/`).then(r => r.status.toString())).toMatch("200");
	});
	// Does the static files work?
	it("static files", async () => {
		expect(await fetch(`${baseURL}/logo.png`).then(r => r.text())).not.toSatisfy((str: string) => str.startsWith("<!doctype html>"));
	});
	// CSP Header
	it("csp header", async () => {
		expect(await fetch(`${baseURL}/`).then(r => r.headers.get("Content-Security-Policy"))).toContain("default-src 'self';");
	});
});

describe("api requests", async () => {
	// Health is OK
	it("/api/health", async () => {
		expect(await fetch(`${baseURL}/api/health`).then(r => r.status)).toBe(200);
	});
	// 404 error:
	it("404", async () => {
		expect(await fetch(`${baseURL}/api/404`).then(r => r.text())).toMatch(`{"error":"Path not found."}`);
	});
	// Not logged in
	it("not authenticated by default", async () => {
		expect(await fetch(`${baseURL}/api/user`).then(r => r.text())).toMatch(`{"error":"Not logged in."}`);
	});
	// Validate creature
	it("validate creature", async () => {
		expect(
			await fetch(`${baseURL}/api/validate/creature`, {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ data: defaultStatblock })
			}).then(r => r.text())
		).toMatch(`{"valid":true}`);
	});
	// Search
	it("bestiary search", async () => {
		expect(await fetch(`${baseURL}/api/search`, { method: "POST" }).then(r => r.text())).toMatch(`{"results":[],"pageAmount":1}`);
	});
});
