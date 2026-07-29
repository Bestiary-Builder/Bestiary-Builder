// Bad-words filter
import BadWordsNext from "bad-words-next";
import en from "@/staticData/badwordsData/en.json";
import en_2 from "@/staticData/badwordsData/en_2.json";
import { log } from "./logger";

export const badwords = new BadWordsNext({ placeholder: "", specialChars: /[\d!@#$%^&*()[\];:'",.?\-_=+~`|]|the|el|la/ });
badwords.add(en_2);
badwords.add(en);

// Badwords check function
export function checkBadwords(value: string): string | undefined {
	const usedBadwords: string[] = [];
	badwords.filter(value, (badword) => {
		usedBadwords.push(badword);
	});
	if (usedBadwords.length > 0) {
		log.log("error", `Badwords detected: ${usedBadwords.join(", ")}`);
		return `includes blocked words or phrases. Remove the blocked words or make the bestiary private. Matched: \"${usedBadwords.join("\", \"")}\". If you think this was a mistake, please file a bug report.`;
	}
	return undefined;
}
