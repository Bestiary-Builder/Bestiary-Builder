import { createVuetify } from "vuetify";
import { createRulesPlugin } from "vuetify/labs/rules";

import AvraeLogo from "@/assets/svg/Avrae_Logo.svg";
import BestiaryBuilderLogo from "@/assets/svg/logo.svg";
// import "@mdi/font/css/materialdesignicons.css";
import iconifyAdapter from "./utils/app/icon";
import "vuetify/styles";


const savedTheme = localStorage.getItem('app-theme')
export const vuetify = createVuetify({
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
			},
		},
		VCheckbox: {
			color: "primary"
		},
		VNumberInput: {
			controlVariant: "stacked"
		},
		VAutocomplete: {
			variant: "solo-filled"
		},

	},
	theme: {
		defaultTheme: savedTheme ? savedTheme : 'dark',
		transition: true,
		themes: {
			dark: {
				dark: true,
				colors: {
					"primary": "#ff4500",
					"surface-bright": "#8b8b8b"
				},
			},
			light: {
				dark: false,
				colors: {
					"primary": "#ff4500",
					"surface": "#d5dbd6",
					"surface-bright": "#707070"
				},
			}
		}
	},
	icons: {
		defaultSet: "iconify",
		sets: {
			iconify: iconifyAdapter,
		},
		aliases: {
			bestiaryBuilder: BestiaryBuilderLogo,
			avrae: AvraeLogo
		}
	},
});

export const vuetifyRulesPlugin = createRulesPlugin({
	aliases: {
		imageLink: (err) => {
			return v => (/^https?:\/\/.+\.(?:png|jpe?g|webp|gif|apng)(?:\?.*)?$/i.test(v)) || err || "Enter a valid image URL https and one of (.png, .jpg, .jpeg, .webp, .gif, or .apng)";
		},
	}
}, vuetify.locale);
