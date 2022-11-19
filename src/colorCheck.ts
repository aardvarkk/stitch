import { DMC_ORDER } from "./colorOrder";
import { DMC_COLORS } from "./colors";

console.log(`${DMC_COLORS.length} color values`);
console.log(`${DMC_ORDER.length} ordering values`);

const colorNames = new Set(DMC_COLORS.map((c) => c.dmc));
const orderNames = new Set(DMC_ORDER);

console.log(DMC_COLORS[0]);
console.log(DMC_COLORS[DMC_COLORS.length - 1]);

for (const c of colorNames) {
  if (!orderNames.has(c)) {
    console.warn(`Order is missing ${c}`);
  }
}

for (const o of orderNames) {
  if (!colorNames.has(o)) {
    console.warn(`Color is missing ${o}`);
  }
}
