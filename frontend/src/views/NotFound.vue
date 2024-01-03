<template>
<Breadcrumbs :routes="[
{
	path: '..',
	text: 'Home',
	isCurrent: false
},
{
	path: '',
	text: '404',
	isCurrent: true
},
]" :isLessWide="true"/> 
<div class="content">
	<p> Error 404 - page not found. </p>
</div>
</template>
<script lang="ts">
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import {defineComponent} from "vue";

export default defineComponent({
    components: { Breadcrumbs }
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
