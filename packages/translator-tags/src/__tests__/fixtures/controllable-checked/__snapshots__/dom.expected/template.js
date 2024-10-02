export const _template_ = "<input type=checkbox><span> </span>";
export const _walks_ = /* get, over(1), next(1), get, out(1) */" bD l";
import { checkedAttr as _checkedAttr, checkedChangeEffect as _checkedChangeEffect, data as _data, queueSource as _queueSource, value as _value, register as _register, queueEffect as _queueEffect, createRenderer as _createRenderer, createTemplate as _createTemplate } from "@marko/runtime-tags/debug/dom";
const _checked = /* @__PURE__ */_value("checked", (_scope, checked) => {
  _checkedAttr(_scope["#input/0"], checked, function (_new_checked) {
    checked = _new_checked;
  });
  _data(_scope["#text/1"], String(checked));
});
const _setup__effect = _register("packages/translator-tags/src/__tests__/fixtures/controllable-checked/template.marko_0", _scope => _checkedChangeEffect(_scope["#input/0"], function (_new_checked) {
  _queueSource(_scope, _checked, _new_checked);
}));
export function _setup_(_scope) {
  _queueEffect(_scope, _setup__effect);
  _checked(_scope, false);
}
export default /* @__PURE__ */_createTemplate(/* @__PURE__ */_createRenderer(_template_, _walks_, _setup_), "packages/translator-tags/src/__tests__/fixtures/controllable-checked/template.marko");