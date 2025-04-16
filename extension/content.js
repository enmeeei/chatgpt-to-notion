// content.js
function addSaveButtons() {
	const messages = document.querySelectorAll('[data-message-author-role="assistant"]');

	messages.forEach((msg) => {
		if (msg.querySelector(".save-to-notion-btn")) return; // 중복 방지

		const button = document.createElement("button");
		button.innerText = "📝 저장";
		button.className = "save-to-notion-btn";
		button.style.marginLeft = "10px";
		button.style.cursor = "pointer";

		button.onclick = async () => {
			const content = msg.innerText.trim();
			const title = content.slice(0, 30);
			await fetch("https://your-vercel-app.vercel.app/api/save-to-notion", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title, content })
			});
			alert("이 메시지를 노션에 저장했어요!");
		};

		msg.appendChild(button);
	});
}

// DOM 변화 감지 → 새로운 메시지에도 버튼 자동 삽입
const observer = new MutationObserver(addSaveButtons);
observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener("load", addSaveButtons);
