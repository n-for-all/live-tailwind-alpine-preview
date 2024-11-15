# Live HTML Previewer with Tailwind Support
This extension allows you to preview html files with TailwindCSS and AplineJS support in VS Code itself.

### Features

* [Support for multiple suggestion](https://gitlab.com/groups/gitlab-org/editor-extensions/-/epics/50) is now on by default.
* Combine Open in GitLab commands ([5a8d69b](https://gitlab.com/gitlab-org/gitlab-vscode-extension/commit/5a8d69be15c98715315a4a2a868eb64b6732e283))
  * Implemented by [Lennard Sprong](https://gitlab.com/X_Sheep) with [MR !1619](https://gitlab.com/gitlab-org/gitlab-vscode-extension/-/merge_requests/1619) 👍
* Telemetry for multiple suggestions ([9bb4e81](https://gitlab.com/gitlab-org/gitlab-vscode-extension/commit/9bb4e81a2b5b45016b8fd87874c813a35d95846f))

#### Side preview with live editing (Tailwind and Alpinejs support)
![IDE](resources/preview.gif)
#### Side preview with aplinejs support
![IDE](resources/screenshot.png)
#### Full page preview
### Usage
* For side preview, use the keybinding 'ctrl+q s' or press 'F1' and type "Show tailwind side preview"
* For full preview, use the keybinding 'ctrl+q f' or press 'F1' and type "Show tailwind full preview"

If a HTML file is open, an icon is displayed on the Status Bar in bottom left. Click on it for side preview.

## Changelog

### [1.0.5](https://github.com/n-for-all/live-tailwind-alpine-preview) (2024-06-12)


### Changes

* Enable error debugging and output to console
* Supporting loading images from disk
