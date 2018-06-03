/**
 * Noname - The framework.
 * @author Nurasyl Aldan <nurassyl.aldan@gmail.com>
 * @version 1.0.0
 */

// @flow

class Noname { // eslint-disable-line
	root: HTMLDivElement;
	tools: ?HTMLDivElement;
	selection: Selection;
	isSelected: boolean;
	isCaret: boolean;
	isRange: boolean;
	isCollapsed: boolean;

	_anchorNode: ?Node;
	_focusNode: ?Node;
	_anchorOffset: ?number;
	_focusOffset: ?number;

	/**
	 * @constructor
	 * @this	{Noname}
	 * @param	{HTMLDivElement} root
	 * @param	{object} options
	 */
	constructor(root: HTMLDivElement, options: any = new Object()) {
		// options
		options.tools =
			options.tools === undefined || options.tools === null ? null : options.tools;
		options.wysiwyg = options.wysiwyg === true ? true : false;

		// elements
		this.root = root;
		this.tools = options.tools;

		// get selection object
		this.selection = window.getSelection();

		// for "this.getSelection()"
		this.isSelected = false;
		this.isCaret = false;
		this.isRange = false;
		this.isCollapsed = false;

		if (options.wysiwyg === true) {
			this.root.setAttribute('contenteditable', 'true');
		}
	}

	/**
	 * Get selection object and selection info.
	 *
	 * @return {Selection}
	 */
	getSelection(): Selection {
		this.isSelected = false;
		this.isCaret = false;
		this.isRange = false;
		this.isCollapsed = false;

		// set selection object to class property
		this.selection = window.getSelection();

		if (this.selection.type !== 'None') {
			this.isSelected = true;
		}

		if (this.selection.type === 'Caret') {
			this.isCaret = true;
		}

		if (this.selection.type === 'Range') {
			this.isRange = true;
		}

		if (this.selection.isCollapsed) {
			this.isCollapsed = true;
		}

		// return selection object
		return this.selection;
	}

	/**
	 * @returns {null|false|Node|Array}
	 * null		- no selection.
	 * false	- error selection.
	 * Node		- one node selection.
	 * Array	- range selection
	 */
	getSelectedNodes() {
		// get selection info
		this.getSelection();

		// reset properties
		this._anchorNode = undefined;
		this._focusNode = undefined;
		this._anchorOffset = undefined;
		this._focusOffset = undefined;

		if (this.isSelected && this.isRange) {
			// get main anchor node
			this._anchorNode = this.selection.anchorNode;
			while (true) { // eslint-disable-line
				// $FlowFixMe
				if (this._anchorNode.parentNode === this.root) {
					this._anchorNode = this._anchorNode;
					break;
					// $FlowFixMe
				} else if (this._anchorNode.parentNode === null) {
					this._anchorNode = null;
					break;
				}
				// $FlowFixMe
				this._anchorNode = this._anchorNode.parentNode;
			}

			// get main focus node
			this._focusNode = this.selection.focusNode;
			while (true) { // eslint-disable-line
				// $FlowFixMe
				if (this._focusNode.parentNode === this.root) {
					this._focusNode = this._focusNode;
					break;
					// $FlowFixMe
				} else if (this._focusNode.parentNode === null) {
					this._focusNode = null;
					break;
				}
				// $FlowFixMe
				this._focusNode = this._focusNode.parentNode;
			}

			// check selection
			if (this._anchorNode === null || this._focusNode === null) {
				// error selection

				return false;
			} else if (this._anchorNode === this._focusNode) {
				// caret or one element selection of range.

				// get right offsets
				this._anchorOffset = this.selection.anchorOffset;

				let fromLeft: boolean = false; // eslint-disable-line

				// $FlowFixMe
				let nodeValue: string = this.selection.anchorNode.nodeValue;
				let anchorOffset: number = this.selection.anchorOffset;

				let selectedText: string = this.selection.toString();

				// $FlowFixMe
				if (selectedText === nodeValue.substr(anchorOffset, selectedText.length)) {
					// from left
					fromLeft = true;
				} else {
					// from right
					fromLeft = false;
					// $FlowFixMe
					this._anchorOffset = this._anchorOffset - 1;
				}

				// set focus offset
				this._focusOffset = selectedText.length;

				// return one node
				return this._anchorNode;
			} else {
				// range selection

				// get nodes
				const nodes = [this._anchorNode, this._focusNode];
				const childNodes: NodeList<Node> = this.root.childNodes;

				// memories
				let anchorIndex: number = 0;
				let focusIndex: number = 0;
				let selectedNodes: Array<Node> = [];
				let fromLeft: boolean = false;

				for (let index: any in childNodes) {
					if (nodes[0] === childNodes[index]) {
						anchorIndex = index;
					}
				}

				for (let index: any in childNodes) {
					if (nodes[1] === childNodes[index]) {
						focusIndex = index;
					}
				}

				if (anchorIndex < focusIndex) {
					// from left|top to right|bottom
					fromLeft = true;
					for (let i: number = anchorIndex; i <= focusIndex; i++) {
						selectedNodes.push(childNodes[i]);
					}
				} else {
					// from right|bottom to left|top
					fromLeft = false;
					for (let i: number = anchorIndex; i >= focusIndex; i--) {
						selectedNodes.unshift(childNodes[i]);
					}
				}

				// get right offsets
				if (fromLeft) {
					this._anchorOffset = this.selection.anchorOffset;
					this._focusOffset = this.selection.focusOffset;
				} else {
					this._anchorOffset = this.selection.focusOffset;
					this._focusOffset = this.selection.anchorOffset;

					let _anchorNode: ?Node = this._anchorNode;
					let _focusNode: ?Node = this._focusNode;

					this._anchorNode = _focusNode;
					this._focusNode = _anchorNode;
				}

				// return selected nodes
				return selectedNodes;
			}
		}
		return null;
	}
}
