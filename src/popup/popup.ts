import { GITHUB_URL } from "../shared/constants";
import { getOrderedPlatforms, loadSettings, saveSettings } from "../shared/settings";
import type { Settings } from "../shared/types";

const platformList = document.getElementById("platform-list") as HTMLUListElement;
const zeroWarning = document.getElementById("zero-warning") as HTMLParagraphElement;
const settingsButton = document.getElementById("open-settings") as HTMLButtonElement;
const githubLink = document.getElementById("github-link") as HTMLAnchorElement;

function render(settings: Settings): void {
  platformList.replaceChildren();

  for (const platform of getOrderedPlatforms(settings)) {
    const enabled = settings.enabledPlatforms[platform.id];

    const row = document.createElement("li");
    row.className = "platform-row";

    const name = document.createElement("span");
    name.className = "platform-name";
    name.dataset.enabled = String(enabled);
    name.textContent = platform.name;

    const toggle = document.createElement("button");
    toggle.className = "switch";
    toggle.type = "button";
    toggle.setAttribute("role", "switch");
    toggle.setAttribute("aria-checked", String(enabled));
    toggle.setAttribute("aria-label", `${platform.name} search`);
    toggle.textContent = enabled ? "On" : "Off";
    toggle.addEventListener("click", () => {
      void toggle_(settings, platform.id);
    });

    row.append(name, toggle);
    platformList.append(row);
  }

  const anyEnabled = Object.values(settings.enabledPlatforms).some(Boolean);
  zeroWarning.hidden = anyEnabled;
}

async function toggle_(settings: Settings, id: keyof Settings["enabledPlatforms"]): Promise<void> {
  const next: Settings = {
    ...settings,
    enabledPlatforms: {
      ...settings.enabledPlatforms,
      [id]: !settings.enabledPlatforms[id],
    },
  };
  await saveSettings(next);
  render(next);
}

settingsButton.addEventListener("click", () => {
  void chrome.runtime.openOptionsPage();
});

githubLink.href = GITHUB_URL;

void loadSettings().then(render);
