import { colord } from "colord";
import { Component, createEffect, createSignal, For } from "solid-js";
import { createStore, produce } from "solid-js/store";
import styles from "./App.module.css";
import { Canvas } from "./Canvas";
import { DMC, DMC_COLORS, getClosestDMC } from "./colors";
import { loadImageFromFile } from "./load";
import { doSave, loadSave } from "./saves";
import { Sidebar } from "./Sidebar";
import {
  ClothCount,
  Palette,
  PaletteIndex,
  Crosses,
  Tool,
  Save,
} from "./types";

export function emptyCrosses(squaresW: number, squaresH: number): Crosses {
  const crosses: Crosses = new Array(squaresH);
  for (let y = 0; y < squaresH; ++y) {
    crosses[y] = new Array(squaresW);
    for (let x = 0; x < squaresW; ++x) {
      crosses[y][x] = null;
    }
  }

  return crosses;
}

const App: Component = () => {
  const [clothCount, setClothCount] = createSignal(ClothCount.A14);
  const [palette, setPalette] = createSignal<Palette>([]);
  const [crosses, setCrosses] = createStore<Crosses>(emptyCrosses(89, 70));
  const [tool, setTool] = createSignal<Tool>(Tool.CROSS);
  const [drawColor, setDrawColor] = createSignal<DMC>(
    DMC_COLORS.find((c) => c.name === "Black")!
  );

  function onSave(description: string) {
    console.log({ description });
    doSave(description, {
      clothCount: clothCount(),
      palette: palette(),
      crosses: crosses,
    });
  }

  function onLoad(description: string) {
    const save = loadSave(description);
    console.log({ save });
    setClothCount(save.clothCount);
    setPalette(save.palette);
    setCrosses(save.crosses);
  }

  async function onImportJson(file: File) {
    const str = new TextDecoder("utf-8").decode(await file.arrayBuffer());
    const save: Save = JSON.parse(str);
    setClothCount(save.clothCount);
    setPalette(save.palette);
    setCrosses(save.crosses);
  }

  async function onImportImage(file: File) {
    const img = await loadImageFromFile(file);
    const palette: DMC[] = [];
    const crosses: Crosses = emptyCrosses(img.width, img.height);
    console.log(img.height, img.width);
    console.log(crosses.length, crosses[0].length);
    for (let y = 0; y < img.height; ++y) {
      for (let x = 0; x < img.width; ++x) {
        const r = img.data[4 * (y * img.width + x) + 0];
        const g = img.data[4 * (y * img.width + x) + 1];
        const b = img.data[4 * (y * img.width + x) + 2];
        const color = getClosestDMC(colord({ r, g, b }).toHex());
        let idx = palette.findIndex((c) => c.hex === color.hex);
        if (idx >= 0) {
          crosses[y][x] = idx;
        } else {
          palette.push(color);
          crosses[y][x] = palette.length - 1;
        }
      }
    }
    setPalette(palette);
    setCrosses(crosses);
  }

  function onImport(file: File) {
    if (file.name.endsWith("json")) {
      onImportJson(file);
    } else {
      onImportImage(file);
    }
  }

  return (
    <div class={styles.App}>
      <Sidebar
        drawColor={drawColor()}
        setDrawColor={setDrawColor}
        onSave={onSave}
        onLoad={onLoad}
        onImport={onImport}
        palette={palette()}
        tool={tool()}
        setTool={setTool}
      />
      <div class={styles.canvasHolder}>
        <Canvas
          drawColor={drawColor()}
          setDrawColor={setDrawColor}
          palette={palette()}
          setPalette={setPalette}
          crosses={crosses}
          setPattern={setCrosses}
          clothCount={clothCount()}
          tool={tool()}
        />
      </div>
    </div>
  );
};

export default App;
