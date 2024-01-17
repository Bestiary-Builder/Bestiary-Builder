<template>
	<nav class="navbar" :class="{expanded: isExpanded}" ref="navbar" id="navbar">
		<div class="navbar-left">
			<RouterLink :to="$router.options.routes[0].path" class="navbar-brand">
				<img src="/logo.svg" alt="Site logo" />
				<span>BESTIARY BUILDER</span>
			</RouterLink>
		</div>

		<div class="navbar-center">
			<RouterLink v-for="route in $router.options.routes.filter((a: any) => a.meta.navbar)" :to="route.path" class="nav-link" @click="isExpanded = false">
				<span class="header-item">{{ route.name }}</span>
			</RouterLink>
		</div>

		<div class="navbar-right" :class="{settings: user}">
			<RouterLink class="user" v-if="user" to="/user" @click="isExpanded = false">
				<span>{{ user.username }}</span>
				<div class="image-wrapper">
					<img alt="avatar" :src="user.avatar ? 'https://cdn.discordapp.com/avatars/' + user._id + '/' + user.avatar + '.png' : 'https://cdn.discordapp.com/embed/avatars/0.png'" />
					<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512">
						<path
							d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"
						/>
					</svg>
				</div>
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
import {onClickOutside} from "@vueuse/core";
import {ref} from "vue";
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
			sendToLogin(this.$route.path);
		}
	},
	setup() {
		const isExpanded = ref(false);
		const navbar = ref<HTMLDivElement | null>(null);

		// only register this handler if on mobile device.
		// this is crude but works fine
		if (window.screen.availWidth < 900) {
			onClickOutside(navbar, () => {
				if (isExpanded.value) isExpanded.value = false;
			});
		}

		return {
			isExpanded,
			navbar
		};
	}
});
</script>
<style scoped lang="less">
.navbar {
	position: fixed;
	top: 0;
	width: 100%;
	z-index: 101;

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
	.navbar-center,
	.navbar-right,
	.user {
		display: none;
	}

	.navbar-brand {
		width: fit-content;
		padding: 0.5rem 1rem;
	}
	.navbar-toggler {
		color: white;

		display: inline-block;
		padding: 0.9rem 1.3rem;

		position: absolute;
		top: 0;
		right: 0;

		cursor: pointer;
	}

	.navbar.expanded {
		grid-template-columns: 8fr;
		width: 100vw;
		z-index: 101;
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

.user {
	display: flex;
	align-items: center;

	gap: 0.3rem;
	& .image-wrapper {
		width: 1.5rem;
		height: 1.5rem;
		position: relative;
		border-radius: 50%;
		overflow: hidden;
	}
	& img {
		scale: 1;
		animation: blip-in 100ms forwards;
	}

	& svg {
		display: none;
	}
}

.login {
	cursor: pointer;
}

.settings .user:hover,
.settings .user:focus {
	img {
		animation: blip-out 200ms forwards;
		overflow: hidden;
	}

	svg {
		position: absolute;
		display: unset;
		top: 0;
		fill: white;
		height: 100%;
		width: 100%;
		scale: 0.9;
		animation: rotate-in 300ms ease-out forwards;
	}
}

@keyframes rotate-in {
	0% {
		scale: -0.3;
		rotate: 0;
	}

	100% {
		scale: 0.9;
		rotate: 420deg;
	}
}

@keyframes blip-out {
	from {
		opacity: 1;
		scale: 1;
	}
	to {
		opacity: 0;
		scale: 0;
	}
}

@keyframes blip-in {
	from {
		opacity: 0;
		scale: 0;
	}
	to {
		opacity: 1;
		scale: 1;
	}
}
</style>

<style lang="less">
@media screen and (max-width: 842px) {
	body:has(.navbar.expanded) {
		overflow: hidden;
	}

	body:has(.navbar.expanded) main::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 100;
	}
}
</style>
