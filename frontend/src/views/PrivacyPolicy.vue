<template>
	<div v-if="content" class="content" v-html="content"></div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
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
.content-tile p {
	padding-top: 0.75rem;
}
</style>
