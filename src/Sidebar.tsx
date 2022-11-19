import { colord } from "colord";
import { Accessor, Component, createSignal, For, Setter, Show } from "solid-js";
import { DMC_GROUPINGS } from "./colorOrder";
import { DMC, DMC_COLORS, getClosestDMC } from "./colors";
import { getSaveDescriptions, loadSave } from "./saves";
import styles from "./Sidebar.module.css";
import { Palette, Tool } from "./types";

export const Sidebar: Component<{
  drawColor: DMC;
  setDrawColor: Setter<DMC>;
  onSave: (description: string) => void;
  onLoad: (description: string) => void;
  onImport: (file: File) => void;
  palette: Palette;
  tool: Tool;
  setTool: Setter<Tool>;
}> = (props) => {
  const [showPicker, setShowPicker] = createSignal(false);
  const [hoveredColor, setHoveredColor] = createSignal<DMC | null>(null);
  const [description, setDescription] = createSignal("");
  const [saveDescriptions, setSaveDescriptions] = createSignal(
    getSaveDescriptions()
  );

  return (
    <div class={styles.sidebar}>
      <button
        class={styles.pickerButton}
        style={{ "background-color": props.drawColor.hex }}
        onClick={() => setShowPicker(true)}
      >
        <span
          style={{
            color: colord(props.drawColor.hex).isDark() ? "white" : "black",
          }}
        >
          {props.drawColor.name} ({props.drawColor.dmc})
        </span>
      </button>
      <Show when={showPicker()}>
        <div class={styles.modalBg} onClick={() => setShowPicker(false)}></div>
        <div class={styles.modal}>
          <div class={styles.modalHeader}>
            {hoveredColor()
              ? `${hoveredColor()!.name} (${hoveredColor()!.dmc})`
              : "\u00A0"}
          </div>
          <div class={styles.colorHolder}>
            <For each={DMC_COLORS}>
              {(c) => (
                <div
                  class={styles.pickerBox}
                  style={{ "background-color": c.hex }}
                  onMouseOver={() => setHoveredColor(c)}
                  onMouseOut={() => setHoveredColor(null)}
                  onClick={() => {
                    props.setDrawColor(c);
                    setShowPicker(false);
                  }}
                ></div>
              )}
            </For>
          </div>
        </div>
      </Show>
      <input
        type="text"
        placeholder="Description"
        onInput={(e) => setDescription(e.currentTarget.value)}
      ></input>
      <button onMouseDown={() => props.onSave(description())}>Save</button>
      <select
        onChange={(ev) => {
          props.onLoad(ev.currentTarget.value);
          ev.currentTarget.selectedIndex = 0;
        }}
      >
        <option disabled selected>
          Load...
        </option>
        <For each={saveDescriptions()}>
          {(d) => <option value={d}>{d}</option>}
        </For>
      </select>
      <input
        type="file"
        accept="image/*,.json"
        onChange={async (ev) => {
          props.onImport(ev.currentTarget.files![0]);
        }}
      ></input>
      <div class={styles.sidebarHeader}>Tool</div>
      <div style={{ display: "flex" }}>
        <ToolButton
          icon="✖"
          active={props.tool === Tool.CROSS}
          onClick={() => props.setTool(Tool.CROSS)}
        />
        <ToolButton
          icon="∅"
          active={props.tool === Tool.CLEAR}
          onClick={() => props.setTool(Tool.CLEAR)}
        />
        <ToolButton
          icon="⛢"
          active={props.tool === Tool.PICKER}
          onClick={() => props.setTool(Tool.PICKER)}
        />
        <ToolButton
          icon="🔦"
          active={props.tool === Tool.HIGHLIGHT}
          onClick={() => props.setTool(Tool.HIGHLIGHT)}
        />
      </div>
      <div class={styles.sidebarHeader}>Palette</div>
      <div class={styles.palette}>
        <For each={props.palette}>
          {(p) => (
            <button
              class={styles.paletteButton}
              style={{
                "background-color": p.hex,
                "box-shadow":
                  p.hex === props.drawColor.hex
                    ? "rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px"
                    : "none",
                "border-bottom-color": colord(p.hex).isLight()
                  ? "black"
                  : "white",
                "border-bottom-width": "8px",
                "border-bottom-style":
                  p.hex === props.drawColor.hex ? "solid" : "none",
              }}
              onclick={() => props.setDrawColor(p)}
            />
          )}
        </For>
      </div>
    </div>
  );
};

const ToolButton: Component<{
  icon: string;
  active: boolean;
  onClick: () => void;
}> = (props) => {
  return (
    <button
      class={styles.toolButton}
      onclick={props.onClick}
      style={{
        border: props.active ? "3px solid black" : "none",
      }}
    >
      {props.icon}
    </button>
  );
};
