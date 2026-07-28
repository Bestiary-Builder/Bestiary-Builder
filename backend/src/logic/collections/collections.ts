import type { BestiaryStatus, Id } from "~/shared";
import { getUser } from "@/src/utilities/database";

export type CollectionPermission = "none" | "view" | "editor" | "owner";
export type CollectionAction = "view" | "edit" | "delete" | "manage-editors";

export interface CollectionWithEditors {
	id: Id;
	ownerId: Id;
	editors: readonly { userId: Id }[];
	status: BestiaryStatus;
}

interface CollectionRepository<C extends CollectionWithEditors, ListedC extends C> {
	getById: (id: Id) => Promise<C | null>;
	getForUser: (userId: Id) => Promise<ListedC[]>;
	addEditor: (collectionId: Id, userId: Id) => Promise<boolean>;
	removeEditor: (collectionId: Id, userId: Id) => Promise<boolean>;
	delete: (collectionId: Id) => Promise<boolean>;
}

export type CollectionOperationFailure = "collection-not-found" | "forbidden" | "user-not-found" | "owner-as-editor" | "already-editor" | "not-editor" | "write-failed";
export type CollectionOperationResult = { ok: true } | { ok: false; reason: CollectionOperationFailure };
export type CollectionAuthorizationResult<C> = { ok: true; collection: C; permission: CollectionPermission } | { ok: false; reason: "collection-not-found" | "forbidden" };

export function createCollectionService<C extends CollectionWithEditors, ListedC extends C>(repository: CollectionRepository<C, ListedC>) {
	function getPermission(collection: C, userId: Id | null): CollectionPermission {
		if (userId === collection.ownerId)
			return "owner";
		if (userId && collection.editors.some(editor => editor.userId === userId))
			return "editor";
		if (collection.status !== "private")
			return "view";
		return "none";
	}

	function canPerform(action: CollectionAction, permission: CollectionPermission) {
		switch (action) {
			case "view": return permission !== "none";
			case "edit": return permission === "owner" || permission === "editor";
			case "delete":
			case "manage-editors": return permission === "owner";
		}
	}

	async function authorize(id: Id, userId: Id | null, action: CollectionAction): Promise<CollectionAuthorizationResult<C>> {
		const collection = await repository.getById(id);
		if (!collection)
			return { ok: false, reason: "collection-not-found" };
		const permission = getPermission(collection, userId);
		if (!canPerform(action, permission))
			return { ok: false, reason: "forbidden" };
		return { ok: true, collection, permission };
	}

	async function addEditor(collectionId: Id, actorId: Id, editorId: Id): Promise<CollectionOperationResult> {
		const result = await authorize(collectionId, actorId, "manage-editors");
		if (!result.ok)
			return result;
		const editor = await getUser(editorId);
		if (!editor)
			return { ok: false, reason: "user-not-found" };
		if (editor.id === result.collection.ownerId)
			return { ok: false, reason: "owner-as-editor" };
		if (result.collection.editors.some(existingEditor => existingEditor.userId === editor.id))
			return { ok: false, reason: "already-editor" };
		return await repository.addEditor(result.collection.id, editor.id)
			? { ok: true }
			: { ok: false, reason: "write-failed" };
	}

	async function removeEditor(collectionId: Id, actorId: Id, editorId: Id): Promise<CollectionOperationResult> {
		const result = await authorize(collectionId, actorId, "manage-editors");
		if (!result.ok)
			return result;
		const editor = await getUser(editorId);
		if (!editor)
			return { ok: false, reason: "user-not-found" };
		if (!result.collection.editors.some(existingEditor => existingEditor.userId === editor.id))
			return { ok: false, reason: "not-editor" };
		return await repository.removeEditor(result.collection.id, editor.id)
			? { ok: true }
			: { ok: false, reason: "write-failed" };
	}

	async function deleteCollection(collectionId: Id, actorId: Id): Promise<CollectionOperationResult> {
		const result = await authorize(collectionId, actorId, "delete");
		if (!result.ok)
			return result;
		return await repository.delete(result.collection.id)
			? { ok: true }
			: { ok: false, reason: "write-failed" };
	}

	async function getItemsForUser<Item>(userId: Id, selectItems: (collection: ListedC) => readonly Item[]): Promise<Item[]> {
		return (await repository.getForUser(userId)).flatMap(selectItems);
	}

	return { getPermission, canPerform, authorize, addEditor, removeEditor, deleteCollection, getForUser: repository.getForUser, getItemsForUser };
}
