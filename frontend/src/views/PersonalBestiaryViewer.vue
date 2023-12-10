<template>
	This is a page to view a specific personal bestiary.
</template>

<script lang="ts">
import {RouterLink, RouterView} from "vue-router";
import { defineComponent } from "vue";
export default defineComponent({

})
</script>

<style scoped lang="less">
.content-container {
	display: grid;
	grid-template-columns: 1fr 1fr;
	height: 60rem;
	gap: 2rem;
}

.content {
	background-color: rgb(46, 44, 44);
	display: flex;

}
</style>
