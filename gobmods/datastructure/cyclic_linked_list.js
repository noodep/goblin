(function(window, document, undefined) {
	'use strict';

	var static_index = 0;
	
	function CyclicLinkedList(options) {
		this._start_node = undefined;
		this.length = 0;
	}

	CyclicLinkedList.prototype.add = function(value) {
		var new_node = new CyclicLinkedList.Node(value);
		this.length++;
		if(this._start_node === undefined) {
			this._start_node = new_node;
			this._start_node._next = new_node;
			this._start_node._previous = new_node;
		} else {
			this._start_node.insertNodeAfter(new_node);
		}

		return new_node;
	}

	CyclicLinkedList.prototype.getStartNode = function() {
		return this._start_node;
	}

	CyclicLinkedList.prototype.removeNode = function(node) {
		this.length--;

		var p = node._previous;
		var n = node._next;

		if(node === this._start_node) {
			this._start_node = n;
		}
		node._previous._next = n;
		node._next._previous = p;
	}


	CyclicLinkedList.prototype.getIterator = function() {
		return new CyclicLinkedList.Iterator(this);
	}

	CyclicLinkedList.Node = function(value, next, previous) {
		this._id = static_index++;
		this._value = value;
		this._next = next;
		this._previous = previous;
	}

	CyclicLinkedList.Node.prototype.insertAfter = function(value) {
		return this.insertNodeAfter(new CyclicLinkedList.Node(value));
	}

	CyclicLinkedList.Node.prototype.insertNodeAfter = function(node) {
		var current_next = this._next;
		this._next = node;
		node._next = current_next;
		node._previous = this;
		current_next._previous = node;
		return node;
	}

	CyclicLinkedList.Node.prototype.insertBefore = function(value) {
		return this.insertNodeBefore(new CyclicLinkedList.Node(value));
	}

	CyclicLinkedList.Node.prototype.insertNodeBefore = function(node) {	
		var current_previous = this._previous;
		this._previous = node;
		node._next = this;
		node._previous = current_previous;
		current_previous._next = node;
		return node;
	}

	CyclicLinkedList.Node.prototype.toString = function() {
		return '[Node ' + this._id /*+ ' : ' + this._value */+']';
	}


	CyclicLinkedList.Iterator = function(list) {
		this._list = list;
		this._current_node = list.getStartNode();
	}

	CyclicLinkedList.Iterator.prototype.next = function() {
		var current_node = this._current_node;
		this._current_node = current_node._next;
		return current_node;
	}

	CyclicLinkedList.Iterator.prototype.isStart = function() {
		return this._current_node === this._list.getStartNode();
	}



	Goblin.addModule("CyclicLinkedList", CyclicLinkedList);
})(this, this.document);
