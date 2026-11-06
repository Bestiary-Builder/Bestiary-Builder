// @ts-ignore statblock will be created on build-types
import type { Statblock } from "./statblock";

import typia from "typia";

export const validateStatblock = typia.createValidate<Statblock>();
