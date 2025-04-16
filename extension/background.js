chrome.action.onClicked.addListener(() => {
	chrome.windows.create({
		url: "panel.html",
		type: "popup",
		width: 200,
		height: 100
	});
});
