document.addEventListener("DOMContentLoaded", () => {
	const saveBtn = document.getElementById("saveBtn");

	if (!saveBtn) {
		console.error("❌ 저장 버튼을 찾을 수 없어요.");
		return;
	}

	saveBtn.addEventListener("click", () => {
		// ChatGPT 탭을 명시적으로 찾는다!
		chrome.tabs.query({ url: "*://chatgpt.com/*" }, (tabs) => {
			if (!tabs || tabs.length === 0) {
				alert("❌ ChatGPT 탭이 열려있지 않아요!");
				return;
			}

			const chatgptTab = tabs[0];

			chrome.scripting.executeScript(
				{
					target: { tabId: chatgptTab.id },
					func: () => window.getSelection().toString()
				},
				async (results) => {
					if (!results || !results[0] || !results[0].result) {
						alert("❗ 선택된 텍스트가 없거나 실행에 실패했어요.");
						return;
					}

					const content = results[0].result.trim();
					const title = content.slice(0, 30);

					try {
						const response = await fetch(
							"https://chatgpt-to-notion.vercel.app/api/save-to-notion",
							{
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ title, content })
							}
						);

						if (!response.ok) {
							throw new Error(`서버 오류: ${response.status}`);
						}

						alert("✅ 노션에 저장했어요!");
					} catch (error) {
						console.error("❌ 저장 중 오류 발생:", error);
						alert("노션 저장 중 문제가 발생했어요 😥");
					}
				}
			);
		});
	});
});
