"use strict";
import * as vscode from "vscode";
import Preview from "./Preview";

const errorMessage = "The current editor is not an HTML document.";

export default class Utilities {
	public static isHTML(showWarning: boolean): boolean {
		let result = vscode.window.activeTextEditor?.document.languageId.toLowerCase() === "html";
		if (!result && showWarning) {
			vscode.window.showInformationMessage(errorMessage);
		}
		return result;
	}
	public static preview(viewColumn: number = vscode.ViewColumn.Two, context: vscode.ExtensionContext, previewUri: vscode.Uri) {
		if (Utilities.isHTML(true)) {
			let preview = new Preview();
			vscode.workspace.registerTextDocumentContentProvider("HTMLPreview", preview.provider);
			let editor = vscode.window.activeTextEditor;
			if (editor && editor.document.languageId.toLowerCase() === "html") {
				let previewDocument = vscode.workspace.openTextDocument(previewUri);
				previewDocument.then((doc: vscode.TextDocument | null) => {
					if (!doc) return;
					let previewPanel: any = vscode.window.createWebviewPanel("njHtmlPreview", `Tailwind Preview`, viewColumn, {
						enableScripts: true,
						retainContextWhenHidden: true,
					});
					previewPanel.webview.html = Utilities.addTailwindScript(doc.getText());
					previewPanel.onDidChangeViewState(() => {
						if (doc && previewPanel.visible) {
							let currentHTMLContent = doc.getText();
							previewPanel.webview.html = currentHTMLContent;
						}
					});

					const update = (event: vscode.TextDocumentChangeEvent) => {
						if (doc && event.document === doc) {
							let currentHTMLContent = Utilities.addTailwindScript(editor.document.getText());
							previewPanel.webview.html = currentHTMLContent;
						}
					};
					vscode.workspace.onDidChangeTextDocument(update);

					previewPanel.onDidDispose(
						() => {
							previewPanel.dispose();
							previewPanel = null;
							doc = null;
						},
						null,
						context.subscriptions
					);
				});
			} else {
				vscode.window.showInformationMessage(errorMessage);
			}
		}
	}

	public static addTailwindScript(html: string): string {
		let tailwind_script_path = "https://cdn.tailwindcss.com";
		let tailwind_script: string = `<script src="${tailwind_script_path}"></script>`;
		return html + tailwind_script + `<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.10/dist/cdn.min.js"></script>`;
	}
}
