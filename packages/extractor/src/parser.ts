import crypto from 'node:crypto';
import Parser, { type SyntaxNode } from 'tree-sitter';
// tree-sitter-typescript exports { typescript, tsx }
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tsGrammar = require('tree-sitter-typescript');

import {
  ExtractedCall,
  ExtractedFile,
  ExtractedImport,
  ExtractedJsx,
  ExtractedSymbol,
  ImportSpecifier,
  SymbolKind,
} from './types.js';

export class AstExtractor {
  private tsParser: Parser;
  private tsxParser: Parser;

  constructor() {
    this.tsParser = new Parser();
    this.tsParser.setLanguage(tsGrammar.typescript);

    this.tsxParser = new Parser();
    this.tsxParser.setLanguage(tsGrammar.tsx);
  }

  public extract(filePath: string, sourceCode: string): ExtractedFile {
    const isTsx = filePath.endsWith('.tsx') || filePath.endsWith('.jsx');
    const parser = isTsx ? this.tsxParser : this.tsParser;
    const tree = parser.parse(sourceCode);

    const hash = crypto.createHash('sha256').update(sourceCode).digest('hex');

    const symbols: ExtractedSymbol[] = [];
    const imports: ExtractedImport[] = [];
    const calls: ExtractedCall[] = [];
    const renderedComponents: ExtractedJsx[] = [];

    let isClientComponent = false;
    let isServerActionFile = false;

    // Directives: check first statements
    for (const child of tree.rootNode.namedChildren) {
      if (child.type === 'expression_statement') {
        const text = child.text.trim().replace(/['";]/g, '');
        if (text === 'use client') isClientComponent = true;
        if (text === 'use server') isServerActionFile = true;
      }
    }

    // Traverse root
    const walk = (node: SyntaxNode, inExport = false, isDefault = false) => {
      // 1. Export Statements
      if (node.type === 'export_statement') {
        const isDef = node.children.some((c) => c.text === 'default');
        for (const child of node.namedChildren) {
          walk(child, true, isDef);
        }
        return;
      }

      // 2. Import Statements
      if (node.type === 'import_statement') {
        const imp = this.parseImport(node);
        if (imp) imports.push(imp);
        return;
      }

      // 3. Function Declarations
      if (
        node.type === 'function_declaration' ||
        node.type === 'generator_function_declaration'
      ) {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          const name = nameNode.text;
          const kind = this.classifySymbolKind(name, isTsx);
          symbols.push({
            name,
            kind,
            startLine: node.startPosition.row + 1,
            endLine: node.endPosition.row + 1,
            isExported: inExport,
            isDefaultExport: isDefault,
          });
        }
      }

      // 4. Lexical Declarations (const / let Foo = ...)
      if (node.type === 'lexical_declaration') {
        for (const decl of node.namedChildren) {
          if (decl.type === 'variable_declarator') {
            const nameNode = decl.childForFieldName('name');
            if (nameNode && nameNode.type === 'identifier') {
              const name = nameNode.text;
              const valueNode = decl.childForFieldName('value');
              const isFunctionValue =
                valueNode?.type === 'arrow_function' ||
                valueNode?.type === 'function';

              if (isFunctionValue || inExport) {
                const kind = isFunctionValue
                  ? this.classifySymbolKind(name, isTsx)
                  : 'variable';
                symbols.push({
                  name,
                  kind,
                  startLine: decl.startPosition.row + 1,
                  endLine: decl.endPosition.row + 1,
                  isExported: inExport,
                  isDefaultExport: isDefault,
                });
              }
            }
          }
        }
      }

      // 5. Calls (fetch, hooks, function invocations)
      if (node.type === 'call_expression') {
        const funcNode = node.childForFieldName('function');
        const argsNode = node.childForFieldName('arguments');
        if (funcNode) {
          const callee = funcNode.text;
          const stringArgs: string[] = [];
          if (argsNode) {
            for (const arg of argsNode.namedChildren) {
              if (
                arg.type === 'string' ||
                arg.type === 'string_fragment' ||
                arg.type === 'template_string'
              ) {
                stringArgs.push(arg.text.replace(/['"`]/g, ''));
              }
            }
          }
          calls.push({
            callee,
            args: stringArgs,
            line: node.startPosition.row + 1,
          });
        }
      }

      // 6. JSX Elements (e.g. <Button onClick={handleUpgrade} />, <form onSubmit={handleSubmit}>)
      if (
        node.type === 'jsx_element' ||
        node.type === 'jsx_self_closing_element'
      ) {
        const openNode =
          node.type === 'jsx_element'
            ? node.childForFieldName('open_tag')
            : node;
        const tagNode = openNode?.namedChildren.find(
          (c) => c.type === 'identifier' || c.type === 'nested_identifier'
        );
        if (tagNode && openNode) {
          const tag = tagNode.text;
          const props = this.parseJsxProps(openNode);
          renderedComponents.push({
            tag,
            line: node.startPosition.row + 1,
            props: Object.keys(props).length > 0 ? props : undefined,
          });
        }
      }

      // Recurse children
      for (const child of node.namedChildren) {
        walk(child, false, false);
      }
    };

    walk(tree.rootNode);

    return {
      filePath,
      contentHash: hash,
      isClientComponent,
      isServerActionFile,
      symbols,
      imports,
      calls,
      renderedComponents,
    };
  }

  private parseImport(node: SyntaxNode): ExtractedImport | null {
    const sourceNode = node.childForFieldName('source');
    if (!sourceNode) return null;

    const source = sourceNode.text.replace(/['"]/g, '');
    const specifiers: ImportSpecifier[] = [];

    // Find import clause
    for (const child of node.namedChildren) {
      if (child.type === 'import_clause') {
        for (const clauseChild of child.namedChildren) {
          if (clauseChild.type === 'identifier') {
            // Default import: import Foo from '...'
            specifiers.push({
              local: clauseChild.text,
              isDefault: true,
            });
          } else if (clauseChild.type === 'named_imports') {
            for (const spec of clauseChild.namedChildren) {
              if (spec.type === 'import_specifier') {
                const nameNode = spec.childForFieldName('name');
                const aliasNode = spec.childForFieldName('alias');
                specifiers.push({
                  local: aliasNode ? aliasNode.text : nameNode?.text || '',
                  imported: nameNode?.text,
                });
              }
            }
          }
        }
      }
    }

    return {
      source,
      specifiers,
      line: node.startPosition.row + 1,
    };
  }

  private parseJsxProps(node: SyntaxNode): Record<string, string> {
    const props: Record<string, string> = {};
    for (const child of node.namedChildren) {
      if (child.type === 'jsx_attribute') {
        const propNameNode = child.namedChildren.find((c) => c.type === 'property_identifier');
        if (propNameNode) {
          const propName = propNameNode.text;
          const valNode = child.namedChildren.find((c) => c !== propNameNode);
          if (valNode) {
            if (valNode.type === 'jsx_expression') {
              const exprChild = valNode.namedChildren[0];
              if (exprChild) {
                props[propName] = exprChild.text;
              }
            } else if (valNode.type === 'string' || valNode.type === 'string_fragment') {
              props[propName] = valNode.text.replace(/['"]/g, '');
            }
          }
        }
      }
    }
    return props;
  }

  private classifySymbolKind(name: string, isTsx: boolean): SymbolKind {
    if (name.startsWith('use') && name.length > 3 && /^[A-Z]/.test(name[3])) {
      return 'hook';
    }
    // Uppercase names in JSX/TSX are components
    if (isTsx && /^[A-Z]/.test(name)) {
      return 'component';
    }
    // Route convention (GET, POST, PUT, DELETE, PATCH, OPTIONS)
    if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].includes(name)) {
      return 'route';
    }
    return 'function';
  }
}
