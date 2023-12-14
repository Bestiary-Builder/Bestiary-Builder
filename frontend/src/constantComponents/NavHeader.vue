<template>
<input id="navbar-indicator" class="navbar-collapse" type="checkbox" checked>
<nav class="navbar">
	<div class="navbar-left">
		<a class="navbar-brand" href="#">
			B E S T I A R Y  B U I L D E R
		</a>
		<RouterLink v-for="route in $router.options.routes.filter((a: any) => a.navbar)" :to="route.path" class="nav-link">
			<div class="header-item"> {{   route.name  }}</div>
		</RouterLink>
	</div>

	<div class="navbar-center">
		<!-- <RouterLink v-for="route in $router.options.routes.filter((a: any) => a.navbar)" :to="route.path" class="nav-link">
			<div class="header-item"> {{   route.name  }}</div>
		</RouterLink> -->
	</div>

	<div class="navbar-right">
		<a class="user" v-if="user" href="/user">
			<span>@{{ user.username }}</span>
			<img alt="avatar" :src="'https://cdn.discordapp.com/avatars/' + user._id + '/' + user.avatar + '.png'" />
		</a>
		<div v-else class="user"> Login </div>
	</div>

	<label class="navbar-toggler" for="navbar-indicator">
	+
	</label>
</nav>
</template>
<script lang="ts">
import {RouterLink, RouterView} from "vue-router";
import UserBanner from "@/components/UserBanner.vue";
import {user} from "@/main";
import type {User} from "@/components/types";
import {defineComponent} from "vue";
import { handleApiResponse } from "@/main";
export default defineComponent({
	name: "NavHeader",
	components: {
		UserBanner
	},
	data: () => ({key: 0} as {user: User | null; key: number}),
	async mounted() {
		this.user = (await fetch("/api/user").then(async (response: any) => {
			if (response.status == 200) return await response.json();
			else return null;
		})) as User;
		console.log(this.user);
		this.$forceUpdate();
	},
	methods: {
		LoginClick() {
			window.location.href = "https://discord.com/oauth2/authorize?client_id=1183362236509601813&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Flogin&scope=identify+email";
		}
	},
});
</script>
<style scoped lang="less">
.user {
	display: flex;
	align-items: center;
	padding: 1rem;
	gap: .3rem;
	& img {
		height: 1.5rem;
		border-radius: 50rem;
		scale: 1.1
	}
}
.user img {
	border-radius: 50rem;
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
   display: inline-block;
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

   display: inline-block;
   padding: 1rem;

}

.navbar-brand {
   font-weight: bold;

   padding-left: 2rem;
   padding-right: 2rem;

   background: orangered;
   
}
.nav-link {
	min-width: 10vw;
	text-align: center;
	border-left: 1px solid orangered;
		
	text-transform: lowercase;
	
}
.nav-link:last-of-type {
	border-right: 1px solid orangered
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

   .navbar .nav-link {
      display: block;
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