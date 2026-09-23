<script setup lang="ts">
import { ref } from "vue";

withDefaults(defineProps<{ isIntExpression?: boolean }>(), { isIntExpression: false });
const model = defineModel<Record<number, string> | undefined>();

const getValue = (index: number): string => model.value?.[index] ?? "";

const updateValue = (index: number, value: string) => {
	model.value = { ...(model.value ?? {}), [index]: value };
};
const isDialogOpen = ref(false)
</script>

<template>
	<v-dialog v-model="isDialogOpen" max-width="600">
		<template #activator="{ props }">
			<v-btn v-bind="props" class="w-100"> At higher levels </v-btn>
		</template>

		<template #default>
			<v-card class="pa-4" title="At higher levels" subtitle="For use with the -l argument.">
				<v-card-text>
					<v-row>
						<v-col v-for="x in 9" :key="x" cols="6">
							<v-text-field :model-value="getValue(x)" @update:model-value="(y) => updateValue(x, y)"
								:label="`Level ${x}`">
								<template #append-inner>
									<v-tooltip
										:text="!isIntExpression ? 'AnnotatedString. Dice allowed, expressions in {}.' : 'IntExpression. Dice not allowed, expressions not in { }'"
										location="bottom">
										<template #activator="{ props: activatorProps }">
											<v-icon :icon="!isIntExpression ? 'tabler:braces' : 'tabler:braces-off'"
												v-bind="activatorProps" />
										</template>
									</v-tooltip>
								</template>
							</v-text-field>
						</v-col>
					</v-row>

				</v-card-text>
				<v-card-actions>
					<v-btn @click="isDialogOpen = false"> Close </v-btn>
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
</template>