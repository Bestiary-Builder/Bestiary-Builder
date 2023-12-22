<template>
	<div class="content">
		<h1><span>terms and conditions</span></h1>
		<div v-if="content" v-html="content"></div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import markdownit from "markdown-it";
const md = markdownit();
import dataFile from "@/assets/terms-and-conditions.md";
export default defineComponent({
	data() {
		return {
			content: md.render(dataFile)
		};
	}
});
</script>

<style scoped lang="less">
.content-tile p {
	padding-top: 0.75rem;
}
</style>
