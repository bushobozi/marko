export const _template_ = "<div></div>";
export const _walks_ = /* get, over(1) */" b";
export const _setup_ = () => {};
import { data as _data, createRenderer as _createRenderer, value as _value, register as _register, loopTo as _loopTo, createTemplate as _createTemplate } from "@marko/runtime-tags/debug/dom";
const _n$forBody = /* @__PURE__ */_value("n", (_scope, n) => _data(_scope["#text/0"], n));
const _params_2$forBody = /* @__PURE__ */_value("_params_2", (_scope, _params_2) => _n$forBody(_scope, _params_2[0]));
const _forBody = _register("packages/translator-tags/src/__tests__/fixtures/create-and-clear-rows-loop-from/template.marko_1_renderer", /* @__PURE__ */_createRenderer("<!>, ", /* replace */"%", void 0, void 0, void 0, _params_2$forBody));
const _for = /* @__PURE__ */_loopTo("#div/0", _forBody);
export const _input_ = /* @__PURE__ */_value("input", (_scope, input) => _for(_scope, [input.to, input.from, input.step]));
export const _params__ = /* @__PURE__ */_value("_params_", (_scope, _params_) => _input_(_scope, _params_[0]));
export default /* @__PURE__ */_createTemplate(/* @__PURE__ */_createRenderer(_template_, _walks_, _setup_, void 0, void 0, _params__), "packages/translator-tags/src/__tests__/fixtures/create-and-clear-rows-loop-from/template.marko");