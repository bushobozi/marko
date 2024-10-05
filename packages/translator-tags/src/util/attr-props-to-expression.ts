import { types as t } from "@marko/compiler";
export function attrPropsToExpression(
  props: t.ObjectExpression["properties"],
): t.Expression {
  return props.length === 1 && t.isSpreadElement(props[0])
    ? props[0].argument
    : t.objectExpression(props);
}
