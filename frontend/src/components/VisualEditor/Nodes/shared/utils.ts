import { type Ref, watch } from "vue";
import type { Effect } from "~/shared";

export const useDataCleanup = <T extends Effect>(data: Ref<T> | undefined, throwAwayValues: Array<keyof T>) => {
	if (!data)
		return;
	for (const property of throwAwayValues) {
		watch(() => data.value[property], () => {
			if (throwAwayValues.includes(property) && Boolean(data.value[property]) === false)
				delete data.value[property];
		});
	}
};
