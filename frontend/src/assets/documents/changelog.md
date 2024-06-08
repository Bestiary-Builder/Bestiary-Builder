## v2.3.0
_June 8th, 2024_

- You can now have innate spellcasting spells of any daily amount, not just 1-3.
- You can now set custom descriptions of the spellcasting features, for when you just need a little more finegrained control.
- Fixed an issue where the spell list of warlock would not display properly.
- Fixed an issue where the + symbol would not display for positive innate spellcasting modifiers.
- Fixed an issue where the update from automation/description buttons for the feature editor would not display.
- Slightly changed Statblock Editor styles to look a bit nicer.

---
## v2.2.3
_June 7th, 2024_

- Fixed an issue where full-casters would not receive a 6th level spellslot at 11th level, which has been an unnoticed bug since launch!

---
## v2.2.2
_June 6th, 2024_

- Fixed an issue where on Firefox, editing the statblock would show a paste button every two seconds and stop you from typing.

---
## v2.2.1
_May 31st, 2024_

- Added the ability to paste a Bestiary Builder statblock directly into the current statblock if it was exported using the export button.
  - This means you no longer need to open a menu and paste the json directly. Simply press export on one page, and press paste on the other.
- Fixed an issue where Animal Handling and Sleight of Hand skills would not show on the statblock since v2.0.0.
- Fixed an issue where the feature editor could freeze and break when incomplete data is used.

---
## v2.2.0
_May 29th, 2024_

- Added the ability to choose between creature from scratch or from an SRD Creature when creating a new creature.
- Added support for having alignment not set on a creature.
- Fixed three 5e.tools importer edge cases.

---
## v2.1.0
_May 25th, 2024_

- Added the ability to export a statblock to an image
- Restored the ability to see other's unlisted creatures if provided with the link
- Fixed that statblocks would sometimes render with an extra orange line.
- Dragging senses/speed/features to reorder them is disabled temporarily as the package upstream (ie: not made by us) seems to have broken. It will be restored when a fix is found.

---
## v2.0.1
_May 23rd, 2024_

- Improved error messages for importing multiple creatures at once.
- Fixed some blocked words bugs.

---
## v2.0.0
_May 19th, 2024_

---
This update brings immense changes to the code that powers Bestiary Builder behind the scenes. Immense effort has been made to make the code able to be maintained long term, and every file and page has received changes.

Few of these changes will affect you (beyond increased performance and the accidental bug fix), but we are sure these changes will make it much easier to work on new features in the future.

---
If you appreciate our effort made, consider supporting us on [Patreon](https://www.patreon.com/BestiaryBuilder). These changes have taken two weeks of continued work, so all support is loved!

---
Here follows a list of the technical changes made:

- Added Initiative as a valid skill to set in the statblock editor.
- All explicit event listeners are destroyed upon the component being unmounted.
- Improved types, removing most mentions of the `any` or `unknown` type unless they are valid.
- Added a `useFetch` wrapper which cleans up the code regarding fetching information from the backend.
- Moved page routes to our shared folder so they are no longer duplicated between frontend and backend, which could cause bugs.
- Improved code flow around saving automation.
- Made a generic BestiaryList component for bookmarks, my bestiaries, and public bestiaries.
- Deduplicated functions related to rendering the statblock, content parsers, and avrae export by moving them to a shared folder.
- Refactored the statblock renderer component to not duplicate logic.
- Moved static lists of options in the statblock editor component to a constants file.
- Improved how things are imported from our shared folder.
- Removed some old code from the automation editor which is unnecessary since the new Monaco editor.
- Moved the avrae export into its own file.
- Improved code flow around logging in.
- Removed unused fonts from being imported, decreasing page load times.
- Added a button to text-only pages to link to that specific section, so you can link to specific parts of the help, for example.
- Extracted some reused logic surrounding user state (among others) to a global store.
- Checking user upon a backend request now fetches the user from our database only once.
- Extracted database logic into their own file instead of one massive file.
- Added ESLint to lint code and make sure it follows one complete style.
- Removed unnecessary `@ts-ignore` and `@ts-expect-error`.
- Cleaned up the page footer.
- Converted almost all components and pages from Options API into Composition API, making it easier to update in the future.
- Make a generic Markdown component to render Markdown anywhere.
- Google Analytics is now only imported on the production site.
- Extracted logic from `main.ts` into their own folder so there are no more exports from the entry point.
- Improved accessibility regarding labelled components.
- Improved the build process for the site and shared folder.
- Created a generic markdown page to deduplicate 4 identical pages (help, changelog, etc).
- Errors occuring on the site should automatically report themselves to us, in addition to the backend errors already doing that.
- Added tests to the build process to guarantee that critterDB import/avrae export remain unchanged and that the backend launches properly.
- Moved parsing critterDB/5etools to the backend.

---
## v1.4.0
_April 30th, 2024_

- Fixes an issue where the breadcrumbs could conceal part of the page content by being placed over them.
- Added a new page: [My Automation](/my-automation). You can now:
  - Edit automation independently of a creature and save them for reuse, and edit them from there.
  - Quickly import your own saved automation into any of your creatures.
- If you'd like to see a full visual automation editor like [Avrae Dashboard](https://avrae.io/dashboard/characters) directly within Bestiary Builder, consider supporting us on [Patreon](https://www.patreon.com/BestiaryBuilder)!

---
## v1.3.4
_April 24th, 2024_

- Improved the home page, adding statistics about the number of users, bestiaries, and creatures.
- Improved the look of checkbox inputs on the statblock editor page to not be so placeholder-y.

---
## v1.3.3
_April 18th, 2024_

- Adds some missing automation documentation.

---
## v1.3.2
_April 17th, 2024_

- Fixes some issues with the help page where it referenced old locations of some buttons.

---
## v1.3.1
_April 14th, 2024_

- Added copy and clear buttons to the feature editor on mobile to assist with the new editor.

---
## v1.3.0
_April 12th, 2024_

- Revamped the feature editor completely:
    - Replaced the old text editor with a new one, which means:
        - Lines are numbered and it also includes word wrap.
        - Indentation is marked by vertical lines, which is very helpful
        - Generally a smoother experience as this is the code editor made by Microsoft for VSCode.
    - Clicking in the editor will *attempt* to find what type of node you are in (e.g. Damage, Target, IEffect) and then:
        - Describe what the node does.
        - Show an overview of its options and their types.
        - Show detailed information for each option, their defaults, if they are optional, and what it does.
        - Show which variables that node exposes the automation
        - **Please note:** This is not a replacement for reading the complete [Documentation](https://avrae.readthedocs.io/en/stable/automation_ref.html), and writing automation by hand is very difficult. It is easier to use the [Automation Editor](https://avrae.io/dashboard/characters) when creating new automation.
    - Reorganized the modal to be more organized for a cleaner and easier experience.
- If a modal is open it is now no longer possible to scroll the document behind it, as originally intended.

---
## v1.2.8
_April 10th, 2024_

- Fixes an issue where clearing the caster level field would break casting cantrips with the -cantripdice # option in avrae.

---
## v1.2.7
_April 8th, 2024_

- Makes lists in statblocks have normal spacing between its list items.
- Makes unnamed features display an Unnamed name in the editor rather than nothing.
- Fixes an issue where SRD features with no automation did not import their name into the feature editor.
- Fixes an issue where imported features with automation only replaced the first placeholder $NAME$ rather than all.

---
## v1.2.6
_April 3rd, 2024_

- Fixed some issues with parsing from 5e.tools.
- Fixed invalid image url error messages.
- Fixed a bestiary import error message.

---
## v1.2.5
_March 25th, 2024_

- Fixed an issue where XP would not import into Avrae properly.
- Fixed an issue where scrolling on mobile devices does not work properly.
- Added .gif and .apng as valid image formats.
- Adding a creature automatically opens the Statblock Editor for said creature.

---
## v1.2.4
_March 3rd, 2024_

- Fixed an issue which made it impossible to import Bestiary Builder JSON
- Fixed an issue where typing invalid YAML into the feature editor would freeze up the site.

---
## v1.2.3
_February 24th, 2024_

- Improved Automation Editor:
    - Importing an SRD feature will automatically remove the name of the origin creature, e.g. Frog - Bite will import as Bite.
    - It now checks if the feature description and last automation text node differ. If they do, prompt the user to update one of the other with a button.
    - Made it full screen since it was getting cluttered. This is an experimental change until we have a better way to edit automation.
        - **Please leave feedback on this change!**
- Importing Bestiary Builder Json will now check if everything is of the right type, stopping the import if things are typed wrongly. This should prevent errors when manually creating or modifying Bestiary Builder JSON.

---
## v1.2.2
_February 12th, 2024_

- Fixes a few issues with the feature editor on mobile. It should now display and be styled properly.

---
## v1.2.1
_February 9th, 2024_

- Once again fixes the issue where deleting an element from a draggable list did not update the buttons after it. This time it should stay working.

---
## v1.2.0
_February 8th, 2024_

- Adds a view creature button in bestiaries that are not your own, making it easy to navigate to the page for just that creature.
- Fixes Animal Handling/Sleight of Hand not being imported properly into Avrae.
- Fixes an issue with empty spell slot lists sometimes causing issues on import.
- Filtering a bestiary now allows custom creature types.
- Fixes the custom styling of the scrollbar having disappeared.
- Fixes an issue where deleting an element from a draggable list did not update the buttons after it.
- Improves 5e.tools import slightly to allow some homebrew creature options to import too, as well as parse more types of attacks correctly.
- Enables full markdown rendering (including images) in the description of features.

---
## v1.1.4
_January 22nd, 2024_

- Fixed import of some srd features.
- Fixed automation validation of empty automation.

---
## v1.1.3
_January 21st, 2024_

- Saving automation will validate if it is formatted as valid avrae automation and send out the relevant error if not. This should make creating automation for your creatures much easier!

---
## v1.1.2
_January 20th, 2024_

- Senses and speed have been reworked to be more flexible, covering a wider range of use cases. You can now set the unit (ft, m, km, mi, none) as well as set flavour text for each. You can now have custom senses and speed as well.

---
## v1.1.1
_January 19th, 2024_

- Creatures that cannot be edited by you no longer show the editor on the creature page. There is a button to toggle showing it, for debugging purposes only.

---
## v1.1.0
_January 18th, 2024_

- New Feature: All SRD features without automation are now also added to the SRD feature selector to make it easier to build your creatures!
- Selectors that take custom text input (e.g. race) are now marked with an asterisk to signify that they do.

---
## v.1.0.7
_January 17th, 2024_

- Fix meta tag description showing unrelated bestiary information.

---
## v.1.0.6
_January 16th, 2024_

- Make features reordable by dragging
- Make cr buttons in bestiary viewer also increment through 1/8-1/4-1/2
- Resolve some mobile styling issues
- Fix some minor bugs here and there

---
## v.1.0.5
_January 15th, 2024_

- Add dynamic link descriptions for bestiaries, so that the bestiaries description, creator, and creature count will be linked on other sites.
- Add support for bestiary images (see [Help](/help)).
- Fix: sleight of hand does now display properly on a statblock.
- Make banned word filter display which word(s) were matched.

---
## v1.0.4
_January 13th, 2024_

- Add dynamic page title for bestiaries and creatures, showing the name of the creature or bestiary reactively.

---
## v1.0.3
_January 12th, 2024_

- Add filter options for viewing a bestiary
- Add sort options for viewing a bestiary

---
## v1.0.2
_January 12th, 2024_

-   New and improved home page
-   New help page
-   Improved page headers
-   Fixed embedding and meta tags
-   Importing bug fixes
-   Exporting bug fixes

---
## v1.0.1
_January 12th, 2024_

-   Resolves some CritterDB importing as an empty Bestiary
-   Developer environment fix
-   Fix scrolling sometimes not working on mobile

---
## v1.0.0
_January 10th, 2024_

-   Release

---
## v0.0.0

_December 10th, 2023_

-   Development started
