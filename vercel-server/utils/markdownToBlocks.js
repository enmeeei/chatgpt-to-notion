import { remark } from "remark";
import remarkParse from "remark-parse";

export function markdownToBlocks(markdown) {
	const tree = remark().use(remarkParse).parse(markdown);
	const blocks = [];

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
									.map(
										(n) => n.children?.map((c) => c.value || "").join("") || ""
									)
									.join("\n")
							}
						}
					]
				}
			});
		} else if (node.type === "list") {
			for (const item of node.children) {
				const content = item.children[0].children?.map((n) => n.value || "").join("") || "";
				const isTodo = /^\[.\]/.test(content); // - [ ] or - [x]
				if (isTodo) {
					const checked = /^\[x\]/i.test(content);
					blocks.push({
						object: "block",
						type: "to_do",
						to_do: {
							checked,
							rich_text: [
								{
									type: "text",
									text: { content: content.replace(/^\[.\]\s*/, "") }
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
									text: { content }
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
		}
	}

	return blocks;
}
