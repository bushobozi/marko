import {
  r as s,
  c as a,
  a as n,
  o as t,
  v as o,
  b as c,
  q as l,
  d as i,
  e as m,
  i as e,
  f as u,
  l as d,
  g as r,
  h as f,
  j as p,
  k as $,
} from "./runtime-VwvNzW5V.js";
const b = s(
    "QURHKITf",
    a(`${x}`, `/${D}&`, (s) => {
      H(s[0]), q(s[0], { comments: comment.comments, path: id });
    }),
  ),
  h = u(2, (s) => {
    const {
      _: { 2: a },
      7: n,
    } = s;
    j(s, `${a.path || "c"}-${n}`);
  }),
  k = f(4),
  v = n("ZcKJNKFe", (s) =>
    t(
      s[2],
      "click",
      ((s) => {
        const { 9: a } = s;
        return function () {
          l(s, K, !a);
        };
      })(s),
    ),
  ),
  K = o(9, (s, a) => {
    i(s[0], "hidden", !a), m(s[3], a ? "[-]" : "[+]"), p(s, v);
  }),
  j = o(8, (s, a) => i(s[0], "id", a)),
  E = o(7, null, h),
  F = o(6, (s, a) => {
    m(s[1], a.text), k(s, a.comments ? b : null);
  }),
  Z = o(
    5,
    (s, a) => {
      F(s, a[0]), E(s, a[1]);
    },
    E,
  ),
  _ = c(2, null, void 0, h),
  g = d(
    0,
    s(
      "$F_EaYZk",
      a(
        "<li><span> </span><button> </button><!></li>",
        " E l D l%",
        (s) => {
          K(s, !0);
        },
        [_],
        void 0,
        Z,
      ),
    ),
  ),
  q = o(2, (s, a) => g(s, [a.comments]), e([g, r(_, 0)])),
  x = "<ul></ul>",
  D = " b",
  H = function () {};
$();
