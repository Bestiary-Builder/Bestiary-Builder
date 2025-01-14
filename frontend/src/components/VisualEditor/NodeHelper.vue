<script setup lang="ts">
import { computed } from "vue";
import NodeText from "./Nodes/NodeText.vue";
import NodeVariable from "./Nodes/NodeVariable.vue";
import NodeTarget from "./Nodes/NodeTarget.vue";
import NodeRemoveIEffect from "./Nodes/NodeRemoveIEffect.vue";
import NodeSave from "./Nodes/NodeSave.vue";
import NodeAttack from "./Nodes/NodeAttack.vue";
import NodeDamage from "./Nodes/NodeDamage.vue";
import NodeCondition from "./Nodes/NodeCondition.vue";
import NodeTempHP from "./Nodes/NodeTempHP.vue";
import NodeRoll from "./Nodes/NodeRoll.vue";
import NodeUseCounter from "./Nodes/NodeUseCounter.vue";
import NodeSpell from "./Nodes/NodeSpell.vue";
import NodeIEffect from "./Nodes/IEffect2/NodeIEffect.vue";
import NodeRoot from "./Nodes/NodeRoot.vue";
import NodeButtonRoot from "./Nodes/NodeButtonRoot.vue";
import NodeIAttackRoot from "./Nodes/NodeIAttackRoot.vue";
import NodeCheck from "./Nodes/NodeCheck.vue";

const props = defineProps<{ node: string }>();

const component = computed(() => {
	if (props.node === "text")
		return NodeText;
	if (props.node === "variable")
		return NodeVariable;
	if (props.node === "target")
		return NodeTarget;
	if (props.node === "remove_ieffect")
		return NodeRemoveIEffect;
	if (props.node === "save")
		return NodeSave;
	if (props.node === "attack")
		return NodeAttack;
	if (props.node === "damage")
		return NodeDamage;
	if (props.node === "condition")
		return NodeCondition;
	if (props.node === "temphp")
		return NodeTempHP;
	if (props.node === "roll")
		return NodeRoll;
	if (props.node === "counter")
		return NodeUseCounter;
	if (props.node === "spell")
		return NodeSpell;
	if (props.node === "ieffect2")
		return NodeIEffect;
	if (props.node === "check")
		return NodeCheck;
	if (props.node === "noderoot")
		return NodeRoot;
	if (props.node === "buttonroot")
		return NodeButtonRoot;
	if (props.node === "attackroot")
		return NodeIAttackRoot;
	return "div";
});
</script>

<template>
	<div>
		<component :is="component" />
	</div>
</template>
