function sortRoot() {
	
	var list = document.getElementsByClassName('tm-comments__tree');
	
	if (list.length == 0) {
		return;
	}
	
	list = list[0];
	
	var items = list.childNodes;
	var itemsArr = [];
	for (var i in items) {
		if (items[i].nodeType == 1) { // get rid of the whitespace text nodes
			itemsArr.push(items[i]);
		}
	}

	itemsArr.sort(function(a, b) {
	  return (getRating(a) > getRating(b) ? -1 : 1);
	});

	for (i = 0; i < itemsArr.length; ++i) {
	  list.appendChild(itemsArr[i]);
	}
	
	console.log('sort finish');
};

function getRating(item) {
	for (var i = 0; i < item.childNodes.length; i++) {
		if (item.childNodes[i].className == "tm-comment-thread__comment") {
			var ratings = item.childNodes[i].getElementsByClassName('tm-votes-meter__value_rating');
			  
			if (ratings.length == 0) {
				return 0;
			}
			
			return parseInt(ratings[0].textContent)
		}        
	}
	
	return 0;
}

sortRoot();