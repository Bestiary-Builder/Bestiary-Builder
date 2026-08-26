import { useLocalStorage } from "@vueuse/core"
import { watch } from "vue"
import { useTheme } from "vuetify"

export const useThemePersistence = () => {
    const theme = useTheme()
    const savedTheme = useLocalStorage('app-theme', theme.global.name.value)

    // keep localStorage in sync whenever theme changes
    watch(theme.global.name, (newName) => {
        savedTheme.value = newName
    })

    return { savedTheme }
}