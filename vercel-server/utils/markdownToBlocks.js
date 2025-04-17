import { remark } from "remark";
import remarkParse from "remark-parse";

function parseRichText(children) {
	return children.map((child) => {
		if (child.type === "text") {
			return {
				type: "text",
				text: { content: child.value },
				annotations: {
					bold: false,
					italic: false,
					underline: false,
					strikethrough: false,
					code: false,
					color: "default"
				}
			};
		} else if (child.type === "strong") {
			return {
				type: "text",
				text: { content: child.children.map((n) => n.value).join("") },
				annotations: {
					bold: true,
					italic: false,
					underline: false,
					strikethrough: false,
					code: false,
					color: "default"
				}
			};
		} else if (child.type === "emphasis") {
			return {
				type: "text",
				text: { content: child.children.map((n) => n.value).join("") },
				annotations: {
					bold: false,
					italic: true,
					underline: false,
					strikethrough: false,
					code: false,
					color: "default"
				}
			};
		} else if (child.type === "inlineCode") {
			return {
				type: "text",
				text: { content: child.value },
				annotations: {
					bold: false,
					italic: false,
					underline: false,
					strikethrough: false,
					code: true,
					color: "default"
				}
			};
		} else {
			return {
				type: "text",
				text: { content: child.value || "" },
				annotations: {
					bold: false,
					italic: false,
					underline: false,
					strikethrough: false,
					code: false,
					color: "default"
				}
			};
		}
	});
}

export function markdownToBlocks(markdown) {
	const tree = remark().use(remarkParse).parse(markdown);
	const blocks = [];

	for (const node of tree.children) {
		if (node.type === "heading") {
			blocks.push({
				object: "block",
				type: `heading_${Math.min(node.depth, 3)}`,
				[`heading_${Math.min(node.depth, 3)}`]: {
					rich_text: parseRichText(node.children)
				}
			});
		} else if (node.type === "paragraph") {
			blocks.push({
				object: "block",
				type: "paragraph",
				paragraph: {
					rich_text: parseRichText(node.children)
				}
			});
		} else if (node.type === "blockquote") {
			blocks.push({
				object: "block",
				type: "quote",
				quote: {
					rich_text: parseRichText(node.children.flatMap((c) => c.children || []))
				}
			});
		} else if (node.type === "list") {
			for (const item of node.children) {
				const children = item.children[0]?.children || [];
				const textContent = children.map((n) => n.value || "").join("");
				const isTodo = /^\[.\]/.test(textContent);

				if (isTodo) {
					blocks.push({
						object: "block",
						type: "to_do",
						to_do: {
							checked: /^\[x\]/i.test(textContent),
							rich_text: parseRichText([
								{ type: "text", value: textContent.replace(/^\[.\]\s*/, "") }
							])
						}
					});
				} else {
					blocks.push({
						object: "block",
						type: node.ordered ? "numbered_list_item" : "bulleted_list_item",
						[node.ordered ? "numbered_list_item" : "bulleted_list_item"]: {
							rich_text: parseRichText(children)
						}
					});
				}
			}
		} else if (node.type === "code") {
			blocks.push({
				object: "block",
				type: "code",
				code: {
					language: node.lang || "plain text",
					rich_text: [
						{
							type: "text",
							text: {
								content: node.value
							}
						}
					]
				}
			});
		} else if (node.type === "thematicBreak") {
			blocks.push({
				object: "block",
				type: "divider",
				divider: {}
			});
		} else if (node.type === "table") {
			const rows = node.children.map((row) => {
				return row.children.map((cell) => {
					const content = cell.children.map((n) => n.value || "").join("");
					return {
						type: "text",
						text: { content }
					};
				});
			});

			blocks.push({
				object: "block",
				type: "table",
				table: {
					table_width: rows[0]?.length || 1,
					has_column_header: false,
					has_row_header: false,
					children: rows.map((row) => ({
						object: "block",
						type: "table_row",
						table_row: {
							cells: row.map((cell) => [cell])
						}
					}))
				}
			});
		}
	}

	return blocks;
}
