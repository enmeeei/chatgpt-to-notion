import { Client } from "@notionhq/client";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { title, content } = req.body;
  const notion = new Client({ auth: process.env.NOTION_TOKEN });

  try {
    await notion.pages.create({
      parent: { database_id: process.env.NOTION_DB_ID },
      properties: {
        Name: {
          title: [{ text: { content: title || "Untitled" } }]
        }
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            text: [{ type: "text", text: { content: content || "No content" } }]
          }
        }
      ]
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}