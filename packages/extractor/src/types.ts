export type SymbolKind = 'component' | 'function' | 'hook' | 'route' | 'variable';

export interface ExtractedSymbol {
  name: string;
  kind: SymbolKind;
  startLine: number;
  endLine: number;
  isExported: boolean;
  isDefaultExport?: boolean;
}

export interface ImportSpecifier {
  local: string;
  imported?: string;
  isDefault?: boolean;
}

export interface ExtractedImport {
  source: string;
  specifiers: ImportSpecifier[];
  line: number;
}

export interface ExtractedCall {
  callee: string;
  args: string[];
  line: number;
}

export interface ExtractedJsx {
  tag: string;
  line: number;
}

export interface ExtractedFile {
  filePath: string;
  contentHash: string;
  isClientComponent: boolean;
  isServerActionFile: boolean;
  symbols: ExtractedSymbol[];
  imports: ExtractedImport[];
  calls: ExtractedCall[];
  renderedComponents: ExtractedJsx[];
}
