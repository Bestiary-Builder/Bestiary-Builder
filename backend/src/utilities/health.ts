import type { Request, Response } from "express";

export function createHealthHandler(checkDatabase: () => Promise<unknown>) {
	return async (_req: Request, res: Response) => {
		res.setHeader("Cache-Control", "no-store");
		try {
			await checkDatabase();
			return res.status(200).json({ status: "ready" });
		}
		catch {
			return res.status(503).json({ status: "unavailable" });
		}
	};
}
