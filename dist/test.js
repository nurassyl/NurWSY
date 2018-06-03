const n = new Noname(document.getElementById('root'));
const btn = document.getElementById('btn');

btn.onclick = function() {
	var s = n._getSelectedNodes();
	if(s instanceof Node) {
		// one node selected
		console.log(s);
	} else if(s instanceof Array) {
		// multiple nodes selected
		console.log(s);
	} else if(s === false) {
		// error selection
		console.log('error selection');
	} else {
		// not selected
		console.log('not selected');
	}
	console.log(n._anchorOffset);
	console.log(n._focusOffset);
	console.log(n._anchorNode);
	console.log(n._focusNode);

	console.log('-----');
}
