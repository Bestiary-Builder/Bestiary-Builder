<script setup lang="ts">
import { RouterView } from "vue-router";
import Footer from "@/components/Page/Footer.vue";
import NavHeader from "@/components/Page/NavHeader.vue";
</script>

<template>
	<div id="modal" />
	<NavHeader />
	<main>
		<RouterView />
	</main>
	<footer>
		<Footer />
	</footer>
</template>
