import type { AutomationModel } from "../types";

import typia from "typia";

export const validateAutomationModel = typia.createValidate<AutomationModel>();
