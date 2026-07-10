import { Mark, Node, mergeAttributes } from "@tiptap/core";

const Highlight = Node.create({
	name: "admonition",
	group: "block",
	content: "block+",

	renderHTML() {
		return [
			"span",
			{ class: "hanging-list" },
			0, // Content
		];
	},

	markdownTokenizer: {
		name: "admonition",
		level: "block",

		start: (src) => {
			return src.indexOf("::");
		},

		tokenize: (src, tokens, lexer) => {
			// Match ::content::
			const match = /^::([\s\S]*)::/.exec(src);

			if (!match)
				return undefined;

			return {
				type: "admonition",
				raw: match[0],
				text: match[1], // Content
				tokens: lexer.blockTokens(match[1]), // Parse block content
			};
		},
	},

	parseMarkdown: (token, helpers) => {
		return {
			type: "admonition",
			attrs: {
				type: token.admonitionType || "note",
			},
			content: helpers.parseChildren(token.tokens || []),
		};
	},

	renderMarkdown: (node, helpers) => {
		const content = helpers.renderChildren(node.content || []);
		return `::${content}::`;
	},
});

export default Highlight;
