import type { User } from "~/shared";
import { useWindowSize } from "@vueuse/core";
import { reactive, watch } from "vue";
import { getUmami } from "./app/analytics";
import { useFetch } from "./utils";

const user = useFetch<User>("/api/user").then(async (result) => {
	if (result.success) {
		void getUmami()?.identify(result.data.id, {
			supporter: result.data.supporter,
			verified: result.data.verified
		});
		return result.data;
	}
	else {
		return null;
	}
});

interface limitsType {
	nameLength: number;
	nameMin: number;
	descriptionLength: number;
	creatureAmount: number;
	imageFormats: string[];
}

const asyncLimits = useFetch<limitsType>("/api/limits").then(async (result) => {
	if (result.success)
		return result.data;
	else return null;
});

const tags = useFetch<string[]>("/api/tags").then(async (result) => {
	if (result.success)
		return result.data;
	else return null;
});

const { width } = useWindowSize();

watch(width, () => {
	store.isMobile = width.value < 900;
});

export const store = reactive({
	// eslint-disable-next-line antfu/no-top-level-await
	user: await user,
	// eslint-disable-next-line antfu/no-top-level-await
	tags: await tags,
	// eslint-disable-next-line antfu/no-top-level-await
	limits: await asyncLimits,
	isMobile: width.value < 900,
});
