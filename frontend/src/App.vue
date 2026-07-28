<script setup lang="ts">
import { RouterView } from "vue-router";
import { Toaster } from "vue-sonner";
import Footer from "@/components/Page/Footer.vue";
import NavHeader from "@/components/Page/NavHeader.vue";
import "vue-sonner/style.css";
</script>

<template>
	<Toaster position="top-left" theme="dark" rich-colors :expand="true" />

	<div id="modal" />
	<NavHeader />
	<main>
		<RouterView />
	</main>
	<footer>
		<Footer />
	</footer>
</template>
