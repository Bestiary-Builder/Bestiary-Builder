<script setup lang="ts">
import { RouterView } from "vue-router";
import Footer from "@/constantComponents/Footer.vue";
import NavHeader from "@/constantComponents/NavHeader.vue";
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
