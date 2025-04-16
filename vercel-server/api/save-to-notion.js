// vercel-server/api/save-to-notion.js

export default async function handler(req, res) {
	const { title, content } = req.body;
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
				Title: {
					title: [{ text: { content: title } }]
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
