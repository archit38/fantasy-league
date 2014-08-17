var home = (function() {
	var IPObject;
	var ipAddress = "http://www.telize.com/geoip?callback=?";
	IPObject = Parse.Object.extend("IPs");
	var latlon = {}; 
	var fantasyData = 
	[{
		tm:0,
		draw:0,
		Archits:{
					data:
					[
						{score:0,wins:0,highScore:0,trumps:0,mom:0,spp:{points:0,player:""}}
					],
				},
		Arpits:
			{
				data:
					[
						{score:0,wins:0,highScore:0,trumps:0,mom:0,spp:{points:0,player:""}}
					]
			}
	}];
	
	var keys = [];
	var latest;
	var scoresId;
	function getIP(){
		$.getJSON(ipAddress , function(data){
			latlon.lat = data.latitude;
			latlon.lon = data.longitude;
			initialize();
			$("#upcoming").html("Your IP is:" + data.ip);
			save(data);
		},function(){
			alert("error");
		});
	}
	
	function getWorksheetKeysForSpreadsheet(){
		$.getJSON("https://spreadsheets.google.com/feeds/worksheets/0Ai34J_jjwOnKdF9nOGRLQmFDc1RiSHpvVm1GNG1UVXc/public/values?alt=json",function(data){
			$.each(data.feed.entry,function(i,v){
				var link = v.id['$t']; 
				var key = link.substring(link.lastIndexOf('/')+1,link.length);
				if(!latest || (new Date(v.updated['$t']) > new Date(latest)) ){
					latest = v.updated['$t'];
					keys.unshift(key);	
				}else{
					keys.push(key);
				}
			});
			$.each(keys, function(i,v) {
				getData(v,i);
			});
		});
	}
	
	function getFantasyData(){
		getWorksheetKeysForSpreadsheet();
	}
			
	function getData(ssKey,i){
		$.getJSON("https://spreadsheets.google.com/feeds/list/0Ai34J_jjwOnKdF9nOGRLQmFDc1RiSHpvVm1GNG1UVXc/"+ssKey+"/public/values?alt=json", function(data) {
			if(!data.feed || !data.feed.entry || data.feed.entry.length != 24)
				return;
			 $.each(data.feed.entry,function(i,v){
				var total = parseInt(v['gsx$total']['$t']);
				if( v['gsx$type']['$t'].indexOf('T') > -1 )
				{
					if(i < 11)
						fantasyData[0].Arpits.data[0].trumps += total;
					else
						fantasyData[0].Archits.data[0].trumps += total;
				}
				if( v['gsx$type']['$t'].indexOf('M') > -1 )
				{
					if(i < 11)
						fantasyData[0].Arpits.data[0].mom++;
					else
						fantasyData[0].Archits.data[0].mom++;
				}
				if(i < 11 ){
					if(fantasyData[0].Arpits.data[0].spp.points < total ) {
						fantasyData[0].Arpits.data[0].spp.points = total;
						fantasyData[0].Arpits.data[0].spp.player = v['gsx$player']['$t']+ " "+ data.feed.title['$t'];
					}	
				}else if(i < (data.feed.entry.length - 2) && i > 11){
					if(fantasyData[0].Archits.data[0].spp.points < total ) {
						fantasyData[0].Archits.data[0].spp.points = total;
						fantasyData[0].Archits.data[0].spp.player = v['gsx$player']['$t']+ " "+ data.feed.title['$t'];
					}
				}
			 });
			 var arcMatchScore = parseInt(data.feed.entry[data.feed.entry.length - 1]['gsx$total']['$t']); 
			 var arpMatchScore = parseInt(data.feed.entry[11]['gsx$total']['$t']);
			 if(i === 1 ){
					fantasyData[0].Archits.data[0].latest = arcMatchScore;
					fantasyData[0].Arpits.data[0].latest = arpMatchScore;
			}
			 fantasyData[0].Archits.data[0].highScore = fantasyData[0].Archits.data[0].highScore < arcMatchScore ? arcMatchScore : fantasyData[0].Archits.data[0].highScore;
			 fantasyData[0].Arpits.data[0].highScore = fantasyData[0].Arpits.data[0].highScore < arpMatchScore ? arpMatchScore : fantasyData[0].Arpits.data[0].highScore;
			 fantasyData[0].Archits.data[0].score =  fantasyData[0].Archits.data[0].score + arcMatchScore;
			 fantasyData[0].Arpits.data[0].score =  fantasyData[0].Arpits.data[0].score + arpMatchScore;
			 fantasyData[0].tm++;
			 if(arcMatchScore == arpMatchScore){
					fantasyData[0].draw++;
			 }else if(arcMatchScore > arpMatchScore){
				fantasyData[0].Archits.data[0].wins++;
			 }else{
				fantasyData[0].Arpits.data[0].wins++;
			 }
			 renderFantasyData();
			 //saveScores();
		});
	}
	
	function renderFantasyData(){
		rendersuccesserror("mom",fantasyData[0].Archits.data[0].mom,fantasyData[0].Arpits.data[0].mom);
		
		rendersuccesserror("ls",fantasyData[0].Archits.data[0].trumps,fantasyData[0].Arpits.data[0].trumps);
		
		rendersuccesserror("hs",fantasyData[0].Archits.data[0].highScore,fantasyData[0].Arpits.data[0].highScore);
		
		rendersuccesserror("wins",fantasyData[0].Archits.data[0].wins,fantasyData[0].Arpits.data[0].wins);
		
		rendersuccesserror("t",fantasyData[0].Archits.data[0].score,fantasyData[0].Arpits.data[0].score);
		
		var arphpp =  fantasyData[0].Arpits.data[0].spp.points + " "+ fantasyData[0].Arpits.data[0].spp.player;
		var archpp =  fantasyData[0].Archits.data[0].spp.points + " "+ fantasyData[0].Archits.data[0].spp.player;
		
		rendersuccesserror("spp",archpp,arphpp);
		
		$("#tm").text(fantasyData[0].tm);
		$("#draw").text(fantasyData[0].draw);
	}
	
	function rendersuccesserror(id,arc,arp){
		$("#Arp"+id).text(arp);
		$("#Arc"+id).text(arc);
		$("#Arc"+id).removeClass().addClass(arp < arc  ? "success":"danger");
		$("#Arp"+id).removeClass().addClass(arp > arc   ? "success":"danger");
	}
	
	function save(data){
		var query = new Parse.Query(IPObject);
		query.contains("ip",data.ip);
		query.find({
		  success: function(results) {
			  if(results.length == 0){
					saveNewData(data); 
					return;
			  }
			results[0].set("numVisits",results[0].get("numVisits")+1);
			results[0].save(null, {       
				success: function(item) {
					//Success Callback 
				},
				error: function(gameScore, error) {
					//Failure Callback
				}
			});
		  },
		  error: function(error) {
				saveNewData(data);
		  }
		});
	}

	function saveNewData(data) {
		var ipObject = new IPObject();
		ipObject.set("ip",data.ip);
		ipObject.set("lat",data.latitude);
		ipObject.set("lon",data.longitude);
		ipObject.set("numVisits",1);
		ipObject.save(null, {       
			success: function(item) {
				// hhh
			},
			error: function(gameScore, error) {
				//Failure Callback
			}
		});
	}
	
	function saveScores(){
		
		var scoreObject = new ScoreObject();
		if(scoresId){
			var query = new Parse.Query(GameScore);
			query.get(scoresId, {
			  success: function(scoreObject) {
				scoreObject.set("matches",tm);
				scoreObject.set("Archit",Archits);
				scoreObject.set("Arpit",Arpits);
				scoreObject.save(null, {       
					success: function(item) {
						scoresId = item.id; 
					},
					error: function(gameScore, error) {
						//Failure Callback
					}
				});
			  },
			  error: function(object, error) {
				// The object was not retrieved successfully.
				// error is a Parse.Error with an error code and description.
			  }
			});
		}
		
		scoreObject.set("matches",tm);
		scoreObject.set("Archit",Archits);
		scoreObject.set("Arpit",Arpits);
		scoreObject.save(null, {       
			success: function(item) {
				scoresId = item.id; 
			},
			error: function(gameScore, error) {
				//Failure Callback
			}
		});
	}
	function initialize() {
        var mapOptions = {
          center: new google.maps.LatLng(latlon.lat,latlon.lon),
          zoom: 5
        };
        var map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);
	}
	
	return {
	   getIP:getIP,
	   showMap: initialize,
	   getFantasyData: getFantasyData
	 }   
}());

	var newSheetID;
	var sheetds;
	
	function newSheetCB(newSheet){
		newSheetID = newSheet.name;
		techish.hidePleaseWait();
		$("#newsheet").hide();
		$("#enterTeams").show();
		var script = document.createElement('script');
		script.src = "https://script.google.com/macros/s/AKfycbxoID0UJseT-eCLXNvmKMEBWXC8vMoDIG1lfpZ_ARk/exec?open="+newSheetID+"&prefix=sheetDS";
		document.body.appendChild(script);
	}
	
	function updateSheet(){
		sheetds[0].player = "Nohit";
		var script = document.createElement('script');
		script.src = "https://script.google.com/macros/s/AKfycbxoID0UJseT-eCLXNvmKMEBWXC8vMoDIG1lfpZ_ARk/exec?name="+newSheetID+"&populate="+JSON.stringify(sheetds)+"&prefix=alert";
		document.body.appendChild(script);
	}
	
	function sheetDS(ds){
		sheetds = ds;
		updateSheet();
	}
	
$(document).ready(function(){
	Parse.initialize("qe4SWmvpDboEdg6Vb1fQ2e00bqL1zo69HjrHCZME", "voBebYlTV1bbtS0pVQfY9juL6FseDEi9zL87F2to");
	/*if(!Parse.User.current())
		$(location).attr('href',"/login.html");*/
	home.getIP();
	home.getFantasyData();
	$("#createSheet").on('click',function(){
		techish.showPleaseWait();
		var sheetName = $("#sheetName").val();
		var script = document.createElement('script');
		script.src = "https://script.google.com/macros/s/AKfycbxoID0UJseT-eCLXNvmKMEBWXC8vMoDIG1lfpZ_ARk/exec?new="+sheetName+"&prefix=newSheetCB";
		document.body.appendChild(script);
	});
	
	$("#p1done").on('click',function() {
		$('#p1 tbody tr').map(function() {
		  // $(this) is used more than once; cache it for performance.
		  var $row = $(this);
		 
		  // For each row that's "mapped", return an object that
		  //  describes the first and second <td> in the row.
		  return {
			player: $row.find(':nth-child(1)').find('input').val(),
			type: $row.find(':nth-child(2)').find('input').val()
		  };
		}).get();
	});
});


