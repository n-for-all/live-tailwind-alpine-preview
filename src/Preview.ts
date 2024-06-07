"use strict";
import * as vscode from "vscode";
import Provider from "./Provider";

export default class Preview {
	provider: Provider;
	disposable: vscode.Disposable;
	loaded = false;
	previewUri: vscode.Uri;

	constructor(previewUri: vscode.Uri) {
		this.provider = new Provider();
		this.provider.generateHTML();
		// subscribe to selection change event
		let subscriptions: vscode.Disposable[] = [];
		vscode.window.onDidChangeTextEditorSelection(this.onEvent, this, subscriptions);
		this.disposable = vscode.Disposable.from(...subscriptions);
		this.loaded = true;
		this.previewUri = previewUri;
	}

	dispose() {
		this.disposable.dispose();
	}

	private onEvent() {
		if (this.loaded == true) return;
		this.provider.update(this.previewUri);
	}
}
