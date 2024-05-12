"use strict";
import * as vscode from "vscode";
import Provider from "./Provider";

export default class Preview {
	provider: Provider;
	disposable: vscode.Disposable;

	constructor() {
		this.provider = new Provider();
		this.provider.generateHTML();
		// subscribe to selection change event
		let subscriptions: vscode.Disposable[] = [];
		vscode.window.onDidChangeTextEditorSelection(this.onEvent, this, subscriptions);
		this.disposable = vscode.Disposable.from(...subscriptions);
	}

	dispose() {
		this.disposable.dispose();
	}

	private onEvent() {
		this.provider.update(vscode.Uri.parse("HTMLPreview://authority/preview"));
	}
}
