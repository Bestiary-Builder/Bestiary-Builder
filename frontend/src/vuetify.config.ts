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
		VCheckbox: {
			color: "primary"
		},
		VNumberInput: {
			controlVariant: "stacked",
			variant: "solo-filled"
		},
		VAutocomplete: {
			variant: "solo-filled"
		},
		VCombobox: {
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
			},
			custom: {
				dark: true,
				colors: {
					"primary": "#FF46A2",
					'background': '#121212',
					'surface': '#212121',
					"surface-bright": "#8b8b8b",
					"surface-light": "#424242"
				},
			},
		}
	},
	icons: {
		defaultSet: "iconify",
		sets: {
			iconify: iconifyAdapter,
		},
		aliases: {
			bestiaryBuilder: BestiaryBuilderLogo,
			avrae: AvraeLogo,
			automation: "mdi:sword-cross",
			automationCollection: "material-symbols:automation",
			bestiary: "mdi:book-open-page-variant",
			creature: "mdi:paw",
			character: "mdi:account",
			drag: "material-symbols:drag-indicator"
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
