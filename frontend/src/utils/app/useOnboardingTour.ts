import { createGlowTour } from "@glowhop/vue-tour";
import { store } from "../store";

const tour = createGlowTour();
export const useOnboardingTour = () => {

    const workflow = tour
        .create("welcome")
        .step({ id: "welcome-1", target: ".v-navigation-drawer--left", title: "Welcome to 3.0.0", content: "The different pages are now here on the left." })
        .step({ id: "welcome-2", target: `a[href="/bestiaries/personal"]`, title: "Open your bestiaries", content: "You can now find your bestiaries here." })
        .step({ id: "welcome-3", target: `a[href="/armory/personal"]`, title: "Open your Armories", content: "Update 3.0.0 introduced Automation Collections, a way to create and organize collections of automations." })
        .step({ id: "welcome-4", target: `a[href="/armory/public"]`, title: "Explore Public Armories", content: "You can find collections of automations that other people made here, subscribe to them, and use their automations for your creatures and characters." })
        .step({ id: "welcome-5", target: `a[href="/characters"]`, title: "Edit Characters", content: "With 3.0.0, you can now edit your Avrae Characters directly on Bestiary Builder." })
        .step({ id: "welcome-6", target: `#v-list-group--id-recentlyViewed`, title: "Recently viewed pages", content: "You can find your recently visited pages here to speed up your workflow." })
        .step({ id: "welcome-7", target: `#user-page`, title: "Your Account", content: store.user ? "Manage your user settings here. With 3.0.0, there are now several new preferences." : "Login to your account here. " })
        .step({ id: "welcome-8", target: `a[href="https://discord.gg/a6bwXCSymN"]`, title: "Join our community", content: "Join our discord community here!" })

        .build();

    function start() {
        void tour.run(workflow);
    }

    return {
        tour, start
    }
}