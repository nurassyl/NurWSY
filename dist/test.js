const nur = new NurWSY(document.getElementById('root'), {
	editable: true
});
const btn = document.getElementById('btn');

btn.onclick = function() {
	let result = nur._divide();
	console.log(result);
	console.log('-----');
}
