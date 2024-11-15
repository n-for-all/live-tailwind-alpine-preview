# Live HTML Previewer with Tailwind Support
This extension allows you to preview html files with TailwindCSS and AplineJS support in VS Code itself.

### Features

* Live Preview of Any file that may contain html markup (not limited to html)
* Using Play CDN for tailwind and AlpineJs CDN
* To support custom tailwind config or plugins 

```
window.addEventListener('DOMContentLoaded', function () {
    tailwind.config = {
        darkMode: 'class',
        prefix: 'tw-',
    }
});
```


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

### [1.0.8](https://github.com/n-for-all/live-tailwind-alpine-preview), fixes and changes (2024-10-15)
### [1.0.5](https://github.com/n-for-all/live-tailwind-alpine-preview) (2024-06-12)


### Changes

* Enable error debugging and output to console
* Supporting loading images from disk
