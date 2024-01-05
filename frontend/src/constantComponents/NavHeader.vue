<template>
	<nav class="navbar" :class="{'expanded': isExpanded}" ref="navbar">
		<div class="navbar-left">
			<RouterLink :to="$router.options.routes[0].path" class="navbar-brand">
				<img src="/logo.svg" alt="Site logo" />
				<span>BESTIARY BUILDER</span>
			</RouterLink>
		</div>

		<div class="navbar-center">
			<RouterLink v-for="route in $router.options.routes.filter((a: any) => a.navbar)" :to="route.path" class="nav-link" @click="isExpanded = false">
				<span class="header-item">{{ route.name }}</span>
			</RouterLink>
		</div>

		<div class="navbar-right">
			<RouterLink class="user" v-if="user" to="/user" @click="isExpanded = false">
				<span>{{ user.username }}</span>
				<img alt="avatar" :src="'https://cdn.discordapp.com/avatars/' + user._id + '/' + user.avatar + '.png'" />
			</RouterLink>
			<div v-else class="user login" @click.prevent="LoginClick">Login</div>
		</div>

		<span class="navbar-toggler" @click="isExpanded = !isExpanded" aria-label="Toggle navbar"> <font-awesome-icon :icon="['fas', 'bars']" /> </span>
	</nav>
</template>
<script lang="ts">
import {RouterLink, RouterView} from "vue-router";
import UserBanner from "@/components/UserBanner.vue";
import {user, sendToLogin} from "@/main";
import type {User} from "@/generic/types";
import {defineComponent} from "vue";
import { onClickOutside } from "@vueuse/core";
import { ref } from "vue";
export default defineComponent({
	name: "NavHeader",
	components: {
		UserBanner
	},
	data() {
		return {
			user: null as User | null,
		};
	},
	async mounted() {
		this.user = await user;
	},
	methods: {
		LoginClick() {
			sendToLogin(this.$route.path);
		},
	},
	setup() {
		const isExpanded = ref(false)
		const navbar = ref<HTMLDivElement | null>(null);

		// only register this handler if on mobile device.
		// this is crude but works fine
		if (window.screen.availWidth < 900) {
			onClickOutside(navbar, () => {
				if (isExpanded.value) isExpanded.value = false
			})
		}
		
		return {
			isExpanded,
			navbar
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
	gap: 0.7rem;

	& .nav-link {
		width: fit-content;
	}
}
.navbar-brand,
.navbar .nav-link {
	color: white;
	padding: 0.7rem;
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
	.navbar {
		grid-template-columns: 8fr 2fr;	
	}
	.navbar-center, .navbar-right, .user {
		display: none;
	}

	.navbar-brand {
		width: fit-content;
		padding: .5rem 1rem
	}
	.navbar-toggler {
		color: white;

		display: inline-block;
		padding: .9rem 1.3rem;

		position: absolute;
		top: 0;
		right: 0;

		cursor: pointer;
	}

	.navbar.expanded {
		grid-template-columns: 8fr;
		position: absolute;
		width: 100vw;
		z-index: 100;
		.navbar-left {
			display: none;
		}
		.navbar-center {
			display: block;
			margin: auto;
		}

		.navbar-right {
			padding: 0;
			display: block;
		}

		.nav-link {
			width: 100%;
		}

		.user {
			display: flex;
			justify-content: center;
			padding-bottom: 1rem;
		}
	}
}
</style>

<style lang="less">
// not scoped styles
@media screen and (max-width: 842px) {
	body:has(.navbar.expanded) main::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, .5);
		z-index: 1;
	}
}
</style>
