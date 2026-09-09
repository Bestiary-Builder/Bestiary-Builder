import { expect, it } from "vitest";
import { getPublishedBestiaryCreatures, parseFromCritterDB } from "@/logic/import/critterdb";
import { StatblockChecker } from "@/logic/external/validation";

it("critterDB export to be unchanged", async () => {
	// Test https://critterdb.com/#/publishedbestiary/view/5acb0aa187653a455731b890 to be identical as before.
	const result = await getPublishedBestiaryCreatures("5acb0aa187653a455731b890", "https://critterdb.com:443/api/publishedbestiaries");
	expect(result).toMatchSnapshot();
});

it("critterDB data parsed to match Statblock schema", async () => {
	// Test https://critterdb.com/#/publishedbestiary/view/5acb0aa187653a455731b890 to be identical as before.
	const result = await getPublishedBestiaryCreatures("5acb0aa187653a455731b890", "https://critterdb.com:443/api/publishedbestiaries");

	const parsed = parseFromCritterDB(result[0])![0]

	expect(StatblockChecker.test(parsed)).toBe(true);
})