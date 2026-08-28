// composables/useCustomThemeColors.ts
import { useTheme } from 'vuetify'
import { useLocalStorage } from '@vueuse/core'
import { computed, watch } from 'vue'
import { useThemePersistence } from './theme'


const defaultColors: Record<string, string> = {
    "primary": "#FF46A2",
    'background': '#121212',
    'surface': '#212121',
    "surface-bright": "#8b8b8b",
    "surface-light": "#424242"
}
export const useCustomThemeColors = () => {
    const theme = useTheme()
    const customColors: Record<string, string> = theme.themes.value.custom.colors as Record<string, string>

    const savedColors = useLocalStorage<Record<string, string>>('app-theme-custom-colors', { ...customColors })

    // restore on load
    Object.assign(customColors, savedColors.value)

    // persist on every change
    watch(customColors, (newColors) => {
        savedColors.value = { ...newColors }
    }, { deep: true })

    const resetColor = (key: string) => {
        customColors[key] = defaultColors[key]
    }

    const resetAll = () => {
        Object.assign(customColors, defaultColors)
    }

    return { customColors, resetColor, resetAll }
}

const defaultStatblockColors: Record<string, string> = {
    '--background': '#f5f3ee',
    '--primary': '#5b160c',
    '--subtle': '#8b8b8b',
    '--text-color': '#000000',
    '--table-1': '#ded4cc',
    '--table-2': '#ede6d9',
    '--table-3': '#d0caca',
    '--table-4': '#d8dad1',
    '--box-shadow': '#f3f5f9',
    '--border': '#d4d0ce',
    '--outline': '#afa47a',
}

export const useStatblockColors = () => {
    const { isAllowedCustomTheme } = useThemePersistence()

    const statblockColors = useLocalStorage<Record<string, string>>(
        'statblock-custom-colors',
        { ...defaultStatblockColors }
    )

    const statblockDesignOptions = computed(() => [
        { title: "Bestiary Builder (Default)", value: "BestiaryBuilder" },
        { title: "Beyond", value: "Beyond" },
        { title: "Odyssey", value: "Odyssey" },
        { title: "Monster Manual (Compact)", value: "MonsterManual" },
        {
            title: isAllowedCustomTheme ? 'Custom' : 'Custom (supporters only)',
            value: 'Custom',
            props: { disabled: !isAllowedCustomTheme }
        },
    ]);


    const resetColor = (key: string) => {
        statblockColors.value[key] = defaultStatblockColors[key]
    }

    const resetAll = () => {
        statblockColors.value = { ...defaultStatblockColors }
    }

    return { statblockColors, resetColor, resetAll, statblockDesignOptions }
}
