<template>
	<div class="content-container">
		<div class="content"> <StatblockEditor /> </div>
		<div class="content"> <StatblockRenderer :data='{"key": 5}'/></div>
	</div>
</template>

<script lang="ts">
import {RouterLink, RouterView} from "vue-router";
import { defineComponent } from "vue";
import StatblockRenderer from "../widgets/StatblockRenderer.vue";
import StatblockEditor from "../widgets/StatblockEditor.vue";
export default defineComponent({
	components: {
		StatblockRenderer,
		StatblockEditor
	}
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
