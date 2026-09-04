<script setup lang="ts">
import type { Statblock } from "~/shared";
import { useRoute } from "vue-router";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { useFetch } from "@/utils/utils";

const { data } = defineProps<{ data: Statblock }>();
const { addToast, removeToast, updateToast } = useToast();
const $route = useRoute();

const exportStatblockToClipBoard = async () => {
	const text = JSON.stringify(data, null, 2);
	await navigator.clipboard.writeText(text);
	addToast("Exported this statblock to your clipboard.");
	void getUmami()?.track("Export statblock to clipboard");
};

const exportStatblockToFile = async () => {
	void getUmami()?.track("Export statblock to file");

	const file = new File(
		[
			JSON.stringify(data)
		],
		`${data.description.name} from Bestiary Builder.txt`,
		{
			type: "text/plain"
		}
	);

	// https://javascript.plainenglish.io/javascript-create-file-c36f8bccb3be
	const link = document.createElement("a");
	const url = URL.createObjectURL(file);

	link.href = url;
	link.download = file.name;
	document.body.appendChild(link);
	link.click();

	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};

const exportHomebrewery = async () => {
	try {
		const { success, data: resultData, error } = await useFetch<{ metadata: string }>(
			`/api/homebrewery/export/creature/${$route.params.id.toString()}`,
			"GET"
		);
		if (success) {
			await navigator.clipboard.writeText(resultData.metadata);
			addToast("Exported this statblock markdown to your clipboard");
			void getUmami()?.track("Export statblock to homebrewery");
		}
		else {
			addToast(error, { color: "error" });
			;
		}
	}
	catch (err) {
		addToast(err as string, { color: "error" });
	}
};

const exportToImage = async (type: "1x1" | "2x1" | "2x1 wide") => {
	if (!data)
		return;
	const toastId = addToast("Exporting...", { loading: true });

	const el = document.getElementById("statblock");
	if (!el) {
		updateToast(toastId, { text: "Uh oh! No statblock element found", color: "error" });
		return;
	}

	el.style = `width: ${type === "2x1 wide" ? "1200" : "800"}px; column-count: ${type === "1x1" ? "1" : "2"};`;
	el.classList.add("to-print");


	let canvas;
	const { default: html2canvas } = await import('html2canvas-pro');
	canvas = await html2canvas(el, { scale: 2, allowTaint: true, logging: false });

	const image = canvas.toDataURL("image/jpeg");

	const link = document.createElement("a");
	link.download = `${data.description.name} from BestiaryBuilder (${type}).jpg`;
	link.href = image;
	link.click();
	el.classList.remove("to-print");
	el.style = "";

	removeToast(toastId);
	void getUmami()?.track("Export statblock to image");
};
</script>

<template>
	<v-dialog max-width="400">
		<template #activator="{ props }">
			<v-icon-btn v-tooltip="'Export creature'" icon="mdi:export" label="Export Creature" v-bind="props"
				size="24" />
		</template>

		<template #default>
			<v-card class="text-center pa-4" title="Export bestiary">
				<v-card-actions class="d-flex flex-column align-center justify-center" min-width="200">
					<v-btn class="w-100" color="success" size="large" @click="exportStatblockToClipBoard()">
						Clipboard
					</v-btn>
					<v-btn class="w-100" color="success" size="large" @click="exportStatblockToFile()">
						File
					</v-btn>
					<v-btn class="w-100" color="success" size="large" @click="exportHomebrewery()">
						Homebrewery
					</v-btn>
					<div class="d-flex align-center no-wrap my-4 w-100">
						<v-divider class="flex-grow-1" />
						<span class="mx-4 text-medium-emphasis">Image Options</span>
						<v-divider class="flex-grow-1" />
					</div>

					<v-btn class="w-100" color="success" size="large" @click="exportToImage('2x1')">
						2 columns
					</v-btn>
					<v-btn class="w-100" color="success" size="large" @click="exportToImage('1x1')">
						1 column
					</v-btn>
					<v-btn class="w-100" color="success" size="large" @click="exportToImage('2x1 wide')">
						2 columns extra wide
					</v-btn>
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
</template>
