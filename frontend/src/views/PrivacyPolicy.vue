<template>
	<div class="content">
		<h1><span>privacy policy</span></h1>
		<div v-if="content" v-html="content"></div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
// @ts-ignore
import markdownit from "markdown-it";
const md = markdownit();
import dataFile from "@/assets/privacy-policy.md";
export default defineComponent({
	data() {
		return {
			content: md.render(dataFile)
		};
	}
});
</script>

<style scoped lang="less">
@import url("../assets/bestiary-list.less");
</style>
