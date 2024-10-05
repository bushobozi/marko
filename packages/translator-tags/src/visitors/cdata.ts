import type { types as t } from "@marko/compiler";

import { isOutputHTML } from "../util/marko-config";
import type { TemplateVisitor } from "../util/visitors";
import * as writer from "../util/writer";

export default {
  translate: {
    exit(cdata) {
      if (isOutputHTML()) {
        writer.writeTo(cdata)`<![CDATA[${cdata.node.value}]]>`;
      }
      cdata.remove();
    },
  },
} satisfies TemplateVisitor<t.MarkoCDATA>;
