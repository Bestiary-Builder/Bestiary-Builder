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


const { width } = useWindowSize();

watch(width, () => {
	store.isMobile = width.value < 900;
});

export const store = reactive({
	user: await user,
	isMobile: width.value < 900,
});
