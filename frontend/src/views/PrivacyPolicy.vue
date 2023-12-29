<template>
<Breadcrumbs :routes="[
{
	path: '',
	text: 'Privacy Policy',
	isCurrent: true
}
]" :isLessWide="true"/> 
	<div class="content privacy">
		<div v-if="content" v-html="content"></div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
// @ts-ignore
import markdownit from "markdown-it";
const md = markdownit();
import dataFile from "@/assets/privacy-policy.md";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
export default defineComponent({
	data() {
		return {
			content: md.render(dataFile)
		};
	},
	components: {
		Breadcrumbs
	}
});
</script>

<style scoped lang="less">
.content {
	display: flex;
	flex-direction: column;
	justify-content: start;
	align-items: center;
	padding-bottom: 5rem;
}

@media screen and (min-width: 1080px) {
	.content div {
		min-width: 50rem;
		width: 50%;
	}
}
</style>

<style lang="less">
.privacy.content {
	& h2 {
		text-align: center;
		margin-bottom: 1rem;
		margin-top: 1.5rem;
		font-size: 2rem;
		border-bottom: 1px solid orangered;
	}
}
</style>
