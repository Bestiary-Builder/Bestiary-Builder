import type { BestiaryStatus, Id } from "~/shared";
import { getUser } from "@/utilities/database";

export type CollectionPermission = "none" | "view" | "editor" | "owner";
export type CollectionAction = "view" | "edit" | "delete" | "manage-editors" | "order-items";

export interface CollectionWithEditors {
	id: Id;
	ownerId: Id;
	editors: readonly { userId: Id }[];
	status: BestiaryStatus;
}

interface CollectionRepository<C extends CollectionWithEditors, ListedC extends C> {
	getById: (id: Id) => Promise<C | null>;
	getForUser: (userId: Id) => Promise<ListedC[]>;
	getOwnedCollectionIds: (userId: Id) => Promise<Id[]>;
	updateUserCollectionIndexes: (userId: Id, items: { id: Id; index: number }[]) => Promise<boolean>;
	addEditor: (collectionId: Id, userId: Id) => Promise<boolean>;
	removeEditor: (collectionId: Id, userId: Id) => Promise<boolean>;
	delete: (collectionId: Id) => Promise<boolean>;
	incrementViewCount: (collectionId: Id) => Promise<void>;
	getItemIds: (collectionId: Id) => Promise<Id[]>;
	updateItemIndexes: (items: { id: Id; index: number }[]) => Promise<boolean>;
	isBookmarked: (userId: Id, collectionId: Id) => Promise<boolean>;
	addBookmark: (userId: Id, collectionId: Id) => Promise<boolean>;
	removeBookmark: (userId: Id, collectionId: Id) => Promise<boolean>;
}

export type CollectionOperationFailure = "collection-not-found" | "forbidden" | "user-not-found" | "owner-as-editor" | "already-editor" | "not-editor" | "items-not-in-collection" | "duplicate-items" | "collections-not-owned" | "duplicate-collections" | "write-failed";
export type CollectionOperationResult = { ok: true } | { ok: false; reason: CollectionOperationFailure };
export type CollectionAuthorizationResult<C> = { ok: true; collection: C; permission: CollectionPermission } | { ok: false; reason: "collection-not-found" | "forbidden" };
export type CollectionBookmarkResult = { ok: true; state: boolean } | { ok: false; reason: "collection-not-found" | "forbidden" | "write-failed" };

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
			case "order-items": return permission === "owner" || permission === "editor";
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

	async function getBookmarkState(collectionId: Id, userId: Id): Promise<CollectionBookmarkResult> {
		const result = await authorize(collectionId, userId, "view");
		if (!result.ok)
			return result;
		return { ok: true, state: await repository.isBookmarked(userId, result.collection.id) };
	}

	async function toggleBookmark(collectionId: Id, userId: Id): Promise<CollectionBookmarkResult> {
		const result = await getBookmarkState(collectionId, userId);
		if (!result.ok)
			return result;
		const success = result.state
			? await repository.removeBookmark(userId, collectionId)
			: await repository.addBookmark(userId, collectionId);
		if (!success)
			return { ok: false, reason: "write-failed" };
		return { ok: true, state: !result.state };
	}

	async function incrementViewCount(collectionId: Id) {
		await repository.incrementViewCount(collectionId);
	}

	async function reorderItems(collectionId: Id, actorId: Id, itemIds: Id[]): Promise<CollectionOperationResult> {
		const result = await authorize(collectionId, actorId, "order-items");
		if (!result.ok)
			return result;
		if (new Set(itemIds).size !== itemIds.length)
			return { ok: false, reason: "duplicate-items" };
		const existingItemIds = await repository.getItemIds(result.collection.id);
		if (itemIds.some(id => !existingItemIds.includes(id)))
			return { ok: false, reason: "items-not-in-collection" };
		const orderedItemIds = [...itemIds, ...existingItemIds.filter(id => !itemIds.includes(id))];
		return await repository.updateItemIndexes(orderedItemIds.map((id, index) => ({ id, index })))
			? { ok: true }
			: { ok: false, reason: "write-failed" };
	}

	async function reorderForUser(userId: Id, collectionIds: Id[]): Promise<CollectionOperationResult> {
		if (new Set(collectionIds).size !== collectionIds.length)
			return { ok: false, reason: "duplicate-collections" };
		const existingCollectionIds = await repository.getOwnedCollectionIds(userId);
		if (collectionIds.some(id => !existingCollectionIds.includes(id)))
			return { ok: false, reason: "collections-not-owned" };
		const orderedCollectionIds = [...collectionIds, ...existingCollectionIds.filter(id => !collectionIds.includes(id))];
		return await repository.updateUserCollectionIndexes(userId, orderedCollectionIds.map((id, index) => ({ id, index })))
			? { ok: true }
			: { ok: false, reason: "write-failed" };
	}

	async function getItemsForUser<Item>(userId: Id, selectItems: (collection: ListedC) => readonly Item[]): Promise<Item[]> {
		return (await repository.getForUser(userId)).flatMap(selectItems);
	}

	return { getPermission, canPerform, authorize, addEditor, removeEditor, deleteCollection, getBookmarkState, toggleBookmark, incrementViewCount, reorderItems, reorderForUser, getForUser: repository.getForUser, getItemsForUser };
}
