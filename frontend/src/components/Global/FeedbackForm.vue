<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useRules } from "vuetify/labs/rules";
import { useToast } from "@/utils/app/toast";
import { useFetch } from "@/utils/utils";

const model = defineModel<boolean>();

const toast = useToast();

const type = ref("");
const message = ref("");

const route = useRoute();
async function submit() {
	const { success, error } = await useFetch("/api/feedback", "POST", { type: type.value, message: message.value, route: route.path });
	if (success) {
		toast.addToast("Feedback submitted successfully.", { color: "success" });
		message.value = "";
		model.value = false;
	}
	else {
		toast.addToast(`Failed to submit feedback: ${error}`, { color: "error" });
	}
}

const rules = useRules();

const title = computed(() => {
	if (type.value === "")
		return "Give Feedback";
	if (type.value === "idea")
		return "Submit Idea";
	if (type.value === "issue")
		return "Submit Issue";
	return "Give Feedback";
});
</script>

<template>
	<v-dialog v-model="model" max-width="500" :activator-props="{ variant: 'plain' }" min-height="400">
		<v-card
			:title class="pa-4 pb-6 text-center d-flex flex-column" style="min-height: 375px;"
			subtitle="Feedback is directly submitted to the developers."
		>
			<div class="">
				<v-slide-x-transition mode="out-in" class="w-100">
					<v-sheet v-if="!type" :key="1" class="d-flex justify-center align-center ga-4 my-5">
						<v-responsive :aspect-ratio="1 / 1">
							<v-btn
								variant="outlined" :ripple="false" class="border border-md rounded w-100 h-100"
								elevation="3" stacked @click="type = 'idea'"
							>
								<template #prepend>
									<v-icon size="48" icon="mdi:lightbulb" color="primary" />
								</template>
								Idea
							</v-btn>
						</v-responsive>

						<v-responsive :aspect-ratio="1 / 1">
							<v-btn
								variant="outlined" :ripple="false" class="border border-md rounded w-100 h-100"
								elevation="3" stacked @click="type = 'issue'"
							>
								<template #prepend>
									<v-icon size="48" icon="mdi:bug" color="success" />
								</template>
								Issue
							</v-btn>
						</v-responsive>
					</v-sheet>
					<v-sheet v-else :key="2" class="w-100 h-100">
						<v-card-text>
							<v-textarea
								v-model="message" label="Feedback" counter
								:rules="[rules.maxLength(4096), rules.required()]"
							/>
							<v-card-actions class="w-100 d-flex ga-2 pa-4">
								<v-btn
									:color="message ? 'success' : undefined" prepend-icon="mdi:send"
									class="flex-grow-1" @click="submit"
								>
									Submit
								</v-btn>
								<v-btn
									prepend-icon="mdi:arrow-left" class="flex-grow-1"
									@click="type = ''; message = ''"
								>
									Back
								</v-btn>
								<v-btn
									prepend-icon="mdi:close" class="flex-grow-1"
									@click="type = ''; message = ''; model = false"
								>
									Cancel
								</v-btn>
							</v-card-actions>
						</v-card-text>
					</v-sheet>
				</v-slide-x-transition>
			</div>
		</v-card>
	</v-dialog>
</template>
