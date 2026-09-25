<script setup lang="ts">
import { useRouter } from "vue-router";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";

const router = useRouter();
const { addToast } = useToast();

async function unsubscribe() {
	const result = await useFetch("/api/unsubscribe", "POST");
	if (result.success) {
		void getUmami()?.track("Unsubscribe email", { id: store.user?.id });
		if (store.user)
			store.user.unsubscribedFromEmails = true;
	}
	addToast(result.success ? "Successfully unsubscribed from emails." : `Failed to unsubscribe from emails: ${result.error}`, {
		color: result.success ? "success" : "error"
	});
	await router.replace("/user");
}

void unsubscribe();
</script>

<template>
	<Breadcrumbs
		:routes="[
			{
				path: '',
				text: 'Unsubscribe from emails',
				isCurrent: true,
			},
		]"
	/>
	<div class="content less-wide center">
		<div>
			<v-progress-circular indeterminate color="primary" size="64" />
			<p>Unsubscribing from emails...</p>
		</div>
	</div>
</template>

<style scoped lang="less">
.content {
	min-height: 80vh;
	padding: 2rem 10vw;

	div {
		display: flex;
		flex-direction: column;
	}
}

.center {
	display: flex;
	justify-content: center;
}

hr {
	width: 100%;
}
</style>
