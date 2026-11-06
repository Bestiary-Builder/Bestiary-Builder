import type { AutomationModel } from "./attackModelForTypia";
import typia from "typia";


export const validateAutomationModel = typia.createValidate<AutomationModel>();