<script setup lang="ts">
import { type Ref, inject } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import type { AttackModel } from "~/shared";
import LabelledComponent from "@/components/LabelledComponent.vue";

const currentEffect = inject<Ref<AttackModel>>("currentEffect");
const _currentContext = inject<Ref<string[]>>("currentContext");

useDataCleanup(currentEffect, ["thumb", "verb", "proper", "phrase", "criton", "extra_crit_damage", "activation_type"]);
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Attack Model" />
		<div class="two-wide">
			<LabelledComponent title="Attack Name*" for="name">
				<input id="name" v-model="currentEffect.name" type="text" :class="{ required: currentEffect.name.length === 0 }">
			</LabelledComponent>
			<LabelledComponent title="Thumbnail URL" for="thumb">
				<input id="thumb" v-model="currentEffect.thumb" type="text">
			</LabelledComponent>
			<LabelledComponent title="Verb" for="verb">
				<input id="verb" v-model="currentEffect.verb" type="text" placeholder="attacks with">
			</LabelledComponent>
			<LabelledComponent title="Proper Noun" for="proper">
				<span><input id="proper" v-model="currentEffect.proper" type="checkbox"> <label for="proper">Name is proper noun</label>  </span>
			</LabelledComponent>
		</div>
		<LabelledComponent title="Flavor Text" for="text" style="margin-top: 1rem">
			<textarea id="text" v-model="currentEffect.phrase" rows="20" placeholder="Flavor text" />
		</labelledcomponent>

		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<LabelledComponent title="Action Type" for="activationType">
				<select id="activationType" v-model="currentEffect.activation_type" title="Activation Type" class="ghost">
					<option value="">
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

	{{ currentEffect }}
</template>

<style scoped>
@import url("../../../assets/styles/automation-editor.less");
</style>
