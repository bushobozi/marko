import { assertNoArgs, assertNoVar, findParentTag } from "@marko/babel-utils";
import { types as t } from "@marko/compiler";

import { isOutputHTML } from "../../util/marko-config";
import { startSection } from "../../util/sections";
import { writeHTMLResumeStatements } from "../../util/signals";
import * as writer from "../../util/writer";

export default {
  analyze: {
    enter(tag: t.NodePath<t.MarkoTag>) {
      assertNoVar(tag);
      assertNoArgs(tag);
      startSection(tag.get("body"));
      if (!findParentTag(tag)) {
        throw tag
          .get("name")
          .buildCodeFrameError("@tags must be nested within another tag.");
      }
    },
  },

  translate: {
    enter(tag: t.NodePath<t.MarkoTag>) {
      if (isOutputHTML()) {
        writer.flushBefore(tag);
      }
    },
    exit(tag: t.NodePath<t.MarkoTag>) {
      if (isOutputHTML()) {
        writer.flushInto(tag);
        writeHTMLResumeStatements(tag.get("body"));
      }
    },
  },
};
