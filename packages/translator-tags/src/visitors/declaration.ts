import type { types as t } from "@marko/compiler";

import { isOutputHTML } from "../util/marko-config";
import type { TemplateVisitor } from "../util/visitors";
import * as writer from "../util/writer";

export default {
  translate: {
    exit(declaration) {
      if (isOutputHTML()) {
        writer.writeTo(declaration)`<?${declaration.node.value}?>`;
      }

      declaration.remove();
    },
  },
} satisfies TemplateVisitor<t.MarkoDeclaration>;
