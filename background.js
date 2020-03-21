// downloads the passed url
browser.runtime.onMessage.addListener(
    function(req) {
        browser.downloads.download({ url : req.url, filename: req.filename});
    }
);