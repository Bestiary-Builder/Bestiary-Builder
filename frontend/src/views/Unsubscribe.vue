<script setup lang="ts">
import { ref } from "vue";
import Breadcrumbs from "@/components/Page/Breadcrumbs.vue";
import { getUmami } from "@/utils/app/analytics";
import { $loading } from "@/utils/app/loading";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";

const status = ref(0);
const errorMsg = ref("");

const loader = $loading.show();

useFetch("/api/unsubscribe")
	.then((result) => {
		if (result.success) {
			status.value = 1;
			getUmami()?.track("Unsubscribe email", { id: store.user?.id });
			if (store.user)
				store.user.unsubscribedFromEmails = false;
		}
		else {
			status.value = 2;
			errorMsg.value = result.error;
		}
		loader.hide();
	})
	.catch((err) => {
		console.error(err);
		status.value = 2;
		errorMsg.value = err;
	});
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
		:is-less-wide="true"
	/>
	<div class="content less-wide center">
		<div>
			<h3 v-if="status === 1">
				Succesfully unsubscribed from all future emails.
			</h3>
			<h3 v-else-if="status === 2">
				Failed to unsubscribe from emails: {{ errorMsg }}
			</h3>
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
