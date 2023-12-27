<template>
	<input id="navbar-indicator" class="navbar-collapse" type="checkbox" checked />
	<nav class="navbar">
		<div class="navbar-left">
			<RouterLink :to="$router.options.routes[0].path" class="navbar-brand">
				<img src="/logo.svg" />
				<span>BESTIARY BUILDER</span>
			</RouterLink>
			<RouterLink v-for="route in $router.options.routes.filter((a: any) => a.navbar)" :to="route.path" class="nav-link">
				<div class="header-item">{{ route.name }}</div>
			</RouterLink>
		</div>

		<div class="navbar-center">
			<!-- <RouterLink v-for="route in $router.options.routes.filter((a: any) => a.navbar)" :to="route.path" class="nav-link">
			<div class="header-item"> {{   route.name  }}</div>
		</RouterLink> -->
		</div>

		<div class="navbar-right">
			<RouterLink class="user" v-if="user" to="/user">
				<span>@{{ user.username }}</span>
				<img alt="avatar" :src="'https://cdn.discordapp.com/avatars/' + user._id + '/' + user.avatar + '.png'" />
			</RouterLink>
			<div v-else class="user login" @click.prevent="LoginClick">Login</div>
		</div>

		<label class="navbar-toggler" for="navbar-indicator"> + </label>
	</nav>
</template>
<script lang="ts">
import {RouterLink, RouterView} from "vue-router";
import UserBanner from "@/components/UserBanner.vue";
import {user, loginLink} from "@/main";
import type {User} from "@/components/types";
import {defineComponent} from "vue";
export default defineComponent({
	name: "NavHeader",
	components: {
		UserBanner
	},
	data() {
		return {
			user: null as User | null
		};
	},
	async mounted() {
		this.user = await user;
	},
	methods: {
		LoginClick() {
			window.location.href = loginLink;
		}
	}
});
</script>
<style scoped lang="less">
.user {
	display: flex;
	align-items: center;
	padding: 1rem;
	gap: 0.3rem;
	text-decoration: none;
	color: var(--color-base);
	& img {
		height: 1.5rem;
		border-radius: 50rem;
		scale: 1.1;
	}
}
.user img {
	border-radius: 50rem;
}
.login {
	cursor: pointer;
}
.navbar {
	position: relative;

	background: rgb(26, 25, 25);

	display: flex;
	flex: 1;
	justify-content: space-between;

	box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
}

.navbar-left {
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
}

.navbar-right {
	display: inline-block;
	display: inline-flex;
}

.navbar-center {
	display: inline-block;
}

.navbar-brand,
.navbar .nav-link {
	color: White;
	text-decoration: none;
	padding: 1rem;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.navbar-brand {
	font-weight: bold;

	padding-left: 2rem;
	padding-right: 2rem;

	background: rgb(48, 46, 46);

	flex-direction: row;
}
.navbar-brand img {
	margin-right: 10px;
	height: 2.25rem;
	//filter: invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%);
}
.nav-link {
	min-width: 10vw;
	text-align: center;
	border-left: 1px solid orangered;
	text-transform: lowercase;
}
.nav-link:last-of-type {
	border-right: 1px solid orangered;
}
.navbar .nav-link:hover {
	color: LightGray;
}

.navbar-collapse,
.navbar-toggler {
	display: none;
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Override styles to support mobile devices
 */

@media (max-width: 842px) {
	.navbar-right,
	.navbar-left {
		display: block;

		border-top: 1px solid DimGray;
	}

	.navbar-right {
		position: static;
	}

	.navbar-collapse:checked + .navbar {
		max-height: 50px;
		overflow: hidden;
	}

	.navbar-toggler {
		color: White;

		display: inline-block;
		padding: 15px 25px;

		position: absolute;
		top: 0;
		right: 0;

		border-left: 1px solid DimGray;

		cursor: pointer;
	}
}
</style>
