import { expect, it } from 'vitest';
import { get_published_bestiary_creatures } from "../logic/critterdb";

it("CritterDB export to be unchanged", async () => {
    // Test https://critterdb.com/#/publishedbestiary/view/5acb0aa187653a455731b890 to be identical as before.
    const result = await get_published_bestiary_creatures("5acb0aa187653a455731b890", "https://critterdb.com:443/api/publishedbestiaries")
    expect(result).toMatchSnapshot();
})