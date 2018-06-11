/**
 * NurWSY - The WYSIWYG framework
 * @author Nurasyl Aldan <nurassyl.aldan@gmail.com>
 * @version 1.0.0
 */

// @flow

class NurWSY {
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
	_single: ?boolean;

	/**
	 * NurWSY constructor.
	 *
	 * @constructor
	 * @this	{NurWSY}
	 * @param	{HTMLDivElement} root Root div element
	 * @param	{object} options Options
	 */
	constructor(root: HTMLDivElement, options: any = new Object()): void {
		// options
		options.tools = options.tools === undefined || options.tools === null ? null : options.tools;
		options.editable = options.editable === true ? true : false;

		// elements
		this.root = root;
		this.tools = options.tools;

		// get selection object
		this.selection = window.getSelection();

		// for "this._getSelection()"
		this.isSelected = false;
		this.isCaret = false;
		this.isRange = false;

		if (options.editable === true) {
			this.root.setAttribute('contenteditable', 'true');
		}
	}

	/**
	 * Get selection object and selection info.
	 *
	 * @return {Selection} Selection object
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
	 * @returns {Node|null} Node|null
	 */
	_findMainNode(node: Node): ?Node {
		while (true) {
			if (node.parentNode === this.root) {
				return node;
			} else if (node.parentNode === null) {
				return null;
			}
			node = (node: any).parentNode;
		}
	}

	/**
	 * Find selected nodes.
	 *
	 * @returns {Node|Array|null|false}
	 * Node		- one node selection.
	 * Array	- range selection.
	 * null		- not selected.
	 * false	- error selection.
	 */
	_getSelectedNodes(): Node | Array<Node> | false | null {
		// get selection info
		this._getSelection();

		// reset properties
		this._anchorNode = undefined;
		this._focusNode = undefined;
		this._anchorOffset = undefined;
		this._focusOffset = undefined;
		this._single = undefined;

		if (this.isSelected) {
			// get main anchor node
			this._anchorNode = (this.selection.anchorNode: any);
			this._anchorNode = this._findMainNode(this._anchorNode);

			// get main focus node
			this._focusNode = (this.selection.focusNode: any);
			this._focusNode = this._findMainNode(this._focusNode);

			// check selection
			if (this._anchorNode === null || this._focusNode === null) {
				// error selection

				// reset nodes
				this._anchorNode = undefined;
				this._focusNode = undefined;

				return false;
			} else if (this._anchorNode === this._focusNode) {
				// one element selection

				// this is single node
				this._single = true;

				// reset focus node
				this._focusNode = undefined;

				// get right offsets
				this._anchorOffset = this.selection.anchorOffset;

				let fromLeft: boolean = false;

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
				// multi elements selection

				// this is don't single node
				this._single = false;

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
	 * Find text node of node.
	 * @static
	 *
	 * @param {Node} node Node
	 * @return {Node|null} Node|null
	 */
	static _findTextNode(node: ?Node): ?Node {
		if (node instanceof Node) {
			while (true) {
				if (node.childNodes.length === 0 && node.nodeName === '#text') {
					return node;
				} else {
					if (node.childNodes.length === 0) {
						return null;
					}
				}
				node = node.childNodes[0];
			}
		} else {
			return null;
		}
	}

	/**
	 * Check node on text.
	 *
	 * @param {Node} node Node
	 * @return {boolean} boolean
	 */
	_ifTextNode(node: ?Node): boolean {
		if (node instanceof Node) {
			if (node.nodeName === '#text') {
				return true;
			}
		}
		return false;
	}

	/**
	 * Clone node
	 *
	 * @param {Node} node Node
	 * @return {Node|false} Node|false
	 */
	_cloneNode(node: ?Node): Node | false {
		if (node instanceof Node) {
			return node.cloneNode(true);
		} else {
			return false;
		}
	}

	/**
	 * Replace text in node.
	 *
	 * @param {Node} node Node
	 * @param {string} text New text
	 * @return {boolean} boolean
	 */
	_replaceText(node: ?Node, text = ''): boolean {
		let n = node;
		if (node instanceof Node) {
			while (true) {
				if ((n: any).childNodes.length === 0) {
					// if text node
					(n: any).textContent = text;
					return true;
				}
				n = (n: any).childNodes[0];
			}
		}
		return false;
	}

	/**
	 * Find text from node.
	 *
	 * @param {Node} node - Node
	 * @return {string|null} string|null
	 */
	_toString(node: ?Node): ?string {
		if (node instanceof Node) {
			let self = this.constructor;

			node = self._findTextNode(node);

			return (node: any).nodeValue;
		} else {
			return null;
		}
	}

	/**
	 * Divide anchor & focus nodes.
	 *
	 * @return {Array|null|false} Array|null|false
	 * Array	- selected nodes.
	 * null		- not selected.
	 * false	- error selection.
	 */
	_divide(): any {
		let node = this._getSelectedNodes();
		if (node instanceof Node) {
			// one node selected

			if (this.isRange) {
				// Text node selection
				if (this._anchorOffset === 0 && (this._toString(this._anchorNode): any).length === this._focusOffset) {
					// full '[Hello!]'

					return ['single', 'full', this._anchorNode];
				} else if (this._anchorOffset === 0) {
					// left // '[He]llo!'

					let a = this._cloneNode(this._anchorNode);
					let b = this._cloneNode(this._anchorNode);

					let text = this._toString((a: any));

					this._replaceText((a: any), (text: any).substr(this._anchorOffset, this._focusOffset));
					this._replaceText((b: any), (text: any).substr(this._focusOffset, (text: any).length));

					return ['single', 'left', a, b];
				} else if ((this._toString(this._anchorNode): any).length === this._anchorOffset + this._focusOffset) {
					// right 'Hel[lo!]'

					let a = this._cloneNode((this._anchorNode: any));
					let b = this._cloneNode((this._anchorNode: any));

					let text = this._toString((a: any));

					this._replaceText((a: any), (text: any).substr(0, this._anchorOffset));
					this._replaceText((b: any), (text: any).substr(this._anchorOffset, (text: any).length));

					return ['single', 'right', a, b];
				} else {
					// center 'H[el]lo!'

					let a = this._cloneNode((this._anchorNode: any));
					let b = this._cloneNode((this._anchorNode: any));
					let c = this._cloneNode((this._anchorNode: any));

					let text = this._toString((a: any));

					this._replaceText((a: any), (text: any).substr(0, this._anchorOffset));
					this._replaceText((b: any), (text: any).substr(this._anchorOffset, this._focusOffset));
					this._replaceText((c: any), (text: any).substr(this._anchorOffset + this._focusOffset, (text: any).length));

					return ['single', 'center', a, b, c];
				}
			} else if (this.isCaret) {
				// is caret

				// get main node.
				let mainNode = this._findMainNode((this.selection.focusNode: any));

				// get next nodes

				let nextNode = (mainNode: any).nextSibling;

				let nextNodes = [];

				while (true) {
					if (nextNode === null) {
						break;
					} else {
						nextNodes.push(nextNode);
					}
					nextNode = (nextNode: any).nextSibling;
				}

				//

				// get previous nodes

				let prevNode = (mainNode: any).previousSibling;

				let prevNodes = [];

				while (true) {
					if (prevNode === null) {
						break;
					} else {
						prevNodes.push(prevNode);
					}
					prevNode = (prevNode: any).previousSibling;
				}

				//

				// get string
				let text = this._toString((mainNode: any));

				// get text length
				let len: number = (text: any).length;

				// get offset
				let offset: number = this.selection.focusOffset;

				// divide main node
				let a = this._cloneNode(mainNode);
				let b = this._cloneNode(mainNode);

				this._replaceText((a: any), (text: any).substr(0, offset));
				this._replaceText((b: any), (text: any).substr(offset, len));

				if ((this._toString((a: any)): any).length === 0) {
					a = null;
				}
				if ((this._toString((b: any)): any).length === 0) {
					b = null;
				}

				let result = [
					[
						...prevNodes
						// a,
					],
					[
						// b,
						...nextNodes
					]
				];

				if (a !== null) {
					result[0].push(a);
				}
				if (b !== null) {
					result[1].unshift(b);
				}

				return result;
			}
		} else if (node instanceof Array) {
			// multi nodes selected

			// clone array
			let nodes = node.slice(1, node.length - 1);

			if (this.isRange) {
				if (this._anchorOffset === 0 && this._focusOffset === (this._toString(this._focusNode): any).length) {
					// full [Hello Nurasyl!]

					return ['multi', 'full', [nodes]];
				} else if (this._anchorOffset === 0) {
					// left [Hello Nur]asyl!

					let a = this._cloneNode(this._focusNode);
					let b = this._cloneNode(this._focusNode);

					let text = this._toString((a: any));

					this._replaceText((a: any), (text: any).substr(0, this._focusOffset));
					this._replaceText((b: any), (text: any).substr(this._focusOffset, (text: any).length));

					return ['multi', 'left', [this._anchorNode, ...nodes, a, b]];
				} else if (this._focusOffset === (this._toString(this._focusNode): any).length) {
					// right He[llo Nurasyl!]

					let a = this._cloneNode((this._anchorNode: any));
					let b = this._cloneNode((this._anchorNode: any));

					let text = this._toString((a: any));

					this._replaceText((a: any), (text: any).substr(0, this._anchorOffset));
					this._replaceText((b: any), (text: any).substr(this._anchorOffset, (text: any).length));

					return ['multi', 'right', [a, b, ...nodes, this._focusNode]];
				} else {
					// center He[llo Nur]asyl!

					let a = this._cloneNode((this._anchorNode: any));
					let b = this._cloneNode((this._anchorNode: any));

					let c = this._cloneNode((this._focusNode: any));
					let d = this._cloneNode((this._focusNode: any));

					let anchorText = this._toString((a: any));

					let focusText = this._toString((c: any));

					this._replaceText((a: any), (anchorText: any).substr(0, this._anchorOffset));
					this._replaceText((b: any), (anchorText: any).substr(this._anchorOffset, (anchorText: any).length));

					this._replaceText((c: any), (focusText: any).substr(0, this._focusOffset));
					this._replaceText((d: any), (focusText: any).substr(this._focusOffset, (focusText: any).length));

					return ['multi', 'center', [a, b, ...nodes, c, d]];
				}
			}
		} else if (node === false) {
			// error selection

			return false;
		} else {
			// not selected

			return null;
		}
		return null;
	}

	/**
	 * Set caret to end.
	 * @static
	 *
	 * @param {HTMLElement} el HTML element
	 * @return {boolean} boolean
	 */
	static caretToEnd(el: ?HTMLElement): boolean {
		if (el != null) {
			// get selection object
			let sel = window.getSelection();

			// focus to element
			el.focus();

			// get nodes
			let nodes = el.childNodes;

			if (nodes.length !== 0) {
				// if nodes is exists

				// get last node
				let lastNode = nodes[nodes.length - 1];

				if (lastNode.textContent.length !== 0) {
					// if node text length is not zero

					// get range object
					let range = sel.getRangeAt(0);

					// set caret position to end
					range.setStart(lastNode, lastNode.textContent.length);
					range.setEnd(lastNode, lastNode.textContent.length);

					// return success data
					return true;
				}
			}
		}

		// return error data
		return false;
	}

	/**
	 * Set caret to start.
	 * @static
	 *
	 * @param {HTMLElement} el HTML element
	 * @return {boolean} boolean
	 */
	static caretToStart(el): boolean {
		if (el != null) {
			// get selection object
			let sel = window.getSelection();

			// focus to element
			el.focus();

			// get nodes
			let nodes = el.childNodes;

			if (nodes.length !== 0) {
				// if nodes is exists

				// get first node
				let firstNode = nodes[0];

				if (firstNode.textContent.length !== 0) {
					// if node text length is not zero

					// get range object
					let range = sel.getRangeAt(0);

					// set caret position to start
					range.setStart(firstNode, 0);
					range.setEnd(firstNode, 0);

					// return success data
					return true;
				}
			}
		}

		// return error data
		return false;
	}
}

// Access in global object.
window.NurWSY = NurWSY;
