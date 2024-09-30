var e = [],
  t = Symbol();
function n(n) {
  return (n[Symbol.iterator] = i), (n[t] = e), n;
}
function r(r, i) {
  return r ? (r[t] === e ? (r[t] = [i]) : r[t].push(i), r) : n(i);
}
function* i() {
  yield this, yield* this[t];
}
function o(e, t) {
  for (let n in e) t(n, e[n]);
}
function l(e, t) {
  if (e) {
    let n = 0;
    for (let r of e) t(r, n++);
  }
}
function f(e, t, n, r) {
  let i = t || 0,
    o = n || 1;
  for (let t = (e - i) / o, n = i; n < t; n++) r(i + n * o);
}
function u(e) {
  return { z: 1, $global: e };
}
var a = u({});
function c(e) {
  return (a.a = a.b = e), a;
}
function s(e) {
  return (t, n) => {
    t.k ??= new Map();
    let r = t.k.get(n);
    return r || ((r = e(t, n)), t.k.set(n, r)), r;
  };
}
var d = s((e, t) => t && { ...t, l: e }),
  h = s((e, t) =>
    t.length
      ? function (...n) {
          return t.call(this, e, ...n);
        }
      : function () {
          return t.call(this, e);
        },
  );
function g(e) {
  p(e), e._?.g?.delete(e);
  let t = e.A?.c;
  if (t) for (let n of t) n.h?.(e);
  return e;
}
function p(e) {
  let t = e.g;
  if (t) for (let e of t) p(e);
  let n = e.m;
  if (n) for (let e of n.values()) e.abort();
}
function b(e) {
  g(e);
  let t = e.a,
    n = e.b.nextSibling;
  for (; t !== n; ) {
    let e = t.nextSibling;
    t.remove(), (t = e);
  }
}
function v(e, t, n) {
  let r = e.a,
    i = e.b.nextSibling;
  for (; r !== i; ) {
    let e = r.nextSibling;
    t.insertBefore(r, n), (r = e);
  }
}
function y(e, t) {
  let n = e.m;
  if (n) {
    let e = n.get(t);
    e && (e.abort(), n.delete(t));
  }
}
function m(e, t) {
  let n = (e.m ??= new Map()),
    r = n.get(t);
  return (
    r ||
      ((function (e) {
        let t = e._;
        for (; t && !t.g?.has(e); ) (t.g ||= new Set()).add(e), (t = (e = t)._);
      })(e),
      n.set(t, (r = new AbortController()))),
    r.signal
  );
}
var w = 2147483647;
function C(e, t) {
  return t ? e : "";
}
var x = /^(--|ta|or|li|z)|n-c|i(do|nk|m|t)|w$|we/;
function S(e, t) {
  return t || 0 === t
    ? `${e}:${"number" == typeof t && t && !x.test(e) ? t + "px" : t}`
    : "";
}
function $(e, t, n) {
  switch (typeof e) {
    case "string":
      return e;
    case "object":
      if (null !== e) {
        let r = "",
          i = "";
        if (Array.isArray(e))
          for (let o of e) {
            let e = $(o, t, n);
            "" !== e && ((r += i + e), (i = t));
          }
        else
          for (let o in e) {
            let l = n(o, e[o]);
            "" !== l && ((r += i + l), (i = t));
          }
        return r;
      }
  }
  return "";
}
var N = new Map(),
  M = new WeakMap(),
  k = { capture: !0 };
function A(e, t, n) {
  let r = N.get(t);
  r || N.set(t, (r = new WeakMap())),
    r.has(e) ||
      (function (e, t) {
        let n = e.getRootNode(),
          r = M.get(n);
        r || M.set(n, (r = new Set())),
          r.has(t) || (r.add(t), n.addEventListener(t, _, k));
      })(e, t),
    r.set(e, n || void 0);
}
function _(e) {
  let t = e.target;
  if (t) {
    let n = N.get(e.type);
    if ((n.get(t)?.(e, t), e.bubbles))
      for (; (t = t.parentElement) && !e.cancelBubble; ) n.get(t)?.(e, t);
  }
}
var E = /^on[A-Z-]/;
function B(e, t, n) {
  I(
    e,
    t,
    (function (e) {
      if (e || 0 === e) return !0 === e ? "" : e + "";
    })(n),
  );
}
function I(e, t, n) {
  void 0 === n ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function T(e, t) {
  I(
    e,
    "class",
    (function (e) {
      return $(e, " ", C);
    })(t) || void 0,
  );
}
function j(e, t) {
  I(
    e,
    "style",
    (function (e) {
      return $(e, ";", S);
    })(t) || void 0,
  );
}
function O(e, t) {
  let n = (function (e) {
    return e || 0 === e ? e + "" : "‍";
  })(t);
  e.data !== n && (e.data = n);
}
function q(e, t, n) {
  let r,
    i = e[t];
  for (let { name: e } of i.attributes) (n && e in n) || i.removeAttribute(e);
  for (let e in n) {
    let t = n[e];
    switch (e) {
      case "class":
        T(i, t);
        break;
      case "style":
        j(i, t);
        break;
      case "renderBody":
        break;
      default:
        E.test(e)
          ? ((r ??= {})["-" === e[2] ? e.slice(3) : e.slice(2).toLowerCase()] =
              t)
          : B(i, e, t);
    }
  }
  e[t + "~"] = r;
}
function R(e, t) {
  let n = e[t],
    r = e[t + "~"];
  for (let e in r) A(n, e, r[e]);
}
var D = document.createElement("template");
function L(e, t, n) {
  let r = e[n],
    i = e[n + "-"] || r,
    o = r.parentNode,
    l = i.nextSibling;
  D.innerHTML = t || 0 === t ? `${t}` : "<!>";
  let f = D.content;
  (e[n] = f.firstChild), (e[n + "-"] = f.lastChild), o.insertBefore(f, r);
  let u = r;
  for (; u !== l; ) {
    let e = u.nextSibling;
    u.remove(), (u = e);
  }
}
function W(e, t, n) {
  let r = e[n],
    i = e[n + "-"],
    o = e[t];
  if (i) for (let e in i) e in r || (o[e] = void 0);
  for (let e in r) o[e] = r[e];
  e[n + "-"] = r;
}
function z(e, t, n) {
  let r = e[t];
  r
    ? (Object.assign(r, n), r.onUpdate?.())
    : ((e[t] = n),
      n.onMount?.(),
      (m(e, "-" + t).onabort = () => n.onDestroy?.()));
}
var P = {},
  F = {},
  H = {};
function J(e, t) {
  let n = e + "#";
  return (e, r) => {
    r !== P && void 0 === e[n] && t(e, r);
  };
}
function U(e, t) {
  let n = e + "#";
  return (r, i) => {
    if (i !== P && i !== F && i !== H) {
      if (null != i && "function" != typeof i)
        throw new Error(`Invalid value ${i} for change handler '${e}'`);
      if (void 0 !== r[n]) {
        let t = r[e];
        if (t && !i)
          throw new Error(
            `Change handler '${e}' cannot change from a function to ${i}`,
          );
        if (!t && i)
          throw new Error(
            `Change handler '${e}' cannot change from a nullish to a function`,
          );
      }
    }
    t(r, i);
  };
}
function Z(e, t, n) {
  let r = e + "#";
  return (i, o) => {
    if (o === P) 1 === (i[r] = (i[r] ?? 0) + 1) && n?.(i, P);
    else if (o !== H) {
      let l = void 0 !== i[r];
      1 === (i[r] ||= 1) &&
        (o === F || (l && i[e] === o)
          ? n?.(i, F)
          : ((i[e] = o), t?.(i, o), n?.(i, H))),
        i[r]--;
    }
  };
}
var G = 0;
function K(e, t, n) {
  let r = "?" + G++,
    i = r + "#";
  return (o, l) => {
    l === P
      ? 1 === (o[i] = (o[i] ?? 0) + 1) && n?.(o, P)
      : void 0 === o[i]
        ? ((o[i] = e - 1), (o[r] = !0))
        : 0 == --o[i]
          ? l === H || o[r]
            ? ((o[r] = !1), t(o, 0), n?.(o, H))
            : n?.(o, F)
          : (o[r] ||= l === H);
  };
}
var Q = (e) => e._;
function V(e, t, n, r) {
  let i = "?" + G++,
    o = i + 1,
    l = n || Q,
    f = "function" == typeof e ? e : () => e;
  return (e, n) => {
    if (n === P) 1 === (e[o] = (e[o] ?? 0) + 1) && r?.(e, P);
    else {
      let u, a;
      if (void 0 === e[o]) {
        (u = l(e)), (a = f(e));
        let t = u[a + "#"],
          r = void 0 === t ? !u.z : 0 === t;
        (e[o] = r ? 1 : 2), (n = H);
      }
      0 == --e[o]
        ? n === H || e[i]
          ? ((e[i] = !1), (u ??= l(e)), (a ??= f(e)), t?.(e, u[a]), r?.(e, H))
          : r?.(e, F)
        : (e[i] ||= n === H);
    }
  };
}
function X(e, t, n, r) {
  let i = n || Q,
    o = "function" == typeof e ? e : () => e,
    l = V(o, t, i, r);
  return (
    (l.e = (e) => {
      let t = i(e),
        n = o(e) + "*";
      (t[n] ??= new Set()), t[n].add(h(e, l));
    }),
    (l.h = (e) => {
      let t = i(e),
        n = o(e) + "*";
      t[n]?.delete(h(e, l));
    }),
    l
  );
}
function Y(e, t) {
  let n = (n, r) => {
    let i = n[t];
    for (let t of e) t(i, r);
  };
  return (
    (n.e = (n) => {
      let r = n[t];
      for (let t of e) t.e?.(r);
    }),
    (n.h = (n) => {
      let r = n[t];
      for (let t of e) t.h?.(r);
    }),
    n
  );
}
function ee(e) {
  let t = e + "*";
  return (e, n) => {
    let r = e[t];
    if (r) for (let e of r) e(n);
  };
}
function te(e, t, n) {
  e[t]["/"] = (t) => n(e, t);
}
var ne = (e, t) => e["/"]?.(t),
  re = (e, t, n) => {
    let r = e?.c;
    if (r) for (let e of r) e(t, n);
  },
  ie = new WeakMap();
function oe({ $global: e }) {
  let t = ie.get(e) || 0;
  return ie.set(e, t + 1), "c" + e.runtimeId + e.renderId + t.toString(36);
}
function le(e, t) {
  return (n, r) => {
    t(n[e], r);
  };
}
function fe(e) {
  return (t, n) => {
    for (let r of e) r(t, n);
  };
}
var ue = document.createTreeWalker(document);
function ae(e) {
  let t = e.length;
  for (; e.charCodeAt(--t) > 47; );
  return e.slice(0, t + 1);
}
function ce(e, t, n) {
  (ue.currentNode = e),
    se(t, n, 0),
    (ue.currentNode = document.documentElement);
}
function se(e, t, n) {
  let r,
    i = 0,
    o = 0,
    l = 0;
  for (; (r = e.charCodeAt(n++)); )
    if (((o = i), (i = 0), r >= 117)) i = 10 * o + r - 117;
    else if (r >= 107) {
      for (r = 10 * o + r - 107; r--; ) ue.parentNode();
      ue.nextSibling();
    } else if (r >= 97)
      for (r = 10 * o + r - 97; r--; ) !ue.nextSibling() && ue.nextNode();
    else if (r >= 67) for (r = 20 * o + r - 67; r--; ) ue.nextNode();
    else if (47 === r) n = se(e, (t[l++] = u(t.$global)), n);
    else {
      if (38 === r) return n;
      if (32 === r) t[l++] = ue.currentNode;
      else {
        let e = (t[l++] = document.createTextNode("")),
          n = ue.currentNode,
          i = n.parentNode;
        33 === r
          ? i.insertBefore(e, n)
          : (35 === r ? i.insertBefore(e, n.nextSibling) : i.replaceChild(e, n),
            (ue.currentNode = e));
      }
    }
  return n;
}
function de(e, t, n) {
  let r = u(t);
  if (((r._ = e.l || n), (r.A = e), he(e, r), e.c)) for (let t of e.c) t.e?.(r);
  return r;
}
function he(e, t) {
  let n = "string" == typeof e ? document.createElement(e) : e.j();
  return (
    ce(11 === n.nodeType ? n.firstChild : n, e.n ?? " ", t),
    (t.a = 11 === n.nodeType ? n.firstChild : n),
    (t.b = 11 === n.nodeType ? n.lastChild : n),
    e.o && e.o(t),
    n
  );
}
function ge(e, t, n) {
  return (r, i) => {
    let o = r[e + "("];
    if (!o || o === t || i === H) return;
    let l = r[e + "!"];
    if (i === P || i === F) return o.d?.(l, i);
    if ("string" == typeof o) q(l, 0, i()), xe(l, 0, t && d(r, t));
    else if (o.d) {
      let e = i();
      o.d(l, n ? e : [t ? { ...e, renderBody: d(r, t) } : e]);
    }
  };
}
function pe(e, t, n, r, i = 0, o) {
  return {
    p: e,
    n: t && ae(t),
    o: n,
    j: be,
    c: new Set(r),
    B: i,
    q: void 0,
    d: o,
    l: void 0,
  };
}
function be() {
  let e = this.q;
  if (!e) {
    let t = this.n,
      n = t && t.length < 4 && 32 !== t.charCodeAt(t.length - 1);
    this.q = e = (function (e, t) {
      let n;
      ye.innerHTML = e;
      let r = ye.content;
      return (
        t || (n = r.firstChild) !== r.lastChild || (n && 8 === n.nodeType)
          ? ((n = ve.createDocumentFragment()), n.appendChild(r))
          : n || (n = ve.createTextNode("")),
        n
      );
    })(this.p, n);
  }
  return e.cloneNode(!0);
}
var ve = document,
  ye = ve.createElement("template");
var me = function (e, t, n) {
  let r = e + "(",
    i = e + "!";
  return (o, l) => {
    if (l === H) return;
    let f = o[r],
      u = l;
    if (l !== P && l !== F) {
      let n = l ? l._ || l.renderBody || l : void 0;
      n !== f
        ? ((f = o[r] = n),
          (function (e, t, n) {
            let r,
              i = e[t + "!"];
            n
              ? ((r = e[t + "!"] = de(n, e.$global, e)), (i = i || c(e[t])))
              : ((r = c(e[t])), (e[t + "!"] = void 0)),
              v(r, i.a.parentNode, i.a),
              b(i);
          })(o, e, n),
          t?.(o),
          (u = H))
        : (u = F);
    }
    n?.(o, u), re(f, o[i], u);
  };
};
function we(e, t) {
  let n = t + "!",
    r = t + "(";
  return (t, i) => {
    let o = t[n];
    if (o) {
      let n = t[r];
      (!n?.c || n.c.has(e)) && e(o, i);
    }
  };
}
var Ce = function (e, t, n) {
  let r = e + "(",
    i = e + "!";
  return (o, l) => {
    if (l === H) return;
    let f = o[r],
      u = l;
    if (l !== P && l !== F) {
      let n = l ? l._ || l.renderBody || l : void 0;
      n !== f ? ((f = o[r] = n), xe(o, e, n), t?.(o), (u = H)) : (u = F);
    }
    n?.(o, u), re(f, o[i], u);
  };
};
function xe(e, t, n) {
  let r = e[t + "!"],
    i = e[t];
  if (((i.textContent = ""), n)) {
    v((e[t + "!"] = de(n, e.$global, e)), i, null);
  }
  r && g(r);
}
var Se = new Map([[Symbol(), c(void 0)]]),
  $e = [c(void 0)],
  Ne = new Map(),
  Me = [];
function ke(e, t) {
  return Ee(e, t, ([e, t = Ie], n) => {
    l(
      e,
      "string" == typeof t
        ? (e, r) => n(e[t], [e, r])
        : (e, r) => n(t(e, r), [e, r]),
    );
  });
}
function Ae(e, t) {
  return Ee(e, t, ([e, t = Te], n) => o(e, (e, r) => n(t(e, r), [e, r])));
}
function _e(e, t) {
  return Ee(e, t, ([e, t, n, r = Te], i) => f(e, t, n, (e) => i(r(e), [e])));
}
function Ee(e, t, n) {
  let r = e + "!",
    i = t.c,
    o = t.d;
  return (l, f) => {
    if (f === H) return;
    if (f === P || f === F) {
      for (let t of l[r] ?? l[e + "("].values()) {
        o?.(t, f);
        for (let e of i) e(t, f);
      }
      return;
    }
    let u,
      a,
      s,
      d,
      h = l[e],
      p = 8 === h.nodeType || 3 === h.nodeType,
      y = l[e + "("] || (p ? Se : Ne),
      m = l[e + "!"] || Array.from(y.values()),
      C = !0;
    if (
      (n(f, (e, n) => {
        let r = y.get(e),
          f = F;
        if ((r || ((r = de(t, l.$global, l)), (f = H)), o && o(r, n), i))
          for (let e of i) e(r, f);
        u ? (u.set(e, r), a.push(r)) : ((u = new Map([[e, r]])), (a = [r]));
      }),
      !u)
    )
      if (p) (u = Se), (a = $e), c(h);
      else {
        if (t.B) for (let e = 0; e < m.length; e++) g(m[e]);
        (h.textContent = ""), (u = Ne), (a = Me), (C = !1);
      }
    if (C) {
      if (p) {
        y === Se && c(h);
        let e = m[m.length - 1];
        (s = e.b.nextSibling), (d = e.a.parentNode);
      } else (s = null), (d = h);
      !(function (e, t, n, r) {
        let i,
          o,
          l,
          f,
          u,
          a,
          c = 0,
          s = 0,
          d = t.length - 1,
          h = n.length - 1,
          g = t[c],
          p = n[s],
          y = t[d],
          m = n[h];
        e: {
          for (; g === p; ) {
            if ((++c, ++s, c > d || s > h)) break e;
            (g = t[c]), (p = n[s]);
          }
          for (; y === m; ) {
            if ((--d, --h, c > d || s > h)) break e;
            (y = t[d]), (m = n[h]);
          }
        }
        if (c > d) {
          if (s <= h) {
            (l = h + 1), (f = l < n.length ? n[l].a : r);
            do {
              v(n[s++], e, f);
            } while (s <= h);
          }
        } else if (s > h)
          do {
            b(t[c++]);
          } while (c <= d);
        else {
          let g = d - c + 1,
            p = h - s + 1,
            y = t,
            m = new Array(p);
          for (i = 0; i < p; ++i) m[i] = -1;
          let C = 0,
            x = 0,
            S = new Map();
          for (o = s; o <= h; ++o) S.set(n[o], o);
          for (i = c; i <= d && x < p; ++i)
            (u = t[i]),
              (o = S.get(u)),
              void 0 !== o &&
                ((C = C > o ? w : o),
                ++x,
                (a = n[o]),
                (m[o - s] = i),
                (y[i] = null));
          if (g === t.length && 0 === x) {
            for (; s < p; ++s) v(n[s], e, r);
            for (; c < g; ++c) b(t[c]);
          } else {
            for (i = g - x; i > 0; ) (u = y[c++]), null !== u && (b(u), i--);
            if (C === w) {
              let t = (function (e) {
                let t,
                  n,
                  r = e.slice(),
                  i = [];
                i.push(0);
                for (let o = 0, l = e.length; o < l; ++o) {
                  if (-1 === e[o]) continue;
                  let l = i[i.length - 1];
                  if (e[l] < e[o]) (r[o] = l), i.push(o);
                  else {
                    for (t = 0, n = i.length - 1; t < n; ) {
                      let r = ((t + n) / 2) | 0;
                      e[i[r]] < e[o] ? (t = r + 1) : (n = r);
                    }
                    e[o] < e[i[t]] && (t > 0 && (r[o] = i[t - 1]), (i[t] = o));
                  }
                }
                for (t = i.length, n = i[t - 1]; t-- > 0; )
                  (i[t] = n), (n = r[n]);
                return i;
              })(m);
              for (o = t.length - 1, l = n.length, i = p - 1; i >= 0; --i)
                -1 === m[i] || o < 0 || i !== t[o]
                  ? ((C = i + s),
                    (a = n[C++]),
                    (f = C < l ? n[C].a : r),
                    v(a, e, f))
                  : --o;
            } else if (x !== p)
              for (l = n.length, i = p - 1; i >= 0; --i)
                -1 === m[i] &&
                  ((C = i + s),
                  (a = n[C++]),
                  (f = C < l ? n[C].a : r),
                  v(a, e, f));
          }
        }
      })(d, m, a, s);
    }
    (l[e + "("] = u), (l[e + "!"] = a);
  };
}
function Be(e, t) {
  let n = t + "!";
  return (r, i) => {
    let o = r[n] ?? r[t + "("]?.values() ?? [];
    for (let t of o) e(t, i);
  };
}
function Ie(e, t) {
  return t;
}
function Te(e) {
  return e;
}
var je,
  Oe = (() => {
    let { port1: e, port2: t } = new MessageChannel();
    return (
      (e.onmessage = () => {
        (je = !1), Fe();
      }),
      t
    );
  })();
function qe() {
  Fe(), requestAnimationFrame(Re);
}
function Re() {
  Oe.postMessage(0);
}
var De = [],
  Le = [];
function We(e, t, n, r) {
  return n ? (n(r), r) : ze(e, t, r);
}
function ze(e, t, n) {
  return je || ((je = !0), queueMicrotask(qe)), t(e, P), De.push(e, t, n), n;
}
function Pe(e, t) {
  Le.push(e, t);
}
function Fe() {
  try {
    Ue();
  } finally {
    De = [];
  }
  try {
    Je();
  } finally {
    Le = [];
  }
}
function He(e) {
  let t = De,
    n = Le,
    r = (Le = []);
  De = [];
  try {
    e(), Ue();
  } finally {
    (De = t), (Le = n);
  }
  return r;
}
function Je(e = Le) {
  for (let t = 0; t < e.length; t += 2) {
    let n = e[t];
    (0, e[t + 1])(n);
  }
}
function Ue() {
  for (let e = 0; e < De.length; e += 3) {
    let t = De[e + 0];
    (0, De[e + 1])(t, De[e + 2]);
  }
}
var Ze = {},
  Ge = class {
    s = [];
    t = {};
    C = { _: Ze };
    constructor(e, t, n) {
      (this.D = e), (this.E = t), (this.u = n), (this.x = e[n]), this.y();
    }
    w() {
      this.x.w(), this.y();
    }
    y() {
      let e = this.x,
        t = this.C,
        n = this.t,
        r = e.v;
      if (r.length) {
        let t = e.i.length;
        e.v = [];
        for (let e of r) {
          let r = e.data,
            i = r[t],
            o = parseInt(r.slice(t + 1)),
            l = (n[o] ??= {}),
            f = r.slice(r.indexOf(" ") + 1);
          if ("*" === i) l[f] = e.previousSibling;
          else if ("[" === i) this.s.push(this.f), (this.f = o), (l.a = e);
          else if ("]" === i) {
            if (((l[f] = e), o < this.f)) {
              let t = n[this.f],
                r = e.parentNode,
                i = t.a;
              r !== i.parentNode && r.prepend(i),
                (t.b = e.previousSibling),
                (this.f = this.s.pop());
            }
          } else if ("|" === i) {
            l[parseInt(f)] = e;
            let t = JSON.parse("[" + f.slice(f.indexOf(" ") + 1) + "]"),
              r = e;
            for (let e = t.length - 1; e >= 0; e--) {
              let i = (n[t[e]] ??= {});
              for (; 8 === (r = r.previousSibling).nodeType; );
              i.a = i.b = r;
            }
          }
        }
      }
      let i = e.r;
      if (i) {
        e.r = [];
        let r = i.length,
          o = 0;
        for (; o < r; ) {
          let e = i[o++];
          if ("function" == typeof e) {
            let r = e(t),
              { $global: i } = n;
            i ||
              ((n.$global = i = r.$ || {}),
              (i.runtimeId = this.E),
              (i.renderId = this.u));
            for (let e in r)
              if ("$" !== e) {
                let t = r[e],
                  o = n[e];
                (t.$global = i), o !== t && (n[e] = Object.assign(t, o));
              }
          } else
            o === r || "string" != typeof i[o]
              ? delete this.D[this.u]
              : Ze[i[o++]](n[e]);
        }
      }
    }
  };
function Ke(e, t) {
  return (Ze[e] = t), t;
}
function Qe(e, t) {
  return (Ze[e] = (e) => (n) => t(e, n)), t;
}
function Ve(e, t) {
  return (Ze[e] = (e) => d(e, t)), t;
}
function Xe(e = "M") {
  let t,
    n = (r) => (n[r] = t[r] = new Ge(t, e, r));
  function r(r) {
    t = r;
    for (let e in r) n(e);
    Object.defineProperty(window, e, { configurable: !0, value: n });
  }
  window[e]
    ? r(window[e])
    : Object.defineProperty(window, e, { configurable: !0, set: r });
}
function Ye(e, t) {
  return Ke(e, t.e), t;
}
var et = new Map(),
  tt = {
    patchConditionals: function (e) {
      (me = e(me)), (Ce = e(Ce));
    },
    queueEffect: Pe,
    init() {
      Ke("$C_s", (e) => {
        et.set(e.m5c, e);
      });
    },
    registerRenderer(e) {
      Ke("$C_r", e);
    },
    isOp: (e) => e === P || e === F || e === H,
    isRenderer: (e) => void 0 !== e.j,
    getStartNode: (e) => e.a,
    setScopeNodes(e, t, n) {
      (e.a = t), (e.b = n);
    },
    runComponentEffects() {
      Je(this.effects);
    },
    resolveRegistered: (e, { runtimeId: t, componentIdPrefix: n }) =>
      Array.isArray(e) && "string" == typeof e[0]
        ? (function (e, t) {
            let n = Ze[e];
            return t && n ? (n.p ? d(t, n) : n(t)) : n;
          })(e[0], 2 === e.length && window[t]?.["s" === n ? "_" : n]?.t[e[1]])
        : e,
    createRenderer(e, t, n) {
      let r = pe("", void 0, e, void 0, 1, n);
      return (r.j = t), r;
    },
    render(e, t, n, r) {
      let i = t.scope;
      i || ((i = et.get(t.id)), i && ((t.scope = i), et.delete(t.id)));
      let o = n.d || nt,
        l = !1;
      if (
        ((t.effects = He(() => {
          if (i) o(i, P), (l = !0);
          else {
            i = t.scope = de(n, e.global);
            let r = n.c;
            if (r) for (let e of r) e(t.scope, F);
          }
          o(i, r);
        })),
        !l)
      )
        return i.a === i.b ? i.a : i.a.parentNode;
    },
  };
function nt() {}
var rt = (e, t) => Ke(t, new it(e)),
  it = class {
    _;
    constructor(e) {
      this._ = e;
    }
    mount(e = {}, t, n) {
      let r,
        i,
        { $global: o } = e;
      o
        ? (({ $global: o, ...e } = e),
          (o = { runtimeId: "M", renderId: "_", ...o }))
        : (o = { runtimeId: "M", renderId: "_" });
      let l = this._.d,
        f = He(() => {
          (r = u(o)), (i = he(this._, r)), l && l(r, [e]);
        });
      switch (n) {
        case "afterbegin":
          t.insertBefore(i, t.firstChild);
          break;
        case "afterend":
          t.parentElement.insertBefore(i, t.nextSibling);
          break;
        case "beforebegin":
          t.parentElement.insertBefore(i, t);
          break;
        default:
          t.appendChild(i);
      }
      return (
        Je(f),
        {
          update: (e) => {
            l &&
              (function (e) {
                let t = De,
                  n = Le;
                (De = []), (Le = []);
                try {
                  e(), Ue(), (De = t), Je();
                } finally {
                  (De = t), (Le = n);
                }
              })(() => {
                l(r, P), l(r, [e]);
              });
          },
          destroy: () => {
            b(r);
          },
        }
      );
    }
  };
export {
  B as attr,
  n as attrTag,
  r as attrTags,
  q as attrs,
  R as attrsEvents,
  h as bindFunction,
  d as bindRenderer,
  U as changeHandler,
  Y as childClosures,
  T as classAttr,
  V as closure,
  tt as compat,
  me as conditional,
  Ce as conditionalOnlyChild,
  pe as createRenderer,
  u as createScope,
  de as createScopeWithRenderer,
  rt as createTemplate,
  O as data,
  X as dynamicClosure,
  ee as dynamicSubscribers,
  ge as dynamicTagAttrs,
  o as forIn,
  l as forOf,
  f as forTo,
  m as getAbortSignal,
  L as html,
  le as inChild,
  we as inConditionalScope,
  Be as inLoopScope,
  Xe as init,
  J as initValue,
  K as intersection,
  fe as intersections,
  z as lifecycle,
  Ae as loopIn,
  ke as loopOf,
  _e as loopTo,
  oe as nextTagId,
  A as on,
  He as prepare,
  W as props,
  We as queueControllableSource,
  Pe as queueEffect,
  ze as queueSource,
  Ke as register,
  Qe as registerBoundSignal,
  Ve as registerRenderer,
  Ye as registerSubscriber,
  y as resetAbortSignal,
  Fe as run,
  Je as runEffects,
  te as setTagVar,
  j as styleAttr,
  ne as tagVarSignal,
  Z as value,
};
