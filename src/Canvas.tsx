import { colord } from "colord";
import {
  Component,
  createEffect,
  createSignal,
  For,
  Setter,
  Show,
} from "solid-js";
import { produce, SetStoreFunction } from "solid-js/store";
import styles from "./Canvas.module.css";
import { DMC } from "./colors";
import { Palette, PaletteIndex, Crosses, Tool, ClothCount } from "./types";

const PX_PER_IN = 96;

const Line: Component<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  faded: boolean;
}> = (props) => {
  return (
    <line
      x1={props.x1}
      y1={props.y1}
      x2={props.x2}
      y2={props.y2}
      stroke={props.color}
      stroke-linecap="round"
      stroke-width="3"
      opacity={props.faded ? 0.1 : 1}
    ></line>
  );
};

export const Canvas: Component<{
  drawColor: DMC;
  setDrawColor: Setter<DMC>;
  crosses: Crosses;
  setPattern: SetStoreFunction<Crosses>;
  palette: Palette;
  setPalette: Setter<Palette>;
  clothCount: number;
  tool: Tool;
}> = (props) => {
  const [holdingMouse, setHoldingMouse] = createSignal(false);
  let xIdx: number | undefined;
  let yIdx: number | undefined;
  let canvas: HTMLCanvasElement | undefined;

  function useTool(xIdx: number, yIdx: number) {
    if (props.tool === Tool.CROSS) {
      let paletteIdx: PaletteIndex = props.palette.findIndex(
        (c) => c.hex === props.drawColor.hex
      );

      if (paletteIdx < 0) {
        paletteIdx = props.palette.length;
        props.setPalette((p) => [...p, props.drawColor]);
      }

      props.setPattern(
        produce((p) => {
          p[yIdx][xIdx] = paletteIdx;
        })
      );
    }

    if (props.tool === Tool.CLEAR) {
      props.setPattern(
        produce((p) => {
          p[yIdx][xIdx] = null;
        })
      );
    }

    if (props.tool === Tool.PICKER) {
      props.setDrawColor(props.palette[props.crosses[yIdx][xIdx]!]);
    }
  }

  function pxToIdx(px: number) {
    return Math.floor((px / PX_PER_IN) * props.clothCount);
  }

  function idxToPx(idx: number) {
    return Math.round((idx * PX_PER_IN) / props.clothCount);
  }

  // Redraw "holes" on canvas when pattern size changes
  createEffect(() => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ddd";
    for (let y = 0; y < props.crosses.length + 1; ++y) {
      for (let x = 0; x < props.crosses[0].length + 1; ++x) {
        ctx.fillRect(idxToPx(x) - 1, idxToPx(y) - 1, 2, 2);
      }
    }
  });

  return (
    <div class={styles.canvasContainer}>
      <canvas
        width={idxToPx(props.crosses[0].length)}
        height={idxToPx(props.crosses.length)}
        class={styles.canvas}
        ref={canvas}
      ></canvas>
      <svg
        width={idxToPx(props.crosses[0].length)}
        height={idxToPx(props.crosses.length)}
        class={styles.canvasSvg}
        onMouseDown={(e) => {
          setHoldingMouse(true);
          xIdx = pxToIdx(e.offsetX);
          yIdx = pxToIdx(e.offsetY);
          useTool(xIdx, yIdx);
        }}
        onMouseMove={(e) => {
          if (!holdingMouse()) {
            return;
          }

          // Optimization so we don't keep setting state if we're not changing position
          if (xIdx != pxToIdx(e.offsetX) || yIdx != pxToIdx(e.offsetY)) {
            xIdx = pxToIdx(e.offsetX);
            yIdx = pxToIdx(e.offsetY);
            useTool(xIdx, yIdx);
          }
        }}
        onMouseUp={() => {
          setHoldingMouse(false);
          xIdx = yIdx = undefined;
        }}
      >
        <g id="crosses">
          <For each={props.crosses}>
            {(row, y) => (
              <For each={row}>
                {(col, x) => (
                  <>
                    <Show when={col !== null}>
                      <Show
                        when={
                          props.tool === Tool.HIGHLIGHT &&
                          props.drawColor.hex === props.palette[col!].hex
                        }
                      >
                        <rect
                          x={idxToPx(x())}
                          y={idxToPx(y())}
                          width={PX_PER_IN / props.clothCount}
                          height={PX_PER_IN / props.clothCount}
                          fill={
                            colord(props.palette[col!].hex).isLight()
                              ? "black"
                              : "white"
                          }
                        />
                      </Show>
                      <Line
                        x1={idxToPx(x())}
                        y1={idxToPx(y())}
                        x2={idxToPx(x() + 1)}
                        y2={idxToPx(y() + 1)}
                        color={props.palette[col!].hex}
                        faded={
                          props.tool === Tool.HIGHLIGHT &&
                          props.drawColor.hex !== props.palette[col!].hex
                        }
                      />
                      <Line
                        x1={idxToPx(x() + 1)}
                        y1={idxToPx(y())}
                        x2={idxToPx(x())}
                        y2={idxToPx(y() + 1)}
                        color={props.palette[col!].hex}
                        faded={
                          props.tool === Tool.HIGHLIGHT &&
                          props.drawColor.hex !== props.palette[col!].hex
                        }
                      />
                    </Show>
                  </>
                )}
              </For>
            )}
          </For>
        </g>
      </svg>
    </div>
  );
};
