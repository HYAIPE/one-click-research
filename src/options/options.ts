import { GITHUB_URL } from "../shared/constants";
import {
  defaultSettings,
  getOrderedPlatforms,
  loadSettings,
  saveSettings,
} from "../shared/settings";
import type { PlatformId, Settings } from "../shared/types";

const platformList = document.getElementById("platform-list") as HTMLUListElement;
const zeroWarning = document.getElementById("zero-warning") as HTMLParagraphElement;
const groupTabsToggle = document.getElementById("toggle-group-tabs") as HTMLButtonElement;
const newTabToggle = document.getElementById("toggle-new-tab") as HTMLButtonElement;
const resetButton = document.getElementById("reset-defaults") as HTMLButtonElement;
const resetStatus = document.getElementById("reset-status") as HTMLParagraphElement;
const githubLink = document.getElementById("github-link") as HTMLAnchorElement;

let current: Settings;

function render(settings: Settings): void {
  current = settings;
  platformList.replaceChildren();

  const ordered = getOrderedPlatforms(settings);
  ordered.forEach((platform, index) => {
    const enabled = settings.enabledPlatforms[platform.id];

    const row = document.createElement("li");
    row.className = "platform-row";

    const name = document.createElement("span");
    name.className = "platform-name";
    name.dataset.enabled = String(enabled);
    name.textContent = platform.name;

    const controls = document.createElement("div");
    controls.className = "row-controls";

    const up = document.createElement("button");
    up.className = "move-button";
    up.type = "button";
    up.textContent = "↑";
    up.setAttribute("aria-label", `Move ${platform.name} up`);
    up.disabled = index === 0;
    up.addEventListener("click", () => void move(platform.id, -1));

    const down = document.createElement("button");
    down.className = "move-button";
    down.type = "button";
    down.textContent = "↓";
    down.setAttribute("aria-label", `Move ${platform.name} down`);
    down.disabled = index === ordered.length - 1;
    down.addEventListener("click", () => void move(platform.id, 1));

    const toggle = document.createElement("button");
    toggle.className = "switch";
    toggle.type = "button";
    toggle.setAttribute("role", "switch");
    toggle.setAttribute("aria-checked", String(enabled));
    toggle.setAttribute("aria-label", `${platform.name} search`);
    toggle.textContent = enabled ? "On" : "Off";
    toggle.addEventListener("click", () => void togglePlatform(platform.id));

    controls.append(up, down, toggle);
    row.append(name, controls);
    platformList.append(row);
  });

  zeroWarning.hidden = Object.values(settings.enabledPlatforms).some(Boolean);
  renderSwitch(groupTabsToggle, settings.groupTabs);
  renderSwitch(newTabToggle, settings.openInNewTab);
}

function renderSwitch(button: HTMLButtonElement, on: boolean): void {
  button.setAttribute("aria-checked", String(on));
  button.textContent = on ? "On" : "Off";
}

async function update(next: Settings): Promise<void> {
  await saveSettings(next);
  render(next);
}

async function togglePlatform(id: PlatformId): Promise<void> {
  await update({
    ...current,
    enabledPlatforms: { ...current.enabledPlatforms, [id]: !current.enabledPlatforms[id] },
  });
}

async function move(id: PlatformId, delta: -1 | 1): Promise<void> {
  const order = [...current.platformOrder];
  const from = order.indexOf(id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= order.length) return;
  const [moved] = order.splice(from, 1);
  if (moved === undefined) return;
  order.splice(to, 0, moved);
  await update({ ...current, platformOrder: order });
}

groupTabsToggle.addEventListener("click", () => {
  void update({ ...current, groupTabs: !current.groupTabs });
});

newTabToggle.addEventListener("click", () => {
  void update({ ...current, openInNewTab: !current.openInNewTab });
});

resetButton.addEventListener("click", () => {
  void update(defaultSettings()).then(() => {
    resetStatus.textContent = "Settings restored to defaults.";
  });
});

githubLink.href = GITHUB_URL;

void loadSettings().then(render);
