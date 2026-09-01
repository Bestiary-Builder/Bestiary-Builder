import type { AttackModel, AutomationConsumables, Statblock } from "~/shared";

declare global {
	// eslint-disable-next-line ts/no-namespace
	namespace PrismaJson {
		type DbStatblock = Statblock;
		type DbAutomation = AttackModel | AttackModel[];
		type DbAutomationConsumables = AutomationConsumables;
	}
}

export { };
