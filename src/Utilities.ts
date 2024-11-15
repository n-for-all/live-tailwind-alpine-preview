"use strict";
import * as vscode from "vscode";
import Preview from "./Preview";
import * as path from "path";

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
		let preview = new Preview(previewUri);
		vscode.workspace.registerTextDocumentContentProvider("njPreview", preview.provider);
		let editor = vscode.window.activeTextEditor;
		if (editor) {
			let log = vscode.window.createOutputChannel("Tailwind/Alpine Preview");
			let previewDocument = vscode.workspace.openTextDocument(previewUri);
			previewDocument.then((doc: vscode.TextDocument | null) => {
				if (!doc) return;
				let previewPanel: vscode.WebviewPanel | null = vscode.window.createWebviewPanel("njHtmlPreview", `Tailwind Preview`, viewColumn, {
					enableScripts: true,
					retainContextWhenHidden: true,
				});
				previewPanel.webview.html = Utilities.addTailwindScript(context, previewPanel, editor.document.fileName, doc.getText());

				const update = (event: vscode.TextDocumentChangeEvent) => {
					if (event.document.fileName === editor.document.fileName && previewPanel) {
						let currentHTMLContent = Utilities.addTailwindScript(
							context,
							previewPanel,
							event.document.fileName,
							editor.document.getText()
						);
						previewPanel.webview.html = currentHTMLContent;
					}
				};
				const disposable  = vscode.workspace.onDidChangeTextDocument(update);

				var messages: Array<{ message: string; stack: string }> = [];
				var timeoutId: any = null;
				previewPanel.webview.onDidReceiveMessage(
					(message) => {
						if (message.command == "alert") {
							messages.push(message);
							if (timeoutId) {
								clearTimeout(timeoutId);
								timeoutId = null;
							}
							timeoutId = setTimeout(() => {
								vscode.window.showErrorMessage(
									`Aplinejs/Tailwind - ${messages.length} Error${messages.length > 1 ? "s" : ""}: ${messages
										.map((m) => m.message)
										.join("\n\n")}`
								);
								messages = [];
							}, 1000);
						}
						if (message.message.trim() != "") {
							log.appendLine(`${new Date().toLocaleString()}: ${message.message}`);
						}
						if (message.stack.trim() != "") {
							log.appendLine(`${new Date().toLocaleString()}: ${message.stack}`);
						}
					},
					undefined,
					context.subscriptions
				);

				previewPanel.onDidDispose(
					() => {
						// if (previewPanel && !previewPanel) previewPanel.webview.html = "";
                        disposable?.dispose();
						// previewPanel?.dispose();
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

	public static addTailwindScript(context: vscode.ExtensionContext, panel: vscode.WebviewPanel | null, filename: string, html: string): string {
		let tailwind_script_path = "https://cdn.tailwindcss.com";
		let tailwind_script: string = `<script src="${tailwind_script_path}"></script>`;
		const onDiskPath = vscode.Uri.joinPath(context.extensionUri, "resources", "alpine.js");
		const alpinejs = panel?.webview.asWebviewUri(onDiskPath);

		return (
			this.convertLinks(context, panel, filename, html) +
			tailwind_script +
			`<script defer src="${alpinejs}"></script>` +
			`<script>
            (function() {
                const vscode = acquireVsCodeApi();
                window.onerror = function (msg, url, lineNo, columnNo, error) {
                    vscode.postMessage({
                        command: 'alert',
                        message: msg + " @line " + lineNo,
                        stack: error.stack
                    });
                    return true;
                }
                var old_warn = console.warn;
                console.warn = function(message) {
                    vscode.postMessage({
                        command: 'alert',
                        message: 'Console Warn: ' + message,
                        stack: ''
                    });
                    old_warn(message);
                };
                
                var old_log = console.log;
                console.log = function(message) {
                    vscode.postMessage({
                        command: 'console',
                        message: 'Console Log: ' + message,
                        stack: ''
                    });
                    old_log(message);
                };
            }())
            </script>`
		);
	}

	public static convertLinks(context: vscode.ExtensionContext, panel: vscode.WebviewPanel | null, filename: string, html: string): string {
		if (!filename || !html) return html;
		try {
			return html.replace(
				new RegExp("( (?:src=['\"])|<link.*(?:href=['\"]))((?!http|\\/).*?)(['\"])", "gmi"),
				(subString: string, p1: string, p2: string, p3: string): string => {
					try {
						if (p2.startsWith("file://")) {
							p2 = p2.replace(/^file:\/\//gi, "");
						}
						if (p2.startsWith("#") || p2.startsWith("https://") || p2.startsWith("http://") || p2.trim() === "") {
							return subString;
						}

						const onDiskPath = vscode.Uri.file(path.join(path.dirname(filename), p2));
						return [p1, panel?.webview.asWebviewUri(onDiskPath).toString() || "", p3].join("");
					} catch (e) {
						return subString;
					}
				}
			);
		} catch (e) {
			return html;
		}
	}
}
