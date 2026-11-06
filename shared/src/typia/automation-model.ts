// @ts-ignore attackModel will be created on build-types
import type { AutomationModel } from "./attackModel";
import typia from "typia";

export const validateAutomationModel = typia.createValidate<AutomationModel>();
