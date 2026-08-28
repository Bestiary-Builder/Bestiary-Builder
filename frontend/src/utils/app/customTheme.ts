// composables/useCustomThemeColors.ts
import { useTheme } from 'vuetify'
import { useLocalStorage } from '@vueuse/core'
import { watch } from 'vue'


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


    return { customColors, resetColor }
}