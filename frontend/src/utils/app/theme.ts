import { useLocalStorage } from "@vueuse/core";
import { computed, watch } from "vue";
import { useTheme } from "vuetify";
import { store } from "../store";

export const useThemePersistence = () => {
	const theme = useTheme();
	const savedTheme = useLocalStorage("app-theme", theme.global.name.value);

	const isAllowedCustomTheme = store.user?.supporter !== "none" || ["303857638171607040", "307900989455859723"].includes(store.user.id);

	// sanitize on load
	if (savedTheme.value === "custom" && !isAllowedCustomTheme) {
		savedTheme.value = "dark";
	}

	// keep localStorage in sync whenever theme changes, but block disallowed values
	watch(theme.global.name, (newName) => {
		if (savedTheme.value === "custom" && !isAllowedCustomTheme) {
			theme.global.name.value = "dark";
			return;
		}
		savedTheme.value = newName;
	});

	const monacoTheme = computed(() => {
		if (theme.global.name.value === "dark")
			return "vs-dark";
		if (theme.global.name.value === "light")
			return "vs-light";
		if (theme.global.name.value === "custom" && isAllowedCustomTheme) {
			const isDarkTheme = relativeLuminance(
				// @ts-expect-error This is fine
				JSON.parse((localStorage.getItem("app-theme-custom-colors") ?? { surface: "#000000" })).surface
			) < 0.5;
			if (isDarkTheme)
				return "vs-dark";
			return "vs-light";
		}
		return "vs-dark";
	});

	const themeOptions = computed(() => [
		{ title: "Light", value: "light" },
		{ title: "Dark", value: "dark" },
		{
			title: isAllowedCustomTheme ? "Custom" : "Custom (supporters only)",
			value: "custom",
			props: { disabled: !isAllowedCustomTheme }
		},
	]);

	return { savedTheme, isAllowedCustomTheme, themeOptions, monacoTheme };
};

// for custom themes, automatically determine whether they should get vs-light or vs-dark themes.
const hexToRgb = (hex: string) => {
	const clean = hex.replace("#", "");
	const full = clean.length === 3
		? clean.split("").map(c => c + c).join("")
		: clean;
	const bigint = Number.parseInt(full, 16);
	return {
		r: (bigint >> 16) & 255,
		g: (bigint >> 8) & 255,
		b: bigint & 255
	};
};

const relativeLuminance = (hex: string) => {
	const { r, g, b } = hexToRgb(hex);
	const [rs, gs, bs] = [r, g, b].map((c) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};
