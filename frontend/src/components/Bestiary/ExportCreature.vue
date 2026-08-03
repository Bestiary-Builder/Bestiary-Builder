<template>
    <v-dialog max-width="400">
        <template v-slot:activator="{ props: activatorProps }">
            <ButtonIcon icon="arrow-right-from-bracket" label="Export Creature" v-bind="activatorProps" />
        </template>

        <template v-slot:default="{ isActive }">
            <v-card class="text-center pb-2 pa-4" title="Export bestiary">
                <v-card-actions class="d-flex flex-column align-center justify-center" min-width="200">
                    <v-btn @click="exportStatblockToClipBoard()" class="w-100" color="green" size="large">
                        Clipboard
                    </v-btn>
                    <v-btn @click="exportStatblockToFile()" class="w-100" color="green" size="large">
                        File
                    </v-btn>
                    <v-btn @click="exportHomebrewery()" class="w-100" color="green" size="large">
                        Homebrewery
                    </v-btn>
                    <div class="d-flex align-center no-wrap my-4 w-100">
                        <v-divider class="flex-grow-1" />
                        <span class="mx-4 text-medium-emphasis">Image Options</span>
                        <v-divider class="flex-grow-1" />
                    </div>

                    <v-btn @click="exportToImage('2x1')" class="w-100" color="green" size="large">
                        2 columns
                    </v-btn>
                    <v-btn @click="exportToImage('1x1')" class="w-100" color="green" size="large">
                        1 column
                    </v-btn>
                    <v-btn @click="exportToImage('2x1 wide')" class="w-100" color="green" size="large">
                        2 columns extra wide
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import { getUmami } from '@/utils/app/analytics';
import { $loading } from '@/utils/app/loading';
import { $toast } from '@/utils/app/toast';
import html2canvas from 'html2canvas';
import { useFetch } from '@/utils/utils';
import type { Statblock } from '~/shared';
import { useRoute } from "vue-router"
import ButtonIcon from '../Global/ButtonIcon.vue';

const { data } = defineProps<{ data: Statblock }>()

const $route = useRoute()

const exportStatblockToClipBoard = async () => {
    const text = JSON.stringify(data, null, 2);
    await navigator.clipboard.writeText(text);
    $toast.info("Exported this statblock to your clipboard.");
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
            $toast.info("Exported this statblock markdown to your clipboard");
            void getUmami()?.track("Export statblock to homebrewery");
        }
        else {
            $toast.error(error);
        }
    }
    catch (err) {
        $toast.error(err as string);
    }
};

const exportToImage = async (type: "1x1" | "2x1" | "2x1 wide") => {
    if (!data)
        return;
    const loader = $loading.show();
    const el = document.getElementById("statblock");
    if (!el)
        return;

    el.style = `width: ${type === "2x1 wide" ? "1200" : "800"}px; column-count: ${type === "1x1" ? "1" : "2"};`;
    el.classList.add("toPrint");

    const canvas = await html2canvas(el, { scale: 2 });
    const image = canvas.toDataURL("image/jpeg");
    const link = document.createElement("a");

    link.download = `${data.description.name} from BestiaryBuilder (${type}).jpg`;
    link.href = image;
    link.click();
    el.classList.remove("toPrint");
    el.style = "";
    loader.hide();
    void getUmami()?.track("Export statblock to image");
};

</script>