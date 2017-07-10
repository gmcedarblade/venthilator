var GamePlayScene = function(game, stage)
{
  var self = this;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;
  var n_ticks = 0;
  var cam = {wx:0,wy:0,ww:1,wh:2};

  var light_blue = "#6096D4";
  var dark_blue  = "#00204A";
  var red        = "#EA4922";
  var green      = "#77AA2F";
  var yellow     = "#D5C047";
  var white      = "#FFFFFF";
  var black      = "#000000";
  var gray       = "#888888";

  var knob_range_img;
  var knob_img;
  var knob_indicator_img;
  var icon_patient_img;
  var icon_alarms_img;
  var icon_sad_face_img;

  //definition
  var ENUM;
  ENUM = 0;
  var MODE_VOLUME   = ENUM; ENUM++;
  var MODE_PRESSURE = ENUM; ENUM++;
  ENUM = 0;
  var OUT_CHANNEL_PEAK_PRESSURE        = ENUM; ENUM++;
  var OUT_CHANNEL_MEAN_PRESSURE        = ENUM; ENUM++;
  var OUT_CHANNEL_FREQ                 = ENUM; ENUM++;
  var OUT_CHANNEL_EXHALE_VOLUME        = ENUM; ENUM++;
  var OUT_CHANNEL_EXHALE_MINUTE_VOLUME = ENUM; ENUM++;
  var OUT_CHANNEL_IE_RATIO             = ENUM; ENUM++;
  ENUM = 0;
  var IN_CHANNEL_MODE    = ENUM; ENUM++;
  var IN_CHANNEL_RATE    = ENUM; ENUM++;
  var IN_CHANNEL_FLOW    = ENUM; ENUM++;
  var IN_CHANNEL_OXY     = ENUM; ENUM++;
  var IN_CHANNEL_TIMEOUT = ENUM; ENUM++;
  var IN_CHANNEL_PEEP    = ENUM; ENUM++;
  ENUM = 0;
  var SCREEN_PATIENT     = ENUM; ENUM++;
  var SCREEN_VENTHILATOR = ENUM; ENUM++;
  var SCREEN_ALARMS      = ENUM; ENUM++;
  var SCREEN_NOTIF       = ENUM; ENUM++;
  var SCREEN_COMPLETE    = ENUM; ENUM++;

  var min_in_volume = 0;
  var max_in_volume = 2000;
  var min_in_pressure = 1;
  var max_in_pressure = 2;
  var min_in_rate = 0;
  var max_in_rate = 40;
  var min_in_flow = 15;
  var max_in_flow = 100;
  var min_in_oxy = 21;
  var max_in_oxy = 100;
  var min_in_timeout = 0;
  var max_in_timeout = 1;
  var min_in_peep = 0;
  var max_in_peep = 1;

  var min_out_peak_pressure        = 0;
  var max_out_peak_pressure        = 1;
  var min_out_mean_pressure        = 0;
  var max_out_mean_pressure        = 1;
  var min_out_freq                 = 0;
  var max_out_freq                 = 1;
  var min_out_exhale_volume        = 0;
  var max_out_exhale_volume        = 1;
  var min_out_exhale_minute_volume = 0;
  var max_out_exhale_minute_volume = 1;
  var min_out_ie_ratio             = 0;
  var max_out_ie_ratio             = 1;

  var min_x_offset = 0;
  var max_x_offset = 1;
  var min_y_offset = 0;
  var max_y_offset = 1;
  var min_wavelength = 0.01;
  var max_wavelength = 0.5;
  var min_amplitude = 0;
  var max_amplitude = 1;
  var min_spacing = 0;
  var max_spacing = 1;

  //data
  var selected_mode = 0;
  var selected_channel = 0;
  var alert_t = 0;
  var norm_in_volume   = 0.5;
  var norm_in_pressure = 0.5;
  var norm_in_rate     = 0.8;
  var norm_in_flow     = 0.5;
  var norm_in_oxy      = 0.5;
  var norm_in_timeout  = 0.1;
  var norm_in_peep     = 0.;
  var in_volume   = lerp(min_in_volume,   max_in_volume,   norm_in_volume);
  var in_pressure = lerp(min_in_pressure, max_in_pressure, norm_in_pressure);
  var in_rate     = lerp(min_in_rate,     max_in_rate,     norm_in_rate);
  var in_flow     = lerp(min_in_flow,     max_in_flow,     norm_in_flow);
  var in_oxy      = lerp(min_in_oxy,      max_in_oxy,      norm_in_oxy);
  var in_timeout  = lerp(min_in_timeout,  max_in_timeout,  norm_in_timeout);
  var in_peep     = lerp(min_in_peep,     max_in_peep,     norm_in_peep);
  var commit_in_volume   = in_volume;
  var commit_in_pressure = in_pressure;
  var commit_in_rate     = in_rate;
  var commit_in_flow     = in_flow;
  var commit_in_oxy      = in_oxy;
  var commit_in_timeout  = in_timeout;
  var commit_in_peep     = in_peep;
  var norm_out_peak_pressure        = 0.5;
  var norm_out_mean_pressure        = 0.5;
  var norm_out_freq                 = 0.5;
  var norm_out_exhale_volume        = 0.5;
  var norm_out_exhale_minute_volume = 0.5;
  var norm_out_ie_ratio             = 0.5;
  var out_peak_pressure        = lerp(min_out_peak_pressure,        max_out_peak_pressure,        norm_out_peak_pressure);
  var out_mean_pressure        = lerp(min_out_mean_pressure,        max_out_mean_pressure,        norm_out_mean_pressure);
  var out_freq                 = lerp(min_out_freq,                 max_out_freq,                 norm_out_freq);
  var out_exhale_volume        = lerp(min_out_exhale_volume,        max_out_exhale_volume,        norm_out_exhale_volume);
  var out_exhale_minute_volume = lerp(min_out_exhale_minute_volume, max_out_exhale_minute_volume, norm_out_exhale_minute_volume);
  var out_ie_ratio             = lerp(min_out_ie_ratio,             max_out_ie_ratio,             norm_out_ie_ratio);
  var patient_compliance = 1;
  var patient_volume = 0;
  var patient_pressure = 0;
  var patient_height = 12*6+2;
  var patient_weight = 182;
  var patient_sex = "M";
  var patient_name_primary = "John";
  var patient_name_secondary = "Smith";

  //ui state
  var blip_t = 0;
  var cur_screen = 0;

  //ui
  var patient_volume_graph;
  var patient_pressure_graph;
  var patient_flow_graph;
  var my_knob;
  var out_channel_btns;
  var in_channel_btns;
  var commit_btn;
  var alarms_btn;
  var patient_btn;
  var next_btn;
  var x_btn;

  //filters
  var clicker;
  var dragger;

  // MODES

  //  lungs have different "compliance" (willingness to change in volume w/ increase of pressure)
  //  patient triggers via detected negative pressure
  //  also triggers via timeout

  //AC (assist control) (CMV, continuous manditory venthilation) common
  //  delivers specific volume
  //  outputs pressure to watch changes in compliance

  //PC (pressure control)
  //  delivers specific pressure
  //  outputs volume to watch changes in compliance

  //commit

  var evaluate_patient = function()
  {
    return false;
  }

  var graph_data = function()
  {
    var self = this;

    self.pulses = [];
    self.pulse_pts = 1000;
    var j = 0;
    //volume
    self.pulses[j] = [];
    for(var i = 0; i < self.pulse_pts; i++)
    {
      if(i < self.pulse_pts/2-self.pulse_pts/20)
      {
        self.pulses[j][i] = sqrt(pcos((i/self.pulse_pts)*twopi-pi));
      }
      else if(i < self.pulse_pts/2+self.pulse_pts/20)
      {
        var t = mapVal(self.pulse_pts/2-self.pulse_pts/20,self.pulse_pts/2+self.pulse_pts/20,0,1,i);
        self.pulses[j][i] = lerp(sqrt(pcos((i/self.pulse_pts)*twopi-pi)),pow(1-((i-self.pulse_pts/2)/(self.pulse_pts/2)),3),t);
      }
      else
      {
        self.pulses[j][i] = pow(1-((i-self.pulse_pts/2)/(self.pulse_pts/2)),3);
      }
    }
    j++;
    //pressure
    self.pulses[j] = [];
    for(var i = 0; i < self.pulse_pts; i++)
    {
        /*
      if(i < self.pulse_pts/2)
      {
        //should work, but pow doesn't like - numbers?
        var x = i/self.pulse_pts/2;
        var a = (x*16)-8;
        var b = 0.333;
        self.pulses[j][i] = 1+pow(a,b)/4;
      }
        */
      if(i < self.pulse_pts/4)
      {
        var x = i/(self.pulse_pts/4);
        var y = pow(x,8)/2;
        self.pulses[j][i] = y;
      }
      else if(i < self.pulse_pts/2)
      {
        var x = (i-self.pulse_pts/4)/(self.pulse_pts/4);
        var y = 1-pow((1-x),8)/2;
        self.pulses[j][i] = y;
      }
      else if(i < self.pulse_pts*3/4)
      {
        var x = (i-self.pulse_pts/2)/(self.pulse_pts/2);
        var y = pow((1-x*2),8);
        self.pulses[j][i] = y;
      }
      else
        self.pulses[j][i] = 0;
    }
    j++;
    //flow
    self.pulses[j] = [];
    self.pulses[j][0] = 0;
    for(var i = 1; i < self.pulse_pts-1; i++)
    {
      if(i < self.pulse_pts/2)
      {
        self.pulses[j][i] = 1;
      }
      else
      {
        self.pulses[j][i] = pow(-1+((i-self.pulse_pts/2)/(self.pulse_pts/2)),3);
      }
    }
    self.pulses[j][self.pulse_pts-1] = 0;
    j++;

    self.pulse_from_i = 0;
    self.pulse_t = 0;
    self.x_offset   = min_x_offset;
    self.y_offset   = min_y_offset;
    self.wavelength = lerp(min_wavelength,max_wavelength,0.5);
    self.amplitude  = lerp(min_amplitude,max_amplitude,0.5);
    self.spacing    = lerp(min_spacing,max_spacing,0.5);

    self.data = [];
    self.data_pts = 1000;
    self.min_y = -.1;
    self.max_y =  1.1;

    self.delta_pulse = function(amt)
    {
      self.pulse_t += amt;

      while(self.pulse_t > 1)
      {
        self.pulse_t -= 1;
        self.pulse_from_i++;
        while(self.pulse_from_i > self.pulses.length-2)
        {
          self.pulse_from_i--;
          self.pulse_t = 1;
        }
      }

      while(self.pulse_t < 0)
      {
        self.pulse_t += 1;
        self.pulse_from_i--;
        while(self.pulse_from_i < 0)
        {
          self.pulse_from_i++;
          self.pulse_t = 0;
        }
      }
    }
    self.sample_pulse = function(t)
    {
      var from_i = floor(t*self.pulse_pts);
      var to_i   = ceil(t*self.pulse_pts);
      var from = lerp(self.pulses[self.pulse_from_i][from_i],self.pulses[self.pulse_from_i+1][from_i],self.pulse_t);
      var to   = lerp(self.pulses[self.pulse_from_i][to_i],  self.pulses[self.pulse_from_i+1][to_i],  self.pulse_t);
      return lerp(from,to,t);
    }

    var gen_data_in_pulse = false;
    var gen_data_t_in_state = 0;
    var gen_data_advance_state = function()
    {
      var changed = true;
      while(changed)
      {
        changed = false;
        if( gen_data_in_pulse && gen_data_t_in_state > self.wavelength)
        {
          gen_data_in_pulse = !gen_data_in_pulse;
          gen_data_t_in_state -= self.wavelength;
          changed = true;
        }
        if(!gen_data_in_pulse && gen_data_t_in_state > self.spacing)
        {
          gen_data_in_pulse = !gen_data_in_pulse;
          gen_data_t_in_state -= self.spacing;
          changed = true;
        }
      }
    }
    self.gen_data = function()
    {
      gen_data_in_pulse = false;
      gen_data_t_in_state = self.x_offset;
      gen_data_advance_state();
      for(var i = 0; i < self.data_pts; i++)
      {
        if(gen_data_in_pulse)
          self.data[i] = self.sample_pulse(gen_data_t_in_state/self.wavelength)*self.amplitude+self.y_offset;
        else
          self.data[i] = self.sample_pulse(0)+self.y_offset;

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

    self.draw = function()
    {
      //self.graph.draw();
      self.commit_graph.draw();
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
    self.min_y = 0;
    self.max_y = 0;

    self.consume_data = function(gd)
    {
      self.data = gd.data;
      self.data_pts = gd.data_pts;
      self.min_y = gd.min_y;
      self.max_y = gd.max_y;
      self.dirty = true;
    }

    self.gen_cache = function() { self.cache = GenIcon(self.w,self.h); }

    self.draw = function()
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
            clamp(0,self.w,mapVal(      0,       1, 0,      self.w, x)),
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
      ctx.moveTo(self.x,       self.y+self.h/2);
      ctx.lineTo(self.x+self.w,self.y+self.h/2);
      ctx.moveTo(self.x,       self.y+self.h);
      ctx.lineTo(self.x+self.w,self.y+self.h);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.drawImage(self.cache,0,0,self.w*blip_t,self.h,self.x,self.y,self.w*blip_t,self.h);
    }
  }

  var out_btn_w = 0.15;
  var in_btn_w = 0.135;
  var btn_w = 0.12;
  var genOutChannelBtn = function(channel, title, x)
  {
    btn = new ButtonBox(0,0,0,0, function(){selected_channel = channel; })
    btn.channel = channel;
    btn.title = title;
    btn.wh = 0.1;
    btn.ww = out_btn_w;
    btn.wx = x;
    btn.wy = 0.75-(btn.ww/2)-0.05;
    screenSpace(cam,canv,btn);
    out_channel_btns[channel] = btn;
  }
  var genInChannelBtn = function(channel, title, x)
  {
    btn = new ButtonBox(0,0,0,0, function(){selected_channel = channel; })
    btn.channel = channel;
    btn.title = title;
    btn.wx = x;
    btn.wy = -0.1
    btn.ww = btn_w;
    btn.wh = 0.1;
    screenSpace(cam,canv,btn);
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
    ctx.fillStyle = light_blue;
    ctx.strokeStyle = light_blue;
    ctx.strokeRect(btn.x,btn.y,btn.w,btn.h);
    ctx.font = "10px Helvetica";
    ctx.fillText(btn.title,btn.x+2,btn.y+btn.h/2-10);
    ctx.font = "18px Helvetica";
    if(sub) ctx.fillText(sub,btn.x+2,btn.y+btn.h/2+8);
    if(subsub) ctx.fillText(subsub,btn.x+2,btn.y+btn.h/2+15);
  }
  var drawBtn = function(btn,sub,subsub)
  {
    ctx.fillStyle = dark_blue;
    ctx.fillRect(btn.x,btn.y,btn.w,btn.h);
    ctx.fillStyle = white;
    ctx.fillText(btn.title,btn.x+2,btn.y+btn.h/2);
    if(sub) ctx.fillText(sub,btn.x+2,btn.y+btn.h/2+5);
    if(subsub) ctx.fillText(subsub,btn.x+2,btn.y+btn.h/2+15);
  }

  var setup_graph_set = function(gs, i)
  {
    gs.wx = 0;
    gs.wh = 0.18;
    gs.ww = cam.ww;
    gs.wy = 0.5-(gs.wh*i*1.1);
    screenSpace(cam,canv,gs);
    gs.apply_size();

    gs.update();
    gs.commit();
  }

  var update_graphs = function()
  {
    for(var i = 0; i < 3; i++)
    {
      var cur_graph;
      switch(i)
      {
        case 0: cur_graph = patient_volume_graph;   cur_graph.data.x_offset = 0.2; break;
        case 1: cur_graph = patient_pressure_graph; break;
        case 2: cur_graph = patient_flow_graph;     cur_graph.data.x_offset = 0.3; break;
      }

           if(selected_mode == MODE_VOLUME)   cur_graph.data.amplitude = lerp(min_amplitude, max_amplitude, norm_in_volume);
      else if(selected_mode == MODE_PRESSURE) cur_graph.data.amplitude = lerp(min_amplitude, max_amplitude, norm_in_pressure);

      cur_graph.data.wavelength = lerp(min_wavelength, max_wavelength, norm_in_rate);
      cur_graph.data.spacing    = lerp(min_spacing,    max_spacing,    norm_in_timeout);
      cur_graph.data.y_offset   = lerp(min_y_offset,   max_y_offset,   norm_in_peep);
      cur_graph.update();
    }
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
    icon_alarms_img.src = "assets/icon-alarms.png"
    icon_patient_img = new Image();
    icon_patient_img.src = "assets/icon-patient.png"
    icon_sad_face_img = new Image();
    icon_sad_face_img.src = "assets/sad-face.png"


    patient_volume_graph = new graph_set(red);
    patient_volume_graph.data.pulse_from_i = 0;
    patient_volume_graph.data.pulse_t = 0;
    setup_graph_set(patient_volume_graph,0);
    patient_pressure_graph = new graph_set(yellow);
    patient_pressure_graph.data.pulse_from_i = 1;
    patient_pressure_graph.data.pulse_t = 0;
    setup_graph_set(patient_pressure_graph,1);
    patient_flow_graph = new graph_set(green);
    patient_flow_graph.data.pulse_from_i = 1;
    patient_flow_graph.data.pulse_t = 1;
    patient_flow_graph.data.min_y = -1.1;
    patient_flow_graph.data.max_y =  1.1;
    setup_graph_set(patient_flow_graph,2);

    my_knob = new KnobBox(0,0,0,0, -1,1,0.1,0,function(v)
    {
      switch(selected_channel)
      {
        case IN_CHANNEL_MODE:
               if(selected_mode == MODE_VOLUME)   norm_in_volume   = clamp(0, 1, norm_in_volume  +v);
          else if(selected_mode == MODE_PRESSURE) norm_in_pressure = clamp(0, 1, norm_in_pressure+v);
          in_volume   = lerp(min_in_volume,   max_in_volume,   norm_in_volume);
          in_pressure = lerp(min_in_pressure, max_in_pressure, norm_in_pressure);
          break;
        case IN_CHANNEL_RATE:
          norm_in_rate = clamp(0,1,norm_in_rate+v);
          in_rate = lerp(min_in_rate, max_in_rate, norm_in_rate);
          break;
        case IN_CHANNEL_FLOW:
          norm_in_flow = clamp(0,1,norm_in_flow+v);
          in_flow = lerp(min_in_flow, max_in_flow, norm_in_flow);
          break;
        case IN_CHANNEL_OXY:
          norm_in_oxy = clamp(0,1,norm_in_oxy+v);
          in_oxy = lerp(min_in_oxy, max_in_oxy, norm_in_oxy);
          break;
        case IN_CHANNEL_TIMEOUT:
          norm_in_timeout = clamp(0,1,norm_in_timeout+v);
          in_timeout = lerp(min_in_timeout, max_in_timeout, norm_in_timeout);
          break;
        case IN_CHANNEL_PEEP:
          norm_in_peep = clamp(0,1,norm_in_peep+v);
          in_peep = lerp(min_in_peep, max_in_peep, norm_in_peep);
          break;
      }
      update_graphs();

      my_knob.val = 0;
    });
    my_knob.ww = 0.3;
    my_knob.wh = 0.3;
    my_knob.wx = -0.28;
    my_knob.wy = -0.35;
    screenSpace(cam,canv,my_knob);

    out_channel_btns = [];
    in_channel_btns = [];

    var x = -0.5+(out_btn_w/2)+0.05;
    var s = out_btn_w+0.02;
    genOutChannelBtn(OUT_CHANNEL_PEAK_PRESSURE,        "PP"  /*"Peak Pressure"*/,        x); x += s;
    genOutChannelBtn(OUT_CHANNEL_MEAN_PRESSURE,        "MP"  /*"Mean Pressure"*/,        x); x += s;
    genOutChannelBtn(OUT_CHANNEL_FREQ,                 "Freq"/*"Frequency"*/,            x); x += s;
    genOutChannelBtn(OUT_CHANNEL_EXHALE_VOLUME,        "EV"  /*"Exhale Volume"*/,        x); x += s;
    genOutChannelBtn(OUT_CHANNEL_EXHALE_MINUTE_VOLUME, "EMV" /*"Exhale Minute Volume"*/, x); x += s;
    genOutChannelBtn(OUT_CHANNEL_IE_RATIO,             "E:I" /*"E:I"*/,                  x); x += s;
    x = -0.5+(in_btn_w/2)+0.05;
    s = in_btn_w+0.02;
    genInChannelBtn(IN_CHANNEL_MODE,   "Volume", x); x += s;
    genInChannelBtn(IN_CHANNEL_RATE,   "Rate",   x); x += s;
    genInChannelBtn(IN_CHANNEL_FLOW,   "Flow",   x); x += s;
    genInChannelBtn(IN_CHANNEL_OXY,    "Oxygen", x); x += s;
    genInChannelBtn(IN_CHANNEL_TIMEOUT,"Timeout",x); x += s;
    genInChannelBtn(IN_CHANNEL_PEEP,   "PEEP",   x); x += s;

    commit_btn = new ButtonBox(0,0,0,0, function()
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
      commit_in_timeout  = in_timeout;
      commit_in_peep     = in_peep;
    });
    commit_btn.title = "Commit Changes";
    commit_btn.ww = 0.4;
    commit_btn.wx = 0.15;
    commit_btn.wh = 0.08;
    commit_btn.wy = -0.42;
    screenSpace(cam,canv,commit_btn);

    x_btn = new ButtonBox(canv.width-50,30,40,40, function()
    {
      cur_screen = SCREEN_VENTHILATOR;
    });
    x_btn.title = "X";

    patient_btn = new ButtonBox(30,canv.height-65,40,40, function()
    {
      cur_screen = SCREEN_PATIENT;
    });
    patient_btn.title = "patient info";

    alarms_btn = new ButtonBox(120,canv.height-65,40,40, function()
    {
      cur_screen = SCREEN_ALARMS;
    });
    alarms_btn.title = "alarms";

    next_btn = new ButtonBox(canv.width-200,canv.height-65,180,40, function()
    {
      cur_screen = SCREEN_NOTIF;
    });
    next_btn.title = "Next Patient";


    alert_t = 0;

    update_graphs();
    patient_volume_graph.draw(false);
    patient_pressure_graph.draw(false);
    patient_flow_graph.draw(false);

    clicker = new Clicker({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});
  };

  self.tick = function()
  {
    n_ticks++;

    switch(cur_screen)
    {
      case SCREEN_VENTHILATOR:
        for(var i = 0; i < in_channel_btns.length; i++)
          clicker.filter(in_channel_btns[i]);
        clicker.filter(commit_btn);
        clicker.filter(patient_btn);
        clicker.filter(alarms_btn);
        clicker.filter(next_btn);
        dragger.filter(my_knob);
      break;
      case SCREEN_PATIENT:
      case SCREEN_ALARMS:
      case SCREEN_NOTIF:
        clicker.filter(x_btn);
      break;
    }
    clicker.flush();
    dragger.flush();

    if(selected_mode == MODE_VOLUME)   in_channel_btns[0].title = "Volume"
    if(selected_mode == MODE_PRESSURE) in_channel_btns[0].title = "Pressure"

    var in_error = false;
    if(in_error) alert_t += 0.1;
    else         alert_t = 0;

    blip_t += 0.001;
    if(blip_t > 1) blip_t = 0;
  };

  self.draw = function()
  {
    if(cur_screen == SCREEN_PATIENT)
    {
      ctx.fillStyle = light_blue;
      ctx.fillRect(0,0,canv.width,canv.height);
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
      ctx.moveTo(30,canv.height/2);
      ctx.lineTo(canv.width-60,canv.height/2);
      ctx.stroke();

      ctx.fillStyle = white;
      ctx.font = "22px Helvetica";
      ctx.fillText("Height",30,canv.height/2+40);
      ctx.fillStyle = dark_blue;
      ctx.font = "50px Helvetica";
      ctx.fillText(parseInt(patient_height/12)+"'"+(patient_height%12)+"\"",30,canv.height/2+100);

      ctx.fillStyle = white;
      ctx.font = "22px Helvetica";
      ctx.fillText("Sex",canv.width/2,canv.height/2+40);
      ctx.fillStyle = dark_blue;
      ctx.font = "50px Helvetica";
      ctx.fillText(patient_sex,canv.width/2,canv.height/2+100);

      ctx.fillStyle = white;
      ctx.font = "22px Helvetica";
      ctx.fillText("Weight",30,canv.height/2+190);
      ctx.fillStyle = dark_blue;
      ctx.font = "50px Helvetica";
      ctx.fillText(patient_weight+" lb",30,canv.height/2+250);

      ctx.fillStyle = white;
      ctx.font = "22px Helvetica";
      ctx.fillText("Something Else",canv.width/2,canv.height/2+190);
      ctx.fillStyle = dark_blue;
      ctx.font = "50px Helvetica";
      ctx.fillText(patient_weight,canv.width/2,canv.height/2+250);

      ctx.fillStyle = white;
      ctx.fillText("X",x_btn.x,x_btn.y+x_btn.h/2+18);
    }
    else if(cur_screen == SCREEN_ALARMS)
    {
      ctx.fillStyle = light_blue;
      ctx.fillRect(0,0,canv.width,canv.height);
      ctx.fillStyle = white;
      ctx.drawImage(icon_alarms_img,20,15,30,40);
      ctx.font = "30px Helvetica";
      ctx.fillText("alarms",70,45);

      ctx.fillStyle = white;
      ctx.fillText("X",x_btn.x,x_btn.y+x_btn.h/2+18);
    }
    else if(cur_screen == SCREEN_NOTIF)
    {
      if(evaluate_patient())
      {
        ctx.fillStyle = green;
        ctx.fillRect(0,0,canv.width,canv.height);
        ctx.fillStyle = white;
        ctx.font = "30px Helvetica";
        ctx.fillText("patient info",70,45);
      }
      else
      {
        ctx.fillStyle = red;
        ctx.fillRect(0,0,canv.width,canv.height);
        ctx.fillStyle = white;
        ctx.font = "30px Helvetica";
        //ctx.fillText("patient info",70,45);

      }

      ctx.fillStyle = white;
      ctx.fillText("X",x_btn.x,x_btn.y+x_btn.h/2+18);
    }
    else if(cur_screen == SCREEN_VENTHILATOR)
    {
      ctx.lineWidth = 1;
      ctx.fillStyle = dark_blue;
      ctx.fillRect(0,0,canv.width,patient_flow_graph.y+patient_flow_graph.h);
      ctx.fillStyle = light_blue;
      ctx.font = "15px Helvetica";
      patient_volume_graph.draw();
      ctx.fillText("Volume",patient_volume_graph.x+10,patient_volume_graph.y+20);
      patient_pressure_graph.draw();
      ctx.fillText("Pressure",patient_pressure_graph.x+10,patient_pressure_graph.y+20);
      patient_flow_graph.draw();
      ctx.fillText("Flow",patient_flow_graph.x+10,patient_flow_graph.y+20);

      ctx.font = "14px Helvetica";
      ctx.fillStyle = light_blue;
      ctx.fillText("Venthilator Output",out_channel_btns[0].x,out_channel_btns[0].y-10);
      var sub;
      for(var i = 0; i < out_channel_btns.length; i++)
      {
        switch(out_channel_btns[i].channel)
        {
          case OUT_CHANNEL_PEAK_PRESSURE:        sub = fdisp(out_peak_pressure); break;
          case OUT_CHANNEL_MEAN_PRESSURE:        sub = fdisp(out_mean_pressure); break;
          case OUT_CHANNEL_FREQ:                 sub = fdisp(out_freq); break;
          case OUT_CHANNEL_EXHALE_VOLUME:        sub = fdisp(out_exhale_volume); break;
          case OUT_CHANNEL_EXHALE_MINUTE_VOLUME: sub = fdisp(out_exhale_minute_volume); break;
          case OUT_CHANNEL_IE_RATIO:             sub = fdisp(out_ie_ratio); break;
        }
        drawOutBtn(out_channel_btns[i],sub);
      }

      ctx.fillStyle = dark_blue;
      ctx.fillRect(in_channel_btns[selected_channel].x,in_channel_btns[selected_channel].y,in_channel_btns[selected_channel].w,in_channel_btns[selected_channel].h);

      var sub;
      for(var i = 0; i < in_channel_btns.length; i++)
      {
        switch(in_channel_btns[i].channel)
        {
          case IN_CHANNEL_MODE:    sub = fdisp(commit_in_volume)+" L";  break;
          case IN_CHANNEL_RATE:    sub = fdisp(commit_in_rate)+" b/m";  break;
          case IN_CHANNEL_FLOW:    sub = fdisp(commit_in_flow)+" l/m";  break;
          case IN_CHANNEL_OXY:     sub = fdisp(commit_in_oxy)+"% O2";   break;
          case IN_CHANNEL_TIMEOUT: sub = fdisp(commit_in_timeout)+" s"; break;
          case IN_CHANNEL_PEEP:    sub = fdisp(commit_in_peep)+"";      break;
        }
        drawInBtn(in_channel_btns[i],sub);
      }

      switch(in_channel_btns[selected_channel].channel)
      {
        case IN_CHANNEL_MODE:    sub = fdisp(in_volume)+" L";  break;
        case IN_CHANNEL_RATE:    sub = fdisp(in_rate)+" b/m";  break;
        case IN_CHANNEL_FLOW:    sub = fdisp(in_flow)+" l/m";  break;
        case IN_CHANNEL_OXY:     sub = fdisp(in_oxy)+"% O2";   break;
        case IN_CHANNEL_TIMEOUT: sub = fdisp(in_timeout)+" s"; break;
        case IN_CHANNEL_PEEP:    sub = fdisp(in_peep)+"";      break;
      }
      ctx.fillStyle = dark_blue;
      ctx.fillText(in_channel_btns[selected_channel].title,commit_btn.x,commit_btn.y-40);
      ctx.fillText(sub,commit_btn.x,commit_btn.y-20);
      drawBtn(commit_btn);

      ctx.drawImage(knob_range_img,my_knob.x,my_knob.y,my_knob.w,my_knob.h);
      ctx.drawImage(knob_img,my_knob.x+10,my_knob.y+10,my_knob.w-20,my_knob.h-20);
      ctx.drawImage(knob_indicator_img,my_knob.x+my_knob.w/2+cos(my_knob.viz_theta)*my_knob.w/3.5-4,my_knob.y+my_knob.h/2+sin(my_knob.viz_theta)*my_knob.w/3.5-4,8,8);

      ctx.strokeStyle = gray;
      ctx.beginPath();
      ctx.moveTo(0,canv.height-80);
      ctx.lineTo(canv.width,canv.height-80);
      ctx.stroke();

      ctx.fillStyle = dark_blue;
      ctx.font = "15px Helvetica";
      ctx.drawImage(icon_patient_img,patient_btn.x+5,patient_btn.y,patient_btn.w-10,patient_btn.h-5);
      ctx.fillText("patient info",patient_btn.x-17,patient_btn.y+patient_btn.h+12);
      ctx.drawImage(icon_alarms_img,alarms_btn.x+5,alarms_btn.y,alarms_btn.w-10,alarms_btn.h-5);
      ctx.fillText("alarms",alarms_btn.x,alarms_btn.y+alarms_btn.h+12);
      ctx.fillStyle = light_blue;
      ctx.fillRect(next_btn.x,next_btn.y,next_btn.w,next_btn.h);
      ctx.fillStyle = white;
      ctx.font = "20px Helvetica";
      ctx.fillText("Next Patient",next_btn.x+10,next_btn.y+next_btn.h/2);

      ctx.font = "30px Helvetica";
      ctx.fillStyle = black;

      if(alert_t)
      {
        ctx.fillStyle = "rgba(255,0,0,"+(psin(alert_t)/2)+")";
        ctx.fillRect(0,0,canv.width,canv.height);
      }
    }
  };

  self.cleanup = function()
  {
  };

};

