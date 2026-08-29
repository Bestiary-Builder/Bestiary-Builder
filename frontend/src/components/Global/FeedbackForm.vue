<script setup lang="ts">
import { ref } from "vue";

import { useToast } from "@/utils/app/toast";
import { useFetch } from "@/utils/utils";

const model = defineModel<boolean>();

const toast = useToast();

const type = ref("idea");
const message = ref("");

async function submit() {
	const { success, error } = await useFetch("/api/feedback", "POST", { type: type.value, message: message.value });
	if (success) {
		toast.addToast("Feedback submitted successfully.", { color: "success" });
		message.value = "";
		model.value = false;
	}
	else {
		toast.addToast(`Failed to submit feedback: ${error}`, { color: "error" });
	}
}
</script>

<template>
	<v-dialog v-model="model">
		<v-card>
			<v-card-title>Feedback</v-card-title>
			<v-card-text>
				<v-textarea v-model="message" label="Message" />
				<v-select
					v-model="type"
					:items="[
						{ title: 'Idea', value: 'idea' },
						{ title: 'Issue', value: 'issue' }
					]"
					label="Type"
				/>
				<v-btn @click="submit()">
					Submit
				</v-btn>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>
