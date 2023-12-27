<template>
	<div class="content">
		<div class="content-container__inner editor">
			<div class="editor-nav">
				<div @click="showSlides(1)" :class="{'active-slide': slideIndex === 1}" class="editor-nav__tab">
					<span> Description </span>
				</div>
				<div @click="showSlides(2)" :class="{'active-slide': slideIndex === 2}" class="editor-nav__tab">
					<span> Core </span>
				</div>
				<div @click="showSlides(3)" :class="{'active-slide': slideIndex === 3}" class="editor-nav__tab">
					<span> Stats </span>
				</div>
				<div @click="showSlides(4)" :class="{'active-slide': slideIndex === 4}" class="editor-nav__tab">
					<span> Defenses </span>
				</div>
				<div @click="showSlides(5)" :class="{'active-slide': slideIndex === 5}" class="editor-nav__tab">
					<span> Features </span>
				</div>
				<div @click="showSlides(6)" :class="{'active-slide': slideIndex === 6}" class="editor-nav__tab">
					<span> Spells </span>
				</div>
			</div>

			<div class="editor-content">
				<div class="editor-content__tab-inner scale-in">
					<div class="editor-field__container two-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="name"><span class="text">Name</span></label>
							<input type="text" :maxlength="limits.nameLength" v-model="data.description.name" id="name" />
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="propernoun"><span class="text">Proper noun</span></label>
							<span> display as "{{ data.description.name }}" instead of "the {{ data.description.name }}" <input type="checkbox" v-model="data.description.isProperNoun" id="propernoun" /> </span>
						</div>
					</div>

					<div class="editor-field__container one-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="description">
								<span class="text">Description</span>
							</label>
							<textarea rows="10" :maxlength="limits.descriptionLength" v-model="data.description.description" />
						</div>
					</div>
					<div class="editor-field__container two-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="image"><span class="text">Image URL</span></label>
							<input type="text" v-model="data.description.image" id="image" :pattern="limits.imageFormats ? `(https:\/\/)(.+)(\\.${limits.imageFormats.join('|\\.')})` : ''" />
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="environment"><span class="text">Environment</span></label>
							<input type="text" v-model="data.description.environment" id="environment" />
						</div>
					</div>
					<div class="editor-field__container two-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="faction"><span class="text">Faction</span></label>
							<input type="text" v-model="data.description.faction" id="faction" />
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="alignment"><span class="text" v-tooltip="'Takes custom text input'">Alignment*</span></label>
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
						</div>
					</div>
					<div class="editor-field__container two-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="challengerating"><span class="text"> Challenge rating</span></label>
							<div class="quantity">
								<input type="number" v-model="data.description.cr" min="0" max="30" inputmode="numeric" id="challengerating" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="changeCR(true)" aria-label="Increase CR">+</div>
									<div class="quantity-button quantity-down" @click="changeCR(false)" aria-label="Decrease CR">-</div>
								</div>
							</div>
							<span> This determines Proficiency Bonus too. </span>
						</div>
					</div>
				</div>
				<div class="editor-content__tab-inner scale-in">
					<div class="editor-field__container two-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="race"><span class="text" v-tooltip="'Takes custom text input'">Race*</span></label>
							<v-select v-model="data.core.race" :options="['Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead']" :taggable="true" :pushTags="true" inputId="race" />
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="size"><span class="text" v-tooltip="'Takes custom text input'">Size*</span> </label>
							<v-select v-model="data.core.size" :options="['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']" :taggable="true" :pushTags="true" inputId="size" />
						</div>
					</div>
					<hr />
					<h2 class="group-header">Speed</h2>
					<div class="editor-field__container three-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="walkspeed"> <span class="text">Walk speed</span> </label>
							<div class="quantity">
								<input type="number" v-model="data.core.speed.walk" min="0" step="5" inputmode="numeric" id="walkspeed" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.core.speed.walk = data.core.speed.walk + 5" aria-label="Increase walk speed">+</div>
									<div class="quantity-button quantity-down" @click="data.core.speed.walk = Math.max(0, data.core.speed.walk - 5)" aria-label="Decrease walk speed">-</div>
								</div>
							</div>
						</div>

						<div class="flow-vertically">
							<label class="editor-field__title" for="flyspeed"><span class="text">Fly speed</span></label>
							<div class="quantity">
								<input type="number" v-model="data.core.speed.fly" min="0" step="5" inputmode="numeric" id="flyspeed" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.core.speed.fly = data.core.speed.fly + 5" aria-label="Increase fly speed">+</div>
									<div class="quantity-button quantity-down" @click="data.core.speed.fly = Math.max(0, data.core.speed.fly - 5)" aria-label="Decrease fly speed">-</div>
								</div>
							</div>
						</div>

						<div class="flow-vertically">
							<label class="editor-field__title" for="canhover"> <span class="text">Hover</span></label>
							<span>Hover yes/no <input type="checkbox" step="5" v-model="data.core.speed.isHover" id="canhover" /></span>
						</div>
					</div>

					<div class="editor-field__container three-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="swimspeed"> <span class="text">Swim speed</span> </label>
							<div class="quantity">
								<input type="number" v-model="data.core.speed.swim" min="0" step="5" inputmode="numeric" id="swimspeed" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.core.speed.swim = data.core.speed.swim + 5" aria-label="Increase swim speed">+</div>
									<div class="quantity-button quantity-down" @click="data.core.speed.swim = Math.max(0, data.core.speed.swim - 5)" aria-label="Decrease swim speed">-</div>
								</div>
							</div>
						</div>

						<div class="flow-vertically">
							<label class="editor-field__title" for="burrowspeed"><span class="text">Burrow speed</span> </label>
							<div class="quantity">
								<input type="number" v-model="data.core.speed.burrow" min="0" step="5" inputmode="numeric" id="burrowspeed" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.core.speed.burrow = data.core.speed.burrow + 5" aria-label="Increase burrow speed">+</div>
									<div class="quantity-button quantity-down" @click="data.core.speed.burrow = Math.max(0, data.core.speed.burrow - 5)" aria-label="Decrease burrow speed">-</div>
								</div>
							</div>
						</div>

						<div class="flow-vertically">
							<label class="editor-field__title" for="climbspeed"><span class="text">Climb speed</span> </label>
							<div class="quantity">
								<input type="number" v-model="data.core.speed.climb" min="0" step="5" inputmode="numeric" id="climbspeed" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.core.speed.climb = data.core.speed.climb + 5" aria-label="Increase climb speed">+</div>
									<div class="quantity-button quantity-down" @click="data.core.speed.climb = Math.max(0, data.core.speed.climb - 5)" aria-label="Decrease climb speed">-</div>
								</div>
							</div>
						</div>
					</div>
					<hr />
					<h2 class="group-header">Senses</h2>
					<div class="editor-field__container three-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="darkvision"> <span class="text">Darkvision</span> </label>
							<div class="quantity">
								<input type="number" v-model="data.core.senses.darkvision" min="0" step="5" inputmode="numeric" id="darkvision" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.core.senses.darkvision = data.core.senses.darkvision + 5" aria-label="Increase darkvision">+</div>
									<div class="quantity-button quantity-down" @click="data.core.senses.darkvision = Math.max(0, data.core.senses.darkvision - 5)" aria-label="Decrease darkvision">-</div>
								</div>
							</div>
						</div>

						<div class="flow-vertically">
							<label class="editor-field__title" for="blindsight"> <span class="text">Blindsight</span> </label>
							<div class="quantity">
								<input type="number" v-model="data.core.senses.blindsight" min="0" step="5" inputmode="numeric" id="blindsight" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.core.senses.blindsight = data.core.senses.blindsight + 5" aria-label="Increase blindsight">+</div>
									<div class="quantity-button quantity-down" @click="data.core.senses.blindsight = Math.max(0, data.core.senses.blindsight - 5)" aria-label="Decrease blindsight">-</div>
								</div>
							</div>
						</div>

						<div class="flow-vertically">
							<label class="editor-field__title" for="canhover"><span class="text">Blind beyond</span></label>
							<span>this radius? <input type="checkbox" step="5" v-model="data.core.speed.isHover" id="canhover" /></span>
						</div>
					</div>

					<div class="editor-field__container three-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="truesight"> <span class="text">Truesight</span> </label>
							<div class="quantity">
								<input type="number" v-model="data.core.senses.truesight" min="0" step="5" inputmode="numeric" id="truesight" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.core.senses.truesight = data.core.senses.truesight + 5" aria-label="Increase truesight">+</div>
									<div class="quantity-button quantity-down" @click="data.core.senses.truesight = Math.max(0, data.core.senses.truesight - 5)" aria-label="Decrease truesight">-</div>
								</div>
							</div>
						</div>

						<div class="flow-vertically">
							<label class="editor-field__title" for="tremorsense"> <span class="text">Tremorsense</span> </label>
							<div class="quantity">
								<input type="number" v-model="data.core.senses.tremorsense" min="0" step="5" inputmode="numeric" id="tremorsense" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.core.senses.tremorsense = data.core.senses.tremorsense + 5" aria-label="Increase tremorsense">+</div>
									<div class="quantity-button quantity-down" @click="data.core.senses.tremorsense = Math.max(0, data.core.senses.tremorsense - 5)" aria-label="Decrease tremorsense">-</div>
								</div>
							</div>
						</div>

						<div class="flow-vertically">
							<label class="editor-field__title" for="passiveperc"> <span class="text">Passive perc override</span> </label>
							<div class="quantity">
								<input type="number" v-model="data.core.senses.passivePerceptionOverride" min="0" step="1" inputmode="numeric" id="passiveperc" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.core.senses.passivePerceptionOverride = (data.core.senses.passivePerceptionOverride ?? 0) + 1" aria-label="Increase passive perception override">+</div>
									<div class="quantity-button quantity-down" @click="data.core.senses.passivePerceptionOverride = Math.max(0, (data.core.senses.passivePerceptionOverride ?? 0) - 1)" aria-label="Decrease passive perception override">-</div>
								</div>
								<span class="delete-button" @click="data.core.senses.passivePerceptionOverride = null" aria-label="Delete passive perception override">🗑️</span>
							</div>
						</div>
					</div>
					<hr />
					<div class="editor-field__container three-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="languages"><span class="text" v-tooltip="'Takes custom text input'">Languages*</span></label>
							<v-select placeholder="Select a Language or type one yourself" v-model="data.core.languages" multiple :deselectFromDropdown="true" :closeOnSelect="false" :options="languages" :taggable="true" :pushTags="true" inputId="languages" />
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="telepathy"><span class="text">Telepathy</span></label>
							<div class="quantity">
								<input type="number" v-model="data.core.senses.telepathy" min="0" step="5" inputmode="numeric" id="telepathy" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.core.senses.telepathy = data.core.senses.telepathy + 5" aria-label="Increase telepathy">+</div>
									<div class="quantity-button quantity-down" @click="data.core.senses.telepathy = Math.max(0, data.core.senses.telepathy - 5)" aria-label="Decrease telepathy">-</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="editor-content__tab-inner scale-in">
					<h2 class="group-header">Ability Scores</h2>
					<div class="editor-field__container three-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="strstat"><span class="text">Strength</span>💪</label>
							<div class="quantity">
								<input type="number" v-model="data.abilities.stats.str" min="1" step="30" inputmode="numeric" id="strstat" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.abilities.stats.str = Math.min(30, data.abilities.stats.str + 1)" aria-label="Increase strength stat">+</div>
									<div class="quantity-button quantity-down" @click="data.abilities.stats.str = Math.max(1, data.abilities.stats.str - 1)" aria-label="Decrease strength stat">-</div>
								</div>
							</div>
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="dexstat"><span class="text">Dexterity</span>🤸</label>
							<div class="quantity">
								<input type="number" v-model="data.abilities.stats.dex" min="1" step="30" inputmode="numeric" id="dexstat" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.abilities.stats.dex = Math.min(30, data.abilities.stats.dex + 1)" aria-label="Increase dexterity stat">+</div>
									<div class="quantity-button quantity-down" @click="data.abilities.stats.dex = Math.max(1, data.abilities.stats.dex - 1)" aria-label="Decrease dexterity stat">-</div>
								</div>
							</div>
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="constat"><span class="text">Constitution</span>💗</label>
							<div class="quantity">
								<input type="number" v-model="data.abilities.stats.con" min="1" step="30" inputmode="numeric" id="constat" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.abilities.stats.con = Math.min(30, data.abilities.stats.con + 1)" aria-label="Increase constitution stat">+</div>
									<div class="quantity-button quantity-down" @click="data.abilities.stats.con = Math.max(1, data.abilities.stats.con - 1)" aria-label="Decrease constitution stat">-</div>
								</div>
							</div>
						</div>
					</div>
					<div class="editor-field__container three-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="intstat"><span class="text">Intelligence</span>🧠</label>
							<div class="quantity">
								<input type="number" v-model="data.abilities.stats.int" min="1" step="30" inputmode="numeric" id="intstat" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.abilities.stats.int = Math.min(30, data.abilities.stats.int + 1)" aria-label="Increase intelligence stat">+</div>
									<div class="quantity-button quantity-down" @click="data.abilities.stats.int = Math.max(1, data.abilities.stats.int - 1)" aria-label="Decrease intelligence stat">-</div>
								</div>
							</div>
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="wisstat"><span class="text">Wisdom</span>🦉</label>
							<div class="quantity">
								<input type="number" v-model="data.abilities.stats.wis" min="1" step="30" inputmode="numeric" id="wisstat" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.abilities.stats.wis = Math.min(30, data.abilities.stats.wis + 1)" aria-label="Increase wisdom stat">+</div>
									<div class="quantity-button quantity-down" @click="data.abilities.stats.wis = Math.max(1, data.abilities.stats.wis - 1)" aria-label="Decrease wisdom stat">-</div>
								</div>
							</div>
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="chastat"><span class="text">Charisma</span>🎭</label>
							<div class="quantity">
								<input type="number" v-model="data.abilities.stats.cha" min="1" step="30" inputmode="numeric" id="chastat" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.abilities.stats.cha = Math.min(30, data.abilities.stats.cha + 1)" aria-label="Increase charisma stat">+</div>
									<div class="quantity-button quantity-down" @click="data.abilities.stats.cha = Math.max(1, data.abilities.stats.cha - 1)" aria-label="Decrease charisma stat">-</div>
								</div>
							</div>
						</div>
					</div>
					<hr />
					<h2 class="group-header">Saving Throws</h2>
					<div class="editor-field__container three-wide">
						<div class="flow-vertically">
							<span class="editor-field__title"><span class="text">Strength</span>💪</span>
							<div>
								<p>
									<label for="strsaveprof" aria-label="strength save proficiency">Proficient</label>
									<input type="checkbox" v-model="data.abilities.saves.str.isProficient" id="strsaveprof" />
								</p>

								<div>
									<label for="strsave" aria-label="strength save override"> Override </label>
									<div class="quantity">
										<input type="number" v-model="data.abilities.saves.str.override" inputmode="numeric" id="strsave" />
										<div class="quantity-nav">
											<div class="quantity-button quantity-up" @click="data.abilities.saves.str.override = (data.abilities.saves.str.override ?? 0) + 1" aria-label="Increase strength save override">+</div>
											<div class="quantity-button quantity-down" @click="data.abilities.saves.str.override = (data.abilities.saves.str.override ?? 0) - 1" aria-label="Decrease strength save override">-</div>
										</div>
										<span class="delete-button" @click="data.abilities.saves.str.override = null" aria-label="Delete strength save override">🗑️</span>
									</div>
								</div>
							</div>
						</div>
						<div class="flow-vertically">
							<span class="editor-field__title"> <span class="text">Dexterity</span>🤸</span>
							<div>
								<p>
									<label for="dexsaveprof" aria-label="dexterity save proficiency">Proficient</label>
									<input type="checkbox" v-model="data.abilities.saves.dex.isProficient" id="dexsaveprof" />
								</p>

								<div>
									<label for="dexsave" aria-label="dexterity save override"> Override </label>
									<div class="quantity">
										<input type="number" v-model="data.abilities.saves.dex.override" inputmode="numeric" id="dexsave" />
										<div class="quantity-nav">
											<div class="quantity-button quantity-up" @click="data.abilities.saves.dex.override = (data.abilities.saves.dex.override ?? 0) + 1" aria-label="Increase dexterity save override">+</div>
											<div class="quantity-button quantity-down" @click="data.abilities.saves.dex.override = (data.abilities.saves.dex.override ?? 0) - 1" aria-label="Decrease dexterity save override">-</div>
										</div>
										<span class="delete-button" @click="data.abilities.saves.dex.override = null" aria-label="Delete dexterity save override">🗑️</span>
									</div>
								</div>
							</div>
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title"> <span class="text">Constitution</span>💗</label>
							<div>
								<p>
									<label for="consaveprof" aria-label="constitution save proficiency">Proficient</label>
									<input type="checkbox" v-model="data.abilities.saves.con.isProficient" id="consaveprof" />
								</p>

								<div>
									<label for="consave" aria-label="constitution save override"> Override </label>
									<div class="quantity">
										<input type="number" v-model="data.abilities.saves.con.override" inputmode="numeric" id="consave" />
										<div class="quantity-nav">
											<div class="quantity-button quantity-up" @click="data.abilities.saves.con.override = (data.abilities.saves.con.override ?? 0) + 1" aria-label="Increase constitution save override">+</div>
											<div class="quantity-button quantity-down" @click="data.abilities.saves.con.override = (data.abilities.saves.con.override ?? 0) - 1" aria-label="Decrease constitution save override">-</div>
										</div>
										<span class="delete-button" @click="data.abilities.saves.con.override = null" aria-label="Delete constitution save override">🗑️</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="editor-field__container three-wide">
						<div class="flow-vertically">
							<span class="editor-field__title"><span class="text">Intelligence</span>🧠</span>
							<div>
								<p>
									<label for="intsaveprof" aria-label="intelligence save proficiency">Proficient</label>
									<input type="checkbox" v-model="data.abilities.saves.int.isProficient" id="intsaveprof" />
								</p>

								<div>
									<label for="intsave" aria-label="intelligence save override"> Override </label>
									<div class="quantity">
										<input type="number" v-model="data.abilities.saves.int.override" inputmode="numeric" id="intsave" />
										<div class="quantity-nav">
											<div class="quantity-button quantity-up" @click="data.abilities.saves.int.override = (data.abilities.saves.int.override ?? 0) + 1" aria-label="Increase intelligence save override">+</div>
											<div class="quantity-button quantity-down" @click="data.abilities.saves.int.override = (data.abilities.saves.int.override ?? 0) - 1" aria-label="Decrease intelligence save override">-</div>
										</div>
										<span class="delete-button" @click="data.abilities.saves.int.override = null" aria-label="Delete intelligence save override">🗑️</span>
									</div>
								</div>
							</div>
						</div>
						<div class="flow-vertically">
							<span class="editor-field__title"><span class="text">Wisdom</span>🦉</span>
							<div>
								<p>
									<label for="wissaveprof" aria-label="wisdom save proficiency">Proficient</label>
									<input type="checkbox" v-model="data.abilities.saves.wis.isProficient" id="wissaveprof" />
								</p>

								<div>
									<label for="wissave" aria-label="wisdom save override">Override</label>
									<div class="quantity">
										<input type="number" v-model="data.abilities.saves.wis.override" inputmode="numeric" id="wissave" />
										<div class="quantity-nav">
											<div class="quantity-button quantity-up" @click="data.abilities.saves.wis.override = (data.abilities.saves.wis.override ?? 0) + 1" aria-label="Increase wisdom save override">+</div>
											<div class="quantity-button quantity-down" @click="data.abilities.saves.wis.override = (data.abilities.saves.wis.override ?? 0) - 1" aria-label="Decrease wisdom save override">-</div>
										</div>
										<span class="delete-button" @click="data.abilities.saves.wis.override = null" aria-label="Delete wisdom save override">🗑️</span>
									</div>
								</div>
							</div>
						</div>
						<div class="flow-vertically">
							<span class="editor-field__title"><span class="text">Charisma</span>🎭</span>
							<div>
								<p>
									<label for="chasaveprof" aria-label="charisma save proficiency">Proficient</label>
									<input type="checkbox" v-model="data.abilities.saves.cha.isProficient" id="chasaveprof" />
								</p>
								<div>
									<label for="chasave" aria-label="charisma save override"> Override </label>
									<div class="quantity">
										<input type="number" v-model="data.abilities.saves.cha.override" inputmode="numeric" id="chasave" />
										<div class="quantity-nav">
											<div class="quantity-button quantity-up" @click="data.abilities.saves.cha.override = (data.abilities.saves.cha.override ?? 0) + 1" aria-label="Increase charisma save override">+</div>
											<div class="quantity-button quantity-down" @click="data.abilities.saves.cha.override = (data.abilities.saves.cha.override ?? 0) - 1" aria-label="Decrease charisma save override">-</div>
										</div>
										<span class="delete-button" @click="data.abilities.saves.cha.override = null" aria-label="Delete charisma save override">🗑️</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					<hr />
					<h2 class="group-header">Skills</h2>
					<div class="editor-field__container two-wide">
						<div v-for="(skill, index) in data.abilities.skills" class="flow-vertically">
							<v-select
								placeholder="Select a skill"
								v-model="skill.skillName"
								:options="['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival']"
								:clearable="false"
							/>
							<div class="button-container">
								<p><label :for="skill.skillName + 'prof'"> Proficient</label> <input type="checkbox" v-model="skill.isProficient" @click="disableOtherSkills(index, 'prof', skill.isProficient)" :id="skill.skillName + 'prof'" /></p>
								<p><label :for="skill.skillName + 'exp'"> Expertise </label> <input type="checkbox" v-model="skill.isExpertise" @click="disableOtherSkills(index, 'exp', skill.isExpertise)" :id="skill.skillName + 'exp'" /></p>
								<p><label :for="skill.skillName + 'halfprof'"> Half prof </label> <input type="checkbox" v-model="skill.isHalfProficient" @click="disableOtherSkills(index, 'halfprof', skill.isHalfProficient)" :id="skill.skillName + 'halfprof'" /></p>
							</div>
							<div>
								<label :aria-label="skill.skillName + ' check override'" :for="skill.skillName + 'override'"> Override </label>
								<div class="quantity">
									<input type="number" v-model="skill.override" step="1" inputmode="numeric" :id="skill.skillName + 'override'" />
									<div class="quantity-nav">
										<div class="quantity-button quantity-up" @click="skill.override = (skill.override ?? 0) + 1" :aria-label="'Increase ' + skill.skillName + ' check override'">+</div>
										<div class="quantity-button quantity-down" @click="skill.override = Math.max(0, (skill.override ?? 0) - 1)" :aria-label="'Decrease ' + skill.skillName + ' check override'">-</div>
									</div>
									<span class="delete-button" @click="skill.override = null" :aria-label="'Delete ' + skill.skillName + ' override'">🗑️</span>
								</div>
							</div>
							<button class="btn" @click="deleteSkill(index)">delete</button>
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="addnewskill"><span class="text">Add New Skill</span></label>
							<button class="btn editor-field__plus-button" id="addnewskill" @click="addNewSkill()">New Skill</button>
						</div>
					</div>
				</div>
				<div class="editor-content__tab-inner scale-in">
					<div class="editor-field__container three-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="hitdiesize"><span class="text">Hit Die Size</span>🎲</label>
							<div class="quantity">
								<input type="number" v-model="data.defenses.hp.sizeOfHitDie" min="0" step="2" inputmode="numeric" id="hitdiesize" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.defenses.hp.sizeOfHitDie = data.defenses.hp.sizeOfHitDie + 2" aria-label="Increase hit die size">+</div>
									<div class="quantity-button quantity-down" @click="data.defenses.hp.sizeOfHitDie = Math.max(0, data.defenses.hp.sizeOfHitDie - 2)" aria-label="Decrease hit die size">-</div>
								</div>
							</div>
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="hitdienum"><span class="text">Hit Die Number</span>🔢</label>
							<div class="quantity">
								<input type="number" v-model="data.defenses.hp.numOfHitDie" min="1" inputmode="numeric" id="hitdienum" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.defenses.hp.numOfHitDie = data.defenses.hp.numOfHitDie + 1" aria-label="Increase hit die number">+</div>
									<div class="quantity-button quantity-down" @click="data.defenses.hp.numOfHitDie = Math.max(1, data.defenses.hp.numOfHitDie - 1)" aria-label="Decrease hit die number">-</div>
								</div>
							</div>
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="hpoverride"><span class="text">HP Override</span>💗</label>
							<div class="quantity">
								<input type="number" v-model="data.defenses.hp.override" min="1" step="1" inputmode="numeric" id="hpoverride" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.defenses.hp.override = (data.defenses.hp.override ?? 0) + 1" aria-label="Increase hit die number">+</div>
									<div class="quantity-button quantity-down" @click="data.defenses.hp.override = Math.max(1, (data.defenses.hp.override ?? 0) - 1)" aria-label="Decrease hit die number">-</div>
								</div>
								<span class="delete-button" @click="data.defenses.hp.override = null" aria-label="Delete HP override">🗑️</span>
							</div>
						</div>
					</div>
					<hr />
					<div class="editor-field__container two-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="ac"><span class="text">Armor Class</span>🛡️</label>
							<div class="quantity">
								<input type="number" v-model="data.defenses.ac.ac" min="0" step="1" inputmode="numeric" id="ac" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.defenses.ac.ac = data.defenses.ac.ac + 1" aria-label="Increase armor class">+</div>
									<div class="quantity-button quantity-down" @click="data.defenses.ac.ac = Math.max(0, data.defenses.ac.ac - 1)" aria-label="Decrease armor class">-</div>
								</div>
							</div>
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="acsource"><span class="text">Armor Class Source</span></label>
							<input type="text" v-model="data.defenses.ac.acSource" />
						</div>
					</div>
					<hr />
					<div class="editor-field__container two-wide">
						<div class="flow-vertically">
							<label for="vulnerabilities" class="editor-field__title"><span class="text" v-tooltip="'Takes custom text input'">Vulnerabilities*</span></label>
							<v-select
								placeholder="type vulnerabilities..."
								v-model="data.defenses.vulnerabilities"
								multiple
								:deselectFromDropdown="true"
								:closeOnSelect="false"
								:options="[
									'Acid',
									'Bludgeoning',
									'Cold',
									'Fire',
									'Force',
									'Lightning',
									'Necrotic',
									'Piercing',
									'Poison',
									'Psychic',
									'Radiant',
									'Slashing',
									'Thunder',
									'Nonmagical Bludgeoning',
									'Nonmagical Piercing',
									'Nonmagical Slashing',
									'Nonmagical Nonsilvered Bludgeoning',
									'Nonmagical Nonsilvered Piercing',
									'Nonmagical Nonsilvered Slashing'
								]"
								:taggable="true"
								:pushTags="true"
								id="vulnerabilities"
							/>
						</div>
						<div class="flow-vertically">
							<label for="resistances" class="editor-field__title"><span class="text" v-tooltip="'Takes custom text input'">Resistances*</span></label>
							<v-select
								placeholder="type resistances..."
								v-model="data.defenses.resistances"
								multiple
								:deselectFromDropdown="true"
								:closeOnSelect="false"
								:options="[
									'Acid',
									'Bludgeoning',
									'Cold',
									'Fire',
									'Force',
									'Lightning',
									'Necrotic',
									'Piercing',
									'Poison',
									'Psychic',
									'Radiant',
									'Slashing',
									'Thunder',
									'Nonmagical Bludgeoning',
									'Nonmagical Piercing',
									'Nonmagical Slashing',
									'Nonmagical Nonsilvered Bludgeoning',
									'Nonmagical Nonsilvered Piercing',
									'Nonmagical Nonsilvered Slashing'
								]"
								:taggable="true"
								:pushTags="true"
								id="resistances"
							/>
						</div>
						<div class="flow-vertically">
							<label for="immunities" class="editor-field__title"><span class="text" v-tooltip="'Takes custom text input'">Immunities*</span></label>
							<v-select
								placeholder="type immunities..."
								v-model="data.defenses.immunities"
								multiple
								:deselectFromDropdown="true"
								:closeOnSelect="false"
								:options="[
									'Acid',
									'Bludgeoning',
									'Cold',
									'Fire',
									'Force',
									'Lightning',
									'Necrotic',
									'Piercing',
									'Poison',
									'Psychic',
									'Radiant',
									'Slashing',
									'Thunder',
									'Nonmagical Bludgeoning',
									'Nonmagical Piercing',
									'Nonmagical Slashing',
									'Nonmagical Nonsilvered Bludgeoning',
									'Nonmagical Nonsilvered Piercing',
									'Nonmagical Nonsilvered Slashing'
								]"
								:taggable="true"
								:pushTags="true"
								id="immunities"
							/>
						</div>
						<div class="flow-vertically">
							<label for="conimmunities" class="editor-field__title"><span class="text" v-tooltip="'Takes custom text input'">Condition Immunities*</span></label>
							<v-select
								placeholder="type condition immunities..."
								v-model="data.defenses.conditionImmunities"
								multiple
								:deselectFromDropdown="true"
								:closeOnSelect="false"
								:options="['Blinded', 'Charmed', 'Deafened', 'Disease', 'Exhaustion', 'Frightened', 'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious']"
								:taggable="true"
								:pushTags="true"
								id="conimmunities"
							/>
						</div>
					</div>
				</div>
				<div class="editor-content__tab-inner scale-in">
					<div v-for="(descText, fType) in featureGenerator">
						<h2 class="group-header">{{ descText.replace("New ", "") }}s</h2>
						<div class="editor-field__container two-wide">
							<div class="flow-vertically" v-for="(feature, index) in data.features[fType]">
								<label class="editor-field__title" :for="fType + index"
									><span class="text">{{ feature.name }}</span></label
								>
								<div class="feature-button__container">
									<FeatureWidget :index="index" :type="fType" :data="data" />
									<span class="delete-button" @click="deleteFeature(fType, index)" aria-label="Delete feature">🗑️</span>
									<div class="moving-buttons">
										<span @click="moveFeature(true, fType, index)">▲</span>
										<span @click="moveFeature(false, fType, index)">▼</span>
									</div>
								</div>
							</div>

							<div class="flow-vertically">
								<label class="editor-field__title" :for="'new' + fType"
									><span class="text">{{ descText }}</span></label
								>
								<button class="btn" @click="createNewFeature(fType)" :id="'new' + fType">Create</button>
							</div>

							<div class="flow-vertically" v-if="data.features[fType].length > 0">
								<label class="editor-field__title" :for="'headertext' + fType"><span class="text"> Section Header </span></label>
								<textarea v-model="data.misc.featureHeaderTexts[fType]" />
							</div>

							<div class="flow-vertically" v-if="fType == 'legendary' && data.features[fType].length > 0">
								<label class="editor-field__title" for="legactionsperround"><span class="text">Legendary Actions / Round</span></label>
								<div class="quantity">
									<input type="number" v-model="data.misc.legActionsPerRound" min="1" step="1" inputmode="numeric" id="legactionsperround" />
									<div class="quantity-nav">
										<div class="quantity-button quantity-up" @click="data.misc.legActionsPerRound = data.misc.legActionsPerRound + 1" aria-label="Increase legendary actions per round">+</div>
										<div class="quantity-button quantity-down" @click="data.misc.legActionsPerRound = Math.max(1, data.misc.legActionsPerRound - 1)" aria-label="Decrease legendary actions per round">-</div>
									</div>
								</div>
							</div>
						</div>
						<hr v-if="fType !== 'regional'" />
					</div>
				</div>
				<div class="editor-content__tab-inner scale-in">
					<h2 class="group-header">Innate Spellcasting</h2>
					<div class="editor-field__container two-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="innateability"><span class="text">Spellcasting Ability</span></label>
							<p>
								<v-select :options="['str', 'dex', 'con', 'wis', 'int', 'cha']" v-model="data.spellcasting.innateSpells.spellCastingAbility" inputId="innateability" />
								<span class="delete-button" @click="data.spellcasting.innateSpells.spellCastingAbility = null" aria-label="Delete innate spellcasting ability">🗑️</span>
							</p>
						</div>
						<div class="flow-vertically">
							<label for="notcomponents" class="editor-field__title"><span class="text">Not these components</span></label>
							<v-select :options="['Material', 'Verbal', 'Somatic']" v-model="data.spellcasting.innateSpells.noComponentsOfType" multiple :deselectFromDropdown="true" :closeOnSelect="false" inputId="notcomponents" />
						</div>
					</div>
					<div class="editor-field__container two-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="innateDcOverride"><span class="text">DC override</span> </label>
							<div class="quantity">
								<input type="number" v-model="data.spellcasting.innateSpells.spellDcOverride" min="0" step="1" inputmode="numeric" id="innateDcOverride" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.spellcasting.innateSpells.spellDcOverride = (data.spellcasting.innateSpells.spellDcOverride ?? 0) + 1" aria-label="Increase innate spellcasting dc override">+</div>
									<div class="quantity-button quantity-down" @click="data.spellcasting.innateSpells.spellDcOverride = Math.max(0, (data.spellcasting.innateSpells.spellDcOverride ?? 0) - 1)" aria-label="Decrease innate spellcasting dc override">-</div>
								</div>
								<span class="delete-button" @click="data.spellcasting.innateSpells.spellDcOverride = null" aria-label="Delete innate spellcasting dc override">🗑️</span>
							</div>
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="innateBonusOverride"><span class="text">Attack bonus override</span> </label>
							<div class="quantity">
								<input type="number" v-model="data.spellcasting.innateSpells.spellBonusOverride" step="1" inputmode="numeric" id="innateBonusOverride" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.spellcasting.innateSpells.spellBonusOverride = (data.spellcasting.innateSpells.spellBonusOverride ?? 0) + 1" aria-label="Increase innate spellcasting attack bonus override">+</div>
									<div class="quantity-button quantity-down" @click="data.spellcasting.innateSpells.spellBonusOverride = (data.spellcasting.innateSpells.spellBonusOverride ?? 0) - 1" aria-label="Decrease innate spellcasting attack bonus override">-</div>
								</div>
								<span class="delete-button" @click="data.spellcasting.innateSpells.spellBonusOverride = null" aria-label="Delete innate spellcasting dc override">🗑️</span>
							</div>
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="atwillspells"><span class="text">At will</span></label>
							<v-select :options="spellListFlattened" v-model="innateSpells[0]" multiple :deselectFromDropdown="true" :closeOnSelect="false" inputId="atwillspells" />
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="onceperday"><span class="text">1/day</span></label>
							<v-select :options="spellListFlattened" v-model="innateSpells[1]" multiple :deselectFromDropdown="true" :closeOnSelect="false" inputId="onceperday" />
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="twiceperday"><span class="text">2/day</span></label>
							<v-select :options="spellListFlattened" v-model="innateSpells[2]" multiple :deselectFromDropdown="true" :closeOnSelect="false" inputId="twiceperday" />
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="thriceperday"><span class="text">3/day</span></label>
							<v-select :options="spellListFlattened" v-model="innateSpells[3]" multiple :deselectFromDropdown="true" :closeOnSelect="false" inputId="thriceperday" />
						</div>

						<div class="flow-vertically">
							<label class="editor-field__title" for="ispionics"> <span class="text">is psionics? </span></label>
							<span> display as psionics? <input type="checkbox" v-model="data.spellcasting.innateSpells.isPsionics" id="ispsionics" /> </span>
						</div>

						<div class="flow-vertically">
							<label class="editor-field__title" for="innatedisplayasaction"> <span class="text">display as action? </span></label>
							<span> should this display as an action? <input type="checkbox" v-model="data.spellcasting.innateSpells.displayAsAction" id="innatedisplayasaction" /> </span>
						</div>

						<div class="flow-vertically">
							<label class="editor-field__title" for="openspelldialog"> <span class="text">edit specific spells</span></label>
							<button>Edit cast level/add comment</button>
						</div>
					</div>

					<!-- TODO: Implement this in a modal 
                    <p> spell list
                    <div v-for="times in data.spellcasting.innateSpells.spellList">
                        <div v-if="times.length>0">
                            <div v-for="spell in times">
                                <b>{{ spell.spell }}</b> override level <input type="number" min=0 max="20" v-model="spell.upcastLevel"> <button class="btn"@click="spell.upcastLevel = null"> reset </button>

                                <input type="text" v-model="spell.comment" placeholder="comment" />
                            </div>
                        </div>
                    </div>
                </p> -->
					<hr />
					<h2 class="group-header">class spellcasting</h2>
					<div class="editor-field__container two-wide">
						<div class="flow-vertically">
							<label class="editor-field__title" for="castingclass"><span class="text">class</span></label>
							<v-select v-model="data.spellcasting.casterSpells.castingClass" :options="['Artificer', 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard']" inputId="castingclass" />
						</div>
						<div class="flow-vertically">
							<label class="editor-field__title" for="castinglevel"><span class="text">class level</span></label>
							<v-select v-model="data.spellcasting.casterSpells.casterLevel" :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]" inputId="castinglevel" />
						</div>

						<div class="flow-vertically">
							<label class="editor-field__title" for="casterDcOverride"><span class="text">dc override</span> </label>
							<div class="quantity">
								<input type="number" v-model="data.spellcasting.casterSpells.spellDcOverride" min="0" step="1" inputmode="numeric" id="casterDcOverride" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.spellcasting.casterSpells.spellDcOverride = (data.spellcasting.casterSpells.spellDcOverride ?? 0) + 1" aria-label="Increase spellcasting dc override">+</div>
									<div class="quantity-button quantity-down" @click="data.spellcasting.casterSpells.spellDcOverride = Math.max(0, (data.spellcasting.casterSpells.spellDcOverride ?? 0) - 1)" aria-label="Decrease spellcasting dc override">-</div>
								</div>
								<span class="delete-button" @click="data.spellcasting.casterSpells.spellDcOverride = null" aria-label="Delete spellcasting dc override">🗑️</span>
							</div>
						</div>

						<div class="flow-vertically">
							<label class="editor-field__title" for="casterBonusOverride"><span class="text">attack bonus override</span> </label>
							<div class="quantity">
								<input type="number" v-model="data.spellcasting.casterSpells.spellBonusOverride" step="1" inputmode="numeric" id="casterBonusOverride" />
								<div class="quantity-nav">
									<div class="quantity-button quantity-up" @click="data.spellcasting.casterSpells.spellBonusOverride = (data.spellcasting.casterSpells.spellBonusOverride ?? 0) + 1" aria-label="Increase spellcasting attack bonus override">+</div>
									<div class="quantity-button quantity-down" @click="data.spellcasting.casterSpells.spellBonusOverride = (data.spellcasting.casterSpells.spellBonusOverride ?? 0) - 1" aria-label="Decrease spellcasting attack bonus override">-</div>
								</div>
								<span class="delete-button" @click="data.spellcasting.casterSpells.spellBonusOverride = null" aria-label="Delete spellcasting dc override">🗑️</span>
							</div>
						</div>

						<div class="flow-vertically">
							<label class="editor-field__title" for="castingabilityoverride"><span class="text">ability override</span></label>
							<p>
								<v-select :options="['str', 'dex', 'con', 'wis', 'int', 'cha']" v-model="data.spellcasting.casterSpells.spellCastingAbilityOverride" inputId="castingabilityoverride" />
								<span class="delete-button" @click="data.spellcasting.casterSpells.spellCastingAbilityOverride = null" aria-label="Delete spellcasting ability override">🗑️</span>
							</p>
						</div>
					</div>

					<div v-if="data.spellcasting.casterSpells.castingClass" class="editor-field__container two-wide">
						<div class="flow-vertically" v-if="!['Ranger', 'Paladin'].includes(data.spellcasting.casterSpells.castingClass)">
							<label class="edit-field__title" for="cantrips"> <span class="text">cantrips</span> </label>
							<v-select v-model="data.spellcasting.casterSpells.spellList[0]" :options="spellList[0]" multiple :deselectFromDropdown="true" :closeOnSelect="false" :taggable="true" :pushTags="true" inputId="cantrips" />
						</div>
						<div class="flow-vertically" v-for="level in spellLevelList()">
							<label class="edit-field__title" :for="'levelspells' + level"
								><span class="text">level {{ level }}</span></label
							>
							<v-select v-model="data.spellcasting.casterSpells.spellList[level]" :options="getSpellsByLevel(level)" multiple :deselectFromDropdown="true" :closeOnSelect="false" :taggable="true" :pushTags="true" :inputId="'levelspells' + level" />
						</div>
					</div>
				</div>
			</div>

			<hr />

			<div class="save-button">
				<button class="btn" @click="isModalOpen = true">Import from 5e.tools</button>
			</div>
			<div class="save-button">
				<button class="btn" @click="saveStatblock()">Save statblock</button>
			</div>
		</div>
		<div class="content-container__inner">
			<StatblockRenderer :data="data" />
		</div>
	</div>

	<Teleport to="#modal">
		<Transition name="modal">
			<div class="modal__bg" v-if="isModalOpen">
				<section class="modal__content modal__small" ref="modal">
					<button @click="isModalOpen = false" class="modal__close-button" aria-label="Close Modal" type="button"><font-awesome-icon icon="fa-solid fa-xmark" /></button>
					<h2 class="modal-header">import from 5e tools</h2>

					<div class="modal-desc">
						<p>
							<b>CritterDB json input: </b>
							<input type="text" v-model="toolsjson" />
						</p>

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

						<div class="modal-buttons">
							<button class="btn" @click="isModalOpen = false">Cancel</button>
							<button class="btn confirm" @click.prevent="import5etools()">Import</button>
						</div>
					</div>
				</section>
			</div>
		</Transition>
	</Teleport>
</template>
<script setup lang="ts">
import {ref} from "vue";
import {onClickOutside} from "@vueuse/core";

const isModalOpen = ref(false);
const modal = ref<HTMLDivElement | null>(null);
// @ts-ignore
onClickOutside(modal, () => (isModalOpen.value = false));
</script>

<script lang="ts">
import {RouterLink, RouterView} from "vue-router";
import {defineComponent, watch} from "vue";
import StatblockRenderer from "../components/StatblockRenderer.vue";
import type {InnateSpellsEntity, InnateSpellsList, SkillsEntity, Statblock, Creature} from "@/generic/types";
import {defaultStatblock, getSpellSlots, spellList, spellListFlattened} from "@/generic/types";
import {handleApiResponse, type error, toast, asyncLimits, type limitsType} from "@/main";
import FeatureWidget from "@/components/FeatureWidget.vue";
import {parseFrom5eTools} from "../parser/parseFrom5eTools";
export default defineComponent({
	components: {
		StatblockRenderer,
		FeatureWidget
	},
	data() {
		return {
			slideIndex: 2,
			data: defaultStatblock as Statblock,
			rawInfo: null as Creature | null,
			list: [] as string[],
			getSpellSlots: getSpellSlots,
			spellListFlattened: spellListFlattened,
			innateSpells: {
				0: [] as string[],
				1: [] as string[],
				2: [] as string[],
				3: [] as string[]
			} as {[key: number]: string[]},
			limits: {} as limitsType,
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
			toolsjson: "" as string,
			notices: {} as {[key: string]: string[]},
			madeChanges: false
		};
	},
	methods: {
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
		showSlides(n: number): void {
			if (this.slideIndex == n) return;

			let slides = document.getElementsByClassName("editor-content__tab-inner") as HTMLCollectionOf<HTMLElement>;

			for (let i = 0; i < slides.length; i++) {
				if (i != n - 1) slides[i].style.display = "none";
			}
			slides[n - 1].style.display = "block";

			this.slideIndex = n;
		},
		moveFeature(isUp: boolean, type: "features" | "actions" | "bonus" | "reactions" | "legendary" | "mythic" | "lair" | "regional", index: number): void {
			// isUp is true if they want to move it higher in the statblock, e.g. earlier in the array
			let features = this.data.features[type];
			if (index == 0 && isUp) return;
			if (index == features.length - 1 && !isUp) return;

			let toSwapIndex = index;
			if (isUp) toSwapIndex--;
			else toSwapIndex++;

			var b = features[toSwapIndex];
			features[toSwapIndex] = features[index];
			features[index] = b;
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
			let index = 0;
			if (this.data.abilities.skills?.length) index = this.data.abilities.skills?.length;
			if (!this.data.abilities.skills) this.data.abilities.skills = [];
			this.data.abilities.skills[index] = {
				skillName: "" as string,
				isHalfProficient: false,
				isProficient: true,
				isExpertise: false,
				override: null
			} as SkillsEntity;
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
			this.data.spellcasting.casterSpells.spellSlotList = undefined;
			this.data.spellcasting.casterSpells.spellCastingAbility = null;
			this.data.spellcasting.casterSpells.spellBonusOverride = null;
			this.data.spellcasting.casterSpells.spellDcOverride = null;
		},
		saveStatblock() {
			///console.log(this.data);
			if (!this.rawInfo) return;
			this.rawInfo.stats = this.data;
			const loader = this.$loading.show()
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
				} else {
					toast.error("Error: " + (result.data as error).error);
				}
			});
			loader.hide()
		}
	},
	async mounted() {
		const loader = this.$loading.show();
		this.limits = (await asyncLimits) ?? ({} as limitsType);
		///console.log("Statblock id: " + this.$route.params.id);
		this.showSlides(1);

		//Fetch creature info
		await fetch("/api/creature/" + this.$route.params.id).then(async (response) => {
			let result = await handleApiResponse<Creature>(response);
			if (result.success) {
				this.data = (result.data as Creature).stats;
				this.rawInfo = result.data as Creature;
			} else {
				console.error("Error: " + (result.data as error).error);
				this.data = defaultStatblock;
			}
		});

		this.innateSpells = {
			0: this.data.spellcasting.innateSpells.spellList[0].map((spell) => spell.spell),
			1: this.data.spellcasting.innateSpells.spellList[1].map((spell) => spell.spell),
			2: this.data.spellcasting.innateSpells.spellList[2].map((spell) => spell.spell),
			3: this.data.spellcasting.innateSpells.spellList[3].map((spell) => spell.spell)
		};
		loader.hide();

		window.addEventListener("beforeunload", (event) => {
			if (this.madeChanges) {
				event.preventDefault();
				event.returnValue = true;
			}
		});
	},
	watch: {
		data: {
			handler() {
				this.madeChanges = true;
			},
			deep: true
		},
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
		"data.spellcasting.casterSpells.casterLevel"(newValue, oldValue) {
			if (newValue == null || newValue == undefined) {
				this.clearCasting();
				return;
			}

			// set spell slots when they change level
			this.data.spellcasting.casterSpells.spellSlotList = getSpellSlots(this.data.spellcasting.casterSpells.castingClass, this.data.spellcasting.casterSpells.casterLevel);
		},
		innateSpells: {
			handler(newValue, oldValue) {
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
		}
	}
});
</script>

<style scoped lang="less">
.content {
	display: grid;
	gap: 2rem;
	grid-template-columns: 1fr 1fr;
}
.content-container__inner:first-of-type {
	background-color: rgb(59, 55, 54);
}

.editor-nav {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
	text-align: center;
	gap: 0.5rem;
	height: fit-content;
	&__tab {
		background: var(--color-surface-2);
		padding: 0.3rem;
		cursor: pointer;
		border-bottom: 2px solid;
		border-color: transparent;

		transition: border-color 0.3s ease-in-out;

		&.active-slide {
			border-color: orangered;
		}
		& span {
			font-size: 1.2rem;
		}
	}
}

.editor-content {
	padding: 0.5rem 1rem;

	&__tab-inner {
		background-color: rgb(59, 55, 54);

		.group-header {
			text-align: center;
			margin-bottom: 1rem;
		}

		.editor-field__container {
			width: 100%;
			display: grid;
			gap: 2rem;
			margin-bottom: 1.5rem;

			.flow-vertically {
				display: flex;
				flex-direction: column;
				gap: 0.3rem;

				.button-container p {
					display: flex;
					justify-content: space-between;
				}

				.feature-button__container {
					display: flex;
					gap: 0.5rem;
					justify-content: space-between;

					& .moving-buttons {
						display: grid;
						grid-template-rows: 1fr 1fr;
						cursor: pointer;

						span {
							border-radius: 50rem;
							width: 20px;
							height: 20px;
							text-align: center;
							display: inline-block;
							line-height: 20px;
							transition: background-color 0.3s ease;

							&:hover {
								background-color: rgb(60, 63, 68);
							}
						}
					}
				}
			}

			.center-vertically {
				display: flex;
				justify-content: center;
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

			&.six-wide {
				grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
			}

			textarea {
				min-height: 46px;
				height: 46px;
			}
		}
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

.quantity {
	position: relative;
	white-space: nowrap;
}

.delete-button {
	translate: 0 7px;
	transition: scale 0.3s ease;
	cursor: pointer;
	display: flex;
	height: fit-content;

	&:hover {
		scale: 1.1;
	}
}
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

input[type="number"] {
	-moz-appearance: textfield;
	appearance: textfield;
}

.quantity input {
	background-color: rgb(31, 32, 35);
	width: 100%;
	height: 42px;
	line-height: 1.65;
	float: left;
	display: block;
	padding: 0;
	margin: 0;
	padding-left: 10px;
	border: 1px solid rgb(60, 63, 68);
	color: white;
}
.quantity:has(.delete-button) input {
	width: 90%;
}

.quantity input:focus {
	outline: 0;
}

.quantity-nav {
	float: left;
	position: relative;
	height: 42px;
}

.quantity-button {
	position: relative;
	cursor: pointer;
	border-left: 1px solid rgb(60, 63, 68);
	width: 20px;
	text-align: center;
	font-size: 13px;
	line-height: 1.7;
	-webkit-transform: translateX(-100%);
	transform: translateX(-100%);
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	-o-user-select: none;
	user-select: none;
}

.quantity-button.quantity-up {
	position: absolute;
	height: 50%;
	top: 0;
	border-bottom: 1px solid rgb(60, 63, 68);
}

.quantity-button.quantity-down {
	position: absolute;
	bottom: -1px;
	height: 50%;
}

hr {
	border-color: orangered;
}

.save-button {
	width: 100%;
	display: flex;
	margin: 2rem 0;
	justify-content: center;
	button {
		background-color: var(--color-success);
		font-size: 1.2rem;

		&:hover {
			background-color: rgb(46, 124, 9);
		}
	}
}

.modal-desc {
	margin-top: 1rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.modal-buttons {
	display: flex;
	gap: 1rem;
	justify-content: center;

	& .btn {
		font-size: 1.2rem;

		&.confirm-button {
			background-color: var(--color-success);
		}
	}
}
</style>
