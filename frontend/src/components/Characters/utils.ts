import type { AttackModel } from "~/shared";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { useFetch } from "@/utils/utils";

const { addToast, updateToast } = useToast()
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
	const toasterId = addToast("Getting character data from Avrae...", { loading: true });
	const { success, data, error } = await useFetch<AvraeCharacter[]>("/api/character/list");
	if (success && data) {
		updateToast(toasterId, { text: "Loaded Avrae Characters", prependIcon: "mdi:check" });
		void getUmami()?.track("Loaded Avrae Characters");
		return data.sort((x, y) => {
			return (x.active === y.active) ? 0 : x.active ? -1 : 1;
		});
	}
	else {
		if (error === "invalid credentials")
			updateToast(toasterId, { text: "No Avrae Token Set", color: "error" });
		else
			updateToast(toasterId, { text: error, color: "error" });
		return null;
	}
};

export const getAvraeCharacterByUpstream = async (upstream: string) => {
	const characters = await getAvraeCharacters();
	if (characters) {
		const char = characters.find(char => char.upstream === upstream);
		if (!char) {
			addToast(`Could not find your character with upstream ${upstream}.`, { color: "error" });
			return null;
		}
		return char;
	}
	addToast(`Could not find your characters.`, { color: "error" });
	return null;
};
