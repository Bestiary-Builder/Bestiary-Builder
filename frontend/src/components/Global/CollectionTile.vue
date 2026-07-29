<script setup lang="ts">
import { computed } from 'vue';
import type { AutomationCollectionExtended, BestiaryExtended } from '~/shared';
import UserBanner from '../Bestiary/UserBanner.vue';
import { store } from '@/utils/store.js';
import ButtonIcon from './ButtonIcon.vue';
import StatusIcon from '../Bestiary/StatusIcon.vue';
import { Icon } from '@iconify/vue';

const { data } = defineProps<{ data: AutomationCollectionExtended | BestiaryExtended }>()

defineEmits<{
    (e: "deleteCollectionItem", collectionId: string): void;
}>();

const collectionImage = computed(() => {
    const description = data.description;
    const match = description.match(/!\[.*?\]\((.*?)\)/);
    const firstImageUrl = (match || [])[1];
    return firstImageUrl
});

const firstLetters = computed(() => {
    const firstLetters = data.name
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase();
    return firstLetters
})

const lastUpdated = computed(() => {
    const seconds = Math.floor((Date.now() - new Date(data.lastUpdated).getTime()) / 1000);

    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;

    const weeks = Math.floor(days / 7);
    if (days < 30) return `${weeks}w`;

    const months = Math.floor(days / 30);
    if (days < 365) return `${months}mo`;

    const years = Math.floor(days / 365);
    return `${years}y`;
})

</script>

<template>
    <div class="collection-container">
        <div class="collection">
            <div class="image-container">
                <img :src="collectionImage" v-if="collectionImage" class="image" />
                <div v-else class="image">
                    {{ firstLetters }}
                </div>
            </div>
            <hr />
            <div class="meta">
                <h2> {{ data.name }} </h2>
                <span>
                    <UserBanner :id="data.ownerId" /> • {{ lastUpdated }}
                </span>
                <ul class="tag-container" v-if="data.tags.length > 0">
                    <li v-for="tag of data.tags.sort()">
                        {{ tag }}
                    </li>
                </ul>
                <p v-if="data.description" class="description"> {{ data.description }}</p>
                <div class="collection-footer">
                    <div>
                        <b>{{ data.viewCount }} views </b>
                    </div>
                    <span v-if="'automations' in data" class="item-count">
                        <b>{{ data.automations.length }}</b>
                        <Icon icon="material-symbols:swords" inline />
                    </span>
                    <span v-if="'creatures' in data" class="item-count">
                        <b>{{ data.creatures.length }} </b>
                        <Icon icon="fa7-solid:dragon" inline />
                    </span>
                    <div class="info-buttons">
                        <font-awesome-icon :icon="['fa', 'grip-vertical']" class="handle" width="20px"/>
                        <StatusIcon :icon="data.status" />
                        <VDropdown :distance="6" :positioning-disabled="store.isMobile"
                            v-if="store.user?.id === data.ownerId" @click.stop.prevent>
                            <ButtonIcon icon="trash" label="Delete collection" />
                            <template #popper>
                                <div class="v-popper__custom-menu">
                                    <span> Are you sure you want to delete <b style="color: white">{{ data.name }}?</b>
                                        <br> This action cannot be undone.</span>
                                    <button v-close-popper class="btn danger"
                                        @click.stop.prevent="$emit('deleteCollectionItem', data.id)">
                                        Confirm
                                    </button>
                                </div>
                            </template>
                        </VDropdown>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
@font-face {
    font-family: "Scala Sans Offc";
    src: url("../Statblock/styles/ScalaSans.woff2") format("woff2");
}
.collection-container {
    transition: scale ease-in-out .2s;
    &:hover {
        scale: 1.02
    }
}
.collection {
    border-radius: .5rem;
    background-color: var(--color-surface-0);

    .image-container {
        padding-top: 56%;
        position: relative;

        .image {
            position: absolute;
            top: 0;
            width: 100%;
            height: 100%;
            border-radius: 4px;
            object-fit: cover;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: xx-large;
        }
    }

    hr {
        margin-top: .25rem;
        margin-bottom: .25rem;
    }

    .meta {
        padding: 0 .5rem 1rem;
        font-family: "Scala Sans Offc", Roboto, Helvetica, sans-serif;

        h2 {
            font-size: 20px;
        }

        .tag-container {
            list-style-type: none;
            margin: 0;
            padding: 0;
            margin-top: .5rem;

            li {
                display: inline-block;
                font-size: smaller;
                background-color: var(--color-surface-1);
                padding: .5rem;
                border-radius: 16px;
                margin-right: .5rem;
                font-weight: bold;
            }
        }

        .description {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            line-clamp: 3;
            overflow: hidden;
            margin: .5rem 0;
            font-size: smaller;
        }

        .collection-footer {
            display: flex;
            justify-content: space-between;

            .info-buttons {
                grid-auto-flow: column;
                grid-auto-columns: 1fr;
                display: grid;
                gap: .25rem;
                button,
                svg {
                    color: unset;
                    padding: 0;
                    
                }
            }
        }
    }
}
</style>

<style>
.item-count svg {
    translate: 0 3px;
    margin-left: .25rem;
}
</style>