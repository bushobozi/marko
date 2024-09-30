import { isAttributeTag } from "@marko/babel-utils";
import { types as t } from "@marko/compiler";

import { buildForRuntimeCall, getForType } from "../core/for";
import type { ParamsExports } from "../visitors/program";
import { getKnownAttrValues } from "./get-known-attr-values";
import { getTagName } from "./get-tag-name";
// TODO: should this move here.
import {
  type AttrTagLookup,
  getAttrTagIdentifier,
} from "./nested-attribute-tags";
import { callRuntime } from "./runtime";
import toPropertyName from "./to-property-name";

const renderBodyProps = new WeakSet<t.Node>();

type BuildRenderBody = (
  body: t.NodePath<t.MarkoTagBody>,
  childExport?: ParamsExports,
) => t.Expression | undefined;

export function translateAttrs(
  tag: t.NodePath<t.MarkoTag>,
  buildRenderBody: BuildRenderBody,
  usedExports?: ParamsExports["props"],
  statements: t.Statement[] = [],
) {
  const seen = new Set<string>();
  const properties: t.ObjectExpression["properties"] = [];
  const attrTagLookup = tag.node.extra?.attributeTags;

  if (attrTagLookup) {
    for (const name in attrTagLookup) {
      const attrTagMeta = attrTagLookup[name];
      if (usesExport(usedExports, attrTagMeta.name)) {
        seen.add(attrTagMeta.name);
        if (attrTagMeta.dynamic) {
          statements.push(
            t.variableDeclaration("let", [
              t.variableDeclarator(getAttrTagIdentifier(attrTagMeta)),
            ]),
          );
          properties.push(
            t.objectProperty(
              toPropertyName(attrTagMeta.name),
              getAttrTagIdentifier(attrTagMeta),
            ),
          );
        }
      }
    }

    const attrTags = tag.get("attributeTags");
    for (let i = 0; i < attrTags.length; i++) {
      const child = attrTags[i];
      if (child.isMarkoTag()) {
        if (isAttributeTag(child)) {
          const attrTagMeta = attrTagLookup[getTagName(child)];
          if (attrTagMeta.dynamic) {
            i = addDynamicAttrTagStatements(
              attrTags,
              i,
              attrTagLookup,
              statements,
              buildRenderBody,
              usedExports,
            );
          } else {
            const translatedAttrTag = translateAttrs(
              child,
              buildRenderBody,
              usedExports?.[attrTagMeta.name]?.props,
              statements,
            );

            if (attrTagMeta.repeated) {
              const prevProp = findObjectProperty(attrTagMeta.name, properties);
              if (prevProp) {
                prevProp.value = callRuntime(
                  "attrTags",
                  prevProp.value as t.Expression,
                  t.objectExpression(translatedAttrTag.properties),
                );
              } else {
                properties.push(
                  t.objectProperty(
                    toPropertyName(attrTagMeta.name),
                    callRuntime(
                      "attrTag",
                      t.objectExpression(translatedAttrTag.properties),
                    ),
                  ),
                );
              }
            } else {
              properties.push(
                t.objectProperty(
                  toPropertyName(attrTagMeta.name),
                  callRuntime(
                    "attrTag",
                    t.objectExpression(translatedAttrTag.properties),
                  ),
                ),
              );
            }
          }
        } else {
          i = addDynamicAttrTagStatements(
            attrTags,
            i,
            attrTagLookup,
            statements,
            buildRenderBody,
            usedExports,
          );
        }
      }
    }
  }

  if (!seen.has("renderBody") && usesExport(usedExports, "renderBody")) {
    seen.add("renderBody");
    const renderBodyExpression = buildRenderBody(
      tag.get("body"),
      usedExports?.renderBody,
    );
    if (renderBodyExpression) {
      const renderBodyProp = t.objectProperty(
        t.identifier("renderBody"),
        renderBodyExpression,
      );
      renderBodyProps.add(renderBodyProp);
      properties.push(renderBodyProp);
    }
  }

  const { attributes } = tag.node;
  for (let i = attributes.length; i--; ) {
    const attr = attributes[i];
    const { value } = attr;
    if (t.isMarkoSpreadAttribute(attr)) {
      properties.push(t.spreadElement(value));
    } else if (!seen.has(attr.name) && usesExport(usedExports, attr.name)) {
      seen.add(attr.name);
      properties.push(t.objectProperty(toPropertyName(attr.name), value));
    }
  }

  properties.reverse();
  return { properties, statements };
}

export function getTranslatedRenderBodyProperty(
  props: t.ObjectExpression["properties"],
) {
  for (const prop of props) {
    if (renderBodyProps.has(prop)) {
      return prop as unknown as t.ObjectExpression & { value: t.Expression };
    }
  }
}

export function addDynamicAttrTagStatements(
  attrTags: t.NodePath<t.MarkoTag["attributeTags"][number]>[],
  index: number,
  attrTagLookup: AttrTagLookup,
  statements: t.Statement[],
  buildRenderBody: BuildRenderBody,
  usedExports: ParamsExports["props"],
): number {
  const tag = attrTags[index];
  if (tag.isMarkoTag()) {
    if (isAttributeTag(tag)) {
      const attrTagMeta = attrTagLookup[getTagName(tag)];
      if (usesExport(usedExports, attrTagMeta.name) && attrTagMeta.dynamic) {
        const translatedAttrTag = translateAttrs(
          tag,
          buildRenderBody,
          usedExports?.[attrTagMeta.name]?.props,
          statements,
        );
        if (attrTagMeta.repeated) {
          statements.push(
            t.expressionStatement(
              t.assignmentExpression(
                "=",
                getAttrTagIdentifier(attrTagMeta),
                callRuntime(
                  "attrTags",
                  getAttrTagIdentifier(attrTagMeta),
                  t.objectExpression(translatedAttrTag.properties),
                ),
              ),
            ),
          );
        } else {
          statements.push(
            t.expressionStatement(
              t.assignmentExpression(
                "=",
                getAttrTagIdentifier(attrTagMeta),
                callRuntime(
                  "attrTag",
                  t.objectExpression(translatedAttrTag.properties),
                ),
              ),
            ),
          );
        }
      }
    } else {
      switch (getTagName(tag)) {
        case "if":
          return translateIfAttrTag(
            attrTags,
            index,
            attrTagLookup,
            statements,
            buildRenderBody,
            usedExports,
          );

        case "for": {
          return translateForAttrTag(
            attrTags,
            index,
            attrTagLookup,
            statements,
            buildRenderBody,
            usedExports,
          );
        }
      }
    }
  }

  return index;
}

function translateForAttrTag(
  attrTags: t.NodePath<t.MarkoTag["attributeTags"][number]>[],
  index: number,
  attrTagLookup: AttrTagLookup,
  statements: t.Statement[],
  buildRenderBody: BuildRenderBody,
  usedExports: ParamsExports["props"],
) {
  const forTag = attrTags[index] as t.NodePath<t.MarkoTag>;
  const bodyStatements: t.Statement[] = [];
  addAllAttrTagsAsDynamic(
    forTag,
    attrTagLookup,
    bodyStatements,
    buildRenderBody,
    usedExports,
  );
  statements.push(
    buildForRuntimeCall(
      getForType(forTag.node)!,
      getKnownAttrValues(forTag.node),
      forTag.node.body.params,
      bodyStatements,
    ),
  );

  return index;
}

function translateIfAttrTag(
  attrTags: t.NodePath<t.MarkoTag["attributeTags"][number]>[],
  index: number,
  attrTagLookup: AttrTagLookup,
  statements: t.Statement[],
  buildRenderBody: BuildRenderBody,
  usedExports: ParamsExports["props"],
) {
  const ifTag = attrTags[index] as t.NodePath<t.MarkoTag>;
  const consequentStatements: t.Statement[] = [];
  let ifStatement = t.ifStatement(
    getConditionTestValue(ifTag)!,
    t.blockStatement(consequentStatements),
  );

  statements.push(ifStatement);
  addAllAttrTagsAsDynamic(
    ifTag,
    attrTagLookup,
    consequentStatements,
    buildRenderBody,
    usedExports,
  );

  let nextIndex = index + 1;
  while (nextIndex < attrTags.length) {
    const nextTag = attrTags[nextIndex];
    if (nextTag.isMarkoTag()) {
      switch (getTagName(nextTag)) {
        case "else-if":
        case "else": {
          const testValue = getConditionTestValue(nextTag);
          const alternateStatements: t.Statement[] = [];
          addAllAttrTagsAsDynamic(
            nextTag,
            attrTagLookup,
            alternateStatements,
            buildRenderBody,
            usedExports,
          );

          if (testValue) {
            ifStatement.alternate = ifStatement = t.ifStatement(
              testValue,
              t.blockStatement(alternateStatements),
            );

            nextIndex++;
            continue;
          } else {
            ifStatement.alternate = t.blockStatement(alternateStatements);
            break;
          }
        }
      }
    }

    break;
  }

  return nextIndex - 1;
}

function addAllAttrTagsAsDynamic(
  tag: t.NodePath<t.MarkoTag>,
  attrTagLookup: AttrTagLookup,
  statements: t.Statement[],
  buildRenderBody: BuildRenderBody,
  usedExports: ParamsExports["props"],
) {
  const attrTags = tag.get("attributeTags");
  for (let i = 0; i < attrTags.length; i++) {
    i = addDynamicAttrTagStatements(
      attrTags,
      i,
      attrTagLookup,
      statements,
      buildRenderBody,
      usedExports,
    );
  }
}

function usesExport(props: ParamsExports["props"], name: string) {
  return !props || !!props[name];
}

function findObjectProperty(
  name: string,
  props: t.ObjectExpression["properties"],
) {
  for (const prop of props) {
    if (prop.type === "ObjectProperty") {
      switch (prop.key.type) {
        case "StringLiteral":
          if (prop.key.value === name) {
            return prop;
          }
          break;
        case "Identifier":
          if (prop.key.name === name) {
            return prop;
          }
          break;
      }
    }
  }

  return false;
}

function getConditionTestValue({
  node: { attributes },
}: t.NodePath<t.MarkoTag>) {
  return attributes.length === 1 ? attributes[0].value : undefined;
}
