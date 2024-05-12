'use strict';
import * as vscode from 'vscode';
import Utilities from './Utilities';
import StatusBarItem from './StatusBarItem';

export function activate(context: vscode.ExtensionContext) {
    let statusBarItem = new StatusBarItem();
    statusBarItem.updateStatusbar();
    // Subscribe so that the statusBarItem gets updated
    vscode.window.onDidChangeActiveTextEditor(statusBarItem.updateStatusbar, statusBarItem, context.subscriptions);
    let previewUri = vscode.Uri.parse("HTMLPreview://authority/preview");
    // Register the commands that are provided to the user
    let disposableSidePreview = vscode.commands.registerCommand('extension.nj.sidePreview', () => {
        Utilities.preview(vscode.ViewColumn.Two, context, previewUri);
    });
    let disposableStandalonePreview = vscode.commands.registerCommand('extension.nj.fullPreview', () => {
        Utilities.preview(vscode.ViewColumn.One, context, previewUri);
    });

    // push to subscriptions list so that they are disposed automatically
    context.subscriptions.push(disposableSidePreview);
    context.subscriptions.push(disposableStandalonePreview);
}

// This method is called when extension is deactivated
export function deactivate() {

}




