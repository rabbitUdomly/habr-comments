
sortHabr = function() {
	var instance = this;
	
	var list = null;
	
	var sortDirection = 1;
	
	this.init = function() {
		
		// init list comments
		list = document.getElementsByClassName('tm-comments__tree');
		if (list.length == 0) {
			return;
		}
		list = list[0];
		
		// init popup
		var popup = document.createElement("div");
		popup.id = 'ext_habr_comment_popup';
		popup.style.cssText = 'position: fixed; right: 0; top: 176px; background: #fff; padding: 10px;';
		document.body.appendChild(popup);
		
		// init sort button
		var buttonSort = document.createElement("button");
		buttonSort.innerHTML = 'Sort comments';
		buttonSort.addEventListener("click", sortRoot);
		popup.appendChild(buttonSort);
		
		// init rating list
		
		
		
	};
	
	this.sortRoot = function() {
		
		var items = list.childNodes;
		var itemsArr = [];
		for (var i in items) {
			if (items[i].nodeType == 1) { // get rid of the whitespace text nodes
				itemsArr.push(items[i]);
			}
		}

		itemsArr.sort(function(a, b) {
		  return (getRating(a) > getRating(b) ? (-1 * sortDirection) : (1 * sortDirection));
		});

		for (i = 0; i < itemsArr.length; ++i) {
		  list.appendChild(itemsArr[i]);
		}
		
		sortDirection = sortDirection * -1;
		console.log('sort finish');
	};

	this.getRating = function(item) {
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
	
	
	this.init();
	
	return this;
}


sortHabr();