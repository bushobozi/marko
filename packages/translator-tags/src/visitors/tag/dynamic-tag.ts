import {
  assertAttributesOrArgs,
  importDefault,
  importNamed,
  loadFileForTag,
} from "@marko/babel-utils";
import { type Config, types as t } from "@marko/compiler";
import { WalkCode } from "@marko/runtime-tags/common/types";

import { isOutputHTML } from "../../util/marko-config";
import { analyzeAttributeTags } from "../../util/nested-attribute-tags";
import {
  addReferenceToExpression,
  type Binding,
  BindingType,
  createBinding,
  getScopeAccessorLiteral,
  mergeReferences,
  trackParamsReferences,
  trackVarReferences,
} from "../../util/references";
import { callRuntime } from "../../util/runtime";
import {
  getOrCreateSection,
  getScopeIdIdentifier,
  getSection,
  startSection,
} from "../../util/sections";
import {
  addValue,
  buildSignalIntersections,
  getSerializedScopeProperties,
  getSignal,
  getSignalFn,
  writeHTMLResumeStatements,
} from "../../util/signals";
import { getAllTagReferenceNodes } from "../../util/tag-reference-nodes";
import { translateTarget } from "../../util/target-translate";
import {
  getTranslatedRenderBodyProperty,
  translateAttrs,
} from "../../util/translate-attrs";
import translateVar from "../../util/translate-var";
import type { TemplateVisitor } from "../../util/visitors";
import * as walks from "../../util/walks";
import * as writer from "../../util/writer";
import { currentProgramPath, scopeIdentifier } from "../program";
import { getTagRelativePath } from "./custom-tag";

const kDOMBinding = Symbol("dynamic tag dom binding");

declare module "@marko/compiler/dist/types" {
  export interface MarkoTagExtra {
    [kDOMBinding]?: Binding;
  }
}

export default {
  analyze: {
    enter(tag) {
      assertAttributesOrArgs(tag);
      analyzeAttributeTags(tag);

      const section = getOrCreateSection(tag);
      const tagExtra = (tag.node.extra ??= {});
      const tagBody = tag.get("body");
      const domBinding = (tagExtra[kDOMBinding] = createBinding(
        "#text",
        BindingType.dom,
        section,
        undefined,
        tagExtra,
      ));

      startSection(tagBody);
      trackVarReferences(tag, BindingType.derived);
      trackParamsReferences(tagBody, BindingType.param);
      mergeReferences(tag, getAllTagReferenceNodes(tag.node));
      addReferenceToExpression(tag, domBinding);
    },
  },
  translate: translateTarget({
    html: {
      enter(tag) {
        walks.visit(tag, WalkCode.Replace);
        walks.enterShallow(tag);
        writer.flushBefore(tag);
      },
      exit(tag) {
        const { node } = tag;
        const extra = node.extra!;
        const nodeRef = extra[kDOMBinding]!;
        const section = getSection(tag);
        let tagExpression = node.name;

        // This is the interop layer leaking into the translator
        // We use the dynamic tag when a custom tag from the class runtime is used
        if (t.isStringLiteral(tagExpression)) {
          tagExpression = importDefault(
            tag.hub.file,
            getTagRelativePath(tag),
            tagExpression.value,
          );
        }

        if (extra.featureType === "class") {
          const compatRuntimeFile = getCompatRuntimeFile(
            tag.hub.file.markoOpts,
          );
          importDefault(tag.hub.file, compatRuntimeFile);
          currentProgramPath.pushContainer(
            "body",
            t.expressionStatement(
              t.callExpression(
                importNamed(tag.hub.file, compatRuntimeFile, "s"),
                [
                  t.identifier((tagExpression as t.Identifier).name),
                  t.stringLiteral(loadFileForTag(tag)!.metadata.marko.id),
                ],
              ),
            ),
          );
        }

        writer.flushInto(tag);
        writeHTMLResumeStatements(tag.get("body"));
        const { properties, statements } = translateAttrs(tag);
        const args: (t.Expression | t.SpreadElement)[] = [];
        let hasMultipleArgs = false;

        if (node.arguments?.length) {
          args.push(...node.arguments);

          if (properties.length) {
            hasMultipleArgs = true;
            args.push(t.objectExpression(properties));
          } else {
            hasMultipleArgs =
              node.arguments.length > 1 || t.isSpreadElement(node.arguments[0]);
          }
        } else {
          const renderBodyProp = getTranslatedRenderBodyProperty(properties);
          if (renderBodyProp) {
            properties.splice(properties.indexOf(renderBodyProp), 1);
            args.push(t.objectExpression(properties), renderBodyProp.value);
          } else {
            args.push(t.objectExpression(properties));
          }
        }

        const dynamicScopeIdentifier =
          currentProgramPath.scope.generateUidIdentifier("dynamicScope");
        const dynamicTagExpr = hasMultipleArgs
          ? callRuntime(
              "dynamicTagArgs",
              tagExpression,
              t.arrayExpression(args),
            )
          : callRuntime("dynamicTagInput", tagExpression, ...args);
        if (node.var) {
          // TODO: This breaks now that _dynamicTag returns a scope
          translateVar(tag, dynamicTagExpr);
        } else {
          statements.push(
            t.variableDeclaration("const", [
              t.variableDeclarator(dynamicScopeIdentifier, dynamicTagExpr),
            ]),
          );
        }

        writer.writeTo(tag)`${callRuntime(
          "markResumeControlEnd",
          getScopeIdIdentifier(section),
          getScopeAccessorLiteral(nodeRef),
        )}`;

        getSerializedScopeProperties(section).set(
          t.stringLiteral(getScopeAccessorLiteral(nodeRef).value + "!"),
          dynamicScopeIdentifier,
        );
        getSerializedScopeProperties(section).set(
          t.stringLiteral(getScopeAccessorLiteral(nodeRef).value + "("),
          t.isIdentifier(tagExpression)
            ? t.identifier(tagExpression.name)
            : tagExpression,
        );

        for (const replacement of tag.replaceWithMultiple(statements)) {
          replacement.skip();
        }
      },
    },
    dom: {
      enter(tag) {
        walks.visit(tag, WalkCode.Replace);
        walks.enterShallow(tag);
      },
      exit(tag) {
        const { node } = tag;
        const extra = node.extra!;
        const nodeRef = extra[kDOMBinding]!;
        const section = getSection(tag);
        const bodySection = getSection(tag.get("body"));
        let tagExpression = node.name;

        // This is the interop layer leaking into the translator
        // We use the dynamic tag when a custom tag from the class runtime is used
        if (t.isStringLiteral(tagExpression)) {
          tagExpression = importDefault(
            tag.hub.file,
            getTagRelativePath(tag),
            tagExpression.value,
          );
        }

        if (extra.featureType === "class") {
          const compatRuntimeFile = getCompatRuntimeFile(
            tag.hub.file.markoOpts,
          );
          importDefault(tag.hub.file, compatRuntimeFile);
          currentProgramPath.pushContainer(
            "body",
            t.expressionStatement(
              callRuntime(
                "register",
                t.stringLiteral(loadFileForTag(tag)!.metadata.marko.id),
                t.identifier((tagExpression as t.Identifier).name),
              ),
            ),
          );
        }

        const hasBody = section !== bodySection;
        const renderBodyIdentifier = hasBody && t.identifier(bodySection.name);
        const signal = getSignal(section, nodeRef, "dynamicTagName");
        signal.build = () => {
          return callRuntime(
            "conditional",
            getScopeAccessorLiteral(nodeRef),
            getSignalFn(signal, [scopeIdentifier]),
            buildSignalIntersections(signal),
          );
        };
        signal.hasDownstreamIntersections = () => true;
        addValue(
          section,
          node.name.extra?.referencedBindings,
          signal,
          renderBodyIdentifier
            ? t.logicalExpression("||", tagExpression, renderBodyIdentifier)
            : tagExpression,
        );

        const { properties, statements } = translateAttrs(tag);
        const args: (t.Expression | t.SpreadElement)[] = [];
        let hasMultipleArgs = false;

        if (node.arguments?.length) {
          args.push(...node.arguments);

          if (properties.length) {
            hasMultipleArgs = true;
            args.push(t.objectExpression(properties));
          } else {
            hasMultipleArgs =
              node.arguments.length > 1 || t.isSpreadElement(node.arguments[0]);
          }
        } else if (properties.length || statements.length) {
          const renderBodyProp = getTranslatedRenderBodyProperty(properties);
          if (renderBodyProp) {
            properties.splice(properties.indexOf(renderBodyProp), 1);
          }

          args.push(t.objectExpression(properties));
        }

        if (args.length) {
          const argsOrInput = hasMultipleArgs
            ? t.arrayExpression(args)
            : (args[0] as t.Expression);
          const attrsGetter = t.arrowFunctionExpression(
            [],
            statements.length
              ? t.blockStatement(
                  statements.concat(t.returnStatement(argsOrInput)),
                )
              : argsOrInput,
          );
          const id = currentProgramPath.scope.generateUidIdentifier(
            tag.get("name").toString() + "_input",
          );
          let added = false;
          addValue(
            section,
            node.extra?.referencedBindings,
            {
              get identifier() {
                if (!added) {
                  currentProgramPath.pushContainer(
                    "body",
                    t.variableDeclaration("const", [
                      t.variableDeclarator(
                        id,
                        callRuntime(
                          "dynamicTagAttrs",
                          getScopeAccessorLiteral(nodeRef),
                          renderBodyIdentifier,
                          hasMultipleArgs && t.numericLiteral(1),
                        ),
                      ),
                    ]),
                  );
                  added = true;
                }
                return id;
              },
              hasDownstreamIntersections: () => true,
            },
            attrsGetter,
          );
        }

        tag.remove();
      },
    },
  }),
} satisfies TemplateVisitor<t.MarkoTag>;

function getCompatRuntimeFile(markoOpts: Required<Config>) {
  return `marko/src/runtime/helpers/tags-compat/${
    isOutputHTML() ? "html" : "dom"
  }${markoOpts.optimize ? "" : "-debug"}.${markoOpts.modules === "esm" ? "mjs" : "js"}`;
}
