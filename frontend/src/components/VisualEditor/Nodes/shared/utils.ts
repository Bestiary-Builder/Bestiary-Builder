import { type Ref, watch } from "vue";
import type { Effect } from "~/shared";

export const useDataCleanup = (data: Ref<any> | undefined, throwAwayValues: Partial<Effect>) => {
	if (!data)
		return;
	for (const property in throwAwayValues) {
		watch(() => data.value[property], () => {
			// @ts-expect-error ___
			if (data.value[property] === throwAwayValues[property])
				delete data.value[property];
		});
	}
};
