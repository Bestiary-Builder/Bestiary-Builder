import type { Component } from "vue";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// monaco editor
import { loader } from "@guolao/vue-monaco-editor";
// Vue
import { createApp } from "vue";

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import { createRulesPlugin } from "vuetify/labs/rules";

// Vue-select
import App from "@/App.vue";

import router from "@/router";

// Style sheet
import "@/assets/styles/main.less";
import "floating-vue/dist/style.css";
// Font awesome
import "@/utils/app/fontawesome";
// Analytics
import "./utils/app/analytics";

import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import iconifyAdapter from './utils/app/icon';



// Components
const vuetify = createVuetify({
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
	},
});

export const app = createApp(App as Component<any>);

app.use(router);
app.use(vuetify);
// app.use(FloatingVue);
app.use(createRulesPlugin({}, vuetify.locale));
app.component("font-awesome-icon", FontAwesomeIcon);
loader.config({
	paths: {
		vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs"
	}
});

// error handling
if (import.meta.env.MODE === "production")
	import("./utils/app/error").then().catch(() => { });

// Finally, mount our app.
app.mount("body");
