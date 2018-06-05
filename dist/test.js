const nur = new NurWSY(document.getElementById('root'), {
	editable: true
});
const btn = document.getElementById('btn');

btn.onclick = function() {
	nur._divide( nur._getSelectedNodes() );

	console.log('-----');
}
