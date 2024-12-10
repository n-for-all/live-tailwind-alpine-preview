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
	public static preview(
		viewColumn: number = vscode.ViewColumn.Two,
		context: vscode.ExtensionContext,
		previewUri: vscode.Uri,
		settings: {
			externalJs?: string;
			externalCSS?: string;
		}
	) {
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
					localResourceRoots: [vscode.Uri.file(path.join(previewUri.path, "../"))],
				});
				previewPanel.webview.html = Utilities.addTailwindScript(context, previewPanel, editor.document.fileName, doc.getText(), settings);

				const update = (event: vscode.TextDocumentChangeEvent) => {
					if (event.document.fileName === editor.document.fileName && previewPanel) {
						let currentHTMLContent = Utilities.addTailwindScript(context, previewPanel, event.document.fileName, editor.document.getText(), settings);
						previewPanel.webview.html = currentHTMLContent;
					}
				};
				const disposable = vscode.workspace.onDidChangeTextDocument(update);

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
									`Aplinejs/Tailwind - ${messages.length} Error${messages.length > 1 ? "s" : ""}: ${messages.map((m) => {
                                        return m.message.length > 100 ? m.message.substring(0, 283) + "..." : m.message;
                                    }).join(" ☛☛☛☛☛☛☛☛⚠ ")}`
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

	public static addTailwindScript(
		context: vscode.ExtensionContext,
		panel: vscode.WebviewPanel | null,
		filename: string,
		html: string,
		settings: {
			externalJs?: string;
			externalCSS?: string;
		}
	): string {
		let tailwind_script_path = "https://cdn.tailwindcss.com";
		let tailwind_script: string = `<script src="${tailwind_script_path}"></script>`;
		const onDiskPath = vscode.Uri.joinPath(context.extensionUri, "resources", "alpine.js");
		const alpinejs = panel?.webview.asWebviewUri(onDiskPath);

		let externalJs = settings.externalJs && settings.externalJs.trim() != "" ? panel?.webview.asWebviewUri(vscode.Uri.file(settings.externalJs)) : null;
		let externalCSS = settings.externalCSS && settings.externalCSS.trim() != "" ? panel?.webview.asWebviewUri(vscode.Uri.file(settings.externalCSS)) : null;

		let additionalJs = "";

		let parsedOutput = "";
		if (filename.endsWith(".liquid")) {
			const onLiquidDiskPath = vscode.Uri.joinPath(context.extensionUri, "resources", "liquid.js");
			const liquidjs = panel?.webview.asWebviewUri(onLiquidDiskPath);
			const filePath = path.dirname(filename);
			const rootDir = panel?.webview.asWebviewUri(vscode.Uri.file(filePath));

			const fileSnippetsPath = path.join(path.dirname(filename), "../snippets");
			const rootDirSnippets = panel?.webview.asWebviewUri(vscode.Uri.file(fileSnippetsPath));
			additionalJs = `<script defer> 
                window.webviewRootMainDir = "${rootDir}"; 
                window.webviewRootDir = "${rootDirSnippets}"; 
            </script>`;
			additionalJs += `<script defer src="${liquidjs}"></script>`;
			parsedOutput = `<script type="text/template" id="liquid">${this.convertLinks(
				context,
				panel,
				filename,
				html
			)}</script><div id="result"></div><script src="https://cdn.jsdelivr.net/npm/liquidjs/dist/liquid.browser.min.js"></script>`;
		} else {
			parsedOutput = this.convertLinks(context, panel, filename, html);
		}

		return `
        ${externalJs ? `<script defer src="${externalJs}"></script>` : ""}${externalCSS ? `<link rel="stylesheet" href="${externalCSS}" />` : ""}
        ${parsedOutput}${tailwind_script}
        <script defer src="${alpinejs}"></script>
            <script>
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
                    old_warn(message);
                    if(message instanceof Error){
                        message = message.message;
                    }
                    vscode.postMessage({
                        command: 'alert',
                        message: 'Warning: ' + message,
                        stack: ''
                    });
                    
                };
                var old_error = console.error;
                console.error = function(message) {
                    old_error(message);

                    if(message instanceof Error){
                        message = message.message;
                    }
                    vscode.postMessage({
                        command: 'alert',
                        message: 'Error: ' + message,
                        stack: ''
                    });
                    
                };
                
                var old_log = console.log;
                console.log = function(message) {
                    old_log(message);
                    if(message instanceof Error){
                        message = message.message;
                    }
                    vscode.postMessage({
                        command: 'console',
                        message: 'Log: ' + message,
                        stack: ''
                    });
                    
                }; 

                window.sendVsCodeMessage = function(message) {
                    vscode.postMessage({
                        command: 'alert',
                        message: message,
                        stack: ''
                    });
                    old_log(message);
                }; 

                const originalXHR = window.XMLHttpRequest;

                window.XMLHttpRequest = function() {
                    const xhr = new originalXHR();
                    xhr.addEventListener('loadend', function() {
                        if (xhr.status != 200) {
                            console.warn(xhr.responseText + ": " + xhr.responseURL);
                            xhr.onerror();
                        }
                    });

                    return xhr;
                };

            }())
            </script>${additionalJs}`;
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
