<template> 
	<Breadcrumbs
		:routes="[
			{
				path: '',
				text: 'My Automation',
				isCurrent: true
			}
		]"
	>
    <button @click="exportMyAutomations()" v-tooltip="'Export all automations to your clipboard'" aria-label="Export all automations to your clipboard">
        <font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" />
    </button>
</Breadcrumbs>
    <div class="content">
        <div class="wrapper">
            <div class="left">
                <LabelledComponent title="List">
                    <ol v-if="data && data.length > 0">
                        <li v-for="d, key in data" :key="key" class="feature-button__container" @click="selectedAutomation = d"  :class="{selected: d._id == selectedAutomation?._id}"> 
                            <p role="button" :aria-label="`Select automation: ${d.name} (${key})`">
                                {{ d.name }}
                            </p>
                        </li>
                    </ol>
                    <p v-else>
                        You do not have any personal automations.
                    </p>
                </LabelledComponent>
                <LabelledComponent title="Add new automation">
                    <input type="text" v-model="newAutomationName" id="addnewautomation">
                    <button class="btn confirm" @click="addAutomation()">Add </button>
                </LabelledComponent>
                <LabelledComponent title="Delete automation" v-if="selectedAutomation">
                    <button class="btn danger" @click="deleteAutomation(selectedAutomation._id)">Delete current automation</button>
                </LabelledComponent>
            </div>
            <hr />
            <div class="automation-editor">
                <AutomationEditor v-if="selectedAutomation" :data="selectedAutomation" :is-stand-alone="true" :key="selectedAutomation?._id.toString()"/>
                <div v-else class="no-selected"> Select an automation to get started with editing it.</div>
            </div> 
        </div>

    </div>
</template>

<script setup lang="ts">
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import {ref, onMounted } from 'vue';
import {useLoading} from 'vue-loading-overlay'
import { user as getUser, handleApiResponse, toast, type error, asyncLimits, type limitsType, loadingOptions } from '@/main';
import { type User, Automation } from '../../../shared';
import type { Id } from '../../../shared';
import LabelledComponent from '@/components/LabelledComponent.vue';
import AutomationEditor from '@/components/AutomationEditor.vue';
import YAML from "yaml";
const $loading = useLoading(loadingOptions);
const user     = ref<User | null>(null);
let limits     : limitsType | null = null
const data     = ref<Automation[]>([]);
// get our data
onMounted(async () => {
    const loader = $loading.show();

    //Request my automations
    await getMyAutomations()
    user.value = await getUser;
    limits = await asyncLimits;
    loader.hide()
})


const selectedAutomation = ref<Automation | null>(null);


const newAutomationName = ref<string>("New Automation");
const addAutomation = () => {
    if (newAutomationName.value == "New Automation") {
        toast.warning("Automation must have a non-default name!")
        return;
    }
    const loader = $loading.show();
    fetch(`/api/automation/add`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({data: {name: newAutomationName.value}})
    }).then(async (response) => {
        let result = await handleApiResponse<Automation>(response);
        if (result.success) {
            await getMyAutomations();
            newAutomationName.value = "New Automation";
            toast.success("Successfully added automation!")
            selectedAutomation.value = data.value[data.value.length -1]
        } 
        else toast.error((result.data as error).error);
    });
    loader.hide()
}

const deleteAutomation = (_id: Id ) => {
    const loader = $loading.show();
    fetch(`/api/automation/${_id}/delete`).then(async (response) => {
        let result = await handleApiResponse<{}>(response);
        if (result.success) {
            toast.success("Successfully deleted the automation!")
            await getMyAutomations()
            selectedAutomation.value = null
        } 
        else toast.error((result.data as error).error);
    });
    loader.hide()
}

const getMyAutomations = async () => {
    await fetch(`/api/my-automations`).then(async (response) => {
        let result = await handleApiResponse<Automation[]>(response);
        if (result.success) data.value = result.data as Automation[];
        else toast.error((result.data as error).error);
    });
}

const exportMyAutomations = () => {
    navigator.clipboard.writeText(
        YAML.stringify(
            data.value.map(a => a.automation)
        )
    )
    toast.success("Copied all automation to clipboard!")
}
</script>

<style scoped lang="less">
@import url("@/assets/styles/mixins.less");
.wrapper {
    display: grid;
    grid-template-columns: 2fr .1fr 10fr;
    gap: 2rem;
    border-radius: 3px;
    padding: .5rem;

    .left {
        ol {
            list-style-type: decimal;
            color: white;
            margin: 0rem;
            li {
                display: list-item;
                margin: .3rem 0;
                p {
                    cursor: pointer;

                }
                &.selected {
                    text-decoration: underline;
                    color: orangered;
                }
            }
        }

        .two-wide.uneven {
            width: 100%;
			display: grid;
			gap: 0rem 1rem;
			margin-bottom: 1rem;
            grid-template-columns: 3fr 1fr;
		}

        display: flex;
        flex-direction: column;
        gap: .8rem;
    }

    .automation-editor {
        border: 0px solid red;
    }
}

@media screen and (max-width: 1200px) {
	.wrapper {
		gap: 1rem;
		grid-template-columns: 1fr;
	}
}
</style>