## v1.2.4
_March 3rd, 2024_

- Fixed an issue which made it impossible to import Bestiary Builder JSON
- Fixed an issue where typing invalid YAML into the feature editor would freeze up the site.

## v1.2.3
_February 24th, 2024_

- Improved Automation Editor:
    - Importing an SRD feature will automatically remove the name of the origin creature, e.g. Frog - Bite will import as Bite.
    - It now checks if the feature description and last automation text node differ. If they do, prompt the user to update one of the other with a button.
    - Made it full screen since it was getting cluttered. This is an experimental change until we have a better way to edit automation. 
        - **Please leave feedback on this change!**
- Importing Bestiary Builder Json will now check if everything is of the right type, stopping the import if things are typed wrongly. This should prevent errors when manually creating or modifying Bestiary Builder JSON.


## v1.2.2
_February 12th, 2024_

- Fixes a few issues with the feature editor on mobile. It should now display and be styled properly.

## v1.2.1
_February 9th, 2024_

- Once again fixes the issue where deleting an element from a draggable list did not update the buttons after it. This time it should stay working.

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

## v1.1.4
_January 22nd, 2024_

- Fixed import of some srd features.
- Fixed automation validation of empty automation.

## v1.1.3
_January 21st, 2024_

- Saving automation will validate if it is formatted as valid avrae automation and send out the relevant error if not. This should make creating automation for your creatures much easier!

## v1.1.2
_January 20th, 2024_

- Senses and speed have been reworked to be more flexible, covering a wider range of use cases. You can now set the unit (ft, m, km, mi, none) as well as set flavour text for each. You can now have custom senses and speed as well. 

## v1.1.1
_January 19th, 2024_

- Creatures that cannot be edited by you no longer show the editor on the creature page. There is a button to toggle showing it, for debugging purposes only.

## v1.1.0
_January 18th, 2024_

- New Feature: All SRD features without automation are now also added to the SRD feature selector to make it easier to build your creatures!
- Selectors that take custom text input (e.g. race) are now marked with an asterisk to signify that they do.

## v.1.0.7
_January 17th, 2024_

- Fix meta tag description showing unrelated bestiary information.

## v.1.0.6
_January 16th, 2024_

- Make features reordable by dragging
- Make cr buttons in bestiary viewer also increment through 1/8-1/4-1/2
- Resolve some mobile styling issues
- Fix some minor bugs here and there

## v.1.0.5
_January 15th, 2024_

- Add dynamic link descriptions for bestiaries, so that the bestiaries description, creator, and creature count will be linked on other sites.
- Add support for bestiary images (see [Help](/help)).
- Fix: sleight of hand does now display properly on a statblock.
- Make banned word filter display which word(s) were matched.

## v1.0.4
_January 13th, 2024_

- Add dynamic page title for bestiaries and creatures, showing the name of the creature or bestiary reactively.

## v1.0.3
_January 12th, 2024_

- Add filter options for viewing a bestiary
- Add sort options for viewing a bestiary

## v1.0.2

_January 12th, 2024_

-   New and improved home page
-   New help page
-   Improved page headers
-   Fixed embedding and meta tags
-   Importing bug fixes
-   Exporting bug fixes

## v1.0.1

_January 12th, 2024_

-   Resolves some CritterDB importing as an empty Bestiary
-   Developer environment fix
-   Fix scrolling sometimes not working on mobile

## v1.0.0

_January 10th, 2024_

-   Release

## v0.0.0

_December 10th, 2023_

-   Development started
