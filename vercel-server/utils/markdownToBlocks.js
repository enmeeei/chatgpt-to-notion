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
							text: { content: node.children.map((n) => n.value).join("") }
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
							text: { content: node.children.map((n) => n.value).join("") }
						}
					]
				}
			});
		} else if (node.type === "list") {
			for (const item of node.children) {
				blocks.push({
					object: "block",
					type: node.ordered ? "numbered_list_item" : "bulleted_list_item",
					[node.ordered ? "numbered_list_item" : "bulleted_list_item"]: {
						rich_text: [
							{
								type: "text",
								text: {
									content: item.children[0].children.map((n) => n.value).join("")
								}
							}
						]
					}
				});
			}
		}
	}

	return blocks;
}
