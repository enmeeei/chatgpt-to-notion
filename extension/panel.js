document.addEventListener("DOMContentLoaded", () => {
	const saveBtn = document.getElementById("saveBtn");

	saveBtn.addEventListener("click", () => {
		const titleInput = document.getElementById("titleInput").value.trim();
		const tagsInput = document.getElementById("tagsInput").value.trim();

		const tags = tagsInput
			.split(",")
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0)
			.map((name) => ({ name }));

		chrome.tabs.query({ url: "*://chatgpt.com/*" }, (tabs) => {
			if (!tabs || tabs.length === 0) {
				alert("❌ ChatGPT 탭이 열려있지 않아요!");
				return;
			}

			const tab = tabs[0];

			chrome.scripting.executeScript(
				{
					target: { tabId: tab.id },
					func: () => {
						const selection = window.getSelection();
						if (!selection || selection.rangeCount === 0) return "";
						const range = selection.getRangeAt(0);
						const container = document.createElement("div");
						container.appendChild(range.cloneContents());
						return container.innerHTML;
					}
				},
				async (results) => {
					if (!results || !results[0] || !results[0].result) {
						alert("선택된 텍스트가 없거나 실행에 실패했어요.");
						return;
					}

					const htmlContent = results[0].result.trim();
					const title = titleInput || htmlContent.replace(/<[^>]+>/g, "").slice(0, 30);

					const payload = {
						title,
						html: htmlContent,
						tags
					};

					try {
						const response = await fetch(
							"https://chatgpt-to-notion.vercel.app/api/save-to-notion",
							{
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify(payload)
							}
						);

						if (!response.ok) throw new Error(`서버 오류: ${response.status}`);
						alert("✅ 노션에 저장했어요!");
					} catch (e) {
						console.error("❌ 저장 중 오류:", e);
						alert("노션 저장 중 문제가 발생했어요 😥");
					}
				}
			);
		});
	});
});
