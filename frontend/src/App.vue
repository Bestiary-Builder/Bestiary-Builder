<script lang="ts">
import {RouterLink, RouterView} from "vue-router";
import Footer from "@/constantComponents/Footer.vue";
import NavHeader from "@/constantComponents/NavHeader.vue";
import {defineComponent} from "vue";
export default defineComponent({
	name: "App",
	components: {
		NavHeader,
		Footer,
		RouterView
	}
});
</script>

<template>
	<div id="modal"></div>
	<header>
		<NavHeader />
	</header>
	<main>
		<RouterView />
	</main>
	<footer>
		<Footer></Footer>
	</footer>
</template>

<style scoped></style>
