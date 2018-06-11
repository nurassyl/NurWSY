const root = document.getElementById('root');
const nur = new NurWSY(root, {
	editable: true
});
const btn = document.getElementById('btn');

btn.onclick = function() {
	let result = nur._divide();
	console.log(result);

	// console.log(NurWSY.caretToEnd(root));
	console.log('-----');
}
