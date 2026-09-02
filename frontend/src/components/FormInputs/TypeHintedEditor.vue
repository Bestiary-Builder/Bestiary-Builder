<script setup lang="ts">
import { ref, computed, shallowRef, onBeforeUnmount, watch } from 'vue'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import type * as Monaco from 'monaco-editor';
import { useTheme } from 'vuetify';

type Variant = 'outlined' | 'filled' | 'underlined' | 'solo' | 'solo-filled' | 'solo-inverted' | 'plain'
type Density = 'default' | 'comfortable' | 'compact'

interface Props {
  modelValue: string
  label?: string
  variant?: Variant
  density?: Density
  color?: string
  error?: boolean
  disabled?: boolean
  height?: number
  isCharacterContext?: boolean
  isAnnotatedString?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  variant: 'solo-filled',
  density: 'default',
  height: 40,
  isCharacterContext: false,
  isAnnotatedString: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isFocused = ref(false)
const editorRef = shallowRef<Monaco.editor.IStandaloneCodeEditor>()

const code = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value ?? ''),
})

// Drives VField's floating-label state, same as VTextField does internally.
const isDirty = computed(() => code.value.length > 0)
const isActive = computed(() => isDirty.value || isFocused.value)

const usesCustomLabel = computed(() =>
  ['filled', 'solo', 'solo-filled', 'solo-inverted'].includes(props.variant)
)

const labelColor = computed(() => {
  if (props.error) return 'rgb(var(--v-theme-error))'

  if (isActive.value && isFocused.value) return "rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity))"
  return 'rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity))'
})

const editorOptions = computed(() => ({
  minimap: { enabled: false },
  lineNumbers: 'off' as const,
  glyphMargin: false,
  folding: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  scrollBeyondLastLine: false,
  scrollBeyondLastColumn: 0,
  scrollbar: {
    vertical: 'hidden' as const,
    horizontal: 'auto' as const,
    verticalScrollbarSize: 6,
  },
  renderLineHighlight: 'none' as const,
  renderWhitespace: 'none' as const,
  wordWrap: 'off' as const,
  fontSize: 15,
  fontFamily: 'inherit',
  automaticLayout: true,
  fixedOverflowWidgets: true,
  contextmenu: false,
  quickSuggestions: true,
  suggestOnTriggerCharacters: true,
  padding: {
    top: 24
  }
}))

const handleMount = (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
  editorRef.value = editor
  monaco.editor.setTheme(theme.name.value === 'dark' ? 'vs-dark' : 'vs-light');

  editor.onDidFocusEditorWidget(() => {
    isFocused.value = true
  })

  editor.onDidBlurEditorWidget(() => {
    isFocused.value = false
  })

  let isFixing = false
  editor.onDidChangeModelContent(() => {
    const model = editor.getModel()
    if (!model) return
    if (model.getLineCount() > 1) {
      isFixing = true
      const flattened = model.getValue().replace(/\r?\n/g, ' ')
      const pos = editor.getPosition()
      model.setValue(flattened)
      if (pos) {
        editor.setPosition({ lineNumber: 1, column: Math.min(pos.column, model.getLineMaxColumn(1)) })
      }
      isFixing = false
    }
  })
}

const focusEditor = () => {
  editorRef.value?.focus()
}

const theme = useTheme()
watch(() => theme, () => {
  editorRef.value?.updateOptions({ theme: theme.name.value === 'dark' ? 'vs-dark' : 'vs-light' })
})

</script>

<template>
  <v-field :variant="variant" :density="density" :color="color" :label="usesCustomLabel ? undefined : label"
    :error="error" :disabled="disabled" :dirty="isDirty" :focused="isFocused" :active="isFocused" class="code-field"
    @click="focusEditor" :append-inner-icon="isAnnotatedString ? 'tabler:braces' : 'tabler:braces-off'">
    <template #default="{ props: fieldSlotProps }">
      <label v-if="usesCustomLabel && label" class="code-field__label"
        :class="{ 'code-field__label--floating': isActive }" :style="{ color: labelColor }"
        :for="(fieldSlotProps.id as string)">
        {{ label }}
      </label>
      <div v-bind="fieldSlotProps" class="code-field__editor" :style="{ height: `${height}px` }">
        <VueMonacoEditor v-model:value="code" language="python" theme="vs-dark" :options="editorOptions"
          @mount="handleMount" />
      </div>
    </template>
    <template #append-inner>
      <v-tooltip
        :text="isAnnotatedString ? 'AnnotatedString. Dice allowed, expressions in {}.' : 'IntExpression. Dice not allowed, expressions not in { }'"
        location="bottom">
        <template #activator="{ props: activatorProps }">
          <v-icon :icon="isAnnotatedString ? 'tabler:braces' : 'tabler:braces-off'" v-bind="activatorProps" />
        </template>
      </v-tooltip>

    </template>
  </v-field>
</template>

<style scoped>
.code-field {
  /* Positioning context for the custom label below. */
  position: relative;
}

.code-field :deep(.v-field__input) {
  /* Keep Vuetify's own padding/min-height - VField measures this box
     to position the floating label, so don't collapse it. */
  align-items: stretch;
}

.code-field__editor {
  width: 100%;
}

.code-field__label {
  position: absolute;
  /* Fixed inset matching Vuetify's default field padding. Adjust if you
     override density/padding away from the default. */
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  transform-origin: left top;
  font-size: 1rem;
  pointer-events: none;
  white-space: nowrap;
  max-width: calc(100% - 32px);
  overflow: hidden;
  text-overflow: ellipsis;
  transition: top 0.15s ease, transform 0.15s ease, font-size 0.15s ease, color 0.15s ease;
}

.code-field__label--floating {
  top: 8px;
  transform: translateY(0) scale(0.75);
}

/* Let VField's own surface color show through instead of Monaco's. */
.code-field :deep(.monaco-editor),
.code-field :deep(.monaco-editor .margin),
.code-field :deep(.monaco-editor-background) {
  background-color: transparent !important;
}

.code-field :deep(.monaco-editor .overflow-guard) {
  border-radius: inherit;
}

.code-field :deep(.monaco-editor.focused) {
  outline: none !important;
}

.code-field :deep(.monaco-editor .suggest-widget) {
  z-index: 3000 !important;
}

.code-field :deep(.monaco-editor .overflowingContentWidgets) {
  z-index: 3000 !important;

}
</style>
