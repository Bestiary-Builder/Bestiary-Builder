<script setup lang="ts">
import { RouterView } from "vue-router";
import Footer from "@/components/Page/Footer.vue";
import NavHeader from "@/components/Page/NavHeader.vue";
import ToastHost from "./components/Page/ToastHost.vue";
</script>

<template>
	<v-app>
		<ToastHost />
		<NavHeader />
		<main>
			<RouterView />
		</main>
		<footer>
			<Footer />
		</footer>
	</v-app>
</template>
