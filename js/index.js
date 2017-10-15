var chart;

function req(url, callback){
	var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
	var xhr = new XHR();
	xhr.open('GET', url, true);
	xhr.onload = function() {
		callback(JSON.parse(this.responseText));
	}
	xhr.onerror = function() {
		console.log('Error ' + this.status);
	}
	xhr.send();
}


function format(today){
	var dd = today.getDate();
	var mm = today.getMonth()+1;

	if(dd<10) {dd = '0'+dd} 
	if(mm<10) {mm = '0'+mm} 

	return today.getFullYear() + '-' + mm + '-' + dd;
}

function get_day(){
	var today = new Date();
	return format(today);
}
var chartData = [];

function restart(){
	console.clear();
	get_data();
}

var dates = [];
function get_data(data=null){
	if(chart != undefined){
		chart.clear();
	}
	if(data == null){
		var date_from = document.getElementById('date_from').value;
		var date_to = document.getElementById('date_to').value;

		if(dates.length == 0){
			chartData = [];
			for(var d = new Date(date_from); d <= new Date(date_to); d.setDate(d.getDate() + 1)) {
				var c_date = format(d);
				dates.push(c_date);
			}
		}
		if(dates.length > 0){
			console.log(dates[0]);
			req('https://explorer.zensystem.io/insight-api-zen/blocks?limit=1000&blockDate=' + dates[0], get_data);
			dates.shift();
		}
	}
	else{
		if(data.length == 0){
			return;
		}
		var sum_txlength = 0;
		for(var i = data['blocks'].length-1; i > 0; i--){
			sum_txlength += data['blocks'][i]['txlength'];
		}
		var date = data['blocks'][0]['time'] + (data['blocks'][data['blocks'].length - 1]['time'] - data['blocks'][0]['time']) / 2;
		chartData.push({
			date: new Date(date * 1000),
			txlength: sum_txlength
		});
		if(dates.length - 1 == 0){
			init(chartData);
			console.log('All blocks - ' + chartData.length);
		}
		if(dates.length > 0){
			get_data();
		}
	}
}

window.onload = function() {
	document.getElementById('date_from').value = format(new Date(new Date().setDate(new Date().getDate()-30)));
	document.getElementById('date_to').value = format(new Date());
	get_data();
};

function init(chartData){
	var chart = AmCharts.makeChart("chartdiv", {
		"type": "serial",
		"theme": "light",
		"marginRight": 80,
		"autoMarginOffset": 20,
		"marginTop": 7,
		"dataProvider": chartData,
		"valueAxes": [{
			"axisAlpha": 0.2,
			"dashLength": 1,
			"position": "left"
		}],
		"mouseWheelZoomEnabled": true,
		"graphs": [{
			"id": "g1",
			"balloonText": "[[txlength]]",
			"bullet": "round",
			"bulletBorderAlpha": 1,
			"bulletColor": "#FFFFFF",
			"hideBulletsCount": 50,
			"title": "red line",
			"valueField": "txlength",
			"useLineColorForBulletBorder": true,
			"balloon":{
				"drop":true
			}
		}],
		"chartScrollbar": {
			"autoGridCount": true,
			"graph": "g1",
			"scrollbarHeight": 40
		},
		"chartCursor": {
		   "limitToGraph":"g1"
		},
		"categoryField": "date",
		"categoryAxis": {
			"parseDates": true,
			"axisColor": "#DADADA",
			"dashLength": 1,
			"minorGridEnabled": true
		}
	});

	chart.addListener("rendered", zoomChart);
	zoomChart();

	function zoomChart() {
		chart.zoomToIndexes(chartData.length - 40, chartData.length - 1);
	}
}