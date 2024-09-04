<script setup lang="ts">
import { RouterView } from "vue-router";
import { Toaster } from "vue-sonner";
import Footer from "@/constantComponents/Footer.vue";
import NavHeader from "@/constantComponents/NavHeader.vue";
</script>

<template>
	<Toaster
		position="top-right" expand theme="dark" rich-colors offset="80px" close-button
	/>
	<div id="modal" />
	<NavHeader />
	<main>
		<RouterView />
	</main>
	<footer>
		<Footer />
	</footer>
</template>
