<script setup lang="ts">
import { type Ref, inject } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import type { AttackInteraction } from "~/shared";
import LabelledComponent from "@/components/LabelledComponent.vue";

const currentEffect = inject<Ref<AttackInteraction>>("currentEffect");
useDataCleanup(currentEffect, ["defaultAttackBonus", "defaultCastingMod", "defaultDC"], { attack: ["activation_type", "criton", "extra_crit_damage", "phrase", "proper", "thumb", "verb"] });
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader :title="`Attack (${currentEffect.attack.name})`" />
		<div class="two-wide">
			<LabelledComponent title="Attack Name*" for="name">
				<input id="name" v-model="currentEffect.attack.name" type="text" :class="{ required: currentEffect.attack.name.length === 0 }">
			</LabelledComponent>
			<LabelledComponent title="Thumbnail URL" for="thumb">
				<input id="thumb" v-model="currentEffect.attack.thumb" type="text">
			</LabelledComponent>
			<LabelledComponent title="Verb" for="verb">
				<input id="verb" v-model="currentEffect.attack.verb" type="text" placeholder="attacks with">
			</LabelledComponent>
			<LabelledComponent title="Proper Noun" for="proper">
				<span><input id="proper" v-model="currentEffect.attack.proper" type="checkbox"> <label for="proper">Name is proper noun</label>  </span>
			</LabelledComponent>
		</div>
		<LabelledComponent title="Flavor Text" for="text" style="margin-top: 1rem">
			<textarea id="text" v-model="currentEffect.attack.phrase" rows="20" placeholder="Flavor text" />
		</labelledcomponent>

		<div class="two-wide">
			<LabelledComponent title="Crit On" for="criton">
				<select id="criton" v-model="currentEffect.attack.criton" class="ghost">
					<option :value="null">
						(crit on 20)
					</option>
					<option v-for="x in 20" :key="20 - x" :value="20 - x">
						{{ 20 - x }}
					</option>
				</select>
			</LabelledComponent>
			<LabelledComponent title="Extra Crit Damage" for="critdamage">
				<input id="critdamage" v-model="currentEffect.attack.extra_crit_damage" type="text">
			</LabelledComponent>
		</div>

		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<LabelledComponent title="Action Type" for="activationType">
				<select id="activationType" v-model="currentEffect.attack.activation_type" title="Activation Type" class="ghost">
					<option :value="null">
						Attack
					</option>
					<option :value="1">
						Action
					</option>
					<option :value="2">
						No Action
					</option>
					<option :value="3">
						Bonus Action
					</option>
					<option :value="4">
						Reaction
					</option>
					<option :value="6">
						Minute
					</option>
					<option :value="7">
						Hour
					</option>
					<option :value="8">
						Special
					</option>
					<option :value="9">
						Legendary
					</option>
					<option :value="10">
						Mythic
					</option>
					<option :value="11">
						Lair
					</option>
				</select>
			</LabelledComponent>
		</div>
	</template>
</template>

<style scoped>
@import url("../../../assets/styles/automation-editor.less");
</style>
