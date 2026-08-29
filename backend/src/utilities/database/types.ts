import type { AutomationConsumables, AutomationDocumentationEntity, Statblock } from "~/shared";

declare global {
	// eslint-disable-next-line ts/no-namespace
	namespace PrismaJson {
		type DbStatblock = Statblock;
		type DbAutomation = AutomationDocumentationEntity;
		type DbAutomationConsumables = AutomationConsumables;
	}
}

export { };
