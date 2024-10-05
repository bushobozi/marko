import type { types as t } from "@marko/compiler";

import { isOutputHTML } from "./marko-config";
import * as hooks from "./plugin-hooks";

export function translateTarget<T extends t.Node>(translate: {
  dom: t.VisitNode<unknown, T>;
  html: t.VisitNode<unknown, T>;
}) {
  return {
    enter(path: t.NodePath<T>) {
      hooks.enter(isOutputHTML() ? translate.html : translate.dom, path);
    },
    exit(path: t.NodePath<T>) {
      hooks.exit(isOutputHTML() ? translate.html : translate.dom, path);
    },
  } as const;
}
