"use strict"
import * as vscode from 'vscode'
import Utilities from "./Utilities"

export default class StatusBarItem {
    statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.statusBarItem.command = "extension.nj.sidePreview";
        this.statusBarItem.text = "$(open-preview) Tailwind/Alpine";
        this.statusBarItem.tooltip = 'Open Tailwind/Alpine Preview';
    }

    updateStatusbar() {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.statusBarItem.hide();
            return;
        }
        if (Utilities.isHTML(false)) {
            this.statusBarItem.text = `$(open-preview)`;
            this.statusBarItem.show();
        }
        else {
            this.statusBarItem.hide();
        }
    }
}