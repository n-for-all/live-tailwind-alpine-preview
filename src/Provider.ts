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
		let html = plainText;
		return html;
	}

	public update(uri: vscode.Uri) {
		this._onDidChange.fire(uri);
	}

	get onDidChange(): vscode.Event<vscode.Uri> {
		return this._onDidChange.event;
	}
}
