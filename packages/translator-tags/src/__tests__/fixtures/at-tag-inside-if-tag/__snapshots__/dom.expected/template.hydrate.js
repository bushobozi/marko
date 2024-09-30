// size: 258 (min) 176 (brotli)

import {
  value as o,
  data as m,
  conditional as r,
  register as t,
  createRenderer as b,
  attrTag as e,
  bindRenderer as a,
  inChild as d,
} from "@marko/runtime-tags/dom";
const i = r(0),
  l = o(
    4,
    (o, r) => {
      m(o[1], r.x), i(o, r);
    },
    i,
  );
t("b0", b("Goodbye", "")), t("b1", b("Hello", ""));
d(0, l);
