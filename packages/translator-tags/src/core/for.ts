import {
  assertAllowedAttributes,
  assertNoArgs,
  assertNoVar,
  getTagDef,
} from "@marko/babel-utils";
import { types as t } from "@marko/compiler";
import { AccessorChar, WalkCode } from "@marko/runtime-tags/common/types";

import { defineTagTranslator } from "../util/define-tag-translator";
import { getKnownAttrValues } from "../util/get-known-attr-values";
import { isStatefulReferences } from "../util/is-stateful";
import {
  type Binding,
  BindingType,
  createBinding,
  getScopeAccessorLiteral,
  mergeReferences,
  trackParamsReferences,
} from "../util/references";
import { callRuntime } from "../util/runtime";
import {
  checkStatefulClosures,
  getOrCreateSection,
  getScopeIdentifier,
  getScopeIdIdentifier,
  getSection,
  startSection,
} from "../util/sections";
import {
  addValue,
  getClosures,
  getSerializedScopeProperties,
  getSignal,
  setForceResumeScope,
  setSubscriberBuilder,
  writeHTMLResumeStatements,
} from "../util/signals";
import * as walks from "../util/walks";
import * as writer from "../util/writer";
import { currentProgramPath } from "../visitors/program";
import {
  kNativeTagBinding,
  kSerializeMarker,
} from "../visitors/tag/native-tag";

type ForType = "in" | "of" | "to";
const kForMarkerBinding = Symbol("for marker binding");
const kOnlyChildInParent = Symbol("only child in parent");
const kHasSingleChild = Symbol("has single child");
declare module "@marko/compiler/dist/types" {
  export interface NodeExtra {
    [kForMarkerBinding]?: Binding;
    [kOnlyChildInParent]?: boolean;
    [kHasSingleChild]?: boolean;
  }
}

export default defineTagTranslator({
  parseOptions: { controlFlow: true },
  attributes: {
    of: {
      type: "expression",
      autocomplete: [
        {
          description: "Iterates over a list of items.",
        },
      ],
    },
    in: {
      type: "expression",
      autocomplete: [
        {
          description: "Iterates over the keys and values of an object.",
        },
      ],
    },
    to: {
      type: "number",
      autocomplete: [
        {
          description: "Iterates up to the provided number (exclusive)",
        },
      ],
    },
    from: {
      type: "number",
      autocomplete: [
        {
          description: "Iterates starting from the provided number (inclusive)",
        },
      ],
    },
    step: {
      type: "number",
      autocomplete: [
        {
          description:
            "The amount to increment during each interation (with from/to)",
        },
      ],
    },
  },
  autocomplete: [
    {
      snippet: "for|${1:value, index}| of=${3:array}",
      description:
        "Use to iterate over lists, object properties, or between ranges.",
      descriptionMoreURL:
        "https://markojs.com/docs/core-tags/#iterating-over-a-list",
    },
    {
      snippet: "for|${1:name, value}| in=${3:object}",
      descriptionMoreURL:
        "https://markojs.com/docs/core-tags/#iterating-over-an-objects-properties",
    },
    {
      snippet: "for|${1:index}| to=${2:number}",
      descriptionMoreURL:
        "https://markojs.com/docs/core-tags/#iterating-between-a-range-of-numbers",
    },
  ],
  analyze(tag) {
    const isAttrTag = !!tag.node.attributeTags.length;
    let allowAttrs: string[];
    assertNoVar(tag);
    assertNoArgs(tag);

    switch (getForType(tag.node)) {
      case "of":
        allowAttrs = ["of"];
        break;
      case "in":
        allowAttrs = ["in"];
        break;
      case "to":
        allowAttrs = ["to", "from", "step"];
        break;
      default:
        throw tag.buildCodeFrameError(
          "Invalid `for` tag, missing an `of=`, `in=`, `to=` attribute.",
        );
    }

    if (!isAttrTag) {
      allowAttrs.push("by");
    }

    assertAllowedAttributes(tag, allowAttrs);

    if (isAttrTag) return;

    const tagExtra = (tag.node.extra ??= {});
    const section = getOrCreateSection(tag);
    const tagBody = tag.get("body");
    trackParamsReferences(tagBody, BindingType.param, undefined, tagExtra);
    mergeReferences(
      tag,
      tag.node.attributes.map((attr) => attr.value),
    );

    startSection(tagBody)!.upstreamExpression = tagExtra;

    if (checkOnlyChildInParent(tag)) {
      const parentTag = tag.parentPath.parent as t.MarkoTag;
      const parentTagName = (parentTag.name as t.StringLiteral)?.value;
      (parentTag.extra ??= {})[kNativeTagBinding] ??= createBinding(
        "#" + parentTagName,
        BindingType.dom,
        section,
      );
    } else {
      tagExtra[kForMarkerBinding] = createBinding(
        "#text",
        BindingType.dom,
        section,
      );
    }

    tagExtra[kHasSingleChild] = tag.node.body.body.length === 1;
  },
  translate: {
    html: {
      enter(tag) {
        if (tag.node.attributeTags.length) return;

        const tagBody = tag.get("body");
        const bodySection = getSection(tagBody);
        const tagExtra = tag.node.extra!;
        const isStateful = isStatefulReferences(tagExtra.referencedBindings);
        if (!tagExtra[kOnlyChildInParent]) {
          walks.visit(tag, WalkCode.Replace);
          walks.enterShallow(tag);
        }
        writer.flushBefore(tag);

        if (isStateful && !tagExtra[kHasSingleChild]) {
          writer.writeTo(tagBody)`${callRuntime(
            "markResumeScopeStart",
            getScopeIdIdentifier(bodySection),
          )}`;
        }
      },
      exit(tag) {
        if (tag.node.attributeTags.length) return;

        const tagBody = tag.get("body");
        const tagSection = getSection(tag);
        const bodySection = getSection(tagBody);
        const { node } = tag;
        const tagExtra = node.extra!;
        const isStateful = isStatefulReferences(tagExtra.referencedBindings);
        const nodeRef = tagExtra[kOnlyChildInParent]
          ? tag.parentPath.parent.extra![kNativeTagBinding]!
          : tag.node.extra![kForMarkerBinding]!;
        const forAttrs = getKnownAttrValues(node);
        const forType = getForType(node)!;
        const params = [...node.body.params];
        const statements: t.Statement[] = [];
        const bodyStatements: t.Statement[] = [...node.body.body];
        const hasStatefulClosures = checkStatefulClosures(bodySection, true);

        if (isStateful || hasStatefulClosures) {
          setForceResumeScope(bodySection);
        }

        if (isStateful && tagExtra[kOnlyChildInParent]) {
          tag.parentPath.parent.extra![kSerializeMarker] = true;
        }

        writer.flushInto(tag);
        // TODO: this is a hack to get around the fact that we don't have a way to
        // know if a scope requires dynamic subscriptions
        setSubscriberBuilder(tag, (() => {}) as any);
        writeHTMLResumeStatements(tagBody);

        if (isStateful || hasStatefulClosures) {
          const defaultParamNames = (
            {
              of: ["list", "index"],
              in: ["key", "value"],
              to: ["value"],
            } as const
          )[forType];
          const defaultByParamIndex = forType === "of" ? 1 : 0;
          const requiredParamsSize = forAttrs.by
            ? defaultParamNames.length
            : defaultByParamIndex;

          for (let i = 0; i < requiredParamsSize; i++) {
            const existingParam = params[i];
            if (!existingParam || !t.isIdentifier(existingParam)) {
              const id = (params[i] =
                currentProgramPath.scope.generateUidIdentifier(
                  defaultParamNames[i],
                ));

              if (existingParam) {
                bodyStatements.unshift(
                  t.variableDeclaration("let", [
                    t.variableDeclarator(existingParam, id),
                  ]),
                );
              }
            }
          }

          let keyExpression: t.Expression;
          if (forAttrs.by) {
            // TODO: handle `by` being undefined or a string.
            const byIdentifier =
              currentProgramPath.scope.generateUidIdentifier("by");
            statements.push(
              t.variableDeclaration("const", [
                t.variableDeclarator(byIdentifier, forAttrs.by),
              ]),
            );
            keyExpression = t.callExpression(
              byIdentifier,
              params as t.Identifier[],
            );
          } else {
            keyExpression = params[defaultByParamIndex] as t.Identifier;
          }

          bodyStatements.push(
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(
                  getScopeIdentifier(bodySection),
                  t.identifier("set"),
                ),
                [
                  keyExpression!,
                  callRuntime(
                    "getScopeById",
                    getScopeIdIdentifier(bodySection),
                  ),
                ],
              ),
            ),
          );

          const forScopeIdsIdentifier =
            tag.scope.generateUidIdentifier("forScopeIds");
          const forScopesIdentifier = getScopeIdentifier(bodySection);

          statements.push(
            t.variableDeclaration(
              "const",
              [
                isStateful &&
                  tagExtra[kHasSingleChild] &&
                  t.variableDeclarator(
                    forScopeIdsIdentifier,
                    t.arrayExpression([]),
                  ),
                t.variableDeclarator(
                  forScopesIdentifier,
                  t.newExpression(t.identifier("Map"), []),
                ),
              ].filter(Boolean) as t.VariableDeclarator[],
            ),
          );

          if (isStateful) {
            const write = writer.writeTo(tag);
            if (tagExtra[kHasSingleChild]) {
              bodyStatements.push(
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(
                      forScopeIdsIdentifier,
                      t.identifier("push"),
                    ),
                    [getScopeIdIdentifier(bodySection)],
                  ),
                ),
              );
              write`${callRuntime(
                "markResumeControlSingleNodeEnd",
                getScopeIdIdentifier(tagSection),
                getScopeAccessorLiteral(nodeRef),
                forScopeIdsIdentifier,
              )}`;
            } else {
              write`${callRuntime(
                "markResumeControlEnd",
                getScopeIdIdentifier(tagSection),
                getScopeAccessorLiteral(nodeRef),
              )}`;
            }
          }
          getSerializedScopeProperties(tagSection).set(
            t.stringLiteral(
              getScopeAccessorLiteral(nodeRef).value +
                AccessorChar.LoopScopeMap,
            ),
            t.conditionalExpression(
              t.memberExpression(forScopesIdentifier, t.identifier("size")),
              forScopesIdentifier,
              t.identifier("undefined"),
            ),
          );
        }

        statements.push(
          buildForRuntimeCall(forType, forAttrs, params, bodyStatements),
        );

        tag.replaceWithMultiple(statements);
      },
    },
    dom: {
      enter(tag) {
        if (tag.node.attributeTags.length) return;

        const tagExtra = tag.node.extra!;
        if (!tagExtra[kOnlyChildInParent]) {
          walks.visit(tag, WalkCode.Replace);
          walks.enterShallow(tag);
        }
      },
      exit(tag) {
        if (tag.node.attributeTags.length) return;

        const tagBody = tag.get("body");
        const tagSection = getSection(tag);
        const bodySection = getSection(tagBody);
        const { node } = tag;
        const tagExtra = node.extra!;
        const { referencedBindings } = tagExtra;
        const nodeRef = tagExtra[kOnlyChildInParent]
          ? tag.parentPath.parent.extra![kNativeTagBinding]!
          : tag.node.extra![kForMarkerBinding]!;

        setSubscriberBuilder(tag, (signal: t.Expression) => {
          return callRuntime(
            "inLoopScope",
            signal,
            getScopeAccessorLiteral(nodeRef),
          );
        });

        const rendererId = t.identifier(bodySection.name);
        const forType = getForType(node)!;
        const signal = getSignal(tagSection, nodeRef, "for");
        signal.build = () => {
          return callRuntime(
            forTypeToDOMRuntime(forType),
            getScopeAccessorLiteral(nodeRef),
            rendererId,
          );
        };

        const paramIdentifiers = Object.values(
          tagBody.getBindingIdentifiers(),
        ) as t.Identifier[];

        signal.hasDownstreamIntersections = () => {
          if (getClosures(bodySection).length > 0) {
            return true;
          }

          if (paramIdentifiers.length) {
            const binding = paramIdentifiers[0].extra!.binding!;
            for (const {
              referencedBindings,
            } of binding.downstreamExpressions) {
              if (
                getSignal(
                  bodySection,
                  referencedBindings,
                ).hasDownstreamIntersections()
              ) {
                return true;
              }
            }
          }

          return false;
        };

        const forAttrs = getKnownAttrValues(node);
        const args = getBaseArgsInForTag(forType, forAttrs);
        if (forAttrs.by) {
          args.push(forAttrs.by);
        }

        addValue(
          tagSection,
          referencedBindings,
          signal,
          t.arrayExpression(args),
        );

        tag.remove();
      },
    },
  },
});

export function buildForRuntimeCall(
  type: ForType,
  attrs: Record<string, t.Expression>,
  params: t.ArrowFunctionExpression["params"],
  statements: t.Statement[],
) {
  return t.expressionStatement(
    callRuntime(
      forTypeToRuntime(type),
      ...getBaseArgsInForTag(type, attrs),
      t.arrowFunctionExpression(params, t.blockStatement(statements)),
    ),
  );
}

export function getForType(tag: t.MarkoTag): ForType | undefined {
  for (const attr of tag.attributes) {
    if (attr.type === "MarkoAttribute") {
      switch (attr.name) {
        case "of":
        case "in":
        case "to":
          return attr.name;
      }
    }
  }
}

function forTypeToRuntime(type: ForType) {
  switch (type) {
    case "of":
      return "forOf";
    case "in":
      return "forIn";
    case "to":
      return "forTo";
  }
}

function forTypeToDOMRuntime(type: ForType) {
  switch (type) {
    case "of":
      return "loopOf";
    case "in":
      return "loopIn";
    case "to":
      return "loopTo";
  }
}

function getBaseArgsInForTag(
  type: ForType,
  attrs: Record<string, t.Expression>,
) {
  switch (type) {
    case "in":
      return [attrs.in];
    case "of":
      return [attrs.of];
    case "to":
      return [
        attrs.to,
        attrs.from || t.numericLiteral(0),
        attrs.step || t.numericLiteral(1),
      ];
  }
}

function checkOnlyChildInParent(tag: t.NodePath<t.MarkoTag>) {
  const extra = tag.node.extra!;
  if (
    t.isMarkoTag(tag.parentPath?.parent) &&
    getTagDef(tag.parentPath!.parentPath! as t.NodePath<t.MarkoTag>)?.html
  ) {
    return (extra[kOnlyChildInParent] =
      (tag.parent as t.MarkoTagBody).body.length === 1);
  }
  return (extra[kOnlyChildInParent] = false);
}
