import type { Component } from "vue";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// monaco editor
import { loader } from "@guolao/vue-monaco-editor";
// Floating vue
import FloatingVue from "floating-vue";
// Vue
import { createApp } from "vue";

// Vue-select
import vSelect from "vue-select";
import App from "@/App.vue";
import router from "@/router";
// Style sheet
import "@/assets/styles/main.less";

import "floating-vue/dist/style.css";

// Font awesome
import "@/utils/app/fontawesome";

import "vue-select/dist/vue-select.css";
// Analytics
import "./utils/app/analytics";

export const app = createApp(App as Component<any>);

app.use(router);
app.use(FloatingVue);
app.component("font-awesome-icon", FontAwesomeIcon);
app.component("v-select", vSelect);
loader.config({
	paths: {
		vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs"
	}
});

// error handling
if (import.meta.env.MODE === "production")
	import("./utils/app/error").then().catch(() => {});

// Finally, mount our app.
app.mount("body");
