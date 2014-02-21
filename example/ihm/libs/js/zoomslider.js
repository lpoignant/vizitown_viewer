$(function() {
		$( "#slider-vertical" ).slider({
			orientation: "vertical",
			range: "min",
			min: 0,
			max: 100,
			value: 30,
			slide: function( event, ui ) {
				changeZoomLevel(ui.value);
			}
		});

		document.addEventListener('mousedown', function(event) {
			if(event.srcElement.tagName === "H4") {
				event.stopPropagation();
			}
			if(event.srcElement.tagName === "B") {
				event.stopPropagation();
			}
			if(event.srcElement.tagName === "DIV") {
				event.stopPropagation();
			}
			if(event.srcElement.tagName === "BUTTON") {
				event.stopPropagation();
			}
			if(event.srcElement.tagName === "INPUT") {
				event.stopPropagation();
			}
		}, true);
});

