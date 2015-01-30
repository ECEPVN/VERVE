setTabActive("Network Overview");

var runningDate;
var myDateRangeInput; // Date rang input object
var selectStartDate = yesterday;
var selectEndDate = yesterday;

//Check report date
if (urlMaster.getParam('where[date.between]') == '') {
	var dateRange = selectStartDate.format('yyyy-mm-dd') + '..'
			+ selectEndDate.format('yyyy-mm-dd');
	urlMaster.replaceParam('where[date.between]', dateRange);
} else {
	var dateRange = urlMaster.getParam('where[date.between]');
	var dateRangeArray = dateRange.split("..");
	selectStartDate = verveDateConvert(dateRangeArray[0]);
	selectEndDate = verveDateConvert(dateRangeArray[1]);
}

//Check report page. If it don't exist set default 1

if (urlMaster.getParam('page') == '') {
	urlMaster.replaceParam('page', 1);
}

$(document).ready(function(){ 
	myDateRangeInput = new generateDateRange({
		stargetId : "overview-date_range",
		start_date : selectStartDate,
		end_date : selectEndDate,
		callback : function(start_date, end_date, value) {
			selectStartDate = start_date;
			selectEndDate = end_date;
			var dateRange = selectStartDate.format('yyyy-mm-dd') + '..'	+ selectEndDate.format('yyyy-mm-dd');
			urlMaster.replaceParam('where[date.between]',dateRange);
			urlMaster.replaceParam("page",1);
			loadData();
		}
	});
	loadData();
});

function loadData(){
	myDateRangeInput.disable();
	var dateRange_value = 'where[date.between]='+urlMaster.getParam('where[date.between]');	
	var page=urlMaster.getParam('page');	
	var apiParam='select=imp_cnt|click_cnt|cta_lp_cnt|cta_call_cnt|cta_save_coupon_cnt|cta_map_cnt|cta_face_cnt|cta_twit_cnt|total_ctas|ctr|cta'+ '&by=date|partner_name'+'&limit='+limitQueryResults+'&order=date.desc|imp_cnt.desc&page='+page+'&'+ dateRange_value;
	var url = apiRootUrl+ '?v=v1&g=vlmo&n=4-network-overview&p='+escape(apiParam);
	console.log('Send request: '+url);
	if (myAjaxStore.isLoading(url)) {
		console.log('Your request is loading...');
		console.log('Callback after ' + loadingCallback + 's...');
		delayTimeout(loadingCallback, function() {
			loadData();
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
				loadData();
			},
			error : function(xhr, status, error) {
				myAjaxStore.remove(url);
				console.log('Request url error: ' + url);
				console.log('Status:  ' + status);
				console.log('Error:  ' + error);
				console.log('Reload chart!');
				if (error == 'timeout') {
					loadData();
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
		processData(ajaxData);
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
	
	function processData(json){
			var data=json.entries;
			var rows=[];
			$.each(data,function(index,item){
				var date=item.date;
				var partner_name=item.partner_name;
				var imp_cnt=parseFloat(item.imp_cnt);
				var click_cnt=parseFloat(item.click_cnt);
				var cta_lp_cnt=parseFloat(item.cta_lp_cnt);
				var cta_call_cnt=parseFloat(item.cta_call_cnt);
				var cta_save_coupon_cnt=parseFloat(item.cta_save_coupon_cnt);
				var cta_map_cnt=parseFloat(item.cta_map_cnt);
				var cta_face_cnt=parseFloat(item.cta_face_cnt);
				var cta_twit_cnt=parseFloat(item.cta_twit_cnt);
				var total_ctas=parseFloat(item.total_ctas);
				var ctr=parseFloat(item.ctr);
				var cta=parseFloat(item.cta);
				var row='<tr>';
				row+='<td>'+date+'</td>';
				row+='<td>'+partner_name+'</td>';
				row+='<td align="right">'+accounting.formatNumber(imp_cnt)+'</td>';
				row+='<td align="right">'+accounting.formatNumber(click_cnt)+'</td>';
				row+='<td align="right">'+accounting.formatNumber(cta_lp_cnt)+'</td>';
				row+='<td align="right">'+accounting.formatNumber(cta_call_cnt)+'</td>';
				row+='<td align="right">'+accounting.formatNumber(cta_save_coupon_cnt)+'</td>';
				row+='<td align="right">'+accounting.formatNumber(cta_map_cnt)+'</td>';
				row+='<td align="right">'+accounting.formatNumber(cta_face_cnt)+'</td>';
				row+='<td align="right">'+accounting.formatNumber(cta_twit_cnt)+'</td>';
				row+='<td align="right">'+accounting.formatNumber(ctr,2)+'%</td>';
				row+='<td align="right">'+accounting.formatNumber(total_ctas)+'</td>';
				row+='<td align="right">'+accounting.formatNumber(cta,2)+'%</td>';
				row+='</tr>';
				rows.push(row);
			});
			$('#dataTable tbody').empty();
			$('#dataTable tbody').append(rows.join(""));
		// unable date range input
		myDateRangeInput.unable();
		//set maxPageNumber if results < limit
		if(json.entries.length<limitQueryResults){	
			maxPageNumber=page;
		}else{
			maxPageNumber=parseFloat(page)+1;
		}
		//hide loading image
		$("#index_container").removeClass("loadingDots");
	}
}

/*
 * export report
 * 
 */
$('a.export_bt').click(function(){
	var dateRange_value = 'where[date.between]='+urlMaster.getParam('where[date.between]');	
	var export_type=$(this).html();
	var apiParam='select=imp_cnt|click_cnt|cta_lp_cnt|cta_call_cnt|cta_save_coupon_cnt|cta_map_cnt|cta_face_cnt|cta_twit_cnt|ctr|total_ctas|cta'+ '&by=date|partner_name'+'&limit=99999999&order=date.desc|imp_cnt.desc&'+ dateRange_value;
	var url = rootUrl+ '/api/index.'+export_type+'?v=v1&g=vlmo&n=4-network-overview&p='+escape(apiParam);
	
	window.open(url,'_blank');
});

