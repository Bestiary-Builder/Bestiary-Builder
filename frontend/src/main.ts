import type { Component } from "vue";
import DropdownMenu from "./components/Global/DropdownMenu.vue";
import Breadcrumbs from "./components/Page/Breadcrumbs.vue";
// monaco editor
import { loader } from "@guolao/vue-monaco-editor";
// Vue
import { createApp } from "vue";



import App from "@/App.vue";

import router from "@/router";

// Style sheet
import "@/assets/styles/main.less";
// Analytics
import "./utils/app/analytics";
import { vuetify, vuetifyRulesPlugin } from "./vuetify.config";


export const app = createApp(App as Component<any>);

app.use(router);
app.use(vuetify);
app.use(vuetifyRulesPlugin);
app.component("DropdownMenu", DropdownMenu)
app.component("Breadcrumbs", Breadcrumbs)
loader.config({
	paths: {
		vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.54.0/min/vs"
	}
});

// error handling
if (import.meta.env.MODE === "production")
	import("./utils/app/error").then().catch(() => { });

// Finally, mount our app.
app.mount("body");
