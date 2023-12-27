<template>
	<div class="content terms">
		<h1><span>Terms and Conditions</span></h1>
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
.content {
	display: flex;
	flex-direction: column;
	justify-content: start;
	align-items: center;
	margin-bottom: 5rem;
}

@media screen and (min-width: 1080px) {
	.content div {
		min-width: 50rem;
		width: 50%;
	}
}
</style>

<style lang="less">
.terms.content {
	& h2 {
		text-align: center;
		margin-bottom: 1rem;
		margin-top: 1.5rem;
		font-size: 2rem;
		border-bottom: 1px solid orangered;
	}
}
</style>
