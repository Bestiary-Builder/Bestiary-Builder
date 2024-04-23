<template>
	<div>
		<Breadcrumbs
			v-if="bestiary && (data.description.name || data.description.name === '')"
			:routes="[
				{
					path: '../my-bestiaries/',
					text: shouldShowEditor ? 'My Bestiaries' : 'Public Bestiaries',
					isCurrent: false
				},
				{
					path: '../bestiary-viewer/' + bestiary?._id,
					text: bestiary?.name,
					isCurrent: false
				},
				{
					path: '',
					text: data?.description.name || 'unnamed creature',
					isCurrent: true
				}
			]"
		>
			<button v-if="!isOwner && !isEditor" @click="shouldShowEditor = !shouldShowEditor" v-tooltip="'Toggle Editor for debugging purposes'" aria-label="Toggle Editor for debugging purposes">
				<font-awesome-icon :icon="['fas', 'eye']" v-if="!shouldShowEditor" />
				<font-awesome-icon :icon="['fas', 'eye-slash']" v-else />
			</button>
			<button v-if="isOwner || isEditor" @click="showImportModal = true" v-tooltip="'Import a creature\'s statblock'" aria-label="Import a creature's statblock">
				<font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" />
			</button>
			<button v-if="isOwner || isEditor" @click="exportStatblock()" v-tooltip="'Export this creature as JSON to your clipboard.'" aria-label="Export a creature's statblock">
				<font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" />
			</button>
		</Breadcrumbs>
		<div class="content" :class="{'is-statblock-only': !shouldShowEditor}">
			<div class="content-container__inner editor" v-show="shouldShowEditor">
				<div class="editor-nav" role="tablist" aria-label="Statblock editor tabs">
					<button @click="showSlides(1)" @keydown="moveSlide" :class="{'active-slide': slideIndex === 1}" class="editor-nav__tab" role="tab" aria-controls="tabpanel-1" id="tab-1">Description</button>
					<button @click="showSlides(2)" @keydown="moveSlide" :class="{'active-slide': slideIndex === 2}" class="editor-nav__tab" role="tab" aria-controls="tabpanel-1" id="tab-2">Core</button>
					<button @click="showSlides(3)" @keydown="moveSlide" :class="{'active-slide': slideIndex === 3}" class="editor-nav__tab" role="tab" aria-controls="tabpanel-1" id="tab-3">Stats</button>
					<button @click="showSlides(4)" @keydown="moveSlide" :class="{'active-slide': slideIndex === 4}" class="editor-nav__tab" role="tab" aria-controls="tabpanel-1" id="tab-4">Defenses</button>
					<button @click="showSlides(5)" @keydown="moveSlide" :class="{'active-slide': slideIndex === 5}" class="editor-nav__tab" role="tab" aria-controls="tabpanel-1" id="tab-5">Features</button>
					<button @click="showSlides(6)" @keydown="moveSlide" :class="{'active-slide': slideIndex === 6}" class="editor-nav__tab" role="tab" aria-controls="tabpanel-1" id="tab-6">Spells</button>
				</div>

				<div class="editor-content">
					<div class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-1" id="tabpanel-1">
						<div class="editor-field__container two-wide">
							<LabelledComponent title="Creature name">
								<input type="text" :maxlength="limits.nameLength" v-model="data.description.name" id="creaturename" />
							</LabelledComponent>

							<LabelledComponent title="Proper Noun">
								<span> display as "{{ data.description.name }}" instead of "the {{ data.description.name }}" <input type="checkbox" v-model="data.description.isProperNoun" id="propernoun" /> </span>
							</LabelledComponent>
						</div>

						<div class="editor-field__container one-wide">
							<LabelledComponent title="Description">
								<textarea rows="20" :maxlength="limits.descriptionLength" v-model="data.description.description" id="description" />
							</LabelledComponent>
						</div>
						<div class="editor-field__container two-wide">
							<LabelledComponent title="Image URL">
								<input type="text" v-model="data.description.image" id="imageurl" :pattern="limits.imageFormats ? `(https:\/\/)(.+)(\\.${limits.imageFormats.join('|\\.')})` : ''" />
							</LabelledComponent>
							<LabelledComponent title="Environment">
								<input type="text" v-model="data.description.environment" id="environment" />
							</LabelledComponent>
							<LabelledComponent title="Faction">
								<input type="text" v-model="data.description.faction" id="faction" />
							</LabelledComponent>
							<LabelledComponent title="Alignment" takes-custom-text-input>
								<v-select
									v-model="data.description.alignment"
									:options="[
										'Unaligned',
										'Good',
										'Neutral',
										'Evil',
										'Lawful Good',
										'Neutral Good',
										'Chaotic Good',
										'Lawful Neutral',
										'Neutral',
										'Chaotic Neutral',
										'Lawful Evil',
										'Neutral Evil',
										'Chaotic Evil',
										'Any Alignment',
										'Typically Good',
										'Typically Neutral',
										'Typically Evil',
										'Typically Lawful Good',
										'Typically Neutral Good',
										'Typically Chaotic Good',
										'Typically Lawful Neutral',
										'Typically Chaotic Neutral',
										'Typically Lawful Evil',
										'Typically Neutral Evil',
										'Typically Chaotic Evil'
									]"
									:taggable="true"
									:pushTags="true"
									inputId="alignment"
								/>
							</LabelledComponent>
						</div>
						<div class="editor-field__container three-wide">
							<div class="flow-vertically">
								<label class="editor-field__title" for="challengerating"><span class="text"> Challenge rating</span></label>
								<div class="quantity">
									<input type="number" v-model="data.description.cr" min="0" max="30" inputmode="numeric" id="challengerating" />
									<div class="quantity-nav">
										<div class="quantity-button quantity-up" @click="changeCR(true)" aria-label="Increase CR">+</div>
										<div class="quantity-button quantity-down" @click="changeCR(false)" aria-label="Decrease CR">-</div>
									</div>
								</div>
							</div>
							<button class="btn" @click="showCRModal = true">Calculate CR</button>
							<LabelledNumberInput v-model="data.core.proficiencyBonus" :min="0" title="Proficiency Bonus" :step="1" />
							<LabelledNumberInput v-model="data.description.xp" :min="0" :step="1" title="Experience Points" />
						</div>
					</div>
					<div class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-2" id="tabpanel-2">
						<div class="editor-field__container two-wide">
							<LabelledComponent title="Race" takes-custom-text-input>
								<v-select v-model="data.core.race" :options="['Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead']" :taggable="true" :pushTags="true" inputId="race" />
							</LabelledComponent>
							<LabelledComponent title="Size" takes-custom-text-input>
								<v-select v-model="data.core.size" :options="['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']" :taggable="true" :pushTags="true" inputId="size" />
							</LabelledComponent>
						</div>
						<h2 class="group-header">Speed</h2>
						<draggable :list="data.core.speed" handle=".handle" :item-key="getDraggableKey" class="editor-field__container two-wide" :animation="150">
							<template #item="{element, index}">
								<LabelledComponent :title="element.name">
									<div class="grid eight-two">
										<LabelledNumberInput title="" v-model="data.core.speed[index].value" />
										<select v-model="data.core.speed[index].unit" class="ghost unit-selector">
											<option>ft</option>
											<option>m</option>
											<option>km</option>
											<option>mi</option>
											<option>none</option>
										</select>
									</div>
									<div class="grid eight-two">
										<input type="text" v-model="data.core.speed[index].comment" placeholder="Comment..." />
										<span class="grid five-five">
											<font-awesome-icon :icon="['fas', 'trash']" v-tooltip="'Delete this speed'" class="button-icon" @click="data.core.speed.splice(index, 1)" />
											<font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle button-icon" />
										</span>
									</div>
								</LabelledComponent>
							</template>
							<template #footer>
								<LabelledComponent title="Add speed" takes-custom-text-input>
									<v-select v-model="newSpeedName" :options="['Walk', 'Swim', 'Fly', 'Climb', 'Burrow']" :taggable="true" :pushTags="true" inputId="addspeed" placeholder="Select speed" />
									<button class="btn" @click="addNewSpeed">Create</button>
								</LabelledComponent>
							</template>
						</draggable>
						<h2 class="group-header">Senses</h2>
						<draggable :list="data.core.senses" handle=".handle" :item-key="getDraggableKey" class="editor-field__container two-wide" :animation="150">
							<template #item="{element, index}">
								<LabelledComponent :title="element.name">
									<div class="grid eight-two">
										<LabelledNumberInput title="" v-model="element.value" />
										<select v-model="element.unit" class="ghost unit-selector">
											<option>ft</option>
											<option>m</option>
											<option>km</option>
											<option>mi</option>
											<option>none</option>
										</select>
									</div>
									<div class="grid eight-two">
										<input type="text" v-model="element.comment" placeholder="Comment..." />
										<span class="grid five-five">
											<font-awesome-icon :icon="['fas', 'trash']" v-tooltip="'Delete this sense'" class="button-icon" @click="data.core.senses.splice(index, 1)" />
											<font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle button-icon" />
										</span>
									</div>
								</LabelledComponent>
							</template>
							<template #footer>
								<LabelledComponent title="Add sense" takes-custom-text-input>
									<v-select v-model="newSenseName" :options="['Darkvision', 'Blindsight', 'Truesight', 'Tremorsense']" :taggable="true" :pushTags="true" inputId="addsense" placeholder="Select sense" />
									<button class="btn" @click="data.core.senses.push({name: newSenseName, value: 30, unit: 'ft', comment: ''})">Create</button>
								</LabelledComponent>
								<LabelledNumberInput v-model="data.misc.passivePerceptionOverride" title="Passive perc override" :step="1" :is-clearable="true" />
							</template>
						</draggable>
						<h2 class="group-header">Misc</h2>
						<div class="editor-field__container two-wide">
							<LabelledComponent title="Languages" takes-custom-text-input>
								<v-select placeholder="Select a Language or type one" v-model="data.core.languages" multiple :deselectFromDropdown="true" :closeOnSelect="false" :options="languages" :taggable="true" :pushTags="true" inputId="languages" />
							</LabelledComponent>
							<LabelledNumberInput v-model="data.misc.telepathy" title="Telepathy" />
						</div>
					</div>

					<div class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-3" id="tabpanel-3">
						<h2 class="group-header">Ability Scores</h2>
						<div class="editor-field__container three-wide">
							<LabelledNumberInput v-model="data.abilities.stats.str" title="Strength" :step="1" />
							<LabelledNumberInput v-model="data.abilities.stats.dex" title="Dexterity" :step="1" />
							<LabelledNumberInput v-model="data.abilities.stats.con" title="Constitution" :step="1" />
							<LabelledNumberInput v-model="data.abilities.stats.int" title="Intelligence" :step="1" />
							<LabelledNumberInput v-model="data.abilities.stats.wis" title="Wisdom" :step="1" />
							<LabelledNumberInput v-model="data.abilities.stats.cha" title="Charisma" :step="1" />
						</div>
						<h2 class="group-header">Saving Throws</h2>
						<div class="editor-field__container three-wide">
							<LabelledNumberInput v-model="data.abilities.saves.str.override" title="Strength" :step="1" :is-clearable="true">
								<p>
									<label for="strsaveprof" aria-label="strength save proficiency">Proficient</label>
									<input type="checkbox" v-model="data.abilities.saves.str.isProficient" id="strsaveprof" :is-clearable="true" />
								</p>
							</LabelledNumberInput>
							<LabelledNumberInput v-model="data.abilities.saves.dex.override" title="Dexterity" :step="1" :is-clearable="true">
								<p>
									<label for="dexsaveprof" aria-label="dexterity save proficiency">Proficient</label>
									<input type="checkbox" v-model="data.abilities.saves.dex.isProficient" id="dexsaveprof" />
								</p>
							</LabelledNumberInput>
							<LabelledNumberInput v-model="data.abilities.saves.con.override" title="Constitution" :step="1" :is-clearable="true">
								<p>
									<label for="consaveprof" aria-label="constitution save proficiency">Proficient</label>
									<input type="checkbox" v-model="data.abilities.saves.con.isProficient" id="consaveprof" />
								</p>
							</LabelledNumberInput>
							<LabelledNumberInput v-model="data.abilities.saves.int.override" title="Intelligence" :step="1" :is-clearable="true">
								<p>
									<label for="intsaveprof" aria-label="intelligence save proficiency">Proficient</label>
									<input type="checkbox" v-model="data.abilities.saves.int.isProficient" id="intsaveprof" />
								</p>
							</LabelledNumberInput>
							<LabelledNumberInput v-model="data.abilities.saves.wis.override" title="Wisdom" :step="1" :is-clearable="true">
								<p>
									<label for="wissaveprof" aria-label="wisdom save proficiency">Proficient</label>
									<input type="checkbox" v-model="data.abilities.saves.wis.isProficient" id="wissaveprof" />
								</p>
							</LabelledNumberInput>
							<LabelledNumberInput v-model="data.abilities.saves.cha.override" title="Charisma" :step="1" :is-clearable="true">
								<p>
									<label for="chasaveprof" aria-label="charisma save proficiency">Proficient</label>
									<input type="checkbox" v-model="data.abilities.saves.cha.isProficient" id="chasaveprof" />
								</p>
							</LabelledNumberInput>
						</div>
						<h2 class="group-header">Skills</h2>
						<div class="editor-field__container two-wide">
							<LabelledComponent v-for="(skill, index) in data.abilities.skills" :title="skill.skillName">
								<div class="button-container">
									<p><label :for="skill.skillName + 'prof'"> Proficient</label> <input type="checkbox" v-model="skill.isProficient" @click="disableOtherSkills(index, 'prof', skill.isProficient)" :id="skill.skillName + 'prof'" /></p>
									<p><label :for="skill.skillName + 'exp'"> Expertise </label> <input type="checkbox" v-model="skill.isExpertise" @click="disableOtherSkills(index, 'exp', skill.isExpertise)" :id="skill.skillName + 'exp'" /></p>
									<p><label :for="skill.skillName + 'halfprof'"> Half prof </label> <input type="checkbox" v-model="skill.isHalfProficient" @click="disableOtherSkills(index, 'halfprof', skill.isHalfProficient)" :id="skill.skillName + 'halfprof'" /></p>
								</div>
								<div>
									<LabelledNumberInput v-model="skill.override" title="" :step="1" :is-clearable="true" />
								</div>
								<button class="btn" @click="deleteSkill(index)">Delete</button>
							</LabelledComponent>
							<LabelledComponent title="Add new skill">
								<v-select
									placeholder="Select skill"
									v-model="newSkillName"
									:options="['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival']"
								/>
								<button class="btn editor-field__plus-button" id="addnewskill" @click="addNewSkill()">New Skill</button>
							</LabelledComponent>
						</div>
					</div>
					<div class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-4" id="tabpanel-4">
						<div class="editor-field__container three-wide">
							<LabelledNumberInput v-model="data.defenses.hp.sizeOfHitDie" title="Hit Die Size" :step="2" />
							<LabelledNumberInput v-model="data.defenses.hp.numOfHitDie" title="Hit Die Number" :step="1" />
							<LabelledNumberInput v-model="data.defenses.hp.override" title="HP Override" :step="1" :is-clearable="true" />
						</div>
						<div class="editor-field__container two-wide">
							<LabelledNumberInput v-model="data.defenses.ac.ac" title="Armor Class" :step="1" />
							<LabelledComponent title="Armor Class source">
								<input type="text" v-model="data.defenses.ac.acSource" id="armorclasssource" />
							</LabelledComponent>
						</div>
						<div class="editor-field__container two-wide">
							<LabelledComponent title="Vulnerabilities" takes-custom-text-input>
								<v-select placeholder="Type vulnerabilities..." v-model="data.defenses.vulnerabilities" multiple :deselectFromDropdown="true" :closeOnSelect="false" :options="resistanceList" :taggable="true" :pushTags="true" inputId="vulnerabilities" />
							</LabelledComponent>
							<LabelledComponent title="Resistances" takes-custom-text-input>
								<v-select placeholder="Type resistances..." v-model="data.defenses.resistances" multiple :deselectFromDropdown="true" :closeOnSelect="false" :options="resistanceList" :taggable="true" :pushTags="true" inputId="resistances" />
							</LabelledComponent>
							<LabelledComponent title="Immunities" takes-custom-text-input>
								<v-select placeholder="Type immunities..." v-model="data.defenses.immunities" multiple :deselectFromDropdown="true" :closeOnSelect="false" :options="resistanceList" :taggable="true" :pushTags="true" inputId="immunities" />
							</LabelledComponent>
							<LabelledComponent title="Condition Immunities" takes-custom-text-input>
								<v-select
									placeholder="Type condition immunities..."
									v-model="data.defenses.conditionImmunities"
									multiple
									:deselectFromDropdown="true"
									:closeOnSelect="false"
									:options="['Blinded', 'Charmed', 'Deafened', 'Disease', 'Exhaustion', 'Frightened', 'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious']"
									:taggable="true"
									:pushTags="true"
									inputId="conditionimmunities"
								/>
							</LabelledComponent>
						</div>
					</div>
					<div class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-5" id="tabpanel-5">
						<div v-for="(descText, fType) in featureGenerator">
							<h2 class="group-header">{{ descText.replace("New ", "") }}s</h2>
							<draggable :list="data.features[fType]" group="features" :item-key="getDraggableKey" handle=".handle" class="editor-field__container two-wide" :animation="150">
								<template #item="{element, index}">
									<LabelledComponent :title="element.name || `Unnamed ${index}`">
										<div class="feature-button__container">
											<FeatureWidget :index="index" :type="fType" :data="data" />
											<span class="delete-button" @click="deleteFeature(fType, index)" aria-label="Delete feature"><font-awesome-icon :icon="['fas', 'trash']" /></span>
											<font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle" />
										</div>
									</LabelledComponent>
								</template>
								<template #footer>
									<LabelledComponent :title="descText">
										<button class="btn" @click="createNewFeature(fType)" :id="descText.toLowerCase().replaceAll(' ', '')">Create</button>
									</LabelledComponent>

									<LabelledComponent :title="capitalizeFirstLetter(fType) + ' Header'">
										<textarea v-model="data.misc.featureHeaderTexts[fType]" :id="(fType + ' Header').toLowerCase().replaceAll(' ', '')" />
									</LabelledComponent>

									<LabelledNumberInput v-model="data.misc.legActionsPerRound" v-if="fType == 'legendary' && data.features[fType].length > 0" title="Legendary Actions per round" :min="0" :step="1" />
								</template>
							</draggable>
						</div>
					</div>
					<div class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-6" id="tabpanel-6">
						<h2 class="group-header">Innate Spellcasting</h2>
						<div class="editor-field__container two-wide">
							<LabelledComponent title="Casting ability">
								<p>
									<v-select :options="['str', 'dex', 'con', 'wis', 'int', 'cha']" v-model="data.spellcasting.innateSpells.spellCastingAbility" inputId="castingability" />
									<span class="delete-button" @click="data.spellcasting.innateSpells.spellCastingAbility = null" aria-label="Delete innate spellcasting ability"><font-awesome-icon :icon="['fas', 'trash']" /></span>
								</p>
							</LabelledComponent>
							<LabelledComponent title="Not these components">
								<v-select :options="['Material', 'Verbal', 'Somatic']" v-model="data.spellcasting.innateSpells.noComponentsOfType" multiple :deselectFromDropdown="true" :closeOnSelect="false" inputId="notthesecomponents" />
							</LabelledComponent>
						</div>
						<div class="editor-field__container two-wide">
							<LabelledNumberInput v-model="data.spellcasting.innateSpells.spellDcOverride" title="DC override" :step="1" :is-clearable="true" />
							<LabelledNumberInput v-model="data.spellcasting.innateSpells.spellBonusOverride" title="Attack bonus override" :step="1" :is-clearable="true" />
							<LabelledComponent title="At will" takes-custom-text-input>
								<v-select :options="spellListFlattened" v-model="innateSpells[0]" multiple :deselectFromDropdown="true" :closeOnSelect="false" inputId="atwill" :taggable="true" :pushTags="true" />
							</LabelledComponent>
							<LabelledComponent title="1/day" takes-custom-text-input>
								<v-select :options="spellListFlattened" v-model="innateSpells[1]" multiple :deselectFromDropdown="true" :closeOnSelect="false" inputId="1/day" :taggable="true" :pushTags="true" />
							</LabelledComponent>
							<LabelledComponent title="2/day" takes-custom-text-input>
								<v-select :options="spellListFlattened" v-model="innateSpells[2]" multiple :deselectFromDropdown="true" :closeOnSelect="false" inputId="2/day" :taggable="true" :pushTags="true" />
							</LabelledComponent>
							<LabelledComponent title="3/day" takes-custom-text-input>
								<v-select :options="spellListFlattened" v-model="innateSpells[3]" multiple :deselectFromDropdown="true" :closeOnSelect="false" inputId="3/day" :taggable="true" :pushTags="true" />
							</LabelledComponent>

							<LabelledComponent title="Is psionics?">
								<span> display as psionics? <input type="checkbox" v-model="data.spellcasting.innateSpells.isPsionics" id="ispsionics?" /> </span>
							</LabelledComponent>
							<LabelledComponent title="Display as action?">
								<span> should this display as an action? <input type="checkbox" v-model="data.spellcasting.innateSpells.displayAsAction" id="displayasaction?" /> </span>
							</LabelledComponent>

							<LabelledComponent title="Edit specific spells">
								<button class="btn" @click="showSpellModal = true" id="editspecificspells">Edit cast level/add comment</button>
							</LabelledComponent>
						</div>
						<h2 class="group-header">Class spellcasting</h2>
						<div class="editor-field__container two-wide">
							<LabelledComponent title="Class">
								<v-select v-model="data.spellcasting.casterSpells.castingClass" :options="['Artificer', 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard']" inputId="class" />
							</LabelledComponent>
							<LabelledComponent title="Class level">
								<v-select v-model="data.spellcasting.casterSpells.casterLevel" :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]" inputId="classlevel" />
							</LabelledComponent>

							<LabelledNumberInput v-model="data.spellcasting.casterSpells.spellDcOverride" title="DC override" :step="1" :is-clearable="true" />
							<LabelledNumberInput v-model="data.spellcasting.casterSpells.spellBonusOverride" title="Attack bonus override" :step="1" />
						</div>
						<div v-if="data.spellcasting.casterSpells.castingClass" class="editor-field__container two-wide">
							<LabelledComponent title="Cantrips" v-if="!['Ranger', 'Paladin'].includes(data.spellcasting.casterSpells.castingClass)" takes-custom-text-input>
								<v-select v-model="data.spellcasting.casterSpells.spellList[0]" :options="spellList[0]" multiple :deselectFromDropdown="true" :closeOnSelect="false" :taggable="true" :pushTags="true" inputId="cantrips" />
							</LabelledComponent>
							<LabelledComponent v-for="level in spellLevelList()" :title="'Level ' + level" takes-custom-text-input>
								<v-select v-model="data.spellcasting.casterSpells.spellList[level]" :options="getSpellsByLevel(level)" multiple :deselectFromDropdown="true" :closeOnSelect="false" :taggable="true" :pushTags="true" :title="'Level ' + level" />
							</LabelledComponent>
						</div>
					</div>
				</div>

				<hr />

				<div class="buttons">
					<button class="btn confirm" @click="saveStatblock()">Save statblock</button>
				</div>
			</div>
			<div class="content-container__inner">
				<StatblockRenderer :data="data" />
			</div>
		</div>

		<Modal :show="showImportModal" @close="showImportModal = false">
			<template #header>Import Creatures</template>
			<template #body>
				<LabelledComponent title="Bestiary Builder JSON">
					<p>Insert the JSON as text gotten from clicking export on another creature within Bestiary Builder.</p>
					<div class="two-wide">
						<input type="text" v-model="bestiaryBuilderJson" id="bestiarybuilderjson" />
						<button class="btn confirm" @click="importBestiaryBuilder">Import</button>
					</div>
				</LabelledComponent>
				<hr />
				<LabelledComponent title="5e Tools JSON">
					<p>Insert 5e.tools JSON as text into this field, gotten from clicking export on 5e.tools and copying the JSON.</p>
					<div class="two-wide">
						<input type="text" v-model="toolsjson" id="5etoolsjson" />
						<button class="btn confirm" @click.prevent="import5etools">Import</button>
					</div>
				</LabelledComponent>

				<div v-if="JSON.stringify(notices) !== '{}'">
					<p class="warning"><b>Please note the following for this import:</b></p>
					<p>Some features may not have automation as they should, aka description only features, but some might not have imported correctly or are missing certain parts. It is recommended to review.</p>
					<div v-for="(type, index) in notices">
						<h3 v-if="type.length > 0">{{ index }}</h3>
						<ul v-if="type.length > 0">
							<li v-for="notice in type">
								{{ notice }}
							</li>
						</ul>
					</div>
				</div>
			</template>
		</Modal>

		<Modal :show="showSpellModal" @close="showSpellModal = false">
			<template #header>Edit Innate Spellcasting list</template>
			<template #body>
				<p>You can use this to add text to specific spells such as "self only" or "at 5th level".</p>
				<div class="two-wide">
					<template v-for="times in data.spellcasting.innateSpells.spellList" :key="times">
						<LabelledComponent v-for="(spell, index) in times" v-if="times.length > 0" :key="index" :title="spell.spell">
							<input type="text" v-model="spell.comment" placeholder="comment" :id="spell.spell" />
						</LabelledComponent>
					</template>
				</div>
			</template>
		</Modal>

		<Modal :show="showCRModal" @close="showCRModal = false">
			<template #header>Calculate Monster CR</template>
			<template #body>
				<div class="two-wide">
					<LabelledNumberInput v-model="crCalc.attackBonus" title="Attack Bonus" :step="1" :min="0"></LabelledNumberInput> 
					<LabelledNumberInput v-model="crCalc.dpr" title="DPR" :step="1" :min="0"></LabelledNumberInput> 
				</div>
				<div class="two-wide">
					<LabelledNumberInput v-model="crCalc.dc" title="Save DC" :step="1" :min="0"></LabelledNumberInput> 
				</div>
				<div class="buttons">
					<button class="btn" @click="calculateCR()">Calculate CR</button>
				</div>
			</template>
		</Modal>
	</div>
</template>

<script lang="ts">
import FeatureWidget from "@/components/FeatureWidget.vue";
import Modal from "@/components/Modal.vue";
import StatblockRenderer from "../components/StatblockRenderer.vue";
import Breadcrumbs from "../components/Breadcrumbs.vue";
import LabelledNumberInput from "@/components/LabelledNumberInput.vue";
import LabelledComponent from "@/components/LabelledComponent.vue";
import draggable from "vuedraggable";

import {defineComponent} from "vue";

import type {SkillsEntity, Statblock, Creature, Bestiary, Stat, FeatureEntity} from "@/../../shared";
import {defaultStatblock, getSpellSlots, spellList, spellListFlattened, getXPbyCR, ChallengeRatingTable, type User} from "@/../../shared";
import {handleApiResponse, type error, toast, asyncLimits, type limitsType, user} from "@/main";
import {parseFrom5eTools} from "../parser/parseFrom5eTools";
import {capitalizeFirstLetter, parseDescIntoAutomation} from "@/parser/utils";
import { isAssertEntry } from "typescript";
const tabs = document.getElementsByClassName("editor-nav__tab") as HTMLCollectionOf<HTMLElement>;
const tabsContent = document.getElementsByClassName("editor-content__tab-inner") as HTMLCollectionOf<HTMLElement>;
let draggableKeyIndex = 0;

export default defineComponent({
	components: {
		StatblockRenderer,
		FeatureWidget,
		Breadcrumbs,
		LabelledNumberInput,
		LabelledComponent,
		Modal,
		draggable
	},
	data() {
		return {
			slideIndex: 2,
			user: null as User | null,
			data: defaultStatblock as Statblock,
			rawInfo: null as Creature | null,
			bestiary: null as Bestiary | null,
			list: [] as string[],
			getSpellSlots: getSpellSlots,
			spellListFlattened: spellListFlattened,
			spellList: spellList,
			innateSpells: {
				0: [] as string[],
				1: [] as string[],
				2: [] as string[],
				3: [] as string[]
			} as {[key: number]: string[]},
			limits: {} as limitsType,
			featureGenerator: {
				features: "New Feature",
				actions: "New Action",
				bonus: "New Bonus Action",
				reactions: "New Reaction",
				legendary: "New Legendary Action",
				lair: "New Lair Action",
				mythic: "New Mythic Action",
				regional: "New Regional Effect"
			},
			toolsjson: "",
			bestiaryBuilderJson: "",
			notices: {} as {[key: string]: string[]},
			madeChanges: false,
			resistanceList: [
				"Acid",
				"Bludgeoning",
				"Cold",
				"Fire",
				"Force",
				"Lightning",
				"Necrotic",
				"Piercing",
				"Poison",
				"Psychic",
				"Radiant",
				"Slashing",
				"Thunder",
				"Nonmagical Bludgeoning",
				"Nonmagical Piercing",
				"Nonmagical Slashing",
				"Nonmagical Nonsilvered Bludgeoning",
				"Nonmagical Nonsilvered Piercing",
				"Nonmagical Nonsilvered Slashing"
			],
			languages: [
				"All",
				"All languages it knew in life",
				"Abyssal",
				"Aarakocra",
				"Aquan",
				"Auran",
				"Celestial",
				"Common",
				"Deep Speech",
				"Draconic",
				"Druidic",
				"Dwarvish",
				"Elvish",
				"Giant",
				"Gith",
				"Gnomish",
				"Goblin",
				"Halfling",
				"Ignan",
				"Infernal",
				"Orc",
				"Primordial",
				"Sylvan",
				"Terran",
				"Thieves' Cant",
				"Undercommon",
				"Understands the languages of its creator but can't speak"
			],
			showImportModal: false,
			showSpellModal: false,
			showCRModal: false,
			capitalizeFirstLetter,
			shouldShowEditor: false,
			isOwner: false,
			isEditor: false,
			newSkillName: "",
			newSpeedName: "",
			newSenseName: "",
			crCalc: {"attackBonus": 0, "dpr": 0, "dc": 0}
		};
	},
	methods: {
		getDraggableKey(item: any) {
			return item;
		},
		exportStatblock(): void {
			navigator.clipboard.writeText(JSON.stringify(this.data, null, 2));
			toast.info("Exported this statblock to your clipboard.");
		},
		import5etools(): void {
			try {
				[this.data, this.notices] = parseFrom5eTools(JSON.parse(this.toolsjson));
				this.toolsjson = "";
				toast.success("Successfully imported " + this.data.description.name);
			} catch (e) {
				console.error(e);
				toast.error("Failed to import this creature");
			}
		},
		async importBestiaryBuilder() {
			try {
				let creature = JSON.parse(this.bestiaryBuilderJson);
				console.log(creature);
				if (Array.isArray(creature)) creature = creature[0];
				//Validate input
				let result = await fetch("/api/validate/creature", {
					method: "POST",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json"
					},
					body: JSON.stringify({data: creature})
				}).then(handleApiResponse);
				//Succesful?:
				if (result.success) {
					this.data = creature;
					this.notices = {};
					this.bestiaryBuilderJson = "";
					toast.success("Successfully imported " + this.data.description.name);
				} else {
					toast.error((result.data as error).error.replaceAll("\n", "<br />"), {
						duration: 0
					});
				}
				this.showImportModal = false;
			} catch (e) {
				console.error(e);
				toast.error("Failed to import this creature");
			}
		},
		showSlides(n: number): void {
			if (this.slideIndex == n) return;

			for (let i = 0; i < tabs.length; i++) {
				let tab = tabs[i];
				if (i != n - 1) {
					tab.setAttribute("aria-selected", "false");
					tab.tabIndex = -1;
				} else {
					tab.setAttribute("aria-selected", "true");
					tab.removeAttribute("tabindex");
					tab.focus();
				}
			}

			for (let i = 0; i < tabsContent.length; i++) {
				if (i != n - 1) {
					tabsContent[i].style.display = "none";
				} else {
					tabsContent[i].style.display = "block";
				}
			}

			this.slideIndex = n;
		},
		moveSlide(event: KeyboardEvent): void {
			let currentSlide = this.slideIndex;
			let moveToSlide = 0;
			switch (event.key) {
				case "ArrowLeft":
					if (currentSlide == 1) moveToSlide = tabs.length;
					else moveToSlide = currentSlide - 1;
					break;

				case "ArrowRight":
					if (currentSlide == tabs.length) moveToSlide = 1;
					else moveToSlide = currentSlide + 1;
					break;

				case "Home":
					moveToSlide = 1;
					break;

				case "End":
					moveToSlide = tabs.length;
					break;
			}

			if (moveToSlide) {
				event.stopPropagation();
				event.preventDefault();
				this.showSlides(moveToSlide);
			}
		},
		calculateCR(): void{
			var defenseCR: number = 0
			var offenseCR: number = 0
			const hp = this.data.defenses.hp.override ? this.data.defenses.hp.override : this.hpCalc()
			console.log("HP: " + hp)

			Object.keys(ChallengeRatingTable).forEach((k) => {
				const cr = parseFloat(k)
				const reference = ChallengeRatingTable[cr]

				if (cr > defenseCR && hp >= reference.hp[0]){
					defenseCR = cr
				}

				if (cr > offenseCR && this.crCalc.dpr >= reference.dpr[0]){
					offenseCR = cr
				}
			})

			
			const attackBonusDiff = this.crCalc.attackBonus - ChallengeRatingTable[offenseCR].attackBonus
			const saveDiff = this.crCalc.dc - ChallengeRatingTable[offenseCR].dc 
			

			defenseCR += Math.floor((this.data.defenses.ac.ac - ChallengeRatingTable[defenseCR].ac)/2.0)
			offenseCR += Math.floor(Math.max(attackBonusDiff, saveDiff) / 2.0)

			const totalCR = (defenseCR: number, offenseCR: number): number => {
				const avg = (defenseCR + offenseCR) / 2

				if (avg >= 0.75) return Math.min(30, Math.round(avg));
				if (avg >= 0.375) return 0.5;
				if (avg >= 0.1875) return 0.25;
				if (avg >= 0.0625) return 0.125;
				return 0
			}
			
			this.showCRModal = false
			this.data.description.cr = totalCR(defenseCR, offenseCR)
			toast.success("Defense CR: " + defenseCR + " Offense CR: " + offenseCR + " Total Calcualted CR: " + totalCR(defenseCR, offenseCR))

		},
		hpCalc(): number {
            return Math.floor(this.data.defenses.hp.numOfHitDie * ( (this.data.defenses.hp.sizeOfHitDie + 1)/2 + this.statCalc("con")))
        },
        statCalc(stat: Stat) : number {
            return Math.floor(this.data.abilities.stats[stat]/2)-5
        },
		attackStats(): number[]{
			var bonuses: number[] = []
			var saveDC: number[] = []
			var damages: number[] = []

			function findAttackBonus(obj: any): any{
				if (typeof obj === 'object' && obj !== null){
					if ('attackBonus' in obj){
						return parseInt(obj.attackBonus)
					} else {
						for (const key in obj){
							const result = findAttackBonus(obj[key])
							if (result !== undefined){
								return result
							}
						}
					}
				}
			}

			function findAttackDamage(obj: any): any{
				if (typeof obj === 'object' && obj !== null){
					if ('damage' in obj){
						return averageDamage(obj.damage)
					} else {
						for (const key in obj){
							const result = findAttackDamage(obj[key])
							if (result !== undefined){
								return result
							}
						}
					}
				}
			}

			function findDC(obj: any): any{
				if (typeof obj === 'object' && obj !== null){
					if ('dc' in obj){
						return obj.dc
					} else {
						for (const key in obj){
							const result = findDC(obj[key])
							if (result !== undefined){
								return result
							}
						}
					}
				}
			}

			function averageDamage(damageString: string): number{
				const d_string = damageString.replace(/\s*\[.*?\]\s*/g, '')
				const [roll, mod] = d_string.includes("+")  ? d_string.split("+") : [d_string,0]
				const [numDie, dieSize] = roll.split("d").map(Number)
				const averageRoll = (dieSize+1)/2
				const averageDmg = (averageRoll * numDie) + (mod ? Number(mod) : 0)
				return Math.floor(averageDmg)
			}

			function scrapeFeatures(features: FeatureEntity[]){
				features.forEach(feature => {
					var automation: string

					if (feature.automation){
						automation = JSON.stringify(feature.automation)
					} else {
						automation = JSON.stringify(parseDescIntoAutomation(feature.description, feature.name ,1)[0])
					}


					const bonus = automation ?  findAttackBonus(JSON.parse(automation)) : undefined
					const damage = automation ? findAttackDamage(JSON.parse(automation)) : undefined
					const dc = automation ? findDC(JSON.parse(automation)): undefined

					if (bonus && !isNaN(bonus)){
						bonuses.push(bonus)
					}

					if (damage && !isNaN(damage)){
						damages.push(damage)
					}

					if (dc && !isNaN(dc)){
						saveDC.push(dc)
					}
				})
			}

			scrapeFeatures(this.data.features.features)
			scrapeFeatures(this.data.features.actions)
			scrapeFeatures(this.data.features.bonus)
		
			
			// Average the numbers
			const attackBonus = Math.round(bonuses.reduce((acc, cv) => acc + cv,0) / bonuses.length)
			const dpr = Math.round(damages.reduce((acc, cv) => acc + cv,0) / damages.length)
			const dc = Math.round(saveDC.reduce((acc, cv) => acc + cv,0) / saveDC.length)
			
			return [attackBonus, dpr, dc]

		},
		changeCR(isIncrease: boolean): void {
			let cr = this.data.description.cr;

			if (cr == 0 && isIncrease) cr = 0.125;
			else if (cr == 0.125 && isIncrease) cr = 0.25;
			else if (cr == 0.25 && isIncrease) cr = 0.5;
			else if (cr == 0.5 && isIncrease) cr = 1;
			else if (cr == 0.125 && !isIncrease) cr = 0;
			else if (cr == 0.25 && !isIncrease) cr = 0.125;
			else if (cr == 0.5 && !isIncrease) cr = 0.25;
			else if (cr == 1 && !isIncrease) cr = 0.5;
			else {
				if (isIncrease) cr = Math.min(30, cr + 1);
				else cr = Math.max(0, cr - 1);
			}

			this.data.description.cr = cr;
		},
		addNewSkill(): void {
			if (!this.newSkillName) {
				this.$toast.error("No skill chosen.");
				return;
			}
			if (this.data.abilities.skills.some((obj) => obj.skillName === this.newSkillName)) {
				this.$toast.error("You already have this skill.");
				return;
			}

			this.data.abilities.skills.push({
				skillName: this.newSkillName as string,
				isHalfProficient: false,
				isProficient: true,
				isExpertise: false,
				override: null
			});

			this.newSkillName = "";
		},
		addNewSpeed() {
			if (!this.newSpeedName) {
				this.$toast.error("No speed chosen.");
				return;
			}
			if (this.data.core.speed.some((obj) => obj.name === this.newSpeedName)) {
				this.$toast.error("You already have this speed.");
				return;
			}
			this.data.core.speed.push({name: this.newSpeedName, value: 30, unit: "ft", comment: ""});
			this.newSpeedName = "";
		},
		addNewSense() {
			if (!this.newSenseName) {
				this.$toast.error("No sense chosen.");
				return;
			}
			if (this.data.core.senses.some((obj) => obj.name === this.newSenseName)) {
				this.$toast.error("You already have this sense.");
				return;
			}
			this.data.core.senses.push({name: this.newSenseName, value: 30, unit: "ft", comment: ""});
			this.newSenseName = "";
		},
		disableOtherSkills(index: number, type: "prof" | "exp" | "halfprof", value: boolean): void {
			if (!value && this.data.abilities.skills) {
				if (type == "prof") {
					this.data.abilities.skills[index].isExpertise = false;
					this.data.abilities.skills[index].isHalfProficient = false;
				}
				if (type == "exp") {
					this.data.abilities.skills[index].isProficient = false;
					this.data.abilities.skills[index].isHalfProficient = false;
				}
				if (type == "halfprof") {
					this.data.abilities.skills[index].isExpertise = false;
					this.data.abilities.skills[index].isProficient = false;
				}
			}
		},
		deleteSkill(index: number): void {
			this.data.abilities.skills?.splice(index, 1);
		},
		deleteFeature(type: "features" | "actions" | "bonus" | "reactions" | "legendary" | "mythic" | "lair" | "regional", index: number): void {
			this.data.features[type].splice(index, 1);
		},
		createNewFeature(type: "features" | "actions" | "bonus" | "reactions" | "legendary" | "mythic" | "lair" | "regional"): void {
			this.data.features[type][this.data.features[type].length] = {
				name: "New Feature " + (this.data.features[type].length + 1),
				description: "",
				automation: null
			};
		},
		spellLevelList(): number[] {
			const sClass = this.data.spellcasting.casterSpells.castingClass;
			const level = this.data.spellcasting.casterSpells.casterLevel;

			const slots = this.data.spellcasting.casterSpells.spellSlotList;
			if (sClass == "Warlock" && slots) {
				// @ts-ignore
				return Array.from({length: Object.keys(slots)[0]}, (_, index) => index + 1);
			}
			if (slots) return Object.keys(slots).map((str) => parseInt(str));
			return [];
		},
		getSpellsByLevel(level: number): string[] {
			// this function is needed for typescript.
			if (level < 0 || level > 9) return [];
			// @ts-ignore
			return spellList[level];
		},
		clearCasting() {
			this.data.spellcasting.casterSpells.castingClass = null;
			this.data.spellcasting.casterSpells.casterLevel = null;
			this.data.spellcasting.casterSpells.spellList = [[], [], [], [], [], [], [], [], [], []];
			this.data.spellcasting.casterSpells.spellSlotList = {};
			this.data.spellcasting.casterSpells.spellCastingAbility = null;
			this.data.spellcasting.casterSpells.spellBonusOverride = null;
			this.data.spellcasting.casterSpells.spellDcOverride = null;
		},
		saveStatblock() {
			///console.log(this.data);
			if (!this.rawInfo) return;
			this.rawInfo.stats = this.data;
			const loader = this.$loading.show();
			//Send to backend
			fetch(`/api/creature/${this.rawInfo._id}/update`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({data: this.rawInfo})
			}).then(async (response) => {
				let result = await handleApiResponse<Creature>(response);
				if (result.success) {
					toast.success("Saved stat block");
					this.madeChanges = false;
					// watch data only once, as traversing the object deeply is expensive.
					const unwatch = this.$watch(
						"data",
						() => {
							this.madeChanges = true;
							unwatch();
						},
						{deep: true}
					);
				} else {
					toast.error("Error: " + (result.data as error).error, {duration: 10000});
				}
			});
			loader.hide();
		}
	},
	async beforeMount() {
		this.user = await user;
	},
	async mounted() {
		const loader = this.$loading.show();
		this.limits = (await asyncLimits) ?? ({} as limitsType);
		///console.log("Statblock id: " + this.$route.params.id);
		this.showSlides(1);

		//Fetch creature info
		let fetchResult = await fetch("/api/creature/" + this.$route.params.id).then(async (response) => {
			let result = await handleApiResponse<Creature>(response);
			if (result.success) {
				this.data = (result.data as Creature).stats;
				this.rawInfo = result.data as Creature;

				return true;
			} else {
				toast.error("Error: " + (result.data as error).error);
				this.madeChanges = false;
				this.$router.push("/error");
				return false;
			}
		});
		if (!fetchResult) {
			loader.hide();
			return;
		}

		document.title = `${this?.data.description.name.substring(0, 16)} | Bestiary Builder`;

		// get bestiary info this creature belongs to so we can get the name of the bestiary
		await fetch("/api/bestiary/" + this.rawInfo?.bestiary).then(async (response) => {
			let result = await handleApiResponse<Bestiary>(response);
			if (result.success) {
				this.bestiary = result.data as Bestiary;
				this.isOwner = this.user?._id == this.bestiary.owner;
				this.isEditor = (this.bestiary?.editors ?? []).includes(this.user?._id ?? "");
				if (this.isOwner || this.isEditor) this.shouldShowEditor = true;
			} else {
				this.bestiary = null;
				toast.error((result.data as error).error);
			}
		});

		this.innateSpells = {
			0: this.data.spellcasting.innateSpells.spellList[0].map((spell) => spell.spell),
			1: this.data.spellcasting.innateSpells.spellList[1].map((spell) => spell.spell),
			2: this.data.spellcasting.innateSpells.spellList[2].map((spell) => spell.spell),
			3: this.data.spellcasting.innateSpells.spellList[3].map((spell) => spell.spell)
		};

		[this.crCalc.attackBonus, this.crCalc.dpr, this.crCalc.dc] = this.attackStats()

		// if the user had changes without saving, stop them from closing the page without confirming.
		window.addEventListener("beforeunload", (event) => {
			// haven't figured out yet how to destroy the event listener upon unmount so for now this confirms that the
			// warning only shows if they are in the statblock editor
			if (this.madeChanges && (this.isOwner || this.isEditor) && location.pathname.split("/")[1] == "statblock-editor") {
				event.preventDefault();
				event.returnValue = true;
			}
		});

		// watch data only once, as traversing the object deeply is expensive.
		// re-registered upon saving.
		// need a set time out otherwise it triggers upon mounting for some reason
		setTimeout(() => {
			let unwatch = this.$watch(
				"data",
				() => {
					this.madeChanges = true;
					unwatch();
				},
				{deep: true}
			);
		}, 1);

		loader.hide();
	},

	watch: {
		"data.spellcasting.casterSpells.castingClass"(newValue, oldValue) {
			if (newValue == null || newValue == undefined) {
				this.clearCasting();
				return;
			}

			const sClass = this.data.spellcasting.casterSpells.castingClass;
			switch (sClass) {
				case "Artificer":
				case "Wizard":
					this.data.spellcasting.casterSpells.spellCastingAbility = "int";
					break;
				case "Cleric":
				case "Druid":
				case "Ranger":
					this.data.spellcasting.casterSpells.spellCastingAbility = "wis";
					break;
				default:
					this.data.spellcasting.casterSpells.spellCastingAbility = "cha";
			}

			// set spell slots in case they changed full caster/half caster/arti half/warlock
			this.data.spellcasting.casterSpells.spellSlotList = getSpellSlots(sClass, this.data.spellcasting.casterSpells.casterLevel);
		},
		"data.spellcasting.casterSpells.casterLevel"(newValue) {
			if (newValue == null || newValue == undefined) {
				this.clearCasting();
				return;
			}

			// set spell slots when they change level
			this.data.spellcasting.casterSpells.spellSlotList = getSpellSlots(this.data.spellcasting.casterSpells.castingClass, this.data.spellcasting.casterSpells.casterLevel);
		},
		innateSpells: {
			handler() {
				let list = this.data.spellcasting.innateSpells.spellList;
				// add spells to our data that we did not have in our statblock data yet but we did in our editor data
				for (let times in this.innateSpells) {
					for (let spell in this.innateSpells[times]) {
						// the spell is not in our stat block data yet, so we add it.
						// @ts-ignore
						if (!list[times].map((obj) => obj.spell).includes(this.innateSpells[times][spell])) {
							list[times].push({
								// @ts-ignore
								spell: this.innateSpells[times][spell],
								comment: ""
							});
						}
					}
				}

				// remove spells that we have in the statblock data but not in the editor data
				for (let times in list) {
					for (let spell in list[times]) {
						//@ts-ignore
						if (!this.innateSpells[times].includes(list[times][spell].spell)) delete list[times][spell];
					}
					// remove all falsy (null/undefined/etc) from our array which delete leaves behind.
					list[times] = list[times].filter(Boolean);
				}
			},
			deep: true
		},
		"data.description.cr"() {
			this.data.core.proficiencyBonus = Math.max(2, Math.min(9, Math.floor((this.data.description.cr + 3) / 4)) + 1);

			// this.data.description.xp = getXPbyCR(this.data.description.cr);
			this.data.description.xp = ChallengeRatingTable[this.data.description.cr].xp;
		},
		"data.description.name"() {
			document.title = `${this?.data.description.name.substring(0, 16)} | Bestiary Builder`;
		}
	},
	beforeRouteUpdate() {
		// just in case the user manages to navigate to a page that also uses StatblockEditorView
		if (this.madeChanges && (this.isOwner || this.isEditor)) {
			const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
			if (!answer) return false;
		}
	},
	beforeRouteLeave() {
		// when the user leaves this route
		if (this.madeChanges && (this.isOwner || this.isEditor)) {
			const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
			if (!answer) return false;
		}
	}
});
</script>

<style scoped lang="less">
@import url("@/assets/styles/number-input.less");
@import url("@/assets/styles/mixins.less");
.content {
	display: grid;
	gap: 2rem;
	grid-template-columns: 1fr 1fr;
}

.content.is-statblock-only {
	grid-template-columns: 1fr;
	.content-container__inner {
		width: 60%;
		margin: auto;
	}
}
@media screen and (max-width: 1200px) {
	.content {
		grid-template-columns: 1fr;

		&.is-statblock-only .content-container__inner {
			width: 100%;
			margin: unset;
		}
	}
}

.content-container__inner:first-of-type {
	background-color: var(--color-surface-1);
}

.editor-nav {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
	text-align: center;
	height: fit-content;
	margin: 0 1px;
	background-color: rgb(48, 47, 47);
	&__tab {
		padding: 0.4rem 1rem;
		cursor: pointer;
		transition: 0.3s ease-in-out;
		transition-property: color background-color;
		background-color: unset;
		border: unset;
		border-bottom: 1px solid grey;
		color: rgb(201, 201, 201);

		&:hover {
			background-color: var(--color-surface-0);
			color: white;
		}

		&.active-slide {
			border-bottom-color: orangered;
			border-bottom-width: 1px;
			color: white;
			position: relative;
			transition: all 0.3s ease;
			&::before {
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				height: 2px;
				background-color: orangered;
				content: "";
			}
		}
	}
}

@media screen and (max-width: 1080px) {
	.editor-nav {
		grid-template-columns: 1fr 1fr 1fr;
	}
}
.two-wide {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
}

.editor-content {
	padding: 0.5rem 1rem;

	&__tab-inner {
		background-color: var(--color-surface-1);

		.group-header {
			text-align: center;
			margin-bottom: 0.5rem;
			border-bottom: 1px solid orangered;
		}

		.editor-field__container {
			width: 100%;
			display: grid;
			gap: 1rem 2rem;
			margin-bottom: 1rem;

			.flow-vertically {
				display: flex;
				flex-direction: column;
				gap: 0.3rem;

				.button-container p {
					display: flex;
					justify-content: space-between;
				}
			}

			.editor-field__title .text {
				font-weight: bold;
				text-decoration: underline;
			}

			&.one-wide {
				grid-template-columns: 1fr;
			}
			&.two-wide {
				grid-template-columns: 1fr 1fr;
			}

			&.three-wide {
				grid-template-columns: 1fr 1fr 1fr;
			}

			textarea {
				min-height: 46px;
				height: 46px;
			}
		}
	}
}

.button-icon {
	cursor: pointer;
	color: orangered;
	padding-top: 15px;
	padding-bottom: 8px;
	.scale-on-hover(1.2);
	margin: auto;
}

.feature-button__container {
	display: flex;
	gap: 0.5rem;
	justify-content: space-between;

	.delete-button {
		padding-top: 9px !important;
		.button-icon();
	}
}

@media screen and (max-width: 1080px) {
	.editor-content__tab-inner .editor-field__container.three-wide {
		grid-template-columns: 1fr 1fr;
	}
}

@media screen and (max-width: 950px) {
	.editor-content__tab-inner .editor-field__container:is(.two-wide, .three-wide) {
		grid-template-columns: 1fr;
	}
}
.scale-in {
	-webkit-animation: scale-in 0.2s ease-in-out;
	-moz-animation: scale-in 0.2s ease-in-out;
	animation: scale-in 0.2s ease-in-out;
}

@keyframes scale-in {
	0% {
		transform: scale(1);
		opacity: 0;
	}
	50% {
		transform: scale(1);
		opacity: 0.5;
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}

.editor hr {
	border-color: orangered;
}

.buttons {
	display: grid;
	gap: 1rem;
	grid-template-columns: 1fr;
	margin: 1rem 25%;
}

.handle {
	padding-top: 15px;
	padding-bottom: 8px;
	cursor: grab;
	color: orangered;

	&:active {
		cursor: grabbing;
	}
}

.unit-selector {
	height: 40px;
	translate: 0 5px;
}
</style>
