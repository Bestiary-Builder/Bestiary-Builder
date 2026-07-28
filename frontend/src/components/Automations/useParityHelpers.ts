import type { MaybeRefOrGetter } from "vue";
import type { AttackModel } from "~/shared";
import { computed, toValue } from "vue";
import YAML from "yaml";

export const useParityHelper = (featureDescription: MaybeRefOrGetter<string>, automationString: MaybeRefOrGetter<string>, automation: MaybeRefOrGetter<AttackModel | AttackModel[] | null>) => {
	const updateFeatureDescFromAutomationDesc = () => {
		let auto;
		try {
			auto = YAML.parse(toValue(automationString));
		}
		catch {
			return;
		}
		if (Array.isArray(auto))
			return;
		for (const field of auto?.automation?.reverse() ?? []) {
			if (field.type === "text") {
				featureDescription = field.text;
				return;
			}
		}
	};

	const updateAutomationDescFromFeatureDesc = () => {
		let auto;
		try {
			auto = YAML.parse(toValue(automationString));
		}
		catch {
			return;
		}
		if (Array.isArray(auto))
			return;
		try {
			for (const field of auto?.automation?.reverse() ?? []) {
				if (field.type === "text") {
					field.text = featureDescription;
					auto.automation.reverse();
					automationString = YAML.stringify(auto);
					return;
				}
			}
		}
		catch {}
	};

	const getAutomationDescription = (): string | boolean => {
		let auto;
		try {
			auto = YAML.parse(toValue(automationString));
		}
		catch {
			return false;
		}
		if (Array.isArray(auto))
			return false;
		if (automation || !auto || auto?.automation?.length === 0)
			return false;
		for (const field of auto?.automation?.reverse() ?? []) {
			if (field?.type === "text")
				return field.text;
		}
		return "";
	};

	const showDescriptionButtons = computed(() => {
		const desc = toValue(featureDescription);
		const autoDesc = getAutomationDescription();
		if (Array.isArray(automation) || !desc || !autoDesc)
			return false;
		if (desc !== autoDesc)
			return true;
		return false;
	});

	return { updateAutomationDescFromFeatureDesc, updateFeatureDescFromAutomationDesc, showDescriptionButtons };
};
