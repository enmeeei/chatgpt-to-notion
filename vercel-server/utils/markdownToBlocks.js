import { remark } from "remark";
import remarkParse from "remark-parse";

export function markdownToBlocks(markdown) {
	const tree = remark().use(remarkParse).parse(markdown);
	const blocks = [];

	console.log("tree", tree);
	for (const node of tree.children) {
		if (node.type === "heading") {
			blocks.push({
				object: "block",
				type: `heading_${Math.min(node.depth, 3)}`,
				[`heading_${Math.min(node.depth, 3)}`]: {
					rich_text: [
						{
							type: "text",
							text: { content: node.children.map((n) => n.value || "").join("") }
						}
					]
				}
			});
		} else if (node.type === "paragraph") {
			blocks.push({
				object: "block",
				type: "paragraph",
				paragraph: {
					rich_text: [
						{
							type: "text",
							text: { content: node.children.map((n) => n.value || "").join("") }
						}
					]
				}
			});
		} else if (node.type === "blockquote") {
			blocks.push({
				object: "block",
				type: "quote",
				quote: {
					rich_text: [
						{
							type: "text",
							text: {
								content: node.children
									.flatMap((c) => c.children || [])
									.map((n) => n.value || "")
									.join("")
							}
						}
					]
				}
			});
		} else if (node.type === "list") {
			for (const item of node.children) {
				const textContent =
					item.children[0]?.children?.map((n) => n.value || "").join("") || "";
				const isTodo = /^\[.\]/.test(textContent);

				if (isTodo) {
					blocks.push({
						object: "block",
						type: "to_do",
						to_do: {
							checked: /^\[x\]/i.test(textContent),
							rich_text: [
								{
									type: "text",
									text: { content: textContent.replace(/^\[.\]\s*/, "") }
								}
							]
						}
					});
				} else {
					blocks.push({
						object: "block",
						type: node.ordered ? "numbered_list_item" : "bulleted_list_item",
						[node.ordered ? "numbered_list_item" : "bulleted_list_item"]: {
							rich_text: [
								{
									type: "text",
									text: { content: textContent }
								}
							]
						}
					});
				}
			}
		} else if (node.type === "code") {
			const lines = (node.value || "").split("\n");
			blocks.push({
				object: "block",
				type: "code",
				code: {
					language: node.lang || "plain text",
					rich_text: lines.map((line, index) => ({
						type: "text",
						text: { content: line + (index < lines.length - 1 ? "\n" : "") }
					}))
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
