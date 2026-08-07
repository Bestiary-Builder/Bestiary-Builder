
import "vuetify/styles";
// import "@mdi/font/css/materialdesignicons.css";
import iconifyAdapter from './utils/app/icon';
import BestiaryBuilderLogo from "@/assets/svg/logo.svg"

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { createRulesPlugin } from "vuetify/labs/rules";

export const vuetify = createVuetify({
    components,
    directives,
    defaults: {
        VTextField: {
            autocomplete: "off",
            variant: "solo-filled"
        },
        VTextarea: {
            variant: "solo-filled",
            autocomplete: "off"
        },
        VSelect: {
            variant: "solo-filled"
        },
        VBtn: {
            variant: "tonal"
        },
        VIconBtn: {
            variant: "text",
            color: "primary"
        },
        VCardActions: {
            VBtn: {
                variant: "tonal"
            }
        },
        VTabsWindowItem: {
            VTextField: {
                variant: "outlined"
            },
            VSelect: {
                variant: "outlined"
            },
            VCombobox: {
                variant: "outlined"
            },
            VNumberInput: {
                variant: "outlined"
            }
        },
        VCheckbox: {
            color: "primary"
        },
        VNumberInput: {
            controlVariant: "stacked"
        },
        VAutocomplete: {
            variant: "solo-filled"
        }
    },
    theme: {
        defaultTheme: "dark",
        themes: {
            dark: {
                dark: true,
                colors: {
                    "primary": "#ff4500",
                    "surface-1": "#3b3736"
                },
            },
        }
    },
    icons: {
        defaultSet: 'iconify',
        sets: {
            iconify: iconifyAdapter,
        },
        aliases: {
            "bestiaryBuilder": BestiaryBuilderLogo
        }
    },
});

export const vuetifyRulesPlugin = createRulesPlugin({
    aliases: {
        imageLink: err => {
            return v => (/^https?:\/\/.+\.(?:png|jpe?g|webp|gif|apng)(?:\?.*)?$/i.test(v)) || err || "Enter a valid image URL https and one of (.png, .jpg, .jpeg, .webp, .gif, or .apng)"
        },
    }
}, vuetify.locale)