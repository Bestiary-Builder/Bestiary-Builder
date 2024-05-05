<script setup lang="ts">
import {RouterView} from "vue-router";
import Footer from "@/constantComponents/Footer.vue";
import NavHeader from "@/constantComponents/NavHeader.vue";
</script>

<template>
	<div id="modal"></div>
	<NavHeader />
	<main>
		<RouterView />
	</main>
	<footer>
		<Footer></Footer>
	</footer>
</template>