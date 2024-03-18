import path from "path";
import { loadFileForImport, resolveRelativePath } from "@marko/babel-utils";
import { types as t } from "@marko/compiler";
import entryBuilder from "../../util/entry-builder";
import {
  getMarkoOpts,
  isOutputDOM,
  isOutputHTML,
} from "../../util/marko-config";
import { finalizeReferences, trackReferencesForBinding } from "../../util/references";
import { assignFinalIds } from "../../util/reserve";
import { startSection } from "../../util/sections";
import { initValue } from "../../util/signals";
import programDOM from "./dom";
import programHTML from "./html";

export let currentProgramPath: t.NodePath<t.Program>;
export let scopeIdentifier: t.Identifier;
export let cleanIdentifier: t.Identifier;
export const createProgramState = <T>(init: () => T) =>{
  const map = new WeakMap<t.NodePath<t.Program>, T>();
  return [
    () => {
      let state = map.get(currentProgramPath);
      if (!state) {
        map.set(currentProgramPath, state = init());
      }
      return state;
    },
    (value: T) => {
      map.set(currentProgramPath, value);
    }
  ] as const;
}

const previousProgramPath: WeakMap<
  t.NodePath<t.Program>,
  t.NodePath<t.Program> | undefined
> = new WeakMap();

export default {
  migrate: {
    enter(program: t.NodePath<t.Program>) {
      previousProgramPath.set(program, currentProgramPath);
      program.node.params = [t.identifier("input")];
      currentProgramPath = program;
    },
    exit() {
      currentProgramPath.scope.crawl();
      currentProgramPath = previousProgramPath.get(currentProgramPath)!;
    },
  },
  analyze: {
    enter(program: t.NodePath<t.Program>) {
      previousProgramPath.set(program, currentProgramPath);
      currentProgramPath = program;
      startSection(program);
      const inputBinding = program.scope.getBinding("input")!;
      if (
        inputBinding.referencePaths.length ||
        inputBinding.constantViolations.length
      ) {
        trackReferencesForBinding(program, "input", undefined);
      }
    },

    exit() {
      assignFinalIds();
      finalizeReferences();
      currentProgramPath = previousProgramPath.get(currentProgramPath)!;
    },
  },
  translate: {
    enter(program: t.NodePath<t.Program>) {
      previousProgramPath.set(program, currentProgramPath);
      currentProgramPath = program;
      scopeIdentifier = isOutputDOM()
        ? program.scope.generateUidIdentifier("scope")
        : (null as any as t.Identifier);
      cleanIdentifier = isOutputDOM()
        ? program.scope.generateUidIdentifier("clean")
        : (null as any as t.Identifier);
      if (getMarkoOpts().output === "hydrate") {
        const entryFile = program.hub.file;
        const visitedFiles = new Set([
          resolveRelativePath(entryFile, entryFile.opts.filename as string),
        ]);
        entryBuilder.visit(entryFile, entryFile, function visitChild(resolved) {
          if (!visitedFiles.has(resolved)) {
            visitedFiles.add(resolved);
            const file = loadFileForImport(entryFile, resolved);
            if (file) {
              entryBuilder.visit(file, entryFile, (id) =>
                visitChild(resolveRelativeToEntry(entryFile, file, id)),
              );
            }
          }
        });

        program.node.body = entryBuilder.build(entryFile);
        program.skip();
        return;
      }

      const reserveInput = program.node.params[0].extra?.reserve;
      if (reserveInput) {
        initValue(reserveInput);
      }
    },
    exit(program: t.NodePath<t.Program>) {
      if (isOutputHTML()) {
        programHTML.translate.exit(program);
      } else {
        programDOM.translate.exit(program);
      }
      currentProgramPath = previousProgramPath.get(currentProgramPath)!;
    },
  },
};

function resolveRelativeToEntry(
  entryFile: t.BabelFile,
  file: t.BabelFile,
  req: string,
) {
  return file === entryFile
    ? resolveRelativePath(file, req)
    : resolveRelativePath(
        entryFile,
        req[0] === "."
          ? path.join(file.opts.filename as string, "..", req)
          : req,
      );
}
