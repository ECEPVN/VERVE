/**
 * 
 */
var globalTimeout;
var currentSession=0;
var ajaxRequestTimeout=20000; // the timeout for a ajax request
var loadingCallback=5000; // The time to call back function when got a loading event
var loginUser;
var limitQueryResults=20; // The maximum results per query
var maxPageNumber=9999999; // The ma
var today=new Date();
var yesterday=new Date(new Date().setDate(new Date().getDate()-1));
var rollBackSevenDay=new Date(new Date().setDate(new Date().getDate()-7));
var thirtyDayBefore=new Date(new Date().setDate(new Date().getDate()-30));
var apiRootUrl=window.location.protocol+'//'+window.location.hostname+':'+window.location.port +'/api/index.json';
var apiLookupRootUrl=window.location.protocol+'//'+window.location.hostname+':'+window.location.port +'/api/lookup.json';
var rootUrl=window.location.protocol+'//'+window.location.hostname+':'+window.location.port +'/';
function setTabActive(tab_title){
		$('#page-tab ul li').removeClass('active');
		$('#page-tab ul li[title=\''+tab_title+'\']').attr('class','active');
}

function generateDateRange(settings){
	settings=$.extend({},{stargetId: '',start_date: thirtyDayBefore,end_date: yesterday,callback: function(start_date,end_date,value){}},settings);
 	//function generate date range
		var html=settings.start_date.format('yyyy-mm-dd') + '..' + settings.end_date.format('yyyy-mm-dd');
		 $('#'+settings.stargetId+' span').html(html);
		 $('#'+settings.stargetId+' input').val('where[date.between]='+html);
			console.log('Unable date range input');		
 	 		$('#'+settings.stargetId).daterangepicker({
 			      ranges: {
// 				         'Today': [moment(), moment()],
 			         'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
 			         'Last 7 Days': [moment().subtract('days', 6), moment()],
 			         'Last 30 Days': [moment().subtract('days', 29), moment()],
 			         'This Month': [moment().startOf('month'), moment().endOf('month')],
 			         'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
 			      },
 			      startDate: moment(settings.start_date.format('yyyy-mm-dd'),'YYYY-MM-DD'),
 			      endDate: moment(settings.end_date.format('yyyy-mm-dd'),'YYYY-MM-DD'),
 			      format: 'YYYY-MM-DD',
 			      dateLimit: 31
 			    },
 			    function(start, end) {
 			    	var html=start.format('YYYY-MM-DD') + '..' + end.format('YYYY-MM-DD');
 			    	console.log(html);
 			        $('#'+settings.stargetId+' span').html(html);
 			        $('#'+settings.stargetId+' input').val('where[date.between]='+html);
 			        var startDate=verveDateConvert(start.format('YYYY-MM-DD'));
 			        var endDate=verveDateConvert(end.format('YYYY-MM-DD'));
 			        settings.callback(startDate, endDate,html);
 			    });				
		this.disable=disable;
 		this.unable=unable;
 		this.getValue=getValue;
 		//disable dom
		var disableDom=$('<div></div>');
		disableDom.addClass('loadingDots');
		disableDom.css('width','100px');
		disableDom.css('height','30px');
		disableDom.hide();
		$('#'+settings.stargetId).before(disableDom);
 		function disable(){
 			console.log('Disable date range input ');
 			$('#'+settings.stargetId).hide();
 			disableDom.show();

 		}
 		function unable(){
 			$('#'+settings.stargetId).show();
 			disableDom.hide();
 		}
 		function getValue(){
 			return $('#'+settings.stargetId+' input').val();
 		}
}

function drawTableFromArray(settings){
	settings=$.extend({},{
		paging: false,
		page: 1,
		page_items: 10,
		table_id: 'myTable',
		table_colums: ['Date','values'],
		columns_width: [],
		columns_format:[],
		table_data: [['2013-01-01',10],['2013-01-01',13],['2013-01-01',12]],
		sort_by: '',
		sortable: false,
		sort_type: 'desc',
		onClickRow: function(rowArray){
			
		}
	},settings);
	
	if(settings.sortable && settings.sort_by==''){
		settings.sort_by=settings.table_colums[0];
	}	
	if(settings.sort_by==''){
		refreshData();
	}else{
		settings.sortable=true;
		sort(settings.sort_by);		
	}
	this.next=next;
	this.previous=previous;
	this.sort=sort;
	function next(){
		var maxPage=parseInt(settings.table_data.length/settings.page_items);
		if(settings.table_data.length%settings.page_items>0){
			maxPage=maxPage+1;
		}
		settings.page=settings.page+1;
		if(settings.page>maxPage){
			settings.page=settings.page-1;
		}
		console.log("Next to page: "+settings.page+"/"+maxPage);
		refreshData();
	}
	function previous(){
		
		settings.page=settings.page-1;
		if(settings.page==0){
			settings.page=settings.page+1;
		}
		console.log("Previous to page: "+settings.page);
		refreshData();
	}
	//refresh table with data
	function refreshData(){
		var myTable=$('#'+settings.table_id);
		myTable.empty();
		myTable.addClass('table');
		myTable.addClass('table-bordered');
		myTable.addClass('table-striped');
		myTable.addClass('table-hover');
		//add head table
		var head=$("<thead></thead>");
		head.append('<tr>				<th class="buttons" colspan="12"></th>				</tr>');
		var tr='<tr>';
		for(var i=0;i<settings.table_colums.length;i++){
			var row='<th class="header" title="'+settings.table_colums[i]+'"><a href="#">'+settings.table_colums[i]+'</a><i style="float: right"></i></th>';
			
			if(settings.columns_width.length>0){
				row='<th class="header col-md-'+settings.columns_width[i]+'" title="'+settings.table_colums[i]+'"><a href="#">'+settings.table_colums[i]+'</a><i style="float: right"></i></th>';
			}
			tr+=row;
		}
		tr+='</tr>';
		head.append(tr);
		myTable.append(head);
		//add head row
		var body=$('<tbody></tbody>');
		var rows=[];
		var start=0;
		var end=settings.table_data.length;
		if(settings.paging){
			start=(settings.page-1)*settings.page_items;
			end=start+settings.page_items;
			if(end>settings.table_data.length){
				end=settings.table_data.length;
			}
		}
		for(var i=start;i<end;i++){
			var row_data=settings.table_data[i];
			var tr='<tr>';
			for(var j=0;j<row_data.length;j++){
				//format columns				
				if(settings.columns_format[j]=='number'){
					tr+='<td align="right">'+accounting.formatNumber(row_data[j])+'</td>';
				}else
				if(settings.columns_format[j]=='%'){
					tr+='<td align="right">'+accounting.formatNumber(row_data[j]*100,2)+'%</td>';
				}else
				if(settings.columns_format[j]=='money'){
					tr+='<td align="right">'+accounting.formatMoney(row_data[j])+'</td>';
				}else{
					tr+='<td>'+row_data[j]+'</td>';
				}
				
			}
			tr+='</tr>';
			rows.push(tr);
		}
		body.append(rows.join(''));
		myTable.append(body);	
		
		//add class sort
		if(settings.sort_by!=''){
			var headArray=myTable.find("thead tr th.header[title='"+settings.sort_by+"']").addClass('sort');
			if(settings.sort_type=='asc'){
				myTable.find("thead tr th.header i").removeClass();
				myTable.find("thead tr th.header[title='"+settings.sort_by+"'] i").addClass('fa fa-sort-alpha-asc');
			}else{
				myTable.find("thead tr th.header i").removeClass();
				myTable.find("thead tr th.header[title='"+settings.sort_by+"'] i").addClass('fa fa-sort-alpha-desc');
			}
			
			
		}
		//add sort event
		if(settings.sortable){
			myTable.find("thead tr th.header").click(function(){
				settings.sort_by=$(this).attr('title');
				sort($(this).attr('title'));
			});
		}
		//Add onClick Event
		myTable.find("tbody tr").click(function(){
			var tr=$(this);
			var row=[];
			tr.find("td").each(function(){
				row.push($(this).html());
			});
			
			settings.onClickRow(row);
		});
	}
	//sort table by column id
	function toogleSort(){
		if(settings.sort_type=='desc'){
			settings.sort_type='asc';
		 }else{
			 settings.sort_type='desc';
		 }
	}
	function sort(columnName){
		//get column index
		
		var columnIndex=0;
		$.each(settings.table_colums,function(index,value){
			if(columnName==value){
				columnIndex=index;
			}
		});
		function Comparator(a,b){
			 var first=a[columnIndex];
			 var second=b[columnIndex];
			 var compairType='string';
			 if(IsNumeric(first)){
				 first=parseFloat(a[columnIndex]);
				 second=parseFloat(b[columnIndex]);
				 compairType='number';
			 }
			 	 
			 var result=first > second?1:-1;

			 if(settings.sort_type=='desc'){
				 result=first < second?1:-1;
			 }
			 
			 if(first == second){
				 result=0;
			 }
//			 console.log(first+" and "+second+" is "+ result+" Comapair type: "+compairType);
			 return result;
		}
		console.log("Sort by column: "+columnName+" "+columnIndex);
		settings.table_data = settings.table_data.sort(Comparator);
		settings.page=1;
		
		refreshData();
		toogleSort();
	}
}

function disabledEventPropagation(event)
{
	event.stopPropagation();
	event.preventDefault();
}

function IsNumeric(input){
    var RE = /^-{0,1}\d*\.{0,1}\d+$/;
    return (RE.test(input));
}

// ajax cache manager
//myAjaxStore.add(url,data);
//myAjaxStore.registe(url);
//myAjaxStore.isLoading(url);
//myAjaxStore.get(url);
var myAjaxStore=new ajaxStore();
function ajaxStore(){
	var expireTime=3600000000000;//5min
	var store=[];
	this.add=add;
	this.get=get;
	this.registe=registe;
	this.isLoading=isLoading;
	this.openDialogIsLoading=openDialogIsLoading;
	this.remove=remove;
	function add(url,data){
		var isInStore=false;
		var indexData=-1;
		$.each(store,function(index,item){
			if(item.url==url){
				isInStore=true;
				indexData=index;
				store[index].data=data;
				store[index].dateTime=new Date();
			}
		});
		if(!isInStore){
			var row={
					url: url,
					data: data,
					dateTime: new Date()
			};
			console.log('Push data to ajax store: '+row.url);
			store.push(row);
		}

	}
	function remove(url){
		$.each(store,function(index,item){
			if(item.url==url){
				store.splice(index, 1);
			}
		});
	}
	function get(url){
		var isInStore=false;
		var result=null;
		$.each(store,function(index,value){
			if(value.url==url){
				if((new Date()-value.dateTime)<expireTime){
					isInStore=true;
					result=value.data;
				}else{
					
				}
				console.log("Got data from ajaxStore center: "+url);
				console.log("Time expire: "+(new Date()-value.dateTime));
			}
		});
		return result;
	}
	function registe(url){
		var isInStore=false;
		var indexData=-1;
		$.each(store,function(index,item){
			if(item.url==url){
				isInStore=true;
				indexData=index;
				store[index].data='isLoading';
				store[index].dateTime=new Date();
			}
		});
		if(!isInStore){
			var row={
					url: url,
					data: 'isLoading',
					dateTime: new Date()
			};
			store.push(row);
		}
	}
	function isLoading(url){
		var isInStore=false;
		var indexData=-1;
		var isLoading=false;
		$.each(store,function(index,item){
			if(item.url==url){
				isInStore=true;
				indexData=index;
				if(item.data=='isLoading'){
					isLoading=true;
				}
			}
		});
		return isLoading;
	}
	function openDialogIsLoading(){
		var myDialog=new contentDialog();
		myDialog.setTitle("Your request is being processed!");
		myDialog.setContent("Server is processing your request. Please select again later 30s.");
		myDialog.open();
	}
};

function contentDialog(){
	var div=$('<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-dialog">  <div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title">Modal title</h4></div><div class="modal-body" style="padding-bottom: 0px;"></div><div class="modal-footer" ><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>');
	$('body').append(div);
	this.open=open;
	this.hide=hide;
	this.setContent=setContent;
	this.setTitle=setTitle;
	this.setWidth=setWidth;
	this.addDom=addDom;
	this.addButton=addButton;
	//function add button
	// example: addButton({name: 'abc',btnClass:'btn-default',action: function(){}});
	function addButton(btn){
		var name=btn.name;
		var btnClass=btn.btnClass;		
		var myBtn=$('<button type="button" class="btn btn-default" >'+name+'</button>');
		myBtn.removeClass("btn-default");
		myBtn.addClass(btnClass);
		myBtn.click(function(){
			btn.action();			
		});
		div.find('.modal-footer').append(myBtn);
	}

	function addDom(dom){
		div.find('div.modal-body').first().append(dom);		
	}
	function setWidth(width){
		div.find('div.modal-dialog').css('width',width+'px');
	}
	function setTitle(title){
		div.find('h4.modal-title').first().html(title);
	}
	function setContent(newContent){
		div.find('div.modal-body').first().html(newContent);
	}
	function open(){
		div.modal({
			  keyboard: false,
			  backdrop: 'static'
		});
	}
	function hide(){
		div.modal('hide');
	}
}


function delayTimeout(second_time,func){
	if(globalTimeout != null) clearTimeout(globalTimeout); 
	globalTimeout =setTimeout(function(){func();},second_time);
}
var urlMaster=new urlMaster();
function urlMaster(){
	var local=0;
	this.clear=clear;
	this.addParam=addParam;
	this.getParam=getParam;
	this.replaceParam=replaceParam;
	function clear(){
		window.history.replaceState('local '+local, 'Title '+local, rootUrl+"/?f=1");
		local++;
	}
	function addParam(name,value){
		var currentUrl=window.location.href;
		currentUrl=currentUrl.replace("\#", "");
		if(currentUrl.indexOf("?")==-1){
			window.history.replaceState('local '+local, 'Title '+local, currentUrl+"?"+name+"="+value);
		}else{
			window.history.replaceState('local '+local, 'Title '+local, currentUrl+"&"+name+"="+value);
		}
		local++;
	}
	function getParam(name){
		  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		  var regexS = "[\\?&]"+name+"=([^&#]*)";
		  var regex = new RegExp( regexS );
		  var results = regex.exec( window.location.href );
		  if( results == null )
		    return "";
		  else
		    return results[1];
	}
	function replaceParam(name,value){
		var currentValue=this.getParam(name);
		if(currentValue==''){
			this.addParam(name,value);
		}else{
			var currentUrl=window.location.href;
			currentUrl=currentUrl.replace("\#", "");
			currentUrl=currentUrl.replace(name+'='+currentValue, name+'='+value);
			window.history.replaceState('local '+local, 'Title '+local, currentUrl);
			local++;
		}
	}
}
//This function convert a string. Example hello -> Hello
function capitalise(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

//This function convert 2014-12-02 to date object in javascript 
function verveDateConvert(full_date){
	var value = full_date;
	var array=value.split("-");
	var year=parseInt(array[0]);
	var month=parseInt(array[1])-1;
	var day=parseInt(array[2]);
	var date = new Date(year,month,day);
	return date;
}

// Function jump page 
// @param interger number

function jumpPage(number,fnReloadData){
	var currentPage=parseFloat(urlMaster.getParam('page'));
	var nextPage=currentPage+number;
	if(nextPage<1){
		nextPage=1;
	}
	if(nextPage>maxPageNumber){
		nextPage=maxPageNumber;
	}
	urlMaster.replaceParam('page',nextPage);
	console.log(maxPageNumber);
	fnReloadData();
	//
	$('a').click(function(event){
		
		if($(this).attr('href')=='#'){
			event.preventDefault();
		}
	});
}


//////////////////////////////////////
//Review export data
//////////////////////////////////////
function reviewExportData(title,path,jrxml,params,width) {
	var url=rootUrl+"/GenerateJasperReport?export_type=html&path="+path+"&jrxml="+jrxml+"&"+$.param(params);
	var mydialog = new contentDialog();
	mydialog.setTitle(title);
	var randomID = new Date().valueOf();
	mydialog.setContent('<div title="' + randomID
			+ '" class="loadingDots" style=""></div>');
	mydialog.setWidth(width);
	mydialog.open();
	var loadingUrl = url;
	var htmlResult;

	if (myAjaxStore.isLoading(loadingUrl)) {
		mydialog.setContent('Your request is being processed. Please come back later 30s!');
	} else {
		htmlResult = myAjaxStore.get(loadingUrl);
		if (htmlResult == null) {
			myAjaxStore.registe(loadingUrl);
			$.ajax({
				url : loadingUrl,
				dataType : 'html',
				success : function(data) {
					myAjaxStore.add(loadingUrl, data);
					mydialog.setContent(data);
				},
				error : function(xhr, status, error) {
					myAjaxStore.remove(loadingUrl);
					console.log('Generate report fail! ');
					console.log('Url: ' + loadingUrl);
				},
				complete : function(jqXHR, textStatus) {

				}
			});
		} else {
			console.log('Set content for div id title=' + randomID);
			mydialog.setContent(htmlResult);
		}
	}
}
///////////////////////////////////
//export data to pdf,csv,xls
///////////////////////////////////
function exportReport(path,jrxml,params,exportType) {
	var loadingUrl = rootUrl + '/GenerateJasperReport' + '?export_type='+exportType + '&jrxml='+jrxml+'&path='+path+'&'+$.param(params);
	window.open(loadingUrl);
}

/**
 * Sand-Signika theme for Highcharts JS
 * @author Torstein Honsi
 */

// Load the fonts
Highcharts.createElement('link', {
   href: 'http://fonts.googleapis.com/css?family=Signika:400,700',
   rel: 'stylesheet',
   type: 'text/css'
}, null, document.getElementsByTagName('head')[0]);

// Add the background image to the container
Highcharts.wrap(Highcharts.Chart.prototype, 'getContainer', function (proceed) {
   proceed.call(this);
   this.container.style.background = 'url(http://www.highcharts.com/samples/graphics/sand.png)';
});


Highcharts.theme = {
   colors: ["#f45b5b", "#8085e9", "#8d4654", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
      "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
   chart: {
      backgroundColor: null,
      style: {
         fontFamily: "Signika, serif"
      }
   },
   title: {
      style: {
         color: 'black',
         fontSize: '16px',
         fontWeight: 'bold'
      }
   },
   subtitle: {
      style: {
         color: 'black'
      }
   },
   tooltip: {
      borderWidth: 0
   },
   legend: {
      itemStyle: {
         fontWeight: 'bold',
         fontSize: '13px'
      }
   },
   xAxis: {
      labels: {
         style: {
            color: '#6e6e70'
         }
      }
   },
   yAxis: {
      labels: {
         style: {
            color: '#6e6e70'
         }
      }
   },
   plotOptions: {
      series: {
         shadow: true
      },
      candlestick: {
         lineColor: '#404048'
      },
      map: {
         shadow: false
      }
   },

   // Highstock specific
   navigator: {
      xAxis: {
         gridLineColor: '#D0D0D8'
      }
   },
   rangeSelector: {
      buttonTheme: {
         fill: 'white',
         stroke: '#C0C0C8',
         'stroke-width': 1,
         states: {
            select: {
               fill: '#D0D0D8'
            }
         }
      }
   },
   scrollbar: {
      trackBorderColor: '#C0C0C8'
   },

   // General
   background2: '#E0E0E8'
   
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);