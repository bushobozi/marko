import { t as _t } from "marko/src/runtime/html";

const _marko_template = _t();

export default _marko_template;
import _marko_component from "./component.js";
import _marko_renderer from "marko/src/runtime/components/renderer";
const _marko_componentType = "packages/translator-default/test/fixtures/class-external-component-index/index.marko",
      _marko_component2 = _marko_component;
_marko_template._ = _marko_renderer(function (input, out, _component, component, state) {
  out.w("<div></div>");
}, {
  t: _marko_componentType,
  d: true
}, _marko_component2);