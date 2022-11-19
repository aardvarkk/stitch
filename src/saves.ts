import { Save } from "./types";

const SAVE_PREFIX = "save_";

export function getSaveDescriptions() {
  const saveDescriptions: string[] = [];
  for (let i = 0; i < localStorage.length; ++i) {
    const key = localStorage.key(i);
    if (key?.startsWith(SAVE_PREFIX)) {
      saveDescriptions.push(key.slice(SAVE_PREFIX.length));
    }
  }
  return saveDescriptions;
}

export function loadSave(description: string): Save {
  const item = localStorage.getItem(`${SAVE_PREFIX}${description}`);
  if (!item) {
    throw Error(`Couldn't find ${description}`);
  }
  return JSON.parse(item);
}

export function doSave(description: string, save: Save) {
  localStorage.setItem(`${SAVE_PREFIX}${description}`, JSON.stringify(save));
}
