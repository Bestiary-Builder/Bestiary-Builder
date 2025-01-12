import { type Ref, watch } from "vue";
import type { AttackInteraction, AttackModel, ButtonInteraction, Effect } from "~/shared";

// type NestedData<T> = {
// 	[K in keyof T]?: T[K] extends object ? Array<keyof T[K]> : never;
// };

type NonObjectEffectKeys<T> = {
	[K in keyof T]: T[K] extends object ? never : K
}[keyof T];

type EffectNestedData<T> = Omit<
    {
    	[K in keyof T]?: (keyof T[K])[]
    },
    NonObjectEffectKeys<T>
>;

export const useDataCleanup = <T extends Effect | AttackModel | ButtonInteraction | AttackInteraction>(
	data: Ref<T> | undefined,
	throwAwayValues: Array<NonObjectEffectKeys<T>>,
	throwAwayNestedValues?: EffectNestedData<T>
) => {
	if (!data)
		return;
	for (const property of throwAwayValues) {
		watch(() => data.value[property], () => {
			if (Boolean(data.value[property]) === false)
				delete data.value[property];
		});
	}

	if (throwAwayNestedValues) {
		for (const property of Object.keys(throwAwayNestedValues) as Array<keyof EffectNestedData<T>>) {
		  	const nestedProperties = throwAwayNestedValues[property];
		  	if (nestedProperties) {
				for (const nestedProperty of nestedProperties) {
			  		// Ensure that nestedProperty is properly typed
			  		watch(() => data.value[property][nestedProperty], () => {
						if (

							!!data.value[property][nestedProperty] === false
							|| data.value[property][nestedProperty] === "0"
						)
							delete data.value[property][nestedProperty];
					});
				}
		  	}
		}
	}
};
