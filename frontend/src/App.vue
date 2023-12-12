<script lang="ts">
import {RouterLink, RouterView} from "vue-router";
import NavBar from "./constantComponents/NavBar.vue";
import Footer from "./constantComponents/Footer.vue";
import UserBanner from "./constantComponents/UserBanner.vue";

import {defineComponent} from "vue";
export default defineComponent({
	name: "App",
	components: {
		NavBar,
		Footer,
		RouterView,
		UserBanner
	}
});
</script>

<template>
	<div id="modal"></div>
	<div class="banner">
		<UserBanner />
	</div>
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

<style scoped>
.banner {
	grid-area: user;
	position: sticky;
	top: 0;
	z-index: 100;
	height: 100%;
	display: none;
}
</style>
