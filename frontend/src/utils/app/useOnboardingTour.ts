import { createGlowTour } from "@glowhop/vue-tour";
import { store } from "../store";

const tour = createGlowTour();
export const useOnboardingTour = () => {
    const onboardingWorkflow = tour
        .create("welcome", {
            onStart() {
                if (!document.querySelector(".v-navigation-drawer--left.v-navigation-drawer--active"))
                    document.getElementById("toggle-drawer")?.click()
            },
            onFinish() {
                document.getElementById("changelog-nav")?.click()
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
    }

    const automationEditorWorkflow = tour
        .create("editor", {
            onCancel() {
                document.getElementById("automation-workflow-end-data")?.click()
            },
            onFinish() {
                document.getElementById("automation-workflow-end-data")?.click()
            }
        })
        .step({ id: "editor-1", target: "#visual-editor-container", title: "Automation Editor", content: "This is the new automation editor. Continue the tour to have a walkthrough of its features. Note: it will temporarily change the data of your action. When the tour is finished or cancelled, your automation will automatically restore itself.", behavior: { disableAutoScroll: true }, })
        .beforeAdvance(() => {
            document.getElementById("automation-workflow-initialize-data")?.click()
        })
        .wait(20000)
        .step({ id: "editor-2", target: "#automation-tree", title: "This is the Automation Tree", content: "Automation is a Tree-Like structure, made up off of several Effects (or Nodes) that each do a thing, such as roll a dice, deal damage, or save a variable.", behavior: { disableAutoScroll: true } })
        .step({ id: "editor-3", target: "#add-effect", title: "Let's create a basic attack.", content: "Press the Add Effect button and choose: 'Attack and Damage'.", behavior: { disableAutoScroll: true, allowInteraction: true }, popover: { disableAdvanceButton: true }, })
        .onTargetEvent("click", (event, context) => context.advance())
        .wait(1000)
        .beforeAdvance(async () => {
            const el = document.getElementById("effect-adder-list");
            if (el) el.scrollTop = el?.scrollHeight
        })
        .wait(1000)
        .step({ id: "editor-4", target: "#effectAdderbasicAttack", title: "Choose Attack and Damage Option", content: "This Preset allows us to attack and deal damage.", behavior: { allowInteraction: true, disableAutoScroll: true }, popover: { disableAdvanceButton: true, placementTryOrder: ["right"] }, overlay: { opacity: 0.4 } })
        .onTargetEvent("click", (event, context) => context.advance())
        .step({ id: "editor-6", target: "#automation-tree", title: "Great! You now have several Effects in your Tree", content: "Let's make some changes.", behavior: { disableAutoScroll: true } })
        .step({ id: "editor-7", target: "#attack1", content: "Press an item in the tree to modify it.", title: "Let's open the Attack Options", behavior: { allowInteraction: true }, popover: { disableAdvanceButton: true } })
        .onTargetEvent("click", (event, context) => context.advance())
        .step({ id: "editor-8", target: "#effect-editor", content: "", title: "You can now edit the Effect Options Here" })
        .step({ id: "editor-9", target: ".code-field.v-field", content: "Change it from 4 to 6.", title: "Let's change the attack Bonus!", behavior: { allowInteraction: true } })
        .step({ id: "editor-10", target: "#effect-editor", content: "", title: "Great! Let's go over some other features now." })
        .step({ id: "editor-11", target: "#showDocumentation", content: "You can see the documentation of every automation effect here.", title: "Show Documentation", popover: { disableAdvanceButton: true }, behavior: { allowInteraction: true } })
        .onTargetEvent("click", (event, context) => context.advance())
        .wait(200)
        .step({ id: "editor-12", target: "#exposedVariables", content: "From here we learn that the Attack Effect exposes a lastAttackDidCrit variable if the attack critted. Let's use this in our attack! ", title: "Exposed Variables", behavior: { scroll: { behavior: "auto" }, disableAutoScroll: false } })
        .beforeAdvance(() => {
            console.log("this is happening!")
            document.getElementById("#exposedVariables").scrollIntoView()
            return true;
        }).wait(2000)
        .build()

    const startAutomationEditorWorkflow = () => {
        void tour.run(automationEditorWorkflow)
    }

    return {
        tour, startOnboardingWorkflow, startAutomationEditorWorkflow
    }
}