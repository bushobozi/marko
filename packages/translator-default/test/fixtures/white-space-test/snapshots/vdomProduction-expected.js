import { t as _t } from "marko/dist/runtime/vdom";

const _marko_template = _t();

export default _marko_template;
import _marko_createElement from "marko/dist/runtime/vdom/helpers/v-element";

const _marko_node = _marko_createElement("div", null, "0", null, 4, 0).e("div", null, null, null, 3, 0).t("Hello ").e("div", null, null, null, 1, 0).t(" ").t(" World").e("div", null, null, null, 1, 0).t(" Hello").e("pre", null, null, null, 1, 0).t("\n    This should  \n      be preserved\n  ").e("div", null, null, null, 1, 0).e("div", null, null, null, 1, 0).t("Hello ");

const _marko_node2 = _marko_createElement("div", null, "2", null, 0, 0);

import _marko_renderer from "marko/dist/runtime/components/renderer";
import { r as _marko_registerComponent } from "marko/dist/runtime/components/registry-browser";

const _marko_componentType = _marko_registerComponent("TRrwGTtp", () => _marko_template),
      _marko_component = {};

_marko_template._ = _marko_renderer(function (input, out, _component, component, state) {
  out.n(_marko_node, component);
  out.be("div", null, "1", component, null, 0);
  scriptletA();
  scriptletB();
  out.t("Hello ", component);
  scriptletC();
  out.t("World", component);
  scriptletD();
  out.ee();
  out.t(" Hello World! ", component);
  out.t(a, component);
  out.t(b, component);
  out.n(_marko_node2, component);
}, {
  t: _marko_componentType,
  i: true
}, _marko_component);
import _marko_defineComponent from "marko/dist/runtime/components/defineComponent";
_marko_template.Component = _marko_defineComponent(_marko_component, _marko_template._);