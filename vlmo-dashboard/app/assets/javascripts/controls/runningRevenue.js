setTabActive("Running Revenue");

var runningRevenueApiUrl=apiRootUrl+'/runningRevenueOverview';
var runningRevenueAgencyApiUrl=apiRootUrl+'/agenciesRunningRevenue';
var runningTierRateApiUrl=apiLookupRootUrl+'/AgencyTierRate';
var runningDate;
limitQueryResults=10;
//Check report page. If it don't exist set default 1

if (urlMaster.getParam('page') == '') {
	urlMaster.replaceParam('page', 1);
}

$(document).ready(function(){ 
	loadRunningDate();
	// change network event 
	$('#selectbox_agency').change(function(){
		if($('#selectbox_agency').val()!=0){
			urlMaster.replaceParam('page', 1);
			urlMaster.replaceParam('network_id', $('#selectbox_agency').val());
			loadRunningDetail();
		}	
	});
	
	//
	$('#search_input').keyup(function(){
		delayTimeout(2000, function(){
			urlMaster.replaceParam('page', 1);
			loadRunningDetail();
		});
	});
});

//////////////////////////
// load running date
///////////////////////////

function loadRunningDate(){
	$.ajax({
		url : apiRootUrl,
		data:{
			v: 'v1',
			g: 'vlmo',
			n: '2-running-revenue',
			p: 'select=clicks&by=date&order=date.desc&limit=1'
		},
		dataType : 'json',
		cache: false,		
		success : function(json) {
			runningDate=json.entries[0].date;
			loadRunningSummary();
		}
	});	
}

////////////////////////////
// loadSummaryTable
///////////////////////////

function loadRunningSummary(){
	$.ajax({
		url : apiRootUrl,
		dataType : 'json',
		cache: false,
		data : {
			v: 'v1',
			g: 'vlmo',
			n: '3-agency-running-revenue',
			p: 'select=delivered_imps|pub_net_revenue|profit_margin&by=date|network_id|network_title|account_id|billable_rate&where[date.between]='+runningDate+'..'+runningDate+'&order=account_id'
		},
		success : function(json) {
			processData(json.entries);
			loadRunningDetail();
		}
	});
	function processData(data){
		var rowsOption=[];
			rowsOption.push('<option value="0">-----</option>');
		var rows=[];
		for(var i=0;i<data.length;i++){
			var full_date=data[i].date;
			var network_id=data[i].network_id;
			var network_title=data[i].network_title;
			var account_id=data[i].account_id;
			var billable_rate=data[i].billable_rate;
			var delivered_imps=data[i].delivered_imps;
			var gross_revenue=(parseFloat(delivered_imps)/1000)*parseFloat(billable_rate);
			var pub_net_revenue=data[i].pub_net_revenue;
			var profit_margin=data[i].profit_margin;
			var row='<tr>'
					+	'<td><a href="#" onclick="urlMaster.replaceParam(\'rate\','+billable_rate+');urlMaster.replaceParam(\'network_id\','+network_id+');urlMaster.replaceParam(\'account_id\','+account_id+');urlMaster.replaceParam(\'page\','+1+');loadRunningDetail()"><b>'+network_title+'</b></a></td>'
					+	'<td>'+account_id+'</td>'
					+	'<td align="right">'+accounting.formatNumber(delivered_imps)+'</td>'
					+	'<td align="right">'+accounting.formatMoney(billable_rate)+'</td>'
					+	'<td align="right">'+accounting.formatMoney(gross_revenue)+'</td>'
					+	'<td align="right">'+accounting.formatMoney(pub_net_revenue)+'</td>'
					+	'<td align="right">'+accounting.formatMoney(profit_margin)+'</td>'
					+	'</tr>';
			rows.push(row);
			rowsOption.push('<option value="'+network_id+'">'+network_title+'</option>');
		}
		$('#summaryTable tbody').html(rows.join(""));
		$('#selectbox_agency').html(rowsOption.join(""));
		$('#dataDate').html(' month to date '+full_date);
	}
}
///////////////////////////////////
// running detail
///////////////////////////////////


/////////////////////////////
//
////////////////////////////
var totalPageDetail=1;
function loadRunningDetail(){
	$('#detailDiv').show();
	$('#tiers_and_rate').hide();
	var network_id=urlMaster.getParam("network_id");
	var detailBy=urlMaster.getParam("detail");
	var page=urlMaster.getParam("page");
	var search=$('#search_input').val();
	var is_campaign;
	var is_subscription;
	var selectStament='merchant_id|merchant_name|account_id|campaign_id|campaign_title|billable_rate';
	
	//check network id
	if(network_id==''){
		return;
	}
	
	//set default page = 1
	if(page==''){
		page=1;
		urlMaster.replaceParam("page",page);
	}
	//set default detail = campaign
	if(detailBy==''){
		detailBy='campaign';
		urlMaster.replaceParam("detail",'campaign');
	}
	
	// remove all active in sub tab
	$('#subTab li').removeClass('active');
	
	//Active tab
	if(detailBy=='campaign'){
		is_campaign='1';
		is_subscription='0';
		//active tab campaign
		$('#subTab li[title="Campaign"]').addClass('active');
		$('#detailTable th[name=detailType]').html('Campaign');
	}else if(detailBy=='offer'){
		is_campaign='0';
		is_subscription='0';
		selectStament='merchant_id|merchant_name|publisher_id|offer_id|offer_title|billable_rate';
		//active tab offer
		$('#subTab li[title="Offer"]').addClass('active');
		$('#detailTable th[name=detailType]').html('Offer');
	}else if(detailBy=='subscription'){
		is_campaign='0';
		is_subscription='1';
		selectStament='merchant_id|merchant_name|publisher_id|subscription_id|subscription_title|billable_rate';
		//active tab offer
		$('#subTab li[title="Subscription"]').addClass('active');
		$('#detailTable th[name=detailType]').html('Subscription');
	}else if(detailBy=='tierRate'){
		loadAgencyTierRate();
		return;
	}
	
	
	// set titlte for detail table
	$('span.detailTitlte').html($('#selectbox_agency option[value='+network_id+']').text());
	
	// select network list set value to current network
	$('#selectbox_agency').val(network_id);
	
	// process search keyword
	search=$.trim(search.toLowerCase());
	var apiParam='select=imps|clicks|billable_imps|gross_revenue|delivered_imps|booked_imps&by='+selectStament+'&where[date.between]='+runningDate+'..'+runningDate
			+'&where[network_id.in]='+network_id
			+'&where[is_campaign.eq]='+is_campaign
			+'&where[is_subscription.eq]='+is_subscription
			// +'&where[merchant_name.like]'+search
			+'&limit='+limitQueryResults+'&page='+page+'&order=account_id';
			
	var url=apiRootUrl+'?v=v1&g=vlmo&n=2-running-revenue&p='+escape(apiParam);
	if (myAjaxStore.isLoading(url)) {
		console.log('Your request is loading...');
		console.log('Callback after ' + loadingCallback + 's...');
		delayTimeout(loadingCallback, function() {
			loadRunningDetail();
		});
		return;
	}
	var ajaxData = myAjaxStore.get(url);
		if (ajaxData == null) {
		myAjaxStore.registe(url);
		$.ajax({
			dataType : "json",
			url : url,
			timeout : 50000,
			xhrFields : {	
				withCredentials : true
			},
			success : function(json) {
				myAjaxStore.add(url, json);
				console.log('Load ajax request successfull with url: ' + url);
				loadRunningDetail();
			},
			error : function(xhr, status, error) {
				myAjaxStore.remove(url);
				console.log('Request url error: ' + url);
				console.log('Status:  ' + status);
				console.log('Error:  ' + error);
				console.log('Reload chart!');
				if (error == 'timeout') {
					loadRunningDetail();
				} else {
					delayTimeout(2000, function() {
						// location.reload(false);
					});
				}
			},
			complete : function() {

			}

		});
	} else {
		processData(ajaxData.entries);
		if (ajaxData.entries.length == 0) {
			var mydialog = new contentDialog();
			mydialog.setTitle("Dashboard Overview Message!");
			mydialog.setContent("Your data from "
							+ selectStartDate.format('yyyy-mm-dd') + " to "
							+ selectEndDate.format('yyyy-mm-dd')
							+ " is not available.");
			mydialog.open();
		}	
	}
	function processData(data){
		var rows=[];
		for(var i=0;i<data.length;i++){
			var merchant_id=data[i].merchant_id;
			var merchant_name=data[i].merchant_name;
			var account_id=data[i].account_id;
			var campaign_id=data[i].campaign_id;
			var campaign_title=data[i].campaign_title;
			var billable_rate=data[i].billable_rate;
			var booked_imps=data[i].booked_imps;
			var delivered_imps=data[i].delivered_imps;
			var clicks=data[i].clicks;
			var billable_imps=data[i].billable_imps;
			var gross_revenue=parseFloat(data[i].gross_revenue);
			
			var row='<tr>'
				+	'<td>'+merchant_name+'<br/><i style="color: gray;">#'+merchant_id+'</i></td>'
				+	'<td>'+campaign_title+'<br><i style="color: gray;">#'+campaign_id+'</i></td>'
				+	'<td align="right">'+accounting.formatNumber(booked_imps)+'</td>'
				+	'<td align="right">'+accounting.formatNumber(delivered_imps)+'</td>'
				+	'<td align="right">'+accounting.formatNumber(billable_imps)+'</td>'
				+	'<td align="right">'+accounting.formatNumber(clicks)+'</td>'
				+	'<td align="right">'+accounting.formatMoney(billable_rate)+'</td>'
				+	'<td align="right">'+accounting.formatMoney(gross_revenue)+'</td>'
				+	'</tr>';
		rows.push(row);
		}
		$('#detailTable tbody').html(rows.join(""));
		//set maxPageNumber if results < limit
		if(data.length<limitQueryResults){	
			maxPageNumber=page;
		}else{
			maxPageNumber=parseFloat(page)+1;
		}
		//hide loading image
		$("#index_container").removeClass("loadingDots");
	}

}

///////////////////////////////
// load agency tier rate
///////////////////////////////
function loadAgencyTierRate(){
	$('#detailTableTierAndRate tbody').empty();
	var page=urlMaster.getParam("page");
	var account_id=urlMaster.getParam("account_id");
	var network_id=urlMaster.getParam("network_id");
	var rate=urlMaster.getParam("rate");
	// set titlte for detail table
	$('span.detailTitlte').html($('#selectbox_agency option[value='+network_id+']').text());
	
	if(account_id==''){
		return;
	}else{
		//show agency tier rate detail
		$('#detailDiv').hide();
		$('#tiers_and_rate').show();
		//active tab
		$('#subTab li').removeClass('active');
		$('#subTab li[title="Tiers and rate"]').addClass('active');
	}
	
	if(page==''){
		page=1;
		urlMaster.replaceParam("page", page);
	}
	$.ajax({
		url : apiRootUrl,
		dataType : 'json',
		data : {
			v: 'v1',
			g: 'vlmo',
			n: '6-vlmo-tier-rate',
			p: 'by=account_id|account_name|imps_text|tier_rate&where[account_id.in]='+account_id+"&order=is_tier.desc|account_id|min_imps&page="+page
		},
		success : function(json) {
			processData(json.entries	);
		}
	});	
	
	function processData(data){
		var rows=[];
		for(var i=0;i<data.length;i++){
			var account_id=data[i].account_id;
			var account_name=data[i].account_name;
			var imps_text=data[i].imps_text;
			var tier_rate=parseFloat(data[i].tier_rate);
			
			var row='<tr>'
				+	'<td>'+account_name+'</td>'
				+	'<td align="right">'+imps_text+'</td>'
				+	'<td align="right">'+accounting.formatMoney(tier_rate)+'</td>'
				+	'</tr>';
			
			if(tier_rate==rate){
				row='<tr class="success">'
					+	'<td>'+account_name+'</td>'
					+	'<td align="right">'+imps_text+'</td>'
					+	'<td align="right">'+accounting.formatMoney(tier_rate)+'</td>'
					+	'</tr>';
			}
		rows.push(row);
		}
		$('#detailTableTierAndRate tbody').html(rows.join(""));		
	}
	
}

