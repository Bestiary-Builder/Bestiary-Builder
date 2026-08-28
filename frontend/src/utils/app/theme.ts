import { useLocalStorage } from "@vueuse/core"
import { watch } from "vue"
import { useTheme } from "vuetify"
import { store } from "../store"
export const useThemePersistence = () => {
    const theme = useTheme()
    const savedTheme = useLocalStorage('app-theme', theme.global.name.value)

    const isAllowedCustomTheme = store.user?.supporter !== 'none' || ['303857638171607040', '307900989455859723'].includes(store.user.id)

    // sanitize on load
    if (savedTheme.value === 'custom' && !isAllowedCustomTheme) {
        savedTheme.value = 'dark'
    }

    // keep localStorage in sync whenever theme changes, but block disallowed values
    watch(theme.global.name, (newName) => {
        if (savedTheme.value === 'custom' && !isAllowedCustomTheme) {
            theme.global.name.value = 'dark'
            return
        }
        savedTheme.value = newName
    })

    return { savedTheme, isAllowedCustomTheme }
}