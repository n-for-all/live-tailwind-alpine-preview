"use strict";
import * as vscode from "vscode";
//@ts-ignore
import * as path from "path";

/**
 * Provider
 */
export default class Provider implements vscode.TextDocumentContentProvider {
	private _onDidChange: vscode.EventEmitter<vscode.Uri>;
	private _textEditor: vscode.TextEditor | undefined;

	constructor() {
		this._onDidChange = new vscode.EventEmitter<vscode.Uri>();
		this._textEditor = vscode.window.activeTextEditor;
	}

	provideTextDocumentContent(uri: vscode.Uri): string {
		return this.generateHTML();
	}

	public generateHTML(): string {
		let plainText: string | undefined = this._textEditor?.document.getText();
		if (!plainText) return "";
		let html = this.convertLinks(plainText);
		return html;
	}

	// Thanks to Thomas Haakon Townsend for coming up with this regex
	private convertLinks(html: string): string {
		let documentFileName = this._textEditor?.document.fileName;
		if (!documentFileName) return html;
		return html.replace(
			new RegExp("((?:src|href)=['\"])((?!http|\\/).*?)(['\"])", "gmi"),
			(subString: string, p1: string, p2: string, p3: string): string => {
				return [p1, vscode.Uri.file(path.join(path.dirname(documentFileName), p2)), p3].join("");
			}
		);
	}

	public update(uri: vscode.Uri) {
		this._onDidChange.fire(uri);
	}

	get onDidChange(): vscode.Event<vscode.Uri> {
		return this._onDidChange.event;
	}
}
