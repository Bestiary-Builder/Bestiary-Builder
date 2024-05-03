import {expect, it} from "vitest";
import {getCreatureData} from "../logic/avrae";
import {defaultStatblock} from "../../shared";

it("default statblock to be equal to snapshot", () => {
	const result = getCreatureData(defaultStatblock);
	expect(result).toMatchSnapshot();
});
