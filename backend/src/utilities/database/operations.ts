import { log } from "@/utilities/logger";

export async function withDatabaseFallback<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
	try {
		return await operation();
	}
	catch (err) {
		log.log("critical", err);
		return fallback;
	}
}
