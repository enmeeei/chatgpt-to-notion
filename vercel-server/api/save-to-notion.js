import TurndownService from "turndown";

const turndown = new TurndownService();

export default async function handler(req, res) {
	if (req.method === "OPTIONS") {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type");
		return res.status(200).end();
	}

	res.setHeader("Access-Control-Allow-Origin", "*");

	const { title, html, tags } = req.body;
	const content = turndown.turndown(html || "");
	const notionToken = process.env.NOTION_TOKEN;
	const databaseId = process.env.NOTION_DATABASE_ID;

	const response = await fetch("https://api.notion.com/v1/pages", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${notionToken}`,
			"Notion-Version": "2022-06-28",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			parent: { database_id: databaseId },
			properties: {
				제목: {
					title: [
						{
							text: {
								content: title || "제목 없음"
							}
						}
					]
				},
				날짜: {
					date: {
						start: new Date().toISOString()
					}
				},
				태그: {
					multi_select: (tags || []).map((tag) => ({ name: tag.name }))
				}
			},
			children: [
				{
					object: "block",
					type: "paragraph",
					paragraph: { rich_text: [{ type: "text", text: { content } }] }
				}
			]
		})
	});

	if (response.ok) {
		res.status(200).json({ message: "Saved to Notion!" });
	} else {
		const error = await response.text();
		res.status(500).json({ error });
	}
}
