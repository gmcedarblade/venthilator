var GamePlayScene = function(game, stage, args)
{
  var self = this;

  var canv = stage.drawCanv;
  var bogus_canv = {width:canv.width/gmulx,height:canv.height/gmuly};
  var canvas = canv.canvas;
  var ctx = canv.context;
  ctx.scale(gmulx,gmuly);
  var n_ticks = 0;
  var cam = {wx:0,wy:0,ww:1,wh:2};

  var light_blue = "#6096D4";
  var dark_blue  = "#00204A";
  var red        = "#EA4922";
  var green      = "#77AA2F";
  var yellow     = "#D5C047";
  var our_yellow = "#e7e40e";
  var white      = "#FFFFFF";
  var black      = "#000000";
  var slate_gray = "#708090";
  var gray       = "#888888";
  var mid_gray   = "#C0C0C0";
  var light_gray = "#EEEEEE";
  var darken     = "rgba(0,0,0,0.5)";
  var purple     = "#604383";

  var img = new Image();
  img.src = 'https://www.wisc-online.com/ARISE_Files/Images/grid_noise.png';

  var knob_range_img;
  var knob_img;
  var knob_indicator_img;
  var icon_patient_img;
  var icon_alarms_img;
  var icon_sad_face_img;
  var beep_aud;
  var icon_warning_img;

  //definition
  var ENUM;
  ENUM = 0;
  var MODE_VOLUME   = ENUM; ENUM++;
  var MODE_PRESSURE = ENUM; ENUM++;
  ENUM = 0;
  var OUT_CHANNEL_PEAK_PRESSURE        = ENUM; ENUM++;
  var OUT_CHANNEL_MEAN_PRESSURE        = ENUM; ENUM++;
  var OUT_CHANNEL_RATE                 = ENUM; ENUM++;
  var OUT_CHANNEL_EXHALE_VOLUME        = ENUM; ENUM++;
  var OUT_CHANNEL_EXHALE_MINUTE_VOLUME = ENUM; ENUM++;
  var OUT_CHANNEL_IE_RATIO             = ENUM; ENUM++;
  ENUM = 0;
  var IN_CHANNEL_MODE  = ENUM; ENUM++;
  var IN_CHANNEL_RATE  = ENUM; ENUM++;
  var IN_CHANNEL_FLOW  = ENUM; ENUM++;
  var IN_CHANNEL_OXY   = ENUM; ENUM++;
  var IN_CHANNEL_ITIME = ENUM; ENUM++;
  var IN_CHANNEL_PEEP  = ENUM; ENUM++;
  ENUM = 0;
  var IN_ALARM_MIN_PRESSURE = ENUM; ENUM++;
  var IN_ALARM_MAX_PRESSURE = ENUM; ENUM++;
  var IN_ALARM_MIN_RATE = ENUM; ENUM++;
  var IN_ALARM_MAX_RATE = ENUM; ENUM++;
  var IN_ALARM_MIN_EXHALE_MINUTE_VOLUME = ENUM; ENUM++;
  var IN_ALARM_MAX_EXHALE_MINUTE_VOLUME = ENUM; ENUM++;
  var IN_ALARM_MIN_APNEA = ENUM; ENUM++;
  var IN_ALARM_MAX_APNEA = ENUM; ENUM++;
  ENUM = 0;
  var SCREEN_PATIENT     = ENUM; ENUM++;
  var SCREEN_VENTILATOR  = ENUM; ENUM++;
  var SCREEN_ALARMS      = ENUM; ENUM++;
  var SCREEN_NOTIF       = ENUM; ENUM++;
  var SCREEN_COMPLETE    = ENUM; ENUM++;

  var min_in_volume = 0.001;
  var max_in_volume = 2;
  var min_in_pressure = 1;
  var max_in_pressure = 2;
  var min_in_rate = 0;
  var max_in_rate = 40;
  var min_in_flow = 15;
  var max_in_flow = 100;
  var min_in_oxy = 21;
  var max_in_oxy = 100;
  var min_in_itime = 0.6;
  var max_in_itime = 5;
  var min_in_peep = 0;
  var max_in_peep = 20;

  var min_in_alarm_pressure = 0;
  var max_in_alarm_pressure = 80;
  var min_in_alarm_rate = 0;
  var max_in_alarm_rate = 60;
  var min_in_alarm_exhale_minute_volume = 0;
  var max_in_alarm_exhale_minute_volume = 45;
  var min_in_alarm_apnea = 0;
  var max_in_alarm_apnea = 45;

  var min_out_peak_pressure        = 10;
  var max_out_peak_pressure        = 80;
  var min_out_mean_pressure        = 5;
  var max_out_mean_pressure        = 50;
  var min_out_rate                 = 0;
  var max_out_rate                 = 40;
  var min_out_exhale_volume        = 0;
  var max_out_exhale_volume        = 2;
  var min_out_exhale_minute_volume = min_out_exhale_volume*min_out_rate;
  var max_out_exhale_minute_volume = max_out_exhale_volume*max_out_rate;
  var min_out_ie_ratio             = 0;
  var max_out_ie_ratio             = 1;

  var min_y_offset = 0;
  var max_y_offset = 0.5;
  var min_itime = 0.02;
  var max_itime = 1;
  var min_etime = 0.02;
  var max_etime = 1;
  var min_dtime = 0.02;
  var max_dtime = 1;
  var min_amplitude = 0;
  var max_amplitude = 1;

  //data
  var selected_mode = 0;
  var selected_channel = 0;
  var selected_alarm = 0;
  var alert_t = 0;
  var alert_rate = 0.01;
  var alert_stamp;
  var norm_in_volume   = 0.5;
  var norm_in_pressure = 0.5;
  var norm_in_rate     = 0.3;
  var norm_in_flow     = 0.294;
  var norm_in_oxy      = 0.0;
  var norm_in_itime    = 0.2;
  var norm_in_peep     = 0.0;

  /*
  Gets the JSON object "ventPlayerSet"
  and sets it as the displaying values, 
  if it is not set then it displays the set
  default values
  */
  var in_volume   = localStorage.getItem("ventPlayerSet") ? object.volume:lerp(min_in_volume,   max_in_volume,   norm_in_volume);
  var in_pressure = localStorage.getItem("ventPlayerSet") ? object.pressure:lerp(min_in_pressure, max_in_pressure, norm_in_pressure);
  var in_rate     = localStorage.getItem("ventPlayerSet") ? object.rate:lerp(min_in_rate,     max_in_rate,     norm_in_rate);
  var in_flow     = localStorage.getItem("ventPlayerSet") ? object.flow:lerp(min_in_flow,     max_in_flow,     norm_in_flow);
  var in_oxy      = localStorage.getItem("ventPlayerSet") ? object.oxygen:lerp(min_in_oxy,      max_in_oxy,      norm_in_oxy);
  var in_itime    = localStorage.getItem("ventPlayerSet") ? object.itime:lerp(min_in_itime  ,  max_in_itime  ,  norm_in_itime);
  var in_peep     = localStorage.getItem("ventPlayerSet") ? object.peep:lerp(min_in_peep,     max_in_peep,     norm_in_peep);
  var norm_in_alarm_min_pressure             = mapVal(min_in_alarm_pressure,             max_in_alarm_pressure,             0,1, 0);
  var norm_in_alarm_max_pressure             = mapVal(min_in_alarm_pressure,             max_in_alarm_pressure,             0,1, 80);
  var norm_in_alarm_min_rate                 = mapVal(min_in_alarm_rate,                 max_in_alarm_rate,                 0,1, 0);
  var norm_in_alarm_max_rate                 = mapVal(min_in_alarm_rate,                 max_in_alarm_rate,                 0,1, 60);
  var norm_in_alarm_min_exhale_minute_volume = mapVal(min_in_alarm_exhale_minute_volume, max_in_alarm_exhale_minute_volume, 0,1, 0);
  var norm_in_alarm_max_exhale_minute_volume = mapVal(min_in_alarm_exhale_minute_volume, max_in_alarm_exhale_minute_volume, 0,1, 45);
  var norm_in_alarm_min_apnea                = mapVal(min_in_alarm_apnea               , max_in_alarm_apnea               , 0,1, -999999);
  var norm_in_alarm_max_apnea                = mapVal(min_in_alarm_apnea               , max_in_alarm_apnea               , 0,1, 45);
  var in_alarm_min_pressure = lerp(min_in_alarm_pressure, max_in_alarm_pressure, norm_in_alarm_min_pressure);
  var in_alarm_max_pressure = lerp(min_in_alarm_pressure, max_in_alarm_pressure, norm_in_alarm_max_pressure);
  var in_alarm_min_rate = lerp(min_in_alarm_rate, max_in_alarm_rate, norm_in_alarm_min_rate);
  var in_alarm_max_rate = lerp(min_in_alarm_rate, max_in_alarm_rate, norm_in_alarm_max_rate);
  var in_alarm_min_exhale_minute_volume = lerp(min_in_alarm_exhale_minute_volume, max_in_alarm_exhale_minute_volume, norm_in_alarm_min_exhale_minute_volume);
  var in_alarm_max_exhale_minute_volume = lerp(min_in_alarm_exhale_minute_volume, max_in_alarm_exhale_minute_volume, norm_in_alarm_max_exhale_minute_volume);
  var in_alarm_min_apnea = lerp(min_in_alarm_apnea, max_in_alarm_apnea, norm_in_alarm_min_apnea);
  var in_alarm_max_apnea = lerp(min_in_alarm_apnea, max_in_alarm_apnea, norm_in_alarm_max_apnea);
  var commit_in_volume   = in_volume;
  var commit_in_pressure = in_pressure;
  var commit_in_rate     = in_rate;
  var commit_in_flow     = in_flow;
  var commit_in_oxy      = in_oxy;
  var commit_in_itime    = in_itime;
  var commit_in_peep     = in_peep;
  var norm_out_peak_pressure        = 0.5;
  var norm_out_mean_pressure        = 0.5;
  var norm_out_rate                 = 0.5;
  var norm_out_exhale_volume        = 0.5;
  var norm_out_exhale_minute_volume = 0.5;
  var norm_out_ie_ratio             = 0.5;
  var out_peak_pressure_max_variance = 0.1;
  var out_mean_pressure_max_variance = 0.06;
  var out_rate_max_variance = 0.0;
  var out_exhale_volume_max_variance = 0.001;
  var out_exhale_minute_volume_max_variance = 0.0;
  var out_ie_ratio_max_variance = 0.0;
  var out_peak_pressure_variance = 0.0;
  var out_mean_pressure_variance = 0.0;
  var out_rate_variance = 0.0;
  var out_exhale_volume_variance = 0.000;
  var out_exhale_minute_volume_variance = 0.0;
  var out_ie_ratio_variance = 0.0;
  var out_peak_pressure        = lerp(min_out_peak_pressure,        max_out_peak_pressure,        norm_out_peak_pressure);
  var out_mean_pressure        = lerp(min_out_mean_pressure,        max_out_mean_pressure,        norm_out_mean_pressure);
  var out_rate                 = lerp(min_out_rate,                 max_out_rate,                 norm_out_rate);
  var out_exhale_volume        = lerp(min_out_exhale_volume,        max_out_exhale_volume,        norm_out_exhale_volume);
  var out_exhale_minute_volume = lerp(min_out_exhale_minute_volume, max_out_exhale_minute_volume, norm_out_exhale_minute_volume);
  var out_ie_ratio             = lerp(min_out_ie_ratio,             max_out_ie_ratio,             norm_out_ie_ratio);
  var patient_compliance = 1;
  var patient_volume = 0;
  var patient_pressure = 0;
  var patient_height = 12*5+5;
  var patient_weight = 154;
  if(args && args.weight && parseInt(args.weight) && !isNaN(parseInt(args.weight))) patient_weight = parseInt(args.weight);
  var patient_age = 68;
  var patient_description_0 = "You are called to the Post-anasthesia Care Unit";
  var patient_description_1 = "for a patient who is not waking up following";
  var patient_description_2 = "a right total knee replacement. They would like";
  var patient_description_3 = "her set up on a ventilator STAT.";
  var patient_description_4 = "";
  var norm_patient_peak_pressure = 0.5;
  var norm_patient_mean_pressure = 0.5;
  var norm_patient_rate = 0.3;
  var norm_patient_exhale_volume = 0.5;
  var norm_patient_exhale_minute_volume = 0.5;
  var norm_patient_ie_ratio = 0.5;
  var patient_sex = "F";
  if(args && args.sex && (args.sex == "M" || args.sex == "F")) patient_sex = args.sex;
  var patient_name_primary = "Jane";
  var patient_name_secondary = "Smith";

  //UI State

  //sets blip_running to true if the JSON object is set, false if not.
  var blip_running = localStorage.getItem("ventPlayerSet") ? 1:0;
  var blip_rate = 0.0013;
  var blip_t = 0;
  var blip_stamp;
  var cur_screen = 1;

  //ui
  var patient_volume_graph;
  var patient_pressure_graph;
  var patient_flow_graph;
  var pressure_alarm;
  var rate_alarm;
  var exhale_minute_volume_alarm;
  var apnea_alarm;
  var vent_knob;
  var alarm_knob;
  var out_channel_btns;
  var in_channel_btns;
  var commit_vent_btn;
  var commit_alarm_btn;
  var alarms_btn;
  var patient_btn;
  var next_btn;
  var x_btn;
  var dismiss_submit_btn;

  //filters
  var clicker;
  var dragger;

  var vol_disp = function(vol)
  {
    vol *= 1000;
    vol /= 5;
    vol = round(vol);
    vol *= 5;
    vol /= 1000;
    var construct = "";
    var t = 0;
    construct += floor(vol);
    t += floor(vol);
    t *= 10;
    construct += ".";
    construct += floor(vol*10)-t;
    t += floor(vol*10)-t;
    t *= 10;
    construct += floor(vol*100)-t;
    t += floor(vol*100)-t;
    t *= 10;
    construct += floor(vol*1000)-t;
    return construct.substr(0,5);
  }

  var evaluate_patient = function()
  {
    var kg = patient_weight*0.453592;
    var ibw;
    if(patient_sex == "M") ibw = 50  +2.3*(patient_height-(5*12));
    else                   ibw = 45.5+2.3*(patient_height-(5*12));
    var expected_volume = 0.007*ibw;
    var expected_rate = 12;
    var expected_peep = 5;
    var expected_oxy = 21;
    var expected_flow = 40;

    console.log("meh");
    console.log(fdisp(in_volume,3))
    console.log(fdisp(in_rate, 1));
    console.log(fdisp(in_peep, 1));
    console.log(fdisp(in_oxy, 2));

    if(fdisp(in_volume, 3) < 0.435 || fdisp(in_volume, 3) > 0.585) { console.log("vol");  return false; }
    if(fdisp(in_rate, 1) < 9.5 || fdisp(in_rate,1) > 16.5) { console.log("rate");  return false; }
    if(fdisp(in_peep, 1) < 4.5 || fdisp(in_peep,1) > 7.5) { console.log("peep"); return false; }
    if(fdisp(in_oxy, 2) < 49.5 || fdisp(in_oxy, 2) > 100.5) { console.log("oxy");  return false; }
    // what the code was before for note
    //if(in_flow) { console.log("flow"); return false; }

    return true;
  }

  var triggered_alarms = function()
  {
    if(!blip_running)                                                                                                                              { return false; }
    if(pressure_alarm.v             > pressure_alarm.max_v            *1.0 || pressure_alarm.v             < pressure_alarm.min_v            *1.0) { return true; }
    if(rate_alarm.v                 > rate_alarm.max_v                *1.0 || rate_alarm.v                 < rate_alarm.min_v                *1.0) { return true; }
    if(exhale_minute_volume_alarm.v > exhale_minute_volume_alarm.max_v*1.0 || exhale_minute_volume_alarm.v < exhale_minute_volume_alarm.min_v*1.0) { return true; }
    return false;
  }
  var evaluate_alarms = function()
  {
    if(!blip_running)                                                                                                                              { console.log("blip"); return false; }
    if(pressure_alarm.v             > pressure_alarm.max_v            *1.0 || pressure_alarm.v             < pressure_alarm.min_v            *1.0) { console.log("pressure alarm"); return false; }
    if(rate_alarm.v                 > rate_alarm.max_v                *1.0 || rate_alarm.v                 < rate_alarm.min_v                *1.0) { console.log("rate alarm");     return false; }
    if(exhale_minute_volume_alarm.v > exhale_minute_volume_alarm.max_v*1.0 || exhale_minute_volume_alarm.v < exhale_minute_volume_alarm.min_v*1.0) { console.log("emv alarm");      return false; }
    return true;
  }

  var alarm = function(min_select,max_select,min_selected,max_selected,min_text,max_text,text,minmin_text,maxmax_text,title,label)
  {
    var self = this;
    self.wx = 0;
    self.wy = 0;
    self.ww = 0;
    self.wh = 0;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.v = 0.5;
    self.min_v = 0;
    self.max_v = 1;

    self.min_box = {x:0,y:0,w:0,h:0,click:function(evt){min_select();}};
    self.max_box = {x:0,y:0,w:0,h:0,click:function(evt){max_select();}};

    self.calcBtns = function()
    {
      self.min_box.w = 40;
      self.min_box.h = 40;
      self.min_box.x = self.x-self.min_box.w-5;
      self.min_box.y = self.y+self.h-(self.min_v*self.h);

      self.max_box.w = 40;
      self.max_box.h = 40;
      self.max_box.x = self.x-self.max_box.w-5;
      self.max_box.y = self.y+self.h-self.max_box.h-(self.max_v*self.h);
    }

    self.draw = function()
    {
      ctx.strokeStyle = dark_blue;
      ctx.fillStyle = light_gray;
      ctx.strokeRect(self.x,self.y,self.w,self.h);
      ctx.fillRect(self.x,self.y,self.w,self.h);

      ctx.textAlign = "center";
      ctx.fillStyle = dark_blue;
      ctx.font = "20px Helvetica";
      ctx.fillStyle = dark_blue;
      ctx.fillText(title,self.x,self.y-70);
      ctx.font = "14px Helvetica";
      ctx.fillText(label,self.x,self.y-50);

      ctx.textAlign = "left";
      ctx.fillStyle = dark_blue;
      if(min_selected()) canv.fillRoundRect(self.min_box.x,self.min_box.y,self.min_box.w,self.min_box.h,5);
      ctx.fillStyle = light_blue;
      ctx.font = "14px Helvetica";
      ctx.fillText("min",self.min_box.x+7,self.min_box.y+20);
      ctx.font = "12px Helvetica";
      ctx.fillText(min_text(),self.min_box.x+7,self.min_box.y+33);
      ctx.strokeStyle = light_blue;
      ctx.fillStyle = white;
      canv.strokeRoundRect(self.min_box.x,self.min_box.y,self.min_box.w,self.min_box.h,5);
      ctx.fillRect(self.x-2,self.min_box.y-2,self.w+4,4);
      ctx.strokeRect(self.x-2,self.min_box.y-2,self.w+4,4);

      ctx.fillStyle = dark_blue;
      if(max_selected()) canv.fillRoundRect(self.max_box.x,self.max_box.y,self.max_box.w,self.max_box.h,5);
      ctx.fillStyle = light_blue;
      ctx.font = "14px Helvetica";
      ctx.fillText("max",self.max_box.x+7,self.max_box.y+20);
      ctx.font = "12px Helvetica";
      ctx.fillText(max_text(),self.max_box.x+7,self.max_box.y+33);
      ctx.strokeStyle = light_blue;
      ctx.fillStyle = white;
      canv.strokeRoundRect(self.max_box.x,self.max_box.y,self.max_box.w,self.max_box.h,5);
      ctx.strokeRect(self.x-2,self.max_box.y+self.max_box.h-2,self.w+4,4);
      ctx.fillRect(self.x-2,self.max_box.y+self.max_box.h-2,self.w+4,4);

      ctx.fillText(minmin_text(),self.x+4,self.y+self.h+20);
      ctx.fillText(maxmax_text(),self.x+4,self.y-4);

      if(blip_running)
      {
        ctx.fillStyle = dark_blue;
        ctx.fillRect(self.x-1,self.y+self.h-(self.h*self.v)-1,self.w+2,2);
        ctx.fillText(text(),self.x+self.w+5,self.y+self.h-(self.v*self.h));
      }
    }
  }

  var graph_data = function()
  {
    var self = this;

    self.inspirations = [];
    self.inspiration_pts = 500;
    var j = 0;
    //volume
    self.inspirations[j] = [];
    for(var i = 0; i < self.inspiration_pts; i++)
    {
      var t = i/self.inspiration_pts;
      if(t < 0.9)
      {
        self.inspirations[j][i] = sqrt(pcos(t/2*twopi-pi));
      }
      else
      {
        var fade = mapVal(0.8,1.2,0,1,t);
        self.inspirations[j][i] = lerp(
          sqrt(pcos(t/2*twopi-pi)),
          pow(1-(t-1),3),
          fade);
      }
      if(self.inspirations[j][i] > 1) self.inspirations[j][i] = 1+pow(self.inspirations[j][i]-1,3);
    }
    j++;
    //pressure
    self.inspirations[j] = [];
    for(var i = 0; i < self.inspiration_pts; i++)
    {
      if(i < self.inspiration_pts/2)
      {
        var x = i/(self.inspiration_pts/2);
        x += 2;
        x /= 3;
        var y = pow(x,8)/2;
        self.inspirations[j][i] = y;
      }
      else
      {
        var x = (i-self.inspiration_pts/2)/(self.inspiration_pts/2);
        x += 1;
        x /= 2;
        x -= 0.5;
        var y = 1-pow((1-x),8)/2;
        self.inspirations[j][i] = y;
      }
    }
    j++;
    //flow
    self.inspirations[j] = [];
    self.inspirations[j][0] = 0.0;
    for(var i = 1; i < self.inspiration_pts-1; i++)
    {
      self.inspirations[j][i] = 1;
    }
    self.inspirations[j][self.inspiration_pts-1] = 0;
    j++;

    self.expirations = [];
    self.expiration_pts = 500;
    var j = 0;
    //volume
    self.expirations[j] = [];
    for(var i = 0; i < self.expiration_pts; i++)
    {
      var t = i/self.expiration_pts;
      if(t < 0.2)
      {
        var fade = mapVal(-0.2,0.2,0,1,t);
        self.expirations[j][i] = lerp(
          sqrt(pcos((0.5+t/2)*twopi-pi)),
          pow(1-t,3),
        fade);
      }
      else
      {
        self.expirations[j][i] = pow(1-t,3);
      }
      if(self.inspirations[j][i] > 1) self.inspirations[j][i] = 1+pow(self.inspirations[j][i]-1,3);
    }
    j++;
    //pressure
    self.expirations[j] = [];
    for(var i = 0; i < self.expiration_pts; i++)
    {
      t = i/self.expiration_pts;
      if(t < 1.1)
      {
        var x = t;
        var y = pow((1-(x/1.5)),8);//charles changed
        self.expirations[j][i] = y;
      }
      else
        self.expirations[j][i] = 0;
    }
    j++;
    //flow
    self.expirations[j] = [];
    self.expirations[j][0] = 0.0;
    for(var i = 1; i < self.expiration_pts-1; i++)
    {
      var t = i/self.expiration_pts;
      self.expirations[j][i] = pow(-1+t,3);
    }
    self.expirations[j][self.expiration_pts-1] = 0;
    j++;

    self.pulse_i = 0;
    self.y_offset   = min_y_offset;
    self.itime = lerp(min_itime,max_itime,0.5);
    self.etime = lerp(min_etime,max_etime,0.5);
    self.dtime = lerp(min_dtime,max_dtime,0.5);
    self.amplitude  = lerp(min_amplitude,max_amplitude,0.5);

    self.data = [];
    self.data_pts = 1000;
    self.min_y = -1;
    self.max_y = 1;

    self.sample_inspiration = function(t)
    {
      var from_i = floor(t*self.inspiration_pts);
      var to_i   = ceil(t*self.inspiration_pts);
      return lerp(self.inspirations[self.pulse_i][from_i],self.inspirations[self.pulse_i][to_i],t);
    }
    self.sample_expiration = function(t)
    {
      var from_i = floor(t*self.expiration_pts);
      var to_i   = ceil(t*self.expiration_pts);
      return lerp(self.expirations[self.pulse_i][from_i],self.expirations[self.pulse_i][to_i],t);
    }

    var gen_data_in_inspiration = false;
    var gen_data_in_expiration = false;
    var gen_data_t_in_state = 0;
    var gen_data_advance_state = function()
    {
      var changed = true;
      while(changed)
      {
        changed = false;
        if(gen_data_in_inspiration && gen_data_t_in_state > self.itime)
        {
          gen_data_in_inspiration = false;
          gen_data_in_expiration = true;
          gen_data_t_in_state -= self.itime;
          changed = true;
        }
        if(gen_data_in_expiration && gen_data_t_in_state > self.etime)
        { 
          gen_data_in_expiration = false;
          gen_data_t_in_state -= self.etime;
          changed = true;
        }
        if(!gen_data_in_inspiration && !gen_data_in_expiration && gen_data_t_in_state > self.dtime)
        {
          gen_data_in_inspiration = true;
          gen_data_t_in_state -= self.dtime;
          changed = true;
        }
      }
    }
    self.gen_data = function()
    {
      gen_data_in_inspiration = true;
      gen_data_in_expiration = false;
      gen_data_t_in_state = 0;
      for(var i = 0; i < self.data_pts; i++)
      {
        if(gen_data_in_inspiration)     self.data[i] = self.sample_inspiration(gen_data_t_in_state/self.itime)*self.amplitude+self.y_offset;
        else if(gen_data_in_expiration) self.data[i] = self.sample_expiration( gen_data_t_in_state/self.etime)*self.amplitude+self.y_offset;
        else                            self.data[i] = self.y_offset;

        gen_data_t_in_state += 1/self.data_pts;
        gen_data_advance_state();
      }
    }
  }

  var graph_set = function(color)
  {
    var self = this;
    self.wx = 0;
    self.wy = 0;
    self.ww = 0;
    self.wh = 0;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.graph = new graph(color);
    self.commit_graph = new graph(color);

    self.data = new graph_data();
    self.data.gen_data();

    var apply_size_graph = function(g)
    {
      g.wx = self.wx;
      g.wy = self.wy;
      g.ww = self.ww;
      g.wh = self.wh;
      g.x = self.x;
      g.y = self.y;
      g.w = self.w;
      g.h = self.h;
      g.gen_cache();
    }
    self.apply_size = function()
    {
      apply_size_graph(self.graph);
      apply_size_graph(self.commit_graph);
    }

    self.update = function()
    {
      self.data.gen_data();
      self.graph.consume_data(self.data);
    }
    self.commit = function()
    {
      self.commit_graph.consume_data(self.data);
    }

    self.draw = function(linethru)
    {
      //self.graph.draw(linethru);
      self.commit_graph.draw(linethru);
    }
  }

  var graph = function(color)
  {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;
    self.wx = 0;
    self.wy = 0;
    self.ww = 0;
    self.wh = 0;
    self.color = color;

    self.cache;
    self.dirty = true;
    self.data_pts = 100;
    self.data = [];
    self.min_y = -1;
    self.max_y = 1;

    self.consume_data = function(gd)
    {
      self.data = gd.data;
      self.data_pts = gd.data_pts;
      self.min_y = gd.min_y;
      self.max_y = gd.max_y;
      self.dirty = true;
    }

    self.gen_cache = function() { self.cache = GenIcon(self.w,self.h); }

    self.draw = function(linethru)
    {
      if(self.dirty)
      {
        self.cache.context.clearRect(0,0,self.w,self.h);
        var c;
        var x;
        var y;
        self.cache.context.strokeStyle = self.color;
        self.cache.context.beginPath();
        y = self.data[0];
        self.cache.context.moveTo(0, clamp(0,self.h,mapVal(self.min_y, self.max_y, self.h, 0, y)));
        for(var i = 1; i < self.data_pts; i++)
        {
          x = i/(self.data_pts-1);
          y = self.data[i];
          self.cache.context.lineTo(
            clamp(0,self.w,mapVal(         0,          1,      0, self.w, x)),
            clamp(0,self.h,mapVal(self.min_y, self.max_y, self.h,      0, y))
          );
        }
        self.cache.context.stroke();
        self.dirty = false
      }

      ctx.lineWidth = 0.5;
      ctx.strokeStyle = light_blue;
      ctx.beginPath();
      ctx.moveTo(self.x,       self.y);
      ctx.lineTo(self.x+self.w,self.y);
      if(linethru)
      {
        ctx.moveTo(self.x,       self.y+self.h/2);
        ctx.lineTo(self.x+self.w,self.y+self.h/2);
      }
      ctx.moveTo(self.x,       self.y+self.h);
      ctx.lineTo(self.x+self.w,self.y+self.h);
      for(var i = 1; i < 12; i++)
      {
        var x = lerp(self.x,self.x+self.w,i/12);
        ctx.moveTo(x,self.y);
        ctx.lineTo(x,self.y+self.h);
      }
      ctx.stroke();
      ctx.lineWidth = 1;
      if(blip_t != 0)
      ctx.drawImage(self.cache,0,0,self.cache.width*blip_t,self.cache.height,self.x,self.y,self.w*blip_t,self.h);
    }
  }

  var out_btn_w = 0.15;
  var in_btn_w = cam.ww/6;
  var genOutChannelBtn = function(channel, title, x)
  {
    btn = new ButtonBox(0,0,0,0, function(){selected_channel = channel; })
    btn.channel = channel;
    btn.title = title;
    btn.wh = 0.1;
    btn.ww = out_btn_w;
    btn.wx = x;
    btn.wy = 0.75-(btn.ww/2)-0.05;
    screenSpace(cam,bogus_canv,btn);
    out_channel_btns[channel] = btn;
  }
  var genInChannelBtn = function(channel, title, x)
  {
    btn = new ButtonBox(0,0,0,0, function(){selected_channel = channel; })
    btn.channel = channel;
    btn.title = title;
    btn.wx = x;
    btn.wy = -0.1
    btn.ww = in_btn_w;
    btn.wh = 0.1;
    screenSpace(cam,bogus_canv,btn);
    in_channel_btns[channel] = btn;
  }
  var drawOutBtn = function(btn,sub,subsub)
  {
    ctx.fillStyle = light_blue;
    ctx.font = "10px Helvetica";
    ctx.fillText(btn.title,btn.x+2,btn.y+btn.h/2-10);
    ctx.font = "18px Helvetica";
    if(sub) ctx.fillText(sub,btn.x+2,btn.y+btn.h/2+8);
    if(subsub) ctx.fillText(subsub,btn.x+2,btn.y+btn.h/2+15);
  }
  var drawInBtn = function(btn,sub,subsub)
  {
    ctx.fillStyle = black;
    ctx.strokeStyle = gray;
    canv.roundRectOptions(btn.x,btn.y,btn.w,btn.h,5,0,0,1,1,light_blue,0);
    ctx.font = "10px Helvetica";
    ctx.fillText(btn.title,btn.x+2,btn.y+btn.h/2-10);
    ctx.font = "12px Helvetica";
    if(sub) ctx.fillText(sub,btn.x+2,btn.y+btn.h/2+4);
    ctx.fillStyle = black;
    if(subsub) ctx.fillText(subsub,btn.x+2,btn.y+btn.h/2+15);
  }
  var drawBtn = function(btn,sub,subsub)
  {
    ctx.fillStyle = green;
    canv.fillRoundRect(btn.x,btn.y,btn.w,btn.h,5);
    ctx.fillStyle = white;
    ctx.font = "18px Helvetica";
    ctx.fillText(btn.title,btn.x+10,btn.y+btn.h/2+8);
    if(sub) ctx.fillText(sub,btn.x+2,btn.y+btn.h/2+5);
    if(subsub) ctx.fillText(subsub,btn.x+2,btn.y+btn.h/2+15);
  }

  var setup_graph_set = function(gs, i)
  {
    gs.wx = 0;
    gs.wh = 0.18;
    gs.ww = cam.ww;
    gs.wy = 0.5-(gs.wh*i*1.1);
    screenSpace(cam,bogus_canv,gs);
    gs.apply_size();

    gs.update();
    gs.commit();
  }

  var exitNotificationScreenSettings = function() {
    
    var gridPattern = ctx.createPattern(img, 'repeat');
    ctx.fillStyle = gridPattern;
    
    ctx.fillRect(0,0,bogus_canv.width,bogus_canv.height);
    
    ctx.drawImage(icon_warning_img, bogus_canv.width*.3, bogus_canv.height*.15);


    ctx.fillStyle = black;

    x = 50;
    ctx.font = "35px Helvetica";
    //ctx.fillText("All settings are final.",x,325);
    y = 400;
    yd = 35;
    ctx.font = "35px Helvetica";
    ctx.fillText("Waiting for patient",x+15,y-25); y+=yd;
    //ctx.fillText("if you are",x+75,y); 
    y+=yd;
    ctx.fillText("connection...",x+55,y); y+=yd;
    y = 380;
    yd = 25;
    ctx.fillText("",x,y); y+=yd;
  }
  
  var update_graphs = function()
  {
    for(var i = 0; i < 3; i++)
    {
      var cur_graph;
      switch(i)
      {
        case 0: cur_graph = patient_volume_graph;   break;
        case 1: cur_graph = patient_pressure_graph; break;
        case 2: cur_graph = patient_flow_graph;     break;
      }

           //if(selected_mode == MODE_VOLUME)   cur_graph.data.amplitude = lerp(min_amplitude, max_amplitude, norm_in_volume);
      //else if(selected_mode == MODE_PRESSURE) cur_graph.data.amplitude = lerp(min_amplitude, max_amplitude, norm_in_pressure);

      cur_graph.data.itime = in_itime/12;
      cur_graph.data.etime = 0.1;
      cur_graph.data.dtime = 1/((in_rate/60)*12)-(cur_graph.data.itime+cur_graph.data.etime);
      if(cur_graph == patient_pressure_graph)
      {
        cur_graph.data.y_offset   = lerp(min_y_offset,   max_y_offset,   norm_in_peep)+0.02;
        cur_graph.data.amplitude  = 1-cur_graph.data.y_offset;
      }
      cur_graph.update();
    }
  }

  var update_alarms = function()
  {
    pressure_alarm.v = mapVal(min_in_alarm_pressure,max_in_alarm_pressure,0,1,out_peak_pressure);
    pressure_alarm.min_v = norm_in_alarm_min_pressure;
    pressure_alarm.max_v = norm_in_alarm_max_pressure;
    in_alarm_min_pressure = lerp(min_in_alarm_pressure, max_in_alarm_pressure, norm_in_alarm_min_pressure);
    in_alarm_max_pressure = lerp(min_in_alarm_pressure, max_in_alarm_pressure, norm_in_alarm_max_pressure);
    pressure_alarm.calcBtns();

    rate_alarm.v = mapVal(min_in_alarm_rate,max_in_alarm_rate,0,1,out_rate);
    rate_alarm.min_v = norm_in_alarm_min_rate;
    rate_alarm.max_v = norm_in_alarm_max_rate;
    in_alarm_min_rate = lerp(min_in_alarm_rate, max_in_alarm_rate, norm_in_alarm_min_rate);
    in_alarm_max_rate = lerp(min_in_alarm_rate, max_in_alarm_rate, norm_in_alarm_max_rate);
    rate_alarm.calcBtns();

    exhale_minute_volume_alarm.v = mapVal(min_in_alarm_exhale_minute_volume,max_in_alarm_exhale_minute_volume,0,1,out_exhale_minute_volume);
    exhale_minute_volume_alarm.min_v = norm_in_alarm_min_exhale_minute_volume;
    exhale_minute_volume_alarm.max_v = norm_in_alarm_max_exhale_minute_volume;
    in_alarm_min_exhale_minute_volume = lerp(min_in_alarm_exhale_minute_volume, max_in_alarm_exhale_minute_volume, norm_in_alarm_min_exhale_minute_volume);
    in_alarm_max_exhale_minute_volume = lerp(min_in_alarm_exhale_minute_volume, max_in_alarm_exhale_minute_volume, norm_in_alarm_max_exhale_minute_volume);
    exhale_minute_volume_alarm.calcBtns();

    apnea_alarm.v = mapVal(min_in_alarm_apnea,max_in_alarm_apnea,0,1,60/out_rate);
    apnea_alarm.min_v = norm_in_alarm_min_apnea;
    apnea_alarm.max_v = norm_in_alarm_max_apnea;
    in_alarm_min_apnea = lerp(min_in_alarm_apnea, max_in_alarm_apnea, norm_in_alarm_min_apnea);
    in_alarm_max_apnea = lerp(min_in_alarm_apnea, max_in_alarm_apnea, norm_in_alarm_max_apnea);
    apnea_alarm.calcBtns();
  }

  self.ready = function()
  {
    cam.wh = isTo(canv.width,1,canv.height);

    knob_range_img = new Image();
    knob_range_img.src = "assets/knob-range.png";
    knob_img = new Image();
    knob_img.src = "assets/knob.png";
    knob_indicator_img = new Image();
    knob_indicator_img.src = "assets/knob-indicator.png";
    icon_alarms_img = new Image();
    icon_alarms_img.src = "assets/alarms-icon-lighter-gray.png"
    icon_patient_img = new Image();
    icon_patient_img.src = "assets/icon-patient.png"
    icon_sad_face_img = new Image();
    icon_sad_face_img.src = "assets/sad-face.png"
    beep_aud = new Audio();
    beep_aud.src = "assets/beep.mp3";

    icon_warning_img = new Image();
    icon_warning_img.src = "assets/icon-warning.png";

    patient_volume_graph = new graph_set(red);
    patient_volume_graph.data.pulse_i = 0;
    patient_volume_graph.data.min_y = 0;
    patient_volume_graph.data.max_y = 1.4;
    patient_volume_graph.data.y_offset = 0.02;
    patient_volume_graph.data.amplitude = 1;
    setup_graph_set(patient_volume_graph,0);
    patient_pressure_graph = new graph_set(yellow);
    patient_pressure_graph.data.pulse_i = 1;
    patient_pressure_graph.data.min_y = 0;
    patient_pressure_graph.data.max_y = 1.4;
    patient_pressure_graph.data.y_offset = 0.02;
    patient_pressure_graph.data.amplitude = 1;
    setup_graph_set(patient_pressure_graph,1);
    patient_flow_graph = new graph_set(green);
    patient_flow_graph.data.pulse_i = 2;
    patient_flow_graph.data.min_y = -1.4;
    patient_flow_graph.data.max_y = 1.4;
    patient_flow_graph.data.amplitude = 1;
    setup_graph_set(patient_flow_graph,2);

    vent_knob = new KnobBox(0,0,0,0, -1,1,0.1,0,function(v)
    {
      switch(selected_channel)
      {
        case IN_CHANNEL_MODE:
               if(selected_mode == MODE_VOLUME)   norm_in_volume   = clamp(0, 1, norm_in_volume  +v);
          else if(selected_mode == MODE_PRESSURE) norm_in_pressure = clamp(0, 1, norm_in_pressure+v);
          in_volume   = lerp(min_in_volume,   max_in_volume,   norm_in_volume);
          in_pressure = lerp(min_in_pressure, max_in_pressure, norm_in_pressure);

          in_flow = in_volume/(in_itime/60);
          in_itime = in_volume/(in_flow/60);

          break;
        case IN_CHANNEL_RATE:
          norm_in_rate = clamp(0,1,norm_in_rate+v);
          in_rate = lerp(min_in_rate, max_in_rate, norm_in_rate);
          break;
        case IN_CHANNEL_FLOW:
          norm_in_flow = clamp(0,1,norm_in_flow+v);
          in_flow = lerp(min_in_flow, max_in_flow, norm_in_flow);
          in_itime = in_volume/(in_flow/60);
          in_norm_itime = mapVal(min_in_itime,max_in_itime,0,1,in_itime);
          break;
        case IN_CHANNEL_OXY:
          norm_in_oxy = clamp(0,1,norm_in_oxy+v);
          in_oxy = lerp(min_in_oxy, max_in_oxy, norm_in_oxy);
          break;
        case IN_CHANNEL_ITIME:
          norm_in_itime = clamp(0,1,norm_in_itime+v);
          in_itime = lerp(min_in_itime, max_in_itime, norm_in_itime);
          in_flow = in_volume/(in_itime/60);
          in_norm_flow = mapVal(min_in_flow,max_in_flow,0,1,in_flow);
          break;
        case IN_CHANNEL_PEEP:
          norm_in_peep = clamp(0,1,norm_in_peep+v);
          in_peep = lerp(min_in_peep, max_in_peep, norm_in_peep);
          break;
      }
      update_graphs();

      vent_knob.val = 0;
    });
    vent_knob.ww = 0.3;
    vent_knob.wh = 0.3;
    vent_knob.wx = -0.28;
    vent_knob.wy = -0.35;
    screenSpace(cam,bogus_canv,vent_knob);

    pressure_alarm = new alarm(
      function(){selected_alarm = IN_ALARM_MIN_PRESSURE;},
      function(){selected_alarm = IN_ALARM_MAX_PRESSURE;},
      function(){return selected_alarm == IN_ALARM_MIN_PRESSURE;},
      function(){return selected_alarm == IN_ALARM_MAX_PRESSURE;},
      function(){return fdisp(in_alarm_min_pressure,0);},
      function(){return fdisp(in_alarm_max_pressure,0);},
      function(){return fdisp(out_peak_pressure,0);},
      function(){return fdisp(min_in_alarm_pressure,0);},
      function(){return fdisp(max_in_alarm_pressure,0);},
      "Pressure",
      "cm H₂O"
      );
    pressure_alarm.wx = -0.28;
    pressure_alarm.wy = 0.09;
    pressure_alarm.ww = 0.06;
    pressure_alarm.wh = 0.55;
    screenSpace(cam,bogus_canv,pressure_alarm);

    rate_alarm = new alarm(
      function(){selected_alarm = IN_ALARM_MIN_RATE;},
      function(){selected_alarm = IN_ALARM_MAX_RATE;},
      function(){return selected_alarm == IN_ALARM_MIN_RATE;},
      function(){return selected_alarm == IN_ALARM_MAX_RATE;},
      function(){return fdisp(in_alarm_min_rate,0);},
      function(){return fdisp(in_alarm_max_rate,0);},
      function(){return fdisp(out_rate,0);},
      function(){return fdisp(min_in_alarm_rate,0);},
      function(){return fdisp(max_in_alarm_rate,0);},
      "Rate",
      "b/min"
      );
    rate_alarm.wx = -0.05;
    rate_alarm.wy = pressure_alarm.wy;
    rate_alarm.ww = pressure_alarm.ww;
    rate_alarm.wh = pressure_alarm.wh;
    screenSpace(cam,bogus_canv,rate_alarm);

    exhale_minute_volume_alarm = new alarm(
      function(){selected_alarm = IN_ALARM_MIN_EXHALE_MINUTE_VOLUME;},
      function(){selected_alarm = IN_ALARM_MAX_EXHALE_MINUTE_VOLUME;},
      function(){return selected_alarm == IN_ALARM_MIN_EXHALE_MINUTE_VOLUME;},
      function(){return selected_alarm == IN_ALARM_MAX_EXHALE_MINUTE_VOLUME;},
      function(){return fdisp(in_alarm_min_exhale_minute_volume,1);},
      function(){return fdisp(in_alarm_max_exhale_minute_volume,1);},
      function(){return fdisp(out_exhale_minute_volume,1);},
      function(){return fdisp(min_in_alarm_exhale_minute_volume,1);},
      function(){return fdisp(max_in_alarm_exhale_minute_volume,1);},
      "V̇E",
      "L/min"
      );
    exhale_minute_volume_alarm.wx = 0.2;
    exhale_minute_volume_alarm.wy = pressure_alarm.wy;
    exhale_minute_volume_alarm.ww = pressure_alarm.ww;
    exhale_minute_volume_alarm.wh = pressure_alarm.wh;
    screenSpace(cam,bogus_canv,exhale_minute_volume_alarm);

    apnea_alarm = new alarm(
      function(){selected_alarm = IN_ALARM_MIN_APNEA;},
      function(){selected_alarm = IN_ALARM_MAX_APNEA;},
      function(){return selected_alarm == IN_ALARM_MIN_APNEA;},
      function(){return selected_alarm == IN_ALARM_MAX_APNEA;},
      function(){return fdisp(in_alarm_min_apnea,0);},
      function(){return fdisp(in_alarm_max_apnea,0);},
      function(){return fdisp(60/out_rate,0);},
      function(){return fdisp(min_in_alarm_apnea,0);},
      function(){return fdisp(max_in_alarm_apnea,0);},
      "Apnea",
      "seconds"
      );
    apnea_alarm.wx = 0.4;
    apnea_alarm.wy = pressure_alarm.wy;
    apnea_alarm.ww = pressure_alarm.ww;
    apnea_alarm.wh = pressure_alarm.wh;
    screenSpace(cam,bogus_canv,apnea_alarm);

    alarm_knob = new KnobBox(0,0,0,0, -1,1,0.1,0,function(v)
    {
      switch(selected_alarm)
      {
        case IN_ALARM_MIN_PRESSURE:
          norm_in_alarm_min_pressure = clamp(0,norm_in_alarm_max_pressure,norm_in_alarm_min_pressure+v);
          break;
        case IN_ALARM_MAX_PRESSURE:
          norm_in_alarm_max_pressure = clamp(norm_in_alarm_min_pressure,1,norm_in_alarm_max_pressure+v);
          break;
        case IN_ALARM_MIN_RATE:
          norm_in_alarm_min_rate = clamp(0,norm_in_alarm_max_rate,norm_in_alarm_min_rate+v);
          break;
        case IN_ALARM_MAX_RATE:
          norm_in_alarm_max_rate = clamp(norm_in_alarm_min_rate,1,norm_in_alarm_max_rate+v);
          break;
        case IN_ALARM_MIN_EXHALE_MINUTE_VOLUME:
          norm_in_alarm_min_exhale_minute_volume = clamp(0,norm_in_alarm_max_exhale_minute_volume,norm_in_alarm_min_exhale_minute_volume+v);
          break;
        case IN_ALARM_MAX_EXHALE_MINUTE_VOLUME:
          norm_in_alarm_max_exhale_minute_volume = clamp(norm_in_alarm_min_exhale_minute_volume,1,norm_in_alarm_max_exhale_minute_volume+v);
          break;
        case IN_ALARM_MIN_APNEA:
          norm_in_alarm_min_apnea = clamp(0,norm_in_alarm_max_apnea,norm_in_alarm_min_apnea+v);
          break;
        case IN_ALARM_MAX_APNEA:
          norm_in_alarm_max_apnea = clamp(0,1,norm_in_alarm_max_apnea+v);
          break;
      }

      update_alarms();
      alarm_knob.val = 0;
    });
    alarm_knob.ww = 0.3;
    alarm_knob.wh = 0.3;
    alarm_knob.wx = -0.28;
    alarm_knob.wy = -0.5;
    screenSpace(cam,bogus_canv,alarm_knob);
    update_alarms();

    out_channel_btns = [];
    in_channel_btns = [];

    var x = -0.52+(out_btn_w/2)+0.05;
    var s = out_btn_w+0.02;
    genOutChannelBtn(OUT_CHANNEL_PEAK_PRESSURE,        "PIP (cm H₂O)"  /*"Peak Pressure"*/,        x); x += s;
    genOutChannelBtn(OUT_CHANNEL_MEAN_PRESSURE,        "MAP (cm H₂O)"  /*"Mean Pressure"*/,        x); x += s;
    genOutChannelBtn(OUT_CHANNEL_RATE,                 "Rate (b/min)"  /*"Frequency"*/,            x); x += s;
    genOutChannelBtn(OUT_CHANNEL_EXHALE_VOLUME,        "Exp. Vt (L)"   /*"Exhale Volume"*/,        x); x += s;
    genOutChannelBtn(OUT_CHANNEL_EXHALE_MINUTE_VOLUME, "V̇E (L/min)"    /*"Exhale Minute Volume"*/, x); x += s;
    genOutChannelBtn(OUT_CHANNEL_IE_RATIO,             "I:E"           /*"I:E"*/,                  x); x += s;
    x = -0.5+(in_btn_w/2);
    s = in_btn_w;
    genInChannelBtn(IN_CHANNEL_MODE,  "Volume", x); x += s;
    genInChannelBtn(IN_CHANNEL_RATE,  "Rate",   x); x += s;
    genInChannelBtn(IN_CHANNEL_FLOW,  "Flow",   x); x += s;
    genInChannelBtn(IN_CHANNEL_OXY,   "Oxygen", x); x += s;
    genInChannelBtn(IN_CHANNEL_ITIME, "I Time", x); x += s;
    genInChannelBtn(IN_CHANNEL_PEEP,  "PEEP",   x); x += s;

    commit_vent_btn = new ButtonBox(0,0,0,0, function()
    {
      blip_t = 0;
      patient_volume_graph.commit();
      patient_pressure_graph.commit();
      patient_flow_graph.commit();
      commit_in_volume   = in_volume;
      commit_in_pressure = in_pressure;
      commit_in_rate     = in_rate;
      commit_in_flow     = in_flow;
      commit_in_oxy      = in_oxy;
      commit_in_itime    = in_itime;
      commit_in_peep     = in_peep;
      blip_running = true;

      getVentSettings(fdisp(in_volume,3), fdisp(in_pressure,2), fdisp(in_rate,2), fdisp(in_flow,2), fdisp(in_oxy,2), fdisp(in_itime, 2), fdisp(in_peep,0));

      update_alarms();
    });
    commit_vent_btn.title = "Test Lung";
    commit_vent_btn.ww = 0.25;
    commit_vent_btn.wx = 0.15;
    commit_vent_btn.wh = 0.08;
    commit_vent_btn.wy = -0.42;
    screenSpace(cam,bogus_canv,commit_vent_btn);

    commit_alarm_btn = new ButtonBox(0,0,0,0, function()
    {
      //cur_screen = SCREEN_VENTILATOR;
    });
    commit_alarm_btn.title = "Commit Changes";
    commit_alarm_btn.ww = 0.4;
    commit_alarm_btn.wx = 0.15;
    commit_alarm_btn.wh = 0.08;
    commit_alarm_btn.wy = -0.54;
    screenSpace(cam,bogus_canv,commit_alarm_btn);

    x_btn = new ButtonBox(bogus_canv.width-325,10,125,40, function()
    {
      cur_screen = SCREEN_VENTILATOR;
    });
    x_btn.title = "Back to Ventilator";

    dismiss_submit_btn = new ButtonBox(bogus_canv.width/2,580,180,40, function()
    {
      cur_screen = SCREEN_VENTILATOR;
      if(evaluate_patient() && evaluate_alarms()) playerSuccess();
      else playerFailure();
    });
    dismiss_submit_btn.title = "Connect Patient";

    patient_btn = new ButtonBox(30,bogus_canv.height-65,40,40, function()
    {
      cur_screen = SCREEN_PATIENT;
    });
    patient_btn.title = "patient info";

    alarms_btn = new ButtonBox(80,bogus_canv.height-65,40,40, function()
    {
      
      //cur_screen = SCREEN_ALARMS;
      update_alarms();
    });
    alarms_btn.title = "alarms";
    alarms_btn.color = "#ff0000";

    next_btn = new ButtonBox(bogus_canv.width-240,bogus_canv.height-65,180,40, function()
    {
      cur_screen = SCREEN_NOTIF;
      
    });
    next_btn.title = "Next Patient";

    alert_t = 0;

    update_graphs();
    patient_volume_graph.draw(false);
    patient_pressure_graph.draw(false);
    patient_flow_graph.draw(true);
    update_alarms();

    clicker = new Clicker({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});
  };

  self.tick = function()
  {
    n_ticks++;

    switch(cur_screen)
    {
      case SCREEN_VENTILATOR:
        for(var i = 0; i < in_channel_btns.length; i++)
          clicker.filter(in_channel_btns[i]);
        clicker.filter(commit_vent_btn);
        //clicker.filter(patient_btn);
        clicker.filter(alarms_btn);
        clicker.filter(next_btn);
        dragger.filter(vent_knob);
      break;
      case SCREEN_PATIENT:
        clicker.filter(x_btn);
      break;
      case SCREEN_ALARMS:
        clicker.filter(x_btn);
        clicker.filter(pressure_alarm.min_box);
        clicker.filter(pressure_alarm.max_box);
        clicker.filter(rate_alarm.min_box);
        clicker.filter(rate_alarm.max_box);
        clicker.filter(exhale_minute_volume_alarm.min_box);
        clicker.filter(exhale_minute_volume_alarm.max_box);
        clicker.filter(apnea_alarm.min_box);
        clicker.filter(apnea_alarm.max_box);
        clicker.filter(commit_alarm_btn);
        dragger.filter(alarm_knob);
        break;
      case SCREEN_NOTIF:
        clicker.filter(x_btn);
        clicker.filter(dismiss_submit_btn);
        break;
      break;
    }
    clicker.flush();
    dragger.flush();

    if(selected_mode == MODE_VOLUME)   in_channel_btns[0].title = "Volume"
    if(selected_mode == MODE_PRESSURE) in_channel_btns[0].title = "Pressure"

    var in_error = triggered_alarms();
    if(in_error)
    {
      if(alert_stamp)
      {
        var delta = new Date()-alert_stamp;
        alert_rate = delta/1000;
      }
      alert_t += alert_rate;
      alert_stamp = new Date();
    }
    else alert_t = 0;

    if(alert_t-0.1 > 0 && floor(alert_t)-floor(alert_t-0.1) > 0)
      beep_aud.play();

    if(blip_running)
    {
      if(blip_stamp)
      {
        var delta = new Date()-blip_stamp;
        blip_rate = delta/(12*1000);
      }
      blip_t += blip_rate;
      blip_stamp = new Date();
    }
    else blip_stamp = 0;

    var fulllen = patient_volume_graph.data.itime+patient_volume_graph.data.etime+patient_volume_graph.data.dtime;
    if(blip_t == blip_rate || floor(((blip_t-patient_volume_graph.data.itime)-blip_rate)/fulllen) != floor((blip_t-patient_volume_graph.data.itime)/fulllen))
    {
      var ibw;
      if(patient_sex == "M") ibw = 50  +2.3*(patient_height-(5*12));
      else                   ibw = 45.5+2.3*(patient_height-(5*12));
      var expected_volume = 0.007*ibw;

      out_peak_pressure_variance = out_peak_pressure_max_variance * rand0();
      norm_patient_peak_pressure = commit_in_volume/expected_volume * (0.155+norm_in_flow/20); //0.155 is ~ good readout
      norm_out_peak_pressure = norm_patient_peak_pressure + norm_patient_peak_pressure * out_peak_pressure_variance;
      out_peak_pressure = lerp(min_out_peak_pressure, max_out_peak_pressure, norm_out_peak_pressure);

      out_mean_pressure_variance = out_mean_pressure_max_variance * rand0();
      norm_patient_mean_pressure = commit_in_volume/expected_volume * 0.15; //0.15 is ~ good readout
      norm_out_mean_pressure = norm_patient_mean_pressure + norm_patient_mean_pressure * out_mean_pressure_variance;
      out_mean_pressure = lerp(min_out_mean_pressure, max_out_mean_pressure, norm_out_mean_pressure);

      out_rate_variance = out_rate_max_variance * rand0();
      norm_patient_rate = (commit_in_rate-min_in_rate)/(max_in_rate-min_in_rate);
      norm_out_rate = norm_patient_rate + norm_patient_rate * out_rate_variance;
      out_rate = lerp(min_out_rate, max_out_rate, norm_out_rate);

      out_exhale_volume_variance = out_exhale_volume_max_variance * rand0();
      norm_patient_exhale_volume = mapVal(min_out_exhale_volume, max_out_exhale_volume, 0, 1, commit_in_volume);
      norm_out_exhale_volume = norm_patient_exhale_volume + norm_patient_exhale_volume * out_exhale_volume_variance;
      out_exhale_volume = lerp(min_out_exhale_volume, max_out_exhale_volume, norm_out_exhale_volume);

      out_exhale_minute_volume_variance = out_exhale_minute_volume_max_variance * rand0();
      norm_patient_exhale_minute_volume = mapVal(min_out_exhale_minute_volume, max_out_exhale_minute_volume, 0, 1, out_rate*out_exhale_volume);
      norm_out_exhale_minute_volume = norm_patient_exhale_minute_volume + norm_patient_exhale_minute_volume * out_exhale_minute_volume_variance;
      out_exhale_minute_volume = lerp(min_out_exhale_minute_volume, max_out_exhale_minute_volume, norm_out_exhale_minute_volume);

      out_ie_ratio_variance = out_ie_ratio_max_variance * rand0();
      norm_patient_ie_ratio = (patient_volume_graph.data.etime+patient_volume_graph.data.dtime)/patient_volume_graph.data.itime;
      norm_out_ie_ratio = norm_patient_ie_ratio + norm_patient_ie_ratio * out_ie_ratio_variance;
      out_ie_ratio = lerp(min_out_ie_ratio, max_out_ie_ratio, norm_out_ie_ratio);

      update_alarms();
    }
    while(blip_t > 1) blip_t -= 1;
  };

  var strokeGraph = function(graph,max,mul)
  {
    var label_disp_y = graph.y+graph.h-(graph.h/max*mul);
    ctx.moveTo(graph.x,            label_disp_y);
    ctx.lineTo(graph.x+graph.w,label_disp_y);
    return label_disp_y;
  }

  var strokeMirrorGraph = function(graph,max,mul)
  {
    var label_disp_y = graph.y+graph.h/2+((graph.h/2)/max*mul);
    ctx.moveTo(graph.x,            label_disp_y);
    ctx.lineTo(graph.x+graph.w,label_disp_y);
    label_disp_y = graph.y+graph.h/2-((graph.h/2)/max*mul);
    ctx.moveTo(graph.x,            label_disp_y);
    ctx.lineTo(graph.x+graph.w,label_disp_y);
    return label_disp_y;
  }

  self.draw = function()
  {
    if(cur_screen == SCREEN_PATIENT)
    {
      ctx.fillStyle = light_blue;
      ctx.fillRect(0,0,bogus_canv.width,bogus_canv.height);
      ctx.fillStyle = white;
      ctx.drawImage(icon_patient_img,20,15,30,40);
      ctx.font = "30px Helvetica";
      ctx.fillText("patient info",70,45);
      ctx.fillStyle = dark_blue;
      ctx.font = "60px Helvetica";
      ctx.fillText(patient_name_primary,30,145);
      ctx.fillText(patient_name_secondary,30,220);
      ctx.strokeStyle = white;
      ctx.beginPath();
      ctx.moveTo(30,bogus_canv.height*2/5);
      ctx.lineTo(bogus_canv.width-60,bogus_canv.height*2/5);
      ctx.stroke();

      ctx.fillStyle = white;
      ctx.font = "22px Helvetica";
      ctx.fillText("Height",30,bogus_canv.height*2/5+40);
      ctx.fillStyle = dark_blue;
      ctx.font = "50px Helvetica";
      ctx.fillText(parseInt(patient_height/12)+"'"+(patient_height%12)+"\"",30,bogus_canv.height*2/5+100);

      ctx.fillStyle = white;
      ctx.font = "22px Helvetica";
      ctx.fillText("Sex",bogus_canv.width/2,bogus_canv.height*2/5+40);
      ctx.fillStyle = dark_blue;
      ctx.font = "50px Helvetica";
      ctx.fillText(patient_sex,bogus_canv.width/2,bogus_canv.height*2/5+100);

      ctx.fillStyle = white;
      ctx.font = "22px Helvetica";
      ctx.fillText("Weight",30,bogus_canv.height*2/5+150);
      ctx.fillStyle = dark_blue;
      ctx.font = "50px Helvetica";
      ctx.fillText(patient_weight+" lb",30,bogus_canv.height*2/5+210);

      ctx.fillStyle = white;
      ctx.font = "22px Helvetica";
      ctx.fillText("Age",bogus_canv.width/2,bogus_canv.height*2/5+150);
      ctx.fillStyle = dark_blue;
      ctx.font = "50px Helvetica";
      ctx.fillText(patient_age,bogus_canv.width/2,bogus_canv.height*2/5+210);

      ctx.fillStyle = white;
      ctx.font = "16px Helvetica";
      ctx.fillText(patient_description_0,30,bogus_canv.height*2/5+270);
      ctx.fillText(patient_description_1,30,bogus_canv.height*2/5+300);
      ctx.fillText(patient_description_2,30,bogus_canv.height*2/5+330);
      ctx.fillText(patient_description_3,30,bogus_canv.height*2/5+360);
      ctx.fillText(patient_description_4,30,bogus_canv.height*2/5+390);

      ctx.fillStyle = white;
      ctx.font = "30px Helvetica"
      ctx.fillText(x_btn.title,x_btn.x,x_btn.y+x_btn.h/2+18);
    }
    else if(cur_screen == SCREEN_ALARMS)
    {
      ctx.fillStyle = white;
      ctx.drawImage(icon_alarms_img,20,15,30,40);
      ctx.font = "30px Helvetica";
      ctx.fillStyle = dark_blue;
      ctx.fillText("alarms",70,45);

      pressure_alarm.draw();
      rate_alarm.draw();
      exhale_minute_volume_alarm.draw();
      apnea_alarm.draw();

      ctx.drawImage(knob_range_img,alarm_knob.x,alarm_knob.y,alarm_knob.w,alarm_knob.h);
      ctx.drawImage(knob_img,alarm_knob.x+10,alarm_knob.y+10,alarm_knob.w-20,alarm_knob.h-20);
      ctx.drawImage(knob_indicator_img,alarm_knob.x+alarm_knob.w/2+cos(alarm_knob.viz_theta)*alarm_knob.w/3.5-4,alarm_knob.y+alarm_knob.h/2+sin(alarm_knob.viz_theta)*alarm_knob.w/3.5-4,8,8);

      switch(selected_alarm)
      {
        case IN_ALARM_MIN_PRESSURE:             sub = fdisp(in_alarm_min_pressure,0)            +" cm H₂0";  title = "Min Pressure"; break;
        case IN_ALARM_MAX_PRESSURE:             sub = fdisp(in_alarm_max_pressure,0)            +" cm H₂0";  title = "Max Pressure"; break;
        case IN_ALARM_MIN_RATE:                 sub = fdisp(in_alarm_min_rate,0)                +" b/min";   title = "Min Rate"; break;
        case IN_ALARM_MAX_RATE:                 sub = fdisp(in_alarm_max_rate,0)                +" b/min";   title = "Max Rate"; break;
        case IN_ALARM_MIN_EXHALE_MINUTE_VOLUME: sub = fdisp(in_alarm_min_exhale_minute_volume,1)+" L/min";   title = "Min V̇E"; break;
        case IN_ALARM_MAX_EXHALE_MINUTE_VOLUME: sub = fdisp(in_alarm_max_exhale_minute_volume,1)+" L/min";   title = "Max V̇E"; break;
        case IN_ALARM_MIN_APNEA:                sub = fdisp(in_alarm_min_apnea,0)               +" seconds"; title = "Apnea"; break;
        case IN_ALARM_MAX_APNEA:                sub = fdisp(in_alarm_max_apnea,0)               +" seconds"; title = "Apnea"; break;
      }

      ctx.fillStyle = dark_blue;
      ctx.fillText(title,commit_alarm_btn.x,commit_alarm_btn.y-40);
      ctx.font = "22px Helvetica";
      ctx.fillText(sub,commit_alarm_btn.x,commit_alarm_btn.y-12);
      drawBtn(commit_alarm_btn);

      ctx.fillStyle = dark_blue;
      ctx.font = "30px Helvetica"
      ctx.fillText(x_btn.title,x_btn.x,x_btn.y+x_btn.h/2+18);
    }
    else if(cur_screen == SCREEN_NOTIF)
    {
      var y;
      var yd;
      var x;
      if(evaluate_patient())
      {
        if(evaluate_alarms())
        {
          exitNotificationScreenSettings();
        }
        else
        {
          exitNotificationScreenSettings();
        }
      }
      else
      {
        exitNotificationScreenSettings();
      }
      ctx.fillStyle = slate_gray;
      canv.fillRoundRect(x_btn.x-85,x_btn.y+5,x_btn.w+115,x_btn.h+5,5);
      ctx.fillStyle = white;
      ctx.font = "25px Helvetica"
      ctx.fillText(x_btn.title,x_btn.x-65,x_btn.y+x_btn.h/2+18);

      ctx.fillStyle = green;
      ctx.strokeStyle = white;
      canv.fillRoundRect(dismiss_submit_btn.x,dismiss_submit_btn.y,dismiss_submit_btn.w+20,dismiss_submit_btn.h,5);
      ctx.fillStyle = white;
      ctx.fillText(dismiss_submit_btn.title,dismiss_submit_btn.x+10,dismiss_submit_btn.y+dismiss_submit_btn.h/2+8);
    }
    else if(cur_screen == SCREEN_VENTILATOR)
    {
      ctx.lineWidth = 1;
      ctx.fillStyle = dark_blue;
      ctx.fillRect(0,0,bogus_canv.width,patient_flow_graph.y+patient_flow_graph.h);

      var y;
      var h;
      ctx.fillStyle = darken;

      ctx.fillRect(0,0,bogus_canv.width,patient_volume_graph.y);

      y = patient_volume_graph.y+patient_volume_graph.h;
      h = patient_pressure_graph.y-y;
      ctx.fillRect(0,y,bogus_canv.width,h);

      y = patient_pressure_graph.y+patient_pressure_graph.h;
      h = patient_flow_graph.y-y;
      ctx.fillRect(0,y,bogus_canv.width,h);

      var cur_graph;
      var label_disp_y;

      ctx.fillStyle = light_blue;
      ctx.font = "12px Helvetica";
      patient_volume_graph.draw(false);
      ctx.fillText("Volume",patient_volume_graph.x+10,patient_volume_graph.y+20);
      cur_graph = patient_volume_graph;
      var maxvol = commit_in_volume*patient_volume_graph.data.max_y;

      ctx.font = "12px Helvetica";
      if(maxvol > 0.25)
      {
        ctx.lineWidth = 0.25;
        ctx.strokeStyle = light_blue;
        ctx.beginPath();
        if(maxvol > 0.25) label_disp_y = strokeGraph(cur_graph,maxvol,0.25);
        if(maxvol > 0.5)  label_disp_y = strokeGraph(cur_graph,maxvol,0.5);
        if(maxvol > 0.75)                strokeGraph(cur_graph,maxvol,0.75);
        if(maxvol > 1.0)  label_disp_y = strokeGraph(cur_graph,maxvol,1.0);
        if(maxvol > 1.25)                strokeGraph(cur_graph,maxvol,1.25);
        if(maxvol > 1.5)  label_disp_y = strokeGraph(cur_graph,maxvol,1.5);
        if(maxvol > 1.75)                strokeGraph(cur_graph,maxvol,1.75);
        if(maxvol > 2.0)  label_disp_y = strokeGraph(cur_graph,maxvol,2.0);
        ctx.stroke();
        ctx.lineWidth = 1;
             if(maxvol > 2)   ctx.fillText("2.0",patient_volume_graph.x+patient_volume_graph.w-20,label_disp_y+5);
        else if(maxvol > 1.5) ctx.fillText("1.5",patient_volume_graph.x+patient_volume_graph.w-20,label_disp_y+5);
        else if(maxvol > 1)   ctx.fillText("1.0",patient_volume_graph.x+patient_volume_graph.w-20,label_disp_y+5);
        else if(maxvol > 0.5) ctx.fillText("0.5",patient_volume_graph.x+patient_volume_graph.w-20,label_disp_y+5);
        else if(maxvol > 0.25) ctx.fillText("0.25",patient_volume_graph.x+patient_volume_graph.w-25,label_disp_y+5);
      }
      else
        ctx.fillText(fdisp(maxvol,1),patient_volume_graph.x+patient_volume_graph.w-20,patient_volume_graph.y+12);
      ctx.fillText("0",patient_volume_graph.x+patient_volume_graph.w-20,patient_volume_graph.y+patient_volume_graph.h-2);

      patient_pressure_graph.draw(false);
      ctx.fillText("Pressure",patient_pressure_graph.x+10,patient_pressure_graph.y+20);
      cur_graph = patient_pressure_graph;
      var maxpress = lerp(min_out_peak_pressure, max_out_peak_pressure, norm_patient_peak_pressure)*patient_pressure_graph.data.max_y;

      ctx.font = "12px Helvetica";
      if(maxpress > 25)
      {
        ctx.lineWidth = 0.25;
        ctx.strokeStyle = light_blue;
        ctx.beginPath();
        if(maxpress > 10)                strokeGraph(cur_graph,maxpress,10);
        if(maxpress > 20) label_disp_y = strokeGraph(cur_graph,maxpress,20);
        if(maxpress > 30) label_disp_y = strokeGraph(cur_graph,maxpress,30);
        if(maxpress > 40)                strokeGraph(cur_graph,maxpress,40);
        if(maxpress > 50) label_disp_y = strokeGraph(cur_graph,maxpress,50);
        if(maxpress > 60)                strokeGraph(cur_graph,maxpress,60);
        if(maxpress > 70) label_disp_y = strokeGraph(cur_graph,maxpress,70);
        if(maxpress > 80)                strokeGraph(cur_graph,maxpress,80);
        ctx.stroke();
        ctx.lineWidth = 1;
             if(maxpress > 70) ctx.fillText("70",patient_pressure_graph.x+patient_pressure_graph.w-20,label_disp_y+5);
        else if(maxpress > 50) ctx.fillText("50",patient_pressure_graph.x+patient_pressure_graph.w-20,label_disp_y+5);
        else if(maxpress > 30) ctx.fillText("30",patient_pressure_graph.x+patient_pressure_graph.w-20,label_disp_y+5);
        else if(maxpress > 20) ctx.fillText("20",patient_pressure_graph.x+patient_pressure_graph.w-20,label_disp_y+5);
      }
      else
      {
        ctx.fillText(fdisp(maxpress,0),patient_pressure_graph.x+patient_pressure_graph.w-20,patient_pressure_graph.y+12);
      }
      ctx.fillText("0",patient_pressure_graph.x+patient_pressure_graph.w-20,patient_pressure_graph.y+patient_pressure_graph.h-2);

      patient_flow_graph.draw(true);
      ctx.fillText("Flow",patient_flow_graph.x+10,patient_flow_graph.y+20);
      cur_graph = patient_flow_graph;
      var maxflow = commit_in_flow*patient_flow_graph.data.max_y;

      ctx.font = "12px Helvetica";
      if(maxflow > 10)
      {
        ctx.lineWidth = 0.25;
        ctx.strokeStyle = light_blue;
        ctx.beginPath();
        if(maxflow > 10)  label_disp_y = strokeMirrorGraph(cur_graph,maxflow,10);
        if(maxflow > 20)  label_disp_y = strokeMirrorGraph(cur_graph,maxflow,20);
        if(maxflow > 30)  label_disp_y = strokeMirrorGraph(cur_graph,maxflow,30);
        if(maxflow > 40) label_disp_y = strokeMirrorGraph(cur_graph,maxflow,40);
        if(maxflow > 50) label_disp_y = strokeMirrorGraph(cur_graph,maxflow,50);
        if(maxflow > 100) label_disp_y = strokeMirrorGraph(cur_graph,maxflow,100);
        if(maxflow > 150) label_disp_y = strokeMirrorGraph(cur_graph,maxflow,150);
        ctx.stroke();
        ctx.lineWidth = 1;
             if(maxflow > 150) ctx.fillText("150",patient_flow_graph.x+patient_flow_graph.w-20,label_disp_y+5);
        else if(maxflow > 100) ctx.fillText("100",patient_flow_graph.x+patient_flow_graph.w-20,label_disp_y+5);
        else if(maxflow > 50) ctx.fillText("50",patient_flow_graph.x+patient_flow_graph.w-20,label_disp_y+5);
        else if(maxflow > 40)  ctx.fillText("40", patient_flow_graph.x+patient_flow_graph.w-20,label_disp_y+5);
        else if(maxflow > 30)  ctx.fillText("30", patient_flow_graph.x+patient_flow_graph.w-20,label_disp_y+5);
        else if(maxflow > 20)  ctx.fillText("20", patient_flow_graph.x+patient_flow_graph.w-20,label_disp_y+5);
        else if(maxflow > 10)  ctx.fillText("10", patient_flow_graph.x+patient_flow_graph.w-20,label_disp_y+5);
      }
      else
      {
        ctx.fillText(fdisp(maxflow,0),patient_flow_graph.x+patient_flow_graph.w-20,patient_flow_graph.y+12);
      }
      ctx.fillText("0",patient_flow_graph.x+patient_flow_graph.w-20,patient_flow_graph.y+patient_flow_graph.h/2+10);

      ctx.fillStyle = dark_blue;
      var start_x = patient_flow_graph.x+4;
      var end_x = patient_flow_graph.x+patient_flow_graph.w-10;
      for(var i = 0; i < 12; i+=3)
        ctx.fillText(i+"s", lerp(start_x,end_x, i/12), patient_flow_graph.y+patient_flow_graph.h+14);
      ctx.fillText(12+"s", end_x-10, patient_flow_graph.y+patient_flow_graph.h+14);

      ctx.font = "14px Helvetica";
      ctx.fillStyle = light_blue;
      ctx.fillText("Ventilator Output",out_channel_btns[0].x,out_channel_btns[0].y-10);
      var sub;
      for(var i = 0; i < out_channel_btns.length; i++)
      {
        if(!blip_running) sub = "-";
        else
        {
          switch(out_channel_btns[i].channel)
          {
            case OUT_CHANNEL_PEAK_PRESSURE:        sub = fdisp(out_peak_pressure,1); break;
            case OUT_CHANNEL_MEAN_PRESSURE:        sub = fdisp(out_mean_pressure,1);        break;
            case OUT_CHANNEL_RATE:                 sub = fdisp(out_rate,0);                 break;
            case OUT_CHANNEL_EXHALE_VOLUME:        sub = fdisp(out_exhale_volume,3).toFixed(3);        break;
            case OUT_CHANNEL_EXHALE_MINUTE_VOLUME: sub = fdisp(out_exhale_minute_volume,1); break;
            case OUT_CHANNEL_IE_RATIO:             sub = "1:"+fdisp(out_ie_ratio,1);      break;
          }
        }
        drawOutBtn(out_channel_btns[i],sub);
      }

      ctx.fillStyle = green;
      canv.fillRoundRect(in_channel_btns[selected_channel].x,in_channel_btns[selected_channel].y,in_channel_btns[selected_channel].w,in_channel_btns[selected_channel].h,5);

      var sub;
      var subsub;
      for(var i = 0; i < in_channel_btns.length; i++)
      {
        switch(in_channel_btns[i].channel)
        {
          case IN_CHANNEL_MODE:  sub = vol_disp(commit_in_volume,3)+" L";      subsub = vol_disp(in_volume,3)+" L";      break;
          case IN_CHANNEL_RATE:  sub = fdisp(commit_in_rate,  0)+" b/min";  subsub = fdisp(in_rate,  0)+" b/min";  break;
          case IN_CHANNEL_FLOW:  sub = fdisp(commit_in_flow,  0)+" l/min";  subsub = fdisp(in_flow,  0)+" l/min";  break;
          case IN_CHANNEL_OXY:   sub = fdisp(commit_in_oxy,   0)+"%";       subsub = fdisp(in_oxy,   0)+"%";       break;
          case IN_CHANNEL_ITIME: sub = fdisp(commit_in_itime, 1)+" sec";    subsub = fdisp(in_itime, 1)+" sec";    break;
          case IN_CHANNEL_PEEP:  sub = fdisp(commit_in_peep,  0)+" cm H₂0"; subsub = fdisp(in_peep,  0)+" cm H₂0"; break;
        }
        if(subsub != sub) drawInBtn(in_channel_btns[i],sub,subsub);
        else              drawInBtn(in_channel_btns[i],sub);
      }

      switch(in_channel_btns[selected_channel].channel)
      {
        case IN_CHANNEL_MODE:  sub = vol_disp(in_volume,3)+" L";      break;
        case IN_CHANNEL_RATE:  sub = fdisp(in_rate,  0)+" b/min";  break;
        case IN_CHANNEL_FLOW:  sub = fdisp(in_flow,  0)+" l/min";  break;
        case IN_CHANNEL_OXY:   sub = fdisp(in_oxy,   0)+"%";       break;
        case IN_CHANNEL_ITIME: sub = fdisp(in_itime, 1)+" sec";    break;
        case IN_CHANNEL_PEEP:  sub = fdisp(in_peep,  0)+" cm H₂0"; break;
      }
      ctx.fillStyle = white;
      ctx.fillText(in_channel_btns[selected_channel].title,commit_vent_btn.x,commit_vent_btn.y-40);
      ctx.font = "22px Helvetica";
      ctx.fillText(sub,commit_vent_btn.x,commit_vent_btn.y-12);
      drawBtn(commit_vent_btn);

      ctx.drawImage(knob_range_img,vent_knob.x,vent_knob.y,vent_knob.w,vent_knob.h);
      ctx.drawImage(knob_img,vent_knob.x+10,vent_knob.y+10,vent_knob.w-20,vent_knob.h-20);
      ctx.drawImage(knob_indicator_img,vent_knob.x+vent_knob.w/2+cos(vent_knob.viz_theta)*vent_knob.w/3.5-4,vent_knob.y+vent_knob.h/2+sin(vent_knob.viz_theta)*vent_knob.w/3.5-4,8,8);

      ctx.strokeStyle = gray;
      ctx.beginPath();
      ctx.moveTo(0,bogus_canv.height-80);
      ctx.lineTo(bogus_canv.width,bogus_canv.height-80);
      ctx.stroke();

      ctx.fillStyle = gray;
      ctx.font = "15px Helvetica";
      //ctx.drawImage(icon_patient_img,patient_btn.x+5,patient_btn.y,patient_btn.w-10,patient_btn.h-5);
      //ctx.fillText("patient info",patient_btn.x-17,patient_btn.y+patient_btn.h+12);
      ctx.drawImage(icon_alarms_img,alarms_btn.x+5,alarms_btn.y,alarms_btn.w-10,alarms_btn.h-5);
      ctx.fillText("Alarms",alarms_btn.x,alarms_btn.y+alarms_btn.h+12);
      ctx.fillStyle = green;
      canv.fillRoundRect(next_btn.x,next_btn.y,next_btn.w,next_btn.h,5);
      ctx.fillStyle = white;
      ctx.font = "22px Helvetica";
      ctx.fillText("Connect Patient",next_btn.x+8,next_btn.y+next_btn.h/2+7);

      ctx.font = "30px Helvetica";
      ctx.fillStyle = black;

    }
    if(alert_t)
    {
      ctx.fillStyle = "rgba(255,0,0,"+(psin(alert_t)/2)+")";
      ctx.fillRect(0,0,bogus_canv.width,bogus_canv.height);
    }
  };

  self.cleanup = function()
  {
  };

};

