<template>
	<input id="navbar-indicator" class="navbar-collapse" type="checkbox" checked />
	<nav class="navbar">
		<div class="navbar-left">
			<RouterLink :to="$router.options.routes[0].path" class="navbar-brand">
				<img src="/logo.svg" />
				<span>BESTIARY BUILDER</span>
			</RouterLink>

		</div>

		<div class="navbar-center">
			<RouterLink v-for="route in $router.options.routes.filter((a: any) => a.navbar)" :to="route.path" class="nav-link">
				<span class="header-item">{{ route.name }}</span>
			</RouterLink>
		</div>

		<div class="navbar-right">
			<RouterLink class="user" v-if="user" to="/user">
				<span>{{ user.username }}</span>
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
import type {User} from "@/generic/types";
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

	gap: 0.3rem;
	& img {
		height: 1.5rem;
		border-radius: 50%;
		scale: 1.1;
	}
}

.login {
	cursor: pointer;
}
.navbar {
	position: relative;

	background: var(--color-surface-2);

	display: grid;
	grid-template-columns: 2fr 6fr 2fr;

	box-shadow: rgba(0, 0, 0, 0.19) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 2px 2px;
}

.navbar-left {
	display: flex;
}
.navbar-right {
	display: flex;
	align-items: center;
	justify-content: right;
	padding: 0 2rem;
}

.navbar-center {
	display: flex;
	justify-content: center;
	padding: 0.3rem 1rem;
	gap: .3rem;
}
.navbar-brand,
.navbar .nav-link {
	color: white;
	padding: .7rem;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.navbar-brand {
	font-weight: bold;
	padding: 0 2rem;
	flex-direction: row;
}

.navbar-brand img {
	margin-right: 10px;
	height: 2.25rem;
}
.nav-link {
	width: 20%;
	text-align: center;
	font-weight: bold;
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
