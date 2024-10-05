import {
  r as s,
  c as n,
  a,
  o as t,
  v as o,
  b as i,
  q as c,
  d as m,
  e as l,
  f as u,
  i as e,
  g as d,
  l as r,
  h as $,
  j as f,
  k as b,
  m as p,
} from "./runtime-CUEnj_xF.js";
const v = s(
    "QURHKITf",
    n(`${q}`, `/${x}&`, (s) => {
      D(s[0]), g(s[0], { comments: comment.comments, path: id });
    }),
  ),
  h = d(2, (s) => {
    const {
      _: { 2: n },
      7: a,
    } = s;
    j(s, `${n.path || "c"}-${a}`);
  }),
  k = f(4),
  K = a("ZcKJNKFe", (s) =>
    t(
      s[2],
      "click",
      ((s) => {
        const { 9: n } = s;
        return function () {
          c(s, T, !n);
        };
      })(s),
    ),
  ),
  T = o(9, (s, n) => {
    m(s[0], "hidden", !n), l(s[3], n ? "[-]" : "[+]"), u(s, K);
  }),
  j = o(8, (s, n) => m(s[0], "id", n)),
  E = o(7, null, h),
  F = o(6, (s, n) => {
    l(s[1], n.text), k(s, n.comments ? v : null);
  }),
  U = o(
    5,
    (s, n) => {
      F(s, n[0]), E(s, n[1]);
    },
    E,
  ),
  Z = i(2, null, void 0, h),
  _ = r(
    0,
    s(
      "$F_EaYZk",
      n(
        "<li><span> </span><button> </button><!></li>",
        " E l D l%",
        (s) => {
          T(s, !0);
        },
        [Z],
        void 0,
        U,
      ),
    ),
  ),
  g = o(2, (s, n) => _(s, [n.comments]), e([_, $(Z, 0)])),
  q = "<ul></ul>",
  x = " b",
  D = function () {},
  H = o(2, (s, n) => g(s[0], n), p(0, g));
b(
  n(
    `${q}`,
    `/${x}&`,
    (s) => {
      D(s[0]);
    },
    void 0,
    void 0,
    o(1, (s, n) => H(s, n[0]), H),
  ),
  "rUbTinTf",
).mount();
