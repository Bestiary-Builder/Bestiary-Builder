import { createGlowTour } from "@glowhop/vue-tour";
import { store } from "../store";
import { getUmami } from "./analytics";

const tour = createGlowTour();
export const useOnboardingTour = () => {
	const onboardingWorkflow = tour
		.create("welcome", {
			onStart() {
				void getUmami()?.track("Onboarding tour started");
				if (!document.querySelector(".v-navigation-drawer--left.v-navigation-drawer--active"))
					document.getElementById("toggle-drawer")?.click();
			},
			onFinish() {
				void getUmami()?.track("Onboarding tour finished");
				document.getElementById("changelog-nav")?.click();
			},
			onCancel() {
				void getUmami()?.track("Onboarding tour cancelled");
			}
		})
		.step({ id: "welcome-1", target: ".v-navigation-drawer--left.v-navigation-drawer--active", title: "Welcome to 3.0.0", content: "You can now find all pages in the collapsible navigation window on the left." })
		.step({ id: "welcome-2", target: `a[href="/bestiaries/personal"].v-list-item--nav`, title: "Open your bestiaries", content: "You can now find your bestiaries here." })
		.step({ id: "welcome-3", target: `a[href="/armory/personal"].v-list-item--nav`, title: "Open your Armories", content: "Update 3.0.0 introduced Automation Collections, a way to create and organize collections of automations. You can reuse these automations for your creatures, or create collections of automations for characters to use." })
		.step({ id: "welcome-4", target: `a[href="/armory/public"].v-list-item--nav`, title: "Explore Public Armories", content: "You can find collections of automations that other people made here, subscribe to them, and use their automations for your creatures and characters." })
		.step({ id: "welcome-5", target: `a[href="/characters"].v-list-item--nav`, title: "Edit Characters", content: "With 3.0.0, you can now edit your Avrae Characters directly on Bestiary Builder." })
		.step({ id: "welcome-6", target: `#v-list-group--id-recentlyViewed`, title: "Recently viewed pages", content: "You can find your recently visited pages here to speed up your workflow." })
		.step({ id: "welcome-7", target: `a[href="/changelog"].v-list-item--nav`, title: "Changelog", content: "You can find a complete list of changes in our changelog!" })
		.step({ id: "welcome-8", target: `#user-page`, title: "Your Account", content: store.user ? "Manage your user settings here. With 3.0.0, there are now several new preferences, including the ability to change the statblock theme and design." : "Login to your account here. " })
		.step({ id: "welcome-9", target: `a[href="https://discord.gg/a6bwXCSymN"]`, title: "Join our community", content: "Join our discord community here! Discuss with other users, get help with automations, and make suggestions and bug reports!" })
		.build();

	const startOnboardingWorkflow = () => {
		void tour.run(onboardingWorkflow);
	};

	const automationEditorWorkflow = tour
		.create("editor", {
			onStart() {
				void getUmami()?.track("Automation tour started");
			},
			onCancel() {
				document.getElementById("automation-workflow-end-data")?.click();
				void getUmami()?.track("Automation tour cancelled");
			},
			onFinish() {
				document.getElementById("automation-workflow-end-data")?.click();
				void getUmami()?.track("Automation tour finished");
			},
		})
		.step({ id: "editor-1", target: "#visual-editor-container", title: "Automation Editor", content: "This is the new automation editor. Continue the tour to have a walkthrough of its features. Note: it will temporarily change the data of your action. When the tour is finished or cancelled, your automation will automatically restore itself.", behavior: { disableAutoScroll: true }, })
		.beforeAdvance(() => {
			document.getElementById("automation-workflow-initialize-data")?.click();
		})
		.wait(20000)
		.step({ id: "editor-2", target: "#automation-tree", title: "This is the Automation Tree", content: "Automation is a Tree-Like structure, made up off of several Effects (or Nodes) that each do a thing, such as roll a dice, deal damage, or save a variable.", behavior: { disableAutoScroll: true } })
		.step({ id: "editor-3", target: "#add-effect", title: "Let's create a basic attack.", content: "Press the Add Effect button and choose: 'Attack and Damage'.", behavior: { disableAutoScroll: true, allowInteraction: true }, popover: { disableAdvanceButton: true }, })
		.onTargetEvent("click", async (event, context) => context.advance())
		.wait(1000)
		.beforeAdvance(async () => {
			const el = document.getElementById("effect-adder-list");
			if (el)
				el.scrollTop = el?.scrollHeight;
			setTimeout(() => window.scrollTo({
				top: 300,
				behavior: "instant"
			}), 500);
		})
		.wait(1000)
		.step({ id: "editor-4", target: "#effectAdderbasicAttack", title: "Choose Attack and Damage Option", content: "This Preset allows us to attack and deal damage.", behavior: { allowInteraction: true, disableAutoScroll: true }, popover: { disableAdvanceButton: true, placementTryOrder: ["right"] }, overlay: { opacity: 0.4 } })
		.onTargetEvent("click", async (event, context) => context.advance())
		.step({ id: "editor-6", target: "#automation-tree", title: "Great! You now have several Effects in your Tree", content: "Let's make some changes.", behavior: { disableAutoScroll: true } })
		.step({ id: "editor-7", target: "#attack1", content: "Press an item in the tree to modify it.", title: "Let's open the Attack Options", behavior: { allowInteraction: true }, popover: { disableAdvanceButton: true } })
		.onTargetEvent("click", async (event, context) => context.advance())
		.step({ id: "editor-8", target: "#effect-editor", content: "All the options for the current Effect will appear here.", title: "You can now edit the Effect Options Here" })
		.step({ id: "editor-9", target: ".code-field.v-field .monaco-editor", content: "Change it from 4 to `dexterityMod + proficiencyBonus`.", title: "Let's change the attack Bonus!", behavior: { allowInteraction: true }, overlay: { opacity: 0.4, padding: 50 }, popover: { placementTryOrder: ["top", "left", "right", "bottom"] } })
		.step({ id: "editor-10", target: "#effect-editor", content: "Did you see that? The editor automatically gives you hints for variables and cvars!", title: "Great! Let's go over some other features now." })
		.step({ id: "editor-11", target: "#showDocumentation", content: "You can see the documentation of every automation effect here. Let's now see some other features", title: "Show Documentation" })
		.step({ id: "editor-12", target: ".right-buttons", content: "Here are buttons for several different powerful features. Let's go over them.", title: "Additional Options" })
		.step({ id: "editor-13", target: ".right-buttons button:nth-of-type(1)", content: "Press the save button to save your changes. Tip: You can also press CTRL/CMD + S to save!", title: "Save Automation" })
		.step({ id: "editor-14", target: ".right-buttons button:nth-of-type(2)", content: "The magic generate button reads the description of the attack and then tries to generate automation for it. Works best for simple attacks!", title: "Magic Generate" })
		.step({ id: "editor-15", target: ".right-buttons button:nth-of-type(3)", content: "The change editor button allows you to edit your automation as YAML!", title: "Change Editor" })
		.step({ id: "editor-16", target: ".right-buttons button:nth-of-type(4)", content: "The database button allows you to load automation from the SRD, from your (subscribed) Automation Collections, and your Avrae Characters.", title: "Load Feature" })
		.step({ id: "editor-17", target: ".right-buttons button:nth-of-type(5)", content: "The Avrae button allows you to load this automation onto a character if you want to quickly test it!", title: "Avrae Character" })
		.step({ id: "editor-18", target: "#visual-editor-container", content: "Congratulations! You've finished the tour of the new editor, but there's still more to discover. Don't hesitate to join our Discord Server if you need help.", title: "Tour Finished" })
		.build();

	const startAutomationEditorWorkflow = () => {
		void tour.run(automationEditorWorkflow);
	};

	return {
		tour,
		startOnboardingWorkflow,
		startAutomationEditorWorkflow
	};
};
