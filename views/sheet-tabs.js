const defaultTab = "lore";

var currentTab = defaultTab;
document.querySelector(`.tab[data-tab="${currentTab}"]`).dataset.active = true;
document.querySelector(`.tabcontent[data-tab="${currentTab}"]`).dataset.active = true;

function setCurrentTab() {
  let tab = window.location.hash.substr(1);
  if (document.querySelector(`.tabcontent[data-tab="${tab}"]`) != null) {
    switchTab(tab);
  }
}

addOnLoad(setCurrentTab);

function switchTab(tabname) {
  if (currentTab == tabname) { return; }

  let currentTabButton = document.querySelector(`.tab[data-tab="${currentTab}"]`);
  currentTabButton.dataset.active = false;
  let tabButton = document.querySelector(`.tab[data-tab="${tabname}"]`);
  tabButton.dataset.active = true;

  let currentTabContent = document.querySelector(`.tabcontent[data-tab="${currentTab}"]`);
  currentTabContent.dataset.active = false;
  let tabContent = document.querySelector(`.tabcontent[data-tab="${tabname}"]`);
  tabContent.dataset.active = true;

  currentTab = tabname;

  let hash = (tabname != defaultTab) ? "#" + tabname : "";
  window.history.pushState(window.document.title, window.document.title,
    window.location.href.split('#')[0] + hash);

}
