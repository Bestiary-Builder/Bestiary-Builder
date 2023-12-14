<template>
<input id="navbar-indicator" class="navbar-collapse" type="checkbox" checked>
<nav class="navbar">


	<div class="navbar-left">
		<RouterLink v-for="route in $router.options.routes.filter((a: any) => a.navbar)" :to="route.path" class="nav-link">
			<div class="header-item"> {{   route.name  }}</div>
		</RouterLink>
	</div>

	<div class="navbar-center">
		<a class="navbar-brand" href="#">
			B E S T I A R Y  B U I L D ER
		</a>
	</div>

	<div class="navbar-right">
		<a class="nav-link" href="#">Github</a>
		<a class="nav-link" href="#">Twitter</a>
		<a class="nav-link" href="#">Facebook</a>
	</div>

	<label class="navbar-toggler" for="navbar-indicator">
	+
	</label>
</nav>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import {RouterLink, RouterView} from "vue-router";
export default defineComponent({
	name: "NavHeader"
})
</script>
<style scoped lang="less">
.navbar {
   position: relative;

   background: rgb(26, 25, 25);

   display: flex;
   flex: 1;
   justify-content: center;
}

.navbar-left {
   display: inline-block;
}

.navbar-right {
   display: inline-block;
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
