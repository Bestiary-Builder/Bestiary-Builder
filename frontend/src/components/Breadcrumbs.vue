<template>
<section class="breadcrumbs__container">
    <div class="breadcrumbs__links">
        <template v-for="route, index in routes">
            <RouterLink v-if="!route.isCurrent" :to="route.path"> {{ route.text }} </RouterLink>
            <span v-else class="current-page"> {{ route.text  }}</span>
            <span v-if="index+1 != routes.length" class="seperator">></span>
        </template>
    </div>

    <div class="right-buttons">
        <slot name="right-button"></slot>
        <button :disabled="!isSupported" @click="startShare">
        {{ isSupported ? 'Share' : 'Web share is not supported in your browser' }}
        </button>
    </div>
</section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue'
import { isClient } from '@vueuse/shared'
import { useShare } from '@vueuse/core'

type links = {
    path: string;
    text: string;
    isCurrent: boolean;
}[]
export default defineComponent({
    setup() {
        const options = ref({
            title: 'Bestiary Builder',
            text: 'Check my creation out on Bestiary Builder!',
            url: isClient ? location.href : '',
        })

        const { share, isSupported } = useShare(options)

        function startShare() {
            return share().catch(err => err)
        }
        return {
            isSupported,
            startShare
        }
    },
    props: {
        routes: {
            type: Array as ()=>links,
            required: true
        }
    },
})
</script>

<style scoped lang="less">
.breadcrumbs__container {
    background-color: #3b3736;
    padding: .7rem 6vw;
	box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;

    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    .right-buttons {
        display: flex;
        gap: 1rem
    }
}

.breadcrumbs__links {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: .7rem;
    font-size: 1.3rem;

    & .current-page {
        font-weight: bold;
    }
}
</style>