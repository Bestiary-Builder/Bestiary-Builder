import type { BestiaryStatus, Statblock } from "~/shared";
import { checkBadwords } from "@/src/utilities/badwords";
import { checkCreatureLimits, limits } from "@/src/utilities/constants";
import { defaultStatblock } from "~/shared";

interface PreparedCreatureStats {
	stats: Statblock;
	error?: string;
	imageWarning?: string;
}

export function prepareCreatureStats(input: Statblock, bestiaryStatus: BestiaryStatus): PreparedCreatureStats {
	const stats = {} as Statblock;
	for (const key in defaultStatblock) {
		const statKey = key as keyof Statblock;
		stats[statKey] = { ...defaultStatblock[statKey], ...(input?.[statKey] ?? {}) } as never;
	}

	const limitError = checkCreatureLimits(stats);
	if (limitError)
		return { stats, error: limitError };

	let image = stats.description.image as string;
	if (image) {
		try {
			const url = new URL(image);
			image = url.origin + url.pathname;
			stats.description.image = image;
		}
		catch {
			return { stats, error: "Invalid image url." };
		}
	}

	let imageWarning: string | undefined;
	if (image) {
		const allowedFormat = limits.imageFormats.some(format => image.endsWith(`.${format}`));
		if (!image.startsWith("https") || !allowedFormat) {
			stats.description.image = "";
			imageWarning = "Image link not recognized as an allowed image format. Make sure it is from a secure https location and ends in an image file format extension (e.g. .png)";
		}
	}

	if (bestiaryStatus !== "private") {
		const nameError = checkBadwords(stats.description.name);
		if (nameError)
			return { stats, error: `Creature name ${nameError}`, imageWarning };
		const descriptionError = checkBadwords(stats.description.description);
		if (descriptionError)
			return { stats, error: `Creature description ${descriptionError}`, imageWarning };
	}

	return { stats, imageWarning };
}
