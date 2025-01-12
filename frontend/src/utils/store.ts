import { reactive, watch } from "vue";
import { useWindowSize } from "@vueuse/core";
import { useFetch } from "./utils";
import type { User } from "~/shared";

const user = useFetch<User>("/api/user").then(async (result) => {
  console.log("Fetched user", result);
  if (result.success) return result.data;
  else return null;
});

interface limitsType {
  nameLength: number;
  nameMin: number;
  descriptionLength: number;
  creatureAmount: number;
  imageFormats: string[];
}

const asyncLimits = useFetch<limitsType>("/api/limits").then(async (result) => {
  if (result.success) return result.data;
  else return null;
});

const tags = useFetch<string[]>("/api/tags").then(async (result) => {
  if (result.success) return result.data;
  else return null;
});

const { width } = useWindowSize();

watch(width, () => {
  store.isMobile = width.value < 900;
});

export const store = reactive({
  user: await user,
  tags: await tags,
  limits: await asyncLimits,
  isMobile: width.value < 900,
});
