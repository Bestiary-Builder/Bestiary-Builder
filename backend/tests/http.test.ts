import { expect, it } from "vitest";

import "../server";
import { defaultStatblock } from "~/shared";

const baseURL = `http://localhost:${process.env.port ?? "5000"}`;

it("basic http requests", async () => {
	// Is the server responding?
	expect(await fetch(`${baseURL}/`).then(r => r.status.toString())).toMatch("200");
	// Does the static files work?
	expect(await fetch(`${baseURL}/logo.png`).then(r => r.text())).not.toSatisfy((str: string) => str.startsWith("<!doctype html>"));
	// CSP Header
	expect(await fetch(`${baseURL}/`).then(r => r.headers.get("Content-Security-Policy"))).toContain("default-src 'self';");
});

it("api requests", async () => {
	// 404 error:
	expect(await fetch(`${baseURL}/api/404`).then(r => r.text())).toMatch(`{"error":"Path not found."}`);
	// Not logged in
	expect(await fetch(`${baseURL}/api/user`).then(r => r.text())).toMatch(`{"error":"Not logged in."}`);
	// Validate creature
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
	// Not logged in
	expect(await fetch(`${baseURL}/api/search`, { method: "POST" }).then(r => r.text())).toMatch(`{"results":[],"pageAmount":1}`);
});
