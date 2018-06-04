const nur = new NurWSY(document.getElementById('root'));
const btn = document.getElementById('btn');

btn.onclick = function() {
	nur._divide( nur._getSelectedNodes() );

	console.log('-----');
}
