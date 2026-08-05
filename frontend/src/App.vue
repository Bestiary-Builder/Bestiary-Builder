<script setup lang="ts">
import { RouterView } from "vue-router";
import { Toaster } from "vue-sonner";
import Footer from "@/components/Page/Footer.vue";
import NavHeader from "@/components/Page/NavHeader.vue";
import "vue-sonner/style.css";
</script>

<template>
	<v-app>
		<Toaster position="bottom-left" theme="dark" rich-colors :expand="true" />
		<NavHeader />
		<main>
			<RouterView />
		</main>
		<footer>
			<Footer />
		</footer>
	</v-app>
</template>
