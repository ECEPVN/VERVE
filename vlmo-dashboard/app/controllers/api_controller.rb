class ApiController < ApplicationController
  def index
    apiGroup=params[:g]
    apiName=params[:n]
    apiVersion=params[:v]
    apiParameters=params[:p]
    exportFileName=params[:exn]
    timeZone=params[:tzone]
    url="http://"+Settings.apiURL+"/#{apiVersion}/#{apiGroup}/#{apiName}/data.json?#{apiParameters}"
    # puts url
    c = Curl::Easy.new(url)
    c.http_auth_types = :basic
    c.username = current_user.authentication_token
    c.perform
    @results = c.body_str
    obj = JSON.parse(@results)
    ary = Array.new
    keyArray=[];
    i=0;
    convertTimeZone=false;

    (obj['entries']).each do |value|
      if i==0 then
        keyArray=value.keys
        
        if (value.keys.include? 'epoch_hour') && (!timeZone.nil?) then
          convertTimeZone=true  
          keyArray.push('time zone')
        end
        
        ary.push(keyArray)
      end

      row=[];
      (keyArray).each do |key|
        keyValue=value[key]
        if convertTimeZone then
          epoch_number=value['epoch_hour']
          time=Time.at(epoch_number)
          time=time.in_time_zone(timeZone)
          if key=='time zone' then
            keyValue=timeZone
          end  
          if key=='date' then
            keyValue=time.strftime('%F');
          end
          if key=='hour' then
            keyValue=time.hour
          end
        end
              
        row.push(keyValue)
      end
      ary.push(row)

      i=i+1
    end

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @results }
      format.xls {
        @results=render_to_xls(ary)
        if !exportFileName then
          exportFileName ="#{apiName}_data_export.xls"
        end
        puts exportFileName
        send_data(@results, :type=>"application/ms-excel", :filename => exportFileName)
      }
      format.csv {
        @results=render_to_csv(ary)
        if !exportFileName then
          exportFileName ="#{apiName}_data_export.csv"
        end
        puts exportFileName
        send_data(@results, :type=>"text/csv", :filename => exportFileName)
      }
    end
  end

  def lookup
    apiName=params[:n]
    apiVersion=params[:v]
    apiID=params[:id]
    url="http://"+Settings.apiURL+"/#{apiVersion}/#{apiName}/lookups/#{apiID}/items.json"
    c = Curl::Easy.new(url)
    c.http_auth_types = :basic
    c.username = current_user.authentication_token
    c.perform
    @results = c.body_str
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @results }
    end
  end
  require 'csv'
  def render_to_csv(ary)
    csv_string = CSV.generate do |csv|
      ary.each_with_index{|n,i|
        csv << n
      }
    end
    return csv_string
  end
  def render_to_xls(ary)
    book = Spreadsheet::Workbook.new
    data = book.create_worksheet :name => 'data'
    data.row(0).concat ary[0]
    header_format = Spreadsheet::Format.new :color => :green, :weight => :bold
    data.row(0).default_format = header_format

    ary.each_with_index { |n, i|
      if i>0 then
      data.row(i).concat n
      end
    }
    blob = StringIO.new
    book.write(blob)
    return blob.string
  end
end
