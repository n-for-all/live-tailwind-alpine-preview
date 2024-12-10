(function () {
	try {
		var parser = new window.DOMParser();
		var parsedDocument = parser.parseFromString(document.getElementById("liquid").innerHTML, "text/html");
		var scripts = parsedDocument.getElementsByTagName("script");
		[].forEach.call(scripts, (script) => {
			var newScript = document.createElement("script");
			newScript.text = script.text;
			document.body.appendChild(newScript);
			script.remove();
		});

		const textarea = parsedDocument.createElement("textarea");
		textarea.innerHTML = parsedDocument.body.innerHTML;

		if (typeof liquidjs != "undefined") {
			if (window.onLiquidRoot) {
				webviewRootDir = window.onLiquidRoot(webviewRootDir);
			}
			const result = document.getElementById("result");
			var engine = new liquidjs.Liquid({
				root: webviewRootDir,
				extname: ".liquid",
			});
			var json = {};
			if (window.onLiquid) {
				json = window.onLiquid(liquidjs, engine);
			} else {
				result.innerHTML = `<code>We have detected that you are trying to preview liquid js, you should declare a function 'onLiquid' so that it returns a json object and renders the liquid template with the variables in the template<br/><br/> Example (add this to your liquid file and replace the variables with your liquid ones):<br/><br/></code> <hr/><pre>&lt;script type="text/javascript"&gt;
    window.onLiquid = function(liquidjs){
        class ValueDrop extends liquidjs.Drop {
            scale_max = 1;
            rating = 10; 
            valueOf() { 
                return this.rating;
            }
        }
        return { 
            product: {   
                metafields: {
                    reviews: {
                        count: 10,
                        rating: {
                            value: new ValueDrop(),
                        },
                    },
                },
            },
        }; 

        // By default the root folder is in ../snippets directory relative to the current file
        // window.onLiquidRoot = function(root){
        //     return root + '/../testfolder'
        // }
    }
&lt;/script&gt;</pre>`;
				return;
			}
			var template = textarea.value;
			engine
				.parseAndRender(template, json)
				.then((html) => {
					document.getElementById("result").innerHTML = html;
				})
				.catch((e) => {
					console.error(e.stack);
					sendVsCodeMessage(e.message);
				});
		}
	} catch (e) {
		console.log(2, e.message);
	}
})();
