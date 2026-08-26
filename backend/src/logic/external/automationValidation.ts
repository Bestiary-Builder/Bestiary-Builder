import fetch from "node-fetch";

const AUTOMATION_VALIDATION_URL = "https://api.avrae.io/characters/attacks/validate";

export interface AutomationValidationResult {
	success: boolean;
	error?: unknown;
	[key: string]: unknown;
}

export async function validateAutomation(automation: unknown): Promise<AutomationValidationResult> {
	const response = await fetch(AUTOMATION_VALIDATION_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(automation)
	});
	const result: unknown = await response.json();

	if (typeof result !== "object" || result === null || !("success" in result) || typeof result.success !== "boolean")
		throw new TypeError("Avrae automation validator returned an invalid response");

	return result as AutomationValidationResult;
}
