<template>
<div>
<Breadcrumbs
    :routes="[
        {
            path: '',
            text: 'Statblock Editor',
            isCurrent: true
        }
    ]"
> </Breadcrumbs>
<div class="content">
    <div>
        <Node :data="data" :depth="0" :root-data="data" @change-current="(current) => changeCurrent(current)" />
    </div>
    <div> <component :is="currentComponent" :data="currentData"></component> </div>
</div> 
</div>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';

import NodeAbilityCheck from "@/components/automationEditor/NodeAbilityCheck.vue";
import NodeBranch from "@/components/automationEditor/NodeBranch.vue";
import NodeCastSpell from "@/components/automationEditor/NodeCastSpell.vue";
import NodeDamage from "@/components/automationEditor/NodeDamage.vue";
import NodeIEffect from "@/components/automationEditor/NodeIEffect.vue";
import NodeRoll from "@/components/automationEditor/NodeRoll.vue";
import NodeSave from "@/components/automationEditor/NodeSave.vue";
import NodeTarget from "@/components/automationEditor/NodeTarget.vue";
import NodeTempHP from "@/components/automationEditor/NodeTempHP.vue";
import NodeUseCounter from "@/components/automationEditor/NodeUseCounter.vue";
import Node from '@/components/automationEditor/Node.vue';
import NodeText from '@/components/automationEditor/NodeText.vue';
import { user } from '@/main';
import type { User } from '@/generic/types';
export default defineComponent({
    data() {
        return {
            params: this.$route.params,
            user: null as User | null,
            data:[
  {
    "type": "roll",
    "dice": "8d6[fire]",
    "name": "damage",
    "higher": {
      "4": "1d6[fire]",
      "5": "2d6[fire]",
      "6": "3d6[fire]",
      "7": "4d6[fire]",
      "8": "5d6[fire]",
      "9": "6d6[fire]"
    }
  },
  {
    "type": "target",
    "target": "all",
    "effects": [
      {
        "type": "save",
        "stat": "dex",
        "fail": [
          {
            "type": "damage",
            "damage": "{damage}"
          }
        ],
        "success": [
          {
            "type": "damage",
            "damage": "({damage})/2"
          }
        ]
      }
    ]
  },
  {
    "type": "text",
    "text": "Each creature in a 20-foot radius must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one."
  }
],
            currentData: null as any
        }
    },
    async beforeMount() {
		this.user = await user;
	},
    components: {
        Breadcrumbs,

        NodeAbilityCheck,
        NodeBranch,        
        NodeCastSpell,
        NodeDamage ,
        NodeIEffect,
        NodeRoll,
        NodeSave,
        NodeTarget,
        NodeTempHP,
        NodeUseCounter,
        NodeText,
        Node
    },
    methods: {
        changeCurrent(current:  any) {
            this.currentData = current
        }
    },
    computed: {
        currentComponent() {
            if (this.currentData?.type == "target") return "NodeTarget"
            if (this.currentData?.type == "text") return "NodeText"
            if (this.currentData?.type == "roll") return "NodeRoll"
        }
    }

})
</script>

<style lang="less" scoped>
.content {
    display: grid;
    grid-template-columns: 5fr 5fr;
    gap: 2rem;

    div {
        width: 100%;
        height: 100%;
    }
}
</style>