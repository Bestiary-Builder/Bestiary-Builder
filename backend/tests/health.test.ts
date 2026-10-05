import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import { afterEach, expect, it, vi } from "vitest";
import { createHealthHandler } from "../src/utilities/health";

let server: Server | undefined;

afterEach(async () => {
	if (server) {
		await new Promise<void>((resolve, reject) => {
			server!.close(error => error ? reject(error) : resolve());
			server!.closeAllConnections();
		});
		server = undefined;
	}
});

async function requestHealth(checkDatabase: () => Promise<unknown>) {
	const app = express();
	app.get("/api/health", createHealthHandler(checkDatabase));
	await new Promise<void>((resolve) => {
		server = app.listen(0, "127.0.0.1", resolve);
	});
	const { port } = server!.address() as AddressInfo;
	return fetch(`http://127.0.0.1:${port}/api/health`, { redirect: "error" });
}

it("reports readiness only after a successful database query", async () => {
	const checkDatabase = vi.fn().mockResolvedValue([{ "?column?": 1 }]);
	const response = await requestHealth(checkDatabase);
	expect(checkDatabase).toHaveBeenCalledOnce();
	expect(response.status).toBe(200);
	expect(response.headers.get("Cache-Control")).toBe("no-store");
	expect(await response.json()).toEqual({ status: "ready" });
});

it("fails closed without exposing database errors or credentials", async () => {
	const response = await requestHealth(() => Promise.reject(new Error("postgresql://secret:password@database")));
	expect(response.status).toBe(503);
	expect(response.headers.get("Cache-Control")).toBe("no-store");
	expect(await response.json()).toEqual({ status: "unavailable" });
});

it("reports unavailable if the database client has not initialized", async () => {
	const response = await requestHealth(() => {
		throw new Error("Prisma client is not initialized");
	});
	expect(response.status).toBe(503);
	expect(await response.json()).toEqual({ status: "unavailable" });
});
