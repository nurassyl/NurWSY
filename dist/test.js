const nur = new NurWSY(document.getElementById('root'));
const btn = document.getElementById('btn');

btn.onclick = function() {
	let s = nur._getSelectedNodes();
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
	console.log(nur._anchorOffset);
	console.log(nur._focusOffset);
	console.log(nur._anchorNode);
	console.log(nur._focusNode);

	console.log('-----');
}
