/**
 * NurWSY - The WYSIWYG framework.
 * @author Nurasyl Aldan <nurassyl.aldan@gmail.com>
 * @version 1.0.0
 */

// @flow

class NurWSY { // eslint-disable-line
	root: HTMLDivElement;
	tools: ?HTMLDivElement;
	selection: Selection;
	isSelected: boolean;
	isCaret: boolean;
	isRange: boolean;

	_anchorNode: ?Node;
	_focusNode: ?Node;
	_anchorOffset: ?number;
	_focusOffset: ?number;

	/**
	 * @constructor
	 * @this	{NurWSY}
	 * @param	{HTMLDivElement} root
	 * @param	{object} options
	 */
	constructor(root: HTMLDivElement, options: any = new Object()): void {
		// options
		options.tools = options.tools === undefined || options.tools === null ? null : options.tools;
		options.wysiwyg = options.wysiwyg === true ? true : false;

		// elements
		this.root = root;
		this.tools = options.tools;

		// get selection object
		this.selection = window.getSelection();

		// for "this._getSelection()"
		this.isSelected = false;
		this.isCaret = false;
		this.isRange = false;

		if (options.wysiwyg === true) {
			this.root.setAttribute('contenteditable', 'true');
		}
	}

	/**
	 * Get selection object and selection info.
	 *
	 * @return {Selection}
	 */
	_getSelection(): Selection {
		this.isSelected = false;
		this.isCaret = false;
		this.isRange = false;

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

		// return selection object
		return this.selection;
	}

	/**
	 * @returns {Node|Array|false|null}
	 * null		- not selected.
	 * false	- error selection.
	 * Node		- one node selection.
	 * Array	- range selection
	 */
	_getSelectedNodes(): Node | Array<Node> | false | null {
		// get selection info
		this._getSelection();

		// reset properties
		this._anchorNode = undefined;
		this._focusNode = undefined;
		this._anchorOffset = undefined;
		this._focusOffset = undefined;

		if (this.isSelected) {
			// get main anchor node
			this._anchorNode = (this.selection.anchorNode: any);
			while (true) { // eslint-disable-line
				if (this._anchorNode.parentNode === this.root) {
					this._anchorNode = this._anchorNode;
					break;
				} else if (this._anchorNode.parentNode === null) {
					this._anchorNode = null;
					break;
				}
				this._anchorNode = (this._anchorNode: any).parentNode;
			}

			// get main focus node
			this._focusNode = (this.selection.focusNode: any);
			while (true) { // eslint-disable-line
				if (this._focusNode.parentNode === this.root) {
					this._focusNode = this._focusNode;
					break;
				} else if (this._focusNode.parentNode === null) {
					this._focusNode = null;
					break;
				}
				this._focusNode = (this._focusNode: any).parentNode;
			}

			// check selection
			if (this._anchorNode === null || this._focusNode === null) {
				// error selection

				// reset nodes
				this._anchorNode = undefined;
				this._focusNode = undefined;

				return false;
			} else if (this._anchorNode === this._focusNode) {
				// one element selection

				// reset focus node
				this._focusNode = undefined;

				// get right offsets
				this._anchorOffset = this.selection.anchorOffset;

				let fromLeft: boolean = false; // eslint-disable-line

				let nodeValue: string = (this.selection.anchorNode: any).nodeValue;
				let anchorOffset: number = this.selection.anchorOffset;

				let selectedText: string = this.selection.toString();

				if (selectedText === nodeValue.substr(anchorOffset, selectedText.length)) {
					// from left
					fromLeft = true;
				} else {
					// from right
					fromLeft = false;
				}

				// set focus offset
				this._focusOffset = selectedText.length;

				if (!fromLeft) {
					// if from right
					this._anchorOffset = typeof this._anchorOffset === 'number' ? this._anchorOffset - this._focusOffset : undefined;
				}

				// return one node
				return (this._anchorNode: any);
			} else {
				// multiple elements selection

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

	/**
	 * Find text node of element node.
	 *
	 * @param {Node} node - Element node.
	 * @return {Node|null}
	 *
	 * @static
	 */
	static _findTextNode(node: Node): ?Node {
		let Node = node;
		while (true) { // eslint-disable-line
			if (Node.childNodes.length === 0 && Node.nodeName === '#text') {
				return Node;
			} else {
				if (Node.childNodes.length === 0) {
					return null;
				}
			}
			Node = Node.childNodes[0];
		}
	}

	/**
	 * Divide anchor & focus nodes.
	 *
	 * @param {Node} node - Element node.
	 * @return {Array|null}
	 */
	_divide(n) {
		let self = this.constructor; // eslint-disable-line
		if (n instanceof Node) {
			// one node selected
			if (this.isRange) {
				if (this._anchorOffset === 0 && (this._anchorNode: any).innerText.length === this._focusOffset) {
					console.log('full');
				} else if (this._anchorOffset === 0) {
					console.log('left');
				} else if ((this._anchorNode: any).innerText.length === this._anchorOffset + this._focusOffset) {
					console.log('right');
				} else {
					console.log('center');
				}
			}
		} else if (n instanceof Array) {
			// multiple nodes selected
			return n;
		} else if (n === false) {
			// error selection
			return false;
		} else {
			// not selected
			return null;
		}
	}
}

// Access in global object.
window.NurWSY = NurWSY;
