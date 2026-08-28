<script setup lang="ts">
import { useCustomThemeColors } from '@/utils/app/customTheme'
import { useThemePersistence } from '@/utils/app/theme'
import { computed } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const { isAllowedCustomTheme } = useThemePersistence()
const themeOptions = computed(() => [
    { title: 'Light', value: 'light' },
    { title: 'Dark', value: 'dark' },
    {
        title: isAllowedCustomTheme ? 'Custom' : 'Custom (supporters only)',
        value: 'custom',
        props: { disabled: !isAllowedCustomTheme }
    },
])
const { customColors, resetColor } = useCustomThemeColors()

</script>

<template>
    <Breadcrumbs :routes="[
        {
            path: '../user',
            text: 'User',
            isCurrent: false
        },
        {
            path: '',
            text: 'Theme',
            isCurrent: true
        }
    ]" />

    <div class="content">

        <v-row>
            <v-col cols="12" v-if="!isAllowedCustomTheme">
                <v-alert icon="$bestiaryBuilder" icon-size="48">
                    This feature is only available to Patreon Supporters.<br>
                    Become a <a href="https://www.patreon.com/c/bestiarybuilder/membership" target="_blank"
                        style="color: rgb(var(--v-theme-primary))"> Patreon
                        Supporter</a> to gain special benefits and support the development of the site.
                </v-alert>
            </v-col>
            <v-divider v-if="!isAllowedCustomTheme" />

            <v-col cols="12">
                <v-select v-model="theme.global.name.value" :items="themeOptions" label="Theme" item-props="props"
                    max-width="400" hide-details />
            </v-col>
            <v-divider />
            <v-col cols="12">
                <v-row>
                    <v-col v-for="(color, key) in customColors" :key="key" cols="6">
                        <v-color-input mode="hex" v-model="customColors[key]" :label="key" hide-actions color-pip
                            :disabled="!isAllowedCustomTheme">
                            <template #append>
                                <v-icon-btn @click="resetColor(key)" icon="mdi:restore" color="primary" />
                            </template>
                        </v-color-input>
                    </v-col>
                </v-row>
            </v-col>
            <v-divider />

            <v-col cols="12">
                <p>
                    Primary is used as the main colour for icons, accents, and important pieces of content.
                </p>
                <p>
                    Background is the background colour of the page.
                </p>
                <p>
                    Surface is the main colour of sections of the page.
                </p>
                <p>
                    Surface-bright is used as a contrasting colour on some surface elements.
                </p>
                <p>
                    Surface-light is a variant colour for some site sections.
                </p>
            </v-col>
        </v-row>
    </div>
</template>

<style lang="less" scoped>
@media screen and (width >=1200px) {
    .content {
        padding-left: 10vw;
        padding-right: 10vw;
    }
}
</style>
