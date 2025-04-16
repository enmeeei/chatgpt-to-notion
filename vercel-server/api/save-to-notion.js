import { Client } from "@notionhq/client";
import TurndownService from "turndown";
import { markdownToBlocks } from "../utils/markdownToBlocks";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
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
	const markdown = turndown.turndown(html || "");
	const blocks = markdownToBlocks(markdown);
	const databaseId = process.env.NOTION_DATABASE_ID;

	if (!Array.isArray(blocks) || blocks.length === 0) {
		throw new Error("❗ 마크다운 변환 결과가 비어 있음");
	}

	try {
		await notion.pages.create({
			parent: { database_id: databaseId },
			properties: {
				제목: {
					title: [{ text: { content: title || "제목 없음" } }]
				},
				태그: {
					multi_select: tags || []
				},
				날짜: {
					date: { start: new Date().toISOString() }
				}
			},
			children: blocks
		});

		res.status(200).json({ message: "Saved to Notion!" });
	} catch (error) {
		console.error("❌ Notion 저장 오류:", error);
		res.status(500).json({ error: error.message || "저장 실패" });
	}
}
