//target text in different languages
let targets = ["Photos partagées", "Shared Photos", "Fotos compartidas", "Fotos compartides", "Fotos Partilhadas", "Gedeelde foto's"];

//used for inserting the button in the correct location
String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

let p_seen = [];

//adds the button
setTimeout (function setButton() {
	var hs = document.getElementsByTagName('h4');
	for(var i = 0; i < hs.length; i++) {
		for(var j = 0; j < targets.length; j++) {
			if(hs[i].innerHTML.match(targets[j]) != null) {
				
				//deduce the username from the url
				var regex = "t\/.*$";
				var username = document.URL.match(regex)[0].slice(2);
				
				//if we haven't added the button for this user
				if(p_seen.indexOf(username) < 0) {
					p_seen.push(username);
					var id = 'DL' + username;
					let dlButton = '<input type="button" id="' + id + '" class="DLButton">'
					hs[i].innerHTML = hs[i].innerHTML.splice(targets[j].length, 0, dlButton);

					// listener
					document.getElementById(id).addEventListener("click", () => {
						alert("Downloading all media, this can take a while...\nTo stop the download leave the page.");
						startDL(username);
					});
				}
			}
		}
	}

	//recursive call in case we changed profile
	setTimeout(setButton, 1000);

}, 1000);

function startDL (username) {
	//get m.facebook message page
	xhr("https://m.facebook.com/" + username, (doc) => {
		//search for the message url
		var matchs = doc.documentElement.innerHTML.match('href="/messages/thread/[^"]*"');
		var splitted = matchs[0].split('"');
		var url = "https://m.facebook.com" + splitted[1];

		xhr(url, (doc) => {
			downloadMedia(doc);
			load_old_rec(doc);
		})
	});
}

//recursive function to scroll the conversation
function load_old_rec(doc) {
	downloadMedia(doc);
	var url = doc.getElementById('see_older').children[0].href;
	xhr(url, (doc) => {
        load_old_rec(doc);
    });
}

//search and download images or videos
function downloadMedia(doc) {
	var i;

	var images = doc.querySelectorAll("div.bx > div > div > a");
	for(i = 0; i < images.length; i++) {
		var c = images[i];
		if(c.href.match("attachment_preview") != null) {
			dlPic(images[i].href);
		}
	}

	var videos = doc.querySelectorAll("div.bx > div > div > div > a");
	for(i = 0; i < videos.length; i++) {
		var d = videos[i];
		if(d.href.match("video_redirect") != null)
			browser.runtime.sendMessage({url: d.href, filename: Date.now() + ".mp4"});
	}
}

function dlPic(url) {
	xhr(url, (doc) => {
		var hdurl = doc.getElementsByClassName("bt bb bu bz")[0].href;
		browser.runtime.sendMessage({url: hdurl});
	});
}

//simplified XMLHttpRequest
function xhr(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.responseType = "document";
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {
			callback(xhr.response);
		}
	};
	xhr.open("GET", url, true);
	xhr.send();
}