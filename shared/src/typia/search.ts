import type { SearchOptions } from "../types";

import typia from "typia";

export const validateSearch = typia.createValidate<SearchOptions>();
