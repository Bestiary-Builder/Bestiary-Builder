import {expect, it} from "vitest";
import {getPublishedBestiaryCreatures} from "@/logic/critterdb";

it("CritterDB export to be unchanged", async () => {
	// Test https://critterdb.com/#/publishedbestiary/view/5acb0aa187653a455731b890 to be identical as before.
	const result = await getPublishedBestiaryCreatures("5acb0aa187653a455731b890", "https://critterdb.com:443/api/publishedbestiaries");
	expect(result).toMatchSnapshot();
});
