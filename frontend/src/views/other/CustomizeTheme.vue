<script setup lang="ts">
import { useTheme } from "vuetify";
import StatblockRenderer from "@/components/Statblock/StatblockRenderer.vue";
import { useCustomThemeColors, useStatblockColors } from "@/utils/app/customTheme";
import { useThemePersistence } from "@/utils/app/theme";
import { capitalizeFirstLetter, defaultInterestingStatblock } from "~/shared";

const theme = useTheme();
const { isAllowedCustomTheme, themeOptions } = useThemePersistence();

const { customColors, resetColor, resetAll } = useCustomThemeColors();

const { statblockColors, resetColor: resetStatblockColor, resetAll: resetAllStatblockColors } = useStatblockColors();
</script>

<template>
	<Breadcrumbs
		:routes="[
			{
				path: '../user',
				text: 'User',
				isCurrent: false
			},
			{
				path: '',
				text: 'Theme',
				isCurrent: true
			}
		]"
	/>

	<div class="content">
		<v-row :class="{ 'text-disabled': !isAllowedCustomTheme }">
			<v-col v-if="!isAllowedCustomTheme" cols="12">
				<v-alert icon="$bestiaryBuilder" icon-size="48">
					This feature is only available to Patreon Supporters.<br>
					Become a <a
						href="https://www.patreon.com/c/bestiarybuilder/membership" target="_blank"
						style="color: rgb(var(--v-theme-primary))"
					> Patreon
						Supporter</a> to gain special benefits and support the development of the site.
				</v-alert>
			</v-col>
			<v-divider v-if="!isAllowedCustomTheme" />

			<v-col cols="12">
				<h2> Site Theme </h2>
				<v-select
					v-model="theme.global.name.value" :items="themeOptions" label="Theme" item-props="props"
					max-width="400" hide-details class="mt-3" :disabled="!isAllowedCustomTheme"
				/>
			</v-col>
			<v-divider />
			<v-col cols="12">
				<v-row>
					<v-col v-for="(color, key) in customColors" :key="key" cols="6">
						<v-color-input
							v-model="customColors[key]" mode="hex" :label="key" hide-actions color-pip
							:disabled="!isAllowedCustomTheme"
						>
							<template #append>
								<v-icon-btn icon="mdi:restore" color="primary" @click="resetColor(key)" />
							</template>
						</v-color-input>
					</v-col>
					<v-col>
						<v-btn
							color="error" size="large" class="w-100" prepend-icon="mdi:restore" :disabled="!isAllowedCustomTheme"
							@click="resetAll"
						>
							Reset all
						</v-btn>
					</v-col>
				</v-row>
			</v-col>
			<v-divider />

			<v-col cols="12">
				<p>
					Primary is used as the main colour for icons, accents, and important pieces of content.
				</p>
				<p>
					Background is the background colour of the page.
				</p>
				<p>
					Surface is the main colour of sections of the page.
				</p>
				<p>
					Surface-light is a variant colour for some site sections.
				</p>
				<p>
					Most other colours will inherit from these colours.
				</p>
			</v-col>
			<v-divider />
			<v-col cols="12">
				<h2> Statblock Theme </h2>
				<small> Remember to set Statblock Theme as "Custom" to see your changes elsewhere.
					<br>
					If the options below do not grant you enough customization options, please contact the developers.
				</small>
			</v-col>
			<v-col cols="6">
				<v-row>
					<v-col v-for="(color, key) in statblockColors" :key="key" cols="6">
						<v-color-input
							v-model="statblockColors[key]" mode="rgba" hide-actions density="comfortable"
							:label="capitalizeFirstLetter(key.replace('--', ''))" color-pip
							:disabled="!isAllowedCustomTheme"
						>
							<template #append>
								<v-icon-btn icon="mdi:restore" color="primary" @click="resetStatblockColor(key)" />
							</template>
						</v-color-input>
					</v-col>
					<v-col>
						<v-btn
							color="error" size="large" class="w-100" prepend-icon="mdi:restore"
							:disabled="!isAllowedCustomTheme" @click="resetAllStatblockColors"
						>
							Reset all
						</v-btn>
					</v-col>
				</v-row>
			</v-col>
			<v-col cols="6">
				<StatblockRenderer
					:data="defaultInterestingStatblock" statblock-design="Custom"
					:style="`opacity: ${isAllowedCustomTheme ? 1 : 'var(--v-disabled-opacity)'}`"
				/>
			</v-col>
		</v-row>
	</div>
</template>

<style lang="less" scoped>
@media screen and (width >=1200px) {
	.content {
		padding-left: 10vw;
		padding-right: 10vw;
	}
}
</style>
