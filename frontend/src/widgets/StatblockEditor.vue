<template>
<div class="editor"> 
    <div class="editor-nav">
        <div @click="currentSlide(1)" :class="{'active-slide': slideIndex === 1}" class="editor-nav__tab">
            <span> Description </span>
        </div>
        <div @click="currentSlide(2)" :class="{'active-slide': slideIndex === 1}" class="editor-nav__tab">
            <span> Core </span>
        </div>
        <div @click="currentSlide(3)" :class="{'active-slide': slideIndex === 1}" class="editor-nav__tab">
            <span> Stats </span>
        </div>
        <div @click="currentSlide(4)" :class="{'active-slide': slideIndex === 1}" class="editor-nav__tab">
            <span> Defense </span>
        </div>
        <div @click="currentSlide(5)" :class="{'active-slide': slideIndex === 1}" class="editor-nav__tab">
            <span> Features </span>
        </div>
    </div>

    <div class="editor-content">
        <div class="editor-content__tab-inner fade">
            <div class="editor-field__slim">
                <span class="editor-field__title">
                    Name
                </span>
                <div class="editor-field__contents">
                    <input type="text" placeholder="Type name...">
                </div>
            </div>
            <div class="editor-field__slim">
                <span class="editor-field__title">
                    Desc
                </span>
                <div class="editor-field__contents">
                    <input type="text" placeholder="Type description...">
                </div>
            </div>
            <div class="editor-field__slim">
                <span class="editor-field__title">
                    Image URL
                </span>
                <div class="editor-field__contents">
                    <input type="text" placeholder="Type image url...">
                </div>
            </div>
            <div class="editor-field__slim">
                <span class="editor-field__title">
                    Environment
                </span>
                <div class="editor-field__contents">
                    <input type="text" placeholder="Type environment...">
                </div>
            </div>
            <div class="editor-field__slim">
                <span class="editor-field__title">
                    Faction
                </span>
                <div class="editor-field__contents">
                    <input type="text" placeholder="Type faction...">
                </div>
            </div>
            <div class="editor-field__slim">
                <span class="editor-field__title">
                    Alignment
                </span>
                <div class="editor-field__contents">
                    <input type="text" placeholder="Type alignment...">
                </div>
            </div>
            <div class="editor-field__slim">
                <span class="editor-field__title">
                    CR (prof)
                </span>
                <div class="editor-field__contents">
                    <input type="input" placeholder="0">
                </div>
            </div>
        </div>
        <div class="editor-content__tab-inner fade">
            Race
            Size
            Speed
            Senses
            Languages
        </div>
        <div class="editor-content__tab-inner fade">
            Ability scores
            Saving Throws
            Skills (prof/exp/JoAT/override)
        </div>
        <div class="editor-content__tab-inner fade">
            Hit die number and size
            HP override
            armor class + armor type
            Vulnerabilities
            Resistances
            Immunities
            Condition Immunities
        </div>
        <div class="editor-content__tab-inner fade">
            Actions
            Bonus Actions
            Reactions
            Legendary Actions
            Lair Actions
            Features
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    data() {
        return {
           slideIndex: 1 as number
        }
    },
    methods: {
        plusSlides(n: number) {
            this.showSlides((this.slideIndex += n));
        },

        currentSlide(n: number) {
            this.showSlides((this.slideIndex = n));
        },

        showSlides(n: number) {
            let i;
            let slides = document.getElementsByClassName("editor-content__tab-inner") as any;
            if (n > slides.length) {
                this.slideIndex = 1;
            }
            if (n < 1) {
                this.slideIndex = slides.length;
            }
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }

            slides[this.slideIndex - 1].style.display = "block";
        },

    },
    mounted() {
        this.showSlides(this.slideIndex);
    },
});
</script>

<style scoped lang="less">
.editor {
    width: 100%;
}

.editor-nav {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    text-align: center;
    gap: .5rem;
    &__tab {
        background: red;
        padding: .3rem;
        cursor: pointer;
        & span {
            font-size: 1.2rem
        }
    }


}
.fade {
    animation-name: fade-in;
    animation-duration: 1s;
    animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes fade-in {
    from {
        opacity: 0;
        translate: 0 30%;
    }
    to {
        opacity: 1;
        translate: 0 0;
    }
}

</style>