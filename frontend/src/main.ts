// Style sheet
import "@/assets/styles/main.less";

// Vue
import { type Component, createApp, } from "vue";

// Floating vue
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";

// Font awesome
import "@/utils/app/fontawesome";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
// @ts-expect-error Shut the fuck up
import { Icon } from "@iconify/vue";
// Vue-select
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

// monaco editor
import { loader } from "@guolao/vue-monaco-editor";

import yaml from "yaml";
import router from "@/router";
import App from "@/App.vue";

export const app = createApp(App as Component<any>);
app.use(router);
app.use(FloatingVue);
app.component("font-awesome-icon", FontAwesomeIcon);
app.component("Icon", Icon);
app.component("v-select", vSelect);
loader.config({
	paths: {
		vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs"
	}
});

// Google analytics
if (import.meta.env.MODE === "production")
	import("./utils/app/gtag.js" as any);

// error handling
if (import.meta.env.MODE === "production")
	import("./utils/app/error");

// Finally, mount our app.
app.mount("body");
