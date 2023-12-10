<script lang="ts">
import {RouterLink, RouterView} from "vue-router";
import NavBar from "./constantComponents/NavBar.vue";
import Footer from "./constantComponents/Footer.vue";

import {defineComponent} from "vue";
export default defineComponent({
	name: "App",
	components: {
		NavBar,
		Footer,
		RouterView
	}
});
</script>

<template>
	<header>
		<NavBar />
	</header>
	<main>
		<RouterView />
	</main>
	<footer>
		<Footer></Footer>
	</footer>
</template>

<style scoped></style>
