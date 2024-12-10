"use strict";
import * as vscode from "vscode";
import Utilities from "./Utilities";
import StatusBarItem from "./StatusBarItem";

export function activate(context: vscode.ExtensionContext) {
	let statusBarItem = new StatusBarItem();
	statusBarItem.updateStatusbar();
	// Subscribe so that the statusBarItem gets updated

	vscode.window.onDidChangeActiveTextEditor(statusBarItem.updateStatusbar, statusBarItem, context.subscriptions);

	// Register the commands that are provided to the user
	let disposableSidePreview = vscode.commands.registerCommand("extension.nj.sidePreview", () => {
		const config = vscode.workspace.getConfiguration("live-tailwind-alpine-preview");
		const externalJs = config.get<string>("externalJs");
		const externalCSS = config.get<string>("externalCSS");

		const settings = {
			externalJs: externalJs,
			externalCSS: externalCSS,
		};
		let previewUri = vscode.Uri.parse("njPreview://authority/preview" + Math.random());
		Utilities.preview(vscode.ViewColumn.Two, context, previewUri, settings);
	});
	let disposableStandalonePreview = vscode.commands.registerCommand("extension.nj.fullPreview", () => {
		const config = vscode.workspace.getConfiguration("live-tailwind-alpine-preview");
		const externalJs = config.get<string>("externalJs");
		const externalCSS = config.get<string>("externalCSS");

		const settings = {
			externalJs: externalJs,
			externalCSS: externalCSS,
		};
		let previewUri = vscode.Uri.parse("njPreview://authority/preview" + Math.random());
		Utilities.preview(vscode.ViewColumn.One, context, previewUri, settings);
	});

	context.subscriptions.push(
		vscode.commands.registerCommand("live-tailwind-alpine-preview.openSettings", () => {
			vscode.commands.executeCommand("workbench.action.openSettings", "live-tailwind-alpine-preview");
		})
	);

	// push to subscriptions list so that they are disposed automatically
	context.subscriptions.push(disposableSidePreview);
	context.subscriptions.push(disposableStandalonePreview);
}

// This method is called when extension is deactivated
export function deactivate() {}
