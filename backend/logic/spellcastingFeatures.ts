import type { FeatureEntity, Statblock } from "~/shared";
import { displayCasterCasting, displayInnateCasting } from "~/shared";

interface SpellcastingFeatureOptions {
	separateParagraphs?: boolean;
	innateDisplayV2024?: boolean;
}

export function getSpellcastingFeatures(
	creature: Statblock,
	{ separateParagraphs = false, innateDisplayV2024 = false }: SpellcastingFeatureOptions = {}
): { traits: FeatureEntity[]; actions: FeatureEntity[] } {
	const traits = [...creature.features.features];
	const actions = [...creature.features.actions];
	const displayCreature = structuredClone(creature);
	const formatDescription = (description: string) => separateParagraphs ? description.replaceAll("\n", "\n\n") : description;
	const caster = creature.spellcasting.casterSpells;

	if (caster.casterLevel && caster.castingClass && caster.spellList.flat().length > 0 && Object.keys(caster.spellSlotList ?? {}).length > 0) {
		traits.push({
			name: "Spellcasting",
			description: formatDescription(displayCasterCasting(displayCreature)),
			automation: null
		});
	}

	const innateCaster = creature.spellcasting.innateSpells;
	if (innateCaster.spellCastingAbility && (innateCaster.spellList[0].length > 0 || innateCaster.spellList[1].length > 0 || innateCaster.spellList[2].length > 0 || innateCaster.spellList[3].length > 0)) {
		const feature: FeatureEntity = {
			name: `Innate Spellcasting${innateCaster.isPsionics ? " (Psionics)" : ""}`,
			description: formatDescription(displayInnateCasting(displayCreature, innateDisplayV2024)),
			automation: null
		};

		if (innateCaster.displayAsAction)
			actions.push(feature);
		else
			traits.push(feature);
	}

	return { traits, actions };
}
