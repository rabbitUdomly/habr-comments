
sortHabr = function() {
	var instance = this;
	
	var list = null;

	var ratingList = null;
	
	var sortDirection = 1;

	var scrolling = true;

	this.init = function() {
		
		// init list comments
		list = document.getElementsByClassName('tm-comments__tree');
		if (list.length === 0) {
			return;
		}
		list = list[0];
		
		// init popup
		var popup = document.createElement('div');
		popup.setAttribute('id', 'ext_habr_comment_popup');
		document.body.appendChild(popup);
		
		// init sort button
		var buttonSort = document.createElement('button');
		buttonSort.setAttribute('id', 'ext_habr_comment_sort_button');
		buttonSort.innerHTML = 'Sort root comments';
		buttonSort.addEventListener('click', sortRoot);
		popup.appendChild(buttonSort);
		
		// init rating list
		ratingList = document.createElement('div');
		ratingList.setAttribute('id', 'ext_habr_comment_rating_list');
		popup.appendChild(ratingList);

		instance.renderRatingList(list.childNodes);

		// listener scroll
		window.addEventListener('scroll', function(e) {
			if (scrolling) {
				scrolling = false;

				instance.activeVisibleComment();

				scrolling = true;
			}
		});
	};

	this.renderRatingList = function(items, prefix = '') {
		if (prefix === '') {
			ratingList.innerHTML = '';
		}

		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var rating = instance.getRating(item);
			var commentId = instance.getCommentId(item);

			var ratingElement = document.createElement('div');
			ratingElement.setAttribute('class', 'ext_habr_comment_rating_link');
			ratingElement.setAttribute('id', 'ext_habr_comment_' + commentId);
			ratingElement.innerHTML = prefix + '<a href="#">' + rating + '</a>';
			ratingElement.addEventListener('click', instance.scrollToComment(item));
			ratingList.appendChild(ratingElement);

			for (var k = 0; k < item.childNodes.length; k++) {
				if (item.childNodes[k].className === 'tm-comment-thread__children') {
					instance.renderRatingList(item.childNodes[k].childNodes, prefix + '*');
				}
			}
		}
	};

	this.scrollToComment = function(item) {
		return (e) => {
			e.preventDefault();

			let position = item.getBoundingClientRect();
			window.scrollTo(position.left, position.top + window.scrollY - instance.getHeaderHeight());
		}
	};

	this.sortRoot = function() {
		var items = list.childNodes;
		var itemsArr = [];
		for (var i in items) {
			if (items[i].nodeType === 1) { // get rid of the whitespace text nodes
				itemsArr.push(items[i]);
			}
		}

		itemsArr.sort(function(a, b) {
		  return (instance.getRating(a) > instance.getRating(b) ? (-1 * sortDirection) : (sortDirection));
		});

		for (i = 0; i < itemsArr.length; ++i) {
		  list.appendChild(itemsArr[i]);
		}
		
		sortDirection = sortDirection * -1;

		instance.renderRatingList(list.childNodes);
	};

	this.getRating = function(item) {
		for (var i = 0; i < item.childNodes.length; i++) {
			if (item.childNodes[i].className === 'tm-comment-thread__comment') {
				var ratings = item.childNodes[i].getElementsByClassName('tm-votes-meter__value_rating');
				  
				if (ratings.length === 0) {
					return 0;
				}
				
				return parseInt(ratings[0].textContent)
			}
		}
		
		return 0;
	}

	this.getCommentId = function(item) {
		for (var i = 0; i < item.childNodes.length; i++) {
			if (item.childNodes[i].className === 'tm-comment-thread__comment') {
				var target = item.childNodes[i].getElementsByClassName('tm-comment-thread__target');
				if (target.length === 0) {
					return '';
				}

				var id = target[0].getAttribute('name');
				id = id.split('_');
				return id[id.length - 1];
			}
		}

		return '';
	}

	this.activeVisibleComment = function () {
		var activeLinks = document.querySelectorAll('.ext_habr_comment_rating_link.active');
		for (var k = 0; k < activeLinks.length; k++) {
			activeLinks[k].classList.remove("active");
		}

		var item = instance.getFirstVisibleComment();
		if (item) {
			var link = document.getElementById('ext_habr_comment_' + instance.getCommentId(item));
			link.classList.add("active");
			link.scrollIntoView();
		}
	};

	this.getFirstVisibleComment = function() {
		var items = document.getElementsByClassName('tm-comment-thread__comment');
		for (var i = 0; i < items.length; i++) {
			if (instance.checkVisible(items[i])) {
				return items[i].parentNode;
			}
		}

		return null;
	};

	this.checkVisible = function(item) {
		var rect = item.getBoundingClientRect();
		var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
		return !(rect.bottom - instance.getHeaderHeight() < 0 || rect.top - viewHeight - instance.getHeaderHeight() >= 0);
	}

	this.getHeaderHeight = function () {
		var header = document.getElementsByClassName('tm-base-layout__header');
		if (header.length === 0) {
			return;
		}
		header = header[0];
		return header.offsetHeight;
	};
	
	this.init();
	
	return this;
}


sortHabr();