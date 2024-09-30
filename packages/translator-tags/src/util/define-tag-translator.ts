import type { EnterExitPlugin, FunctionPlugin, Tag } from "@marko/babel-utils";
import type { types as t } from "@marko/compiler";

import { isOutputHTML } from "./marko-config";
import * as hooks from "./plugin-hooks";

type MarkoTagHook = EnterExitPlugin<t.MarkoTag> | FunctionPlugin<t.MarkoTag>;
type Visitor = {
  analyze: MarkoTagHook;
  translate:
    | MarkoTagHook
    | {
        dom: MarkoTagHook;
        html: MarkoTagHook;
      };
};

export function defineTagTranslator(
  tagDef: Omit<Tag, "analyze" | "translate"> & Visitor,
): Tag {
  return {
    ...tagDef,
    analyze: {
      enter(tag) {
        hooks.enter(tagDef.analyze, tag);
      },
      exit(tag) {
        hooks.exit(tagDef.analyze, tag);
      },
    },
    translate: {
      enter(tag) {
        hooks.enter(getTranslateHooks(tagDef), tag);
      },
      exit(tag) {
        hooks.exit(getTranslateHooks(tagDef), tag);
      },
    },
  };
}

function getTranslateHooks({ translate }: Visitor) {
  return isOutputHTML()
    ? "html" in translate
      ? translate.html
      : translate
    : "dom" in translate
      ? translate.dom
      : translate;
}
