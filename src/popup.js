document.getElementById("submitBtn").onclick = () => {
  let radios = document.getElementsByName("filterRadio");
  let selectedFilter;
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      selectedFilter = radios[i].value;
      break;
    }
  }
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let currTab = tabs[0];
    if (currTab) {
      let currTabId = currTab.id;
      chrome.tabs.sendMessage(currTabId, {
        selectedFilter: selectedFilter,
      });
    }
  });
};
