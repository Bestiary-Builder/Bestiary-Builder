<script setup lang="ts">
import type { PdfOrientation, PdfPageSize } from "@zumer/snapdom-plugins/pdf";
import type { Statblock } from "~/shared";
import { useLocalStorage } from "@vueuse/core";
import { snapdom } from "@zumer/snapdom";
import { pdf } from "@zumer/snapdom-plugins/pdf";
import { useRoute } from "vue-router";
import { useTheme } from "vuetify";
import { getUmami } from "@/utils/app/analytics";
import { downloadFile } from "@/utils/app/export";
import { useToast } from "@/utils/app/toast";
import { useFetch } from "@/utils/utils";

const { data } = defineProps<{ data: Statblock }>();
const { addToast, updateToast } = useToast();
const $route = useRoute();

const exportStatblockToClipBoard = async () => {
	const text = JSON.stringify(data, null, 2);
	await navigator.clipboard.writeText(text);
	addToast("Exported this statblock to your clipboard.");
	void getUmami()?.track("Export statblock to clipboard");
};

const exportStatblockToFile = async () => {
	void getUmami()?.track("Export statblock to file");
	downloadFile(data, `${data.description.name} from Bestiary Builder`);
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

	const result = await snapdom(el, { scale: 2, quality: 1, backgroundColor: "#fff" });
	await result.download({ format: "jpg", filename: `${data.description.name} from BestiaryBuilder (${type}).jpg` });

	el.classList.remove("to-print");
	el.style = "";
	updateToast(toastId, { text: "Export completed successfully", color: "success" });
	void getUmami()?.track("Export statblock to image");
};

const pdfExportOptions = useLocalStorage("pdfExportOptions", {
	page: "a4" as PdfPageSize, // false means US letter
	includeDescription: true,
	orientation: "portrait" as PdfOrientation
});

const theme = useTheme();
const exportToPdf = async () => {
	if (!data)
		return;
	const toastId = addToast("Exporting...", { loading: true });

	const outerEl = document.getElementById("statblock-outer");
	const innerEl = document.getElementById("statblock");
	const descriptionTextEl = document.getElementById("description-text");
	if (!outerEl || !innerEl) {
		updateToast(toastId, { text: "Uh oh! No statblock element found", color: "error" });
		return;
	}

	innerEl.style = `width: 800px; column-count: 2`;
	outerEl.style = "width: 800px;";
	innerEl.classList.add("to-print");
	if (descriptionTextEl && theme.current.value.dark)
		descriptionTextEl.style = "color: #000";
	const proxyUrl = `${window.location.origin}/api/proxy`;
	// we run it twice, as the first one tends to have some issues
	let result = await snapdom(pdfExportOptions.value.includeDescription ? outerEl : innerEl, { plugins: [pdf({ breakAvoid: true })], scale: 2, quality: 1, backgroundColor: "#fff", fast: false, embedFonts: true, useProxy: proxyUrl });
	result = await snapdom(pdfExportOptions.value.includeDescription ? outerEl : innerEl, { plugins: [pdf({ breakAvoid: true })], scale: 2, quality: 1, backgroundColor: "#fff", fast: false, embedFonts: true, useProxy: proxyUrl });

	await result.toPdf({
		page: pdfExportOptions.value.page ? "a4" : "letter",
		orientation: pdfExportOptions.value.orientation,
		margin: 24,
		header: {
			left: "Made with Bestiary Builder",
			right: data.description.name,
			rule: false
		},
		download: `${data.description.name} from BestiaryBuilder.pdf`
	});

	innerEl.classList.remove("to-print");
	innerEl.style = "";
	outerEl.style = "";
	if (descriptionTextEl && theme.current.value.dark)
		descriptionTextEl.style = "";

	updateToast(toastId, { text: "Export completed successfully", color: "success" });
	void getUmami()?.track("Export statblock to pdf");
};

const isGecko = CSS.supports("-moz-appearance", "none");
</script>

<template>
	<v-dialog max-width="400">
		<template #activator="{ props }">
			<v-icon-btn
				v-tooltip="'Export creature'" icon="mdi:export" label="Export Creature" v-bind="props"
				size="24"
			/>
		</template>

		<template #default>
			<v-card class="text-center pa-4" title="Export bestiary">
				<v-card-actions class="d-flex flex-column align-center justify-center" min-width="200">
					<v-btn class="w-100" color="success" size="large" prepend-icon="mdi:content-copy" @click="exportStatblockToClipBoard()">
						Clipboard
					</v-btn>
					<v-btn class="w-100" color="success" size="large" prepend-icon="mdi:file" @click="exportStatblockToFile()">
						File
					</v-btn>
					<v-btn class="w-100" color="success" size="large" prepend-icon="arcticons:rpg-dice" @click="exportHomebrewery()">
						Homebrewery
					</v-btn>
					<div class="d-flex align-center no-wrap my-4 w-100">
						<v-divider class="flex-grow-1" />
						<span class="mx-4 text-medium-emphasis text-no-wrap">
							Image
							Options
						</span>
						<v-divider class="flex-grow-1" />
					</div>
					<v-alert v-if="isGecko" color="error">
						For best results use a different browser other than Firefox.
					</v-alert>
					<v-btn class="w-100" color="success" size="large" @click="exportToImage('2x1')">
						2 columns
					</v-btn>
					<v-btn class="w-100" color="success" size="large" @click="exportToImage('1x1')">
						1 column
					</v-btn>
					<v-btn class="w-100" color="success" size="large" @click="exportToImage('2x1 wide')">
						2 columns extra wide
					</v-btn>
					<div class="d-flex align-center no-wrap my-4 w-100">
						<v-divider class="flex-grow-1" />
						<span class="mx-4 text-medium-emphasis text-no-wrap">
							PDF Options
						</span>
						<v-divider class="flex-grow-1" />
					</div>
					<v-alert v-if="isGecko" color="error">
						For best results use a different browser other than Firefox.
					</v-alert>
					<div class="w-100">
						<v-switch v-model="pdfExportOptions.includeDescription" color="primary" label="Include creature description" hide-details density="compact" size="small" />
						<v-switch v-model="pdfExportOptions.page" color="primary" density="compact" :label="`Page size: ${pdfExportOptions.page === 'a4' ? 'A4' : 'US Letter'}`" hide-details false-value="letter" true-value="a4" size="small" />
						<v-switch v-model="pdfExportOptions.orientation" color="primary" density="compact" :label="`Page orientation: ${pdfExportOptions.orientation}`" false-value="landscape" true-value="portrait" hide-details size="small" />
					</div>
					<v-badge class="w-100" color="primary" content="experimental" location="top right" offset-x="60">
						<v-btn class="w-100" color="success" size="large" prepend-icon="mdi:file-pdf-box" @click="exportToPdf()">
							Export to PDF
						</v-btn>
					</v-badge>
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
</template>
