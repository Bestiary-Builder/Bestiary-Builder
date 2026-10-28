import type { Statblock } from "../types";

import typia from "typia";

export const validateStatblock = typia.createValidate<Statblock>();
