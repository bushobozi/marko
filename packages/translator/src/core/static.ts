import { types as t } from "@marko/compiler";
import { parseScript } from "@marko/babel-utils";
export default {
  parse(tag: t.NodePath<t.MarkoTag>) {
    const {
      node,
      hub: { file },
    } = tag;
    const rawValue = node.rawValue!;
    const code = rawValue.replace(/^static\s*/, "").trim();
    const start = node.name.start! + (rawValue.length - code.length);
    let { body } = parseScript(file, code, start);
    if (body.length === 1 && t.isBlockStatement(body[0])) {
      body = body[0].body;
    }

    tag.replaceWith(t.markoScriptlet(body, true));
  },
  "parse-options": {
    rootOnly: true,
    rawOpenTag: true,
    openTagOnly: true,
    ignoreAttributes: true,
  },
  autocomplete: [
    {
      displayText: "static <statement>",
      description:
        "A JavaScript statement which is only evaluated once your template is loaded.",
      descriptionMoreURL: "https://markojs.com/docs/syntax/#static-javascript",
    },
  ],
};
