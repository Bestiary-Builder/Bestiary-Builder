<template>
<font-awesome-icon :icon="['fas', 'earth-europe']" v-if="icon == 'public'"/>
<font-awesome-icon :icon="['fas', 'link']" v-if="icon == 'unlisted'"/>
<font-awesome-icon :icon="['fas', 'lock']" v-if="icon == 'private'"/>
</template>
<script lang="ts">
import type { Bestiary } from '@/generic/types';

export default {
    props: {
        icon: {
            type: String as ()=>Bestiary['status'],
            required: true
        }
    }
}
</script>

<style scoped>
svg {
    color: orangered;
    translate: 0 3px;
}

</style>