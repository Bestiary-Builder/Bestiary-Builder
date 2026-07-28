import type { AttackModel } from "~/shared";
import { getUmami } from "@/utils/app/analytics";
import { $toast } from "@/utils/app/toast";
import { useFetch } from "@/utils/utils";

export type AvraeCharacter = Record<string, unknown> & {
	overrides: {
		attacks: AttackModel[];
		image: string;
	};
	name: string;
	levels: { total_level: number; classes: { [key: string]: number } };
	active: boolean;
	image: string;
	upstream: string;
};

export const getAvraeCharacters = async () => {
	const toasterId = $toast.loading("Getting character data from Avrae...");
	const { success, data, error } = await useFetch<AvraeCharacter[]>("/api/character/list");
	if (success && data) {
		$toast.success("Loaded Avrae Characters", { id: toasterId });
		getUmami()?.track("Loaded Avrae Characters");
		return data.sort((x, y) => {
			return (x.active === y.active) ? 0 : x.active ? -1 : 1;
		});
	}
	else {
		if (error === "invalid credentials")
			$toast.error("No Avrae Token set.", { id: toasterId });
		else
			$toast.error(error, { id: toasterId });
		return null;
	}
};

export const getAvraeCharacterByUpstream = async (upstream: string) => {
	const characters = await getAvraeCharacters();
	if (characters) {
		const char = characters.find(char => char.upstream === upstream);
		if (!char) {
			$toast.error(`Could not find your character with upstream ${upstream}.`);
			return null;
		}
		return char;
	}
	$toast.error(`Could not find your characters.`);
	return null;
};
