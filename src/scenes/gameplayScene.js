var GamePlayScene = function(game, stage)
{
  var self = this;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;
  var n_ticks = 0;
  var cam = {wx:0,wy:0,ww:1,wh:2};

  //definition
  var ENUM;
  ENUM = 0;
  var MODE_VOLUME   = ENUM; ENUM++;
  var MODE_PRESSURE = ENUM; ENUM++;
  ENUM = 0;
  var OUT_CHANNEL_MODE    = ENUM; ENUM++;
  var OUT_CHANNEL_RATE    = ENUM; ENUM++;
  var OUT_CHANNEL_FLOW    = ENUM; ENUM++;
  var OUT_CHANNEL_OXY     = ENUM; ENUM++;
  var OUT_CHANNEL_TIMEOUT = ENUM; ENUM++;
  var OUT_CHANNEL_PEEP    = ENUM; ENUM++;
  ENUM = 0;
  var IN_CHANNEL_MODE    = ENUM; ENUM++;
  var IN_CHANNEL_RATE    = ENUM; ENUM++;
  var IN_CHANNEL_FLOW    = ENUM; ENUM++;
  var IN_CHANNEL_OXY     = ENUM; ENUM++;
  var IN_CHANNEL_TIMEOUT = ENUM; ENUM++;
  var IN_CHANNEL_PEEP    = ENUM; ENUM++;
  ENUM = 0;
  var GRAPH_TYPE_VOLUME   = ENUM; ENUM++;
  var GRAPH_TYPE_PRESSURE = ENUM; ENUM++;
  var GRAPH_TYPE_FLOW     = ENUM; ENUM++;

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
  var patient_compliance = 1;
  var patient_volume = 0;
  var patient_pressure = 0;

  //ui state
  var selected_graph_type = 0;
  var blip_t = 0;

  //ui
  var patient_volume_graph;
  var patient_pressure_graph;
  var patient_flow_graph;
  var my_knob;
  var out_channel_btns;
  var in_channel_btns;
  var graph_type_btns;
  var graph_type_btn;
  var commit_btn;

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
      if(i < self.pulse_pts/2-self.pulse_pts/20)
      {
        self.pulses[j][i] = pow(pcos((i/self.pulse_pts)*twopi-pi),0.5);
      }
      else if(i < self.pulse_pts/2+self.pulse_pts/20)
      {
        var t = mapVal(self.pulse_pts/2-self.pulse_pts/20,self.pulse_pts/2+self.pulse_pts/20,0,1,i);
        self.pulses[j][i] = lerp(pow(pcos((i/self.pulse_pts)*twopi-pi),0.5),pow(1-((i-self.pulse_pts/2)/(self.pulse_pts/2)),12)*0.5,t);
      }
      else
      {
        self.pulses[j][i] = pow(1-((i-self.pulse_pts/2)/(self.pulse_pts/2)),12)*0.5;
      }
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

  var graph_set = function()
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

    self.graph = new graph();
    self.commit_graph = new graph();

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

  var graph = function()
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
        self.cache.context.strokeStyle = "#000000";
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

      ctx.drawImage(self.cache,0,0,self.w*blip_t,self.h,self.x,self.y,self.w*blip_t,self.h);
      ctx.strokeStyle = "#000000";
      ctx.strokeRect(self.x,self.y,self.w,self.h);
    }
  }

  var btn_w = 0.12;
  var genGraphTypeBtn = function(type, title, x)
  {
    btn = new ButtonBox(0,0,0,0, function(){selected_graph_type = type; })
    btn.title = title;
    btn.wx = x;
    btn.wy = 0.2;
    btn.ww = btn_w;
    btn.wh = 0.1;
    screenSpace(cam,canv,btn);
    graph_type_btns[type] = btn;
  }
  var genOutChannelBtn = function(channel, title, x)
  {
    btn = new ButtonBox(0,0,0,0, function(){selected_channel = channel; })
    btn.channel = channel;
    btn.title = title;
    btn.wh = 0.1;
    btn.ww = btn_w;
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
  var drawBtn = function(btn,sub,subsub)
  {
    ctx.strokeRect(btn.x,btn.y,btn.w,btn.h);
    ctx.fillText(btn.title,btn.x+2,btn.y+btn.h/2-10);
    if(sub) ctx.fillText(sub,btn.x+2,btn.y+btn.h/2+5);
    if(subsub) ctx.fillText(subsub,btn.x+2,btn.y+btn.h/2+15);
  }

  var setup_graph_set = function(gs)
  {
    gs.wx = 0;
    gs.wy = 0.4;
    gs.ww = cam.ww-0.1;
    gs.wh = 0.2;
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

    patient_volume_graph = new graph_set();
    patient_volume_graph.data.pulse_from_i = 0;
    patient_volume_graph.data.pulse_t = 0;
    setup_graph_set(patient_volume_graph);
    patient_pressure_graph = new graph_set();
    patient_pressure_graph.data.pulse_from_i = 1;
    patient_pressure_graph.data.pulse_t = 0;
    setup_graph_set(patient_pressure_graph);
    patient_flow_graph = new graph_set();
    patient_flow_graph.data.pulse_from_i = 1;
    patient_flow_graph.data.pulse_t = 1;
    patient_flow_graph.data.min_y = -1.1;
    patient_flow_graph.data.max_y =  1.1;
    setup_graph_set(patient_flow_graph);

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
    my_knob.ww = 0.2;
    my_knob.wx = 0.5-(my_knob.ww/2)-0.05 - (0.15+0.05);
    my_knob.wh = 0.2;
    my_knob.wy = -0.5+(my_knob.wh/2)+0.05;
    screenSpace(cam,canv,my_knob);

    out_channel_btns = [];
    in_channel_btns = [];
    graph_type_btns = [];

    var x = -0.5+(btn_w/2)+0.05;
    var s = btn_w+0.02;
    genOutChannelBtn(OUT_CHANNEL_MODE,   "Volume", x); x += s;
    genOutChannelBtn(OUT_CHANNEL_RATE,   "Rate",   x); x += s;
    genOutChannelBtn(OUT_CHANNEL_FLOW,   "Flow",   x); x += s;
    genOutChannelBtn(OUT_CHANNEL_OXY,    "Oxygen", x); x += s;
    genOutChannelBtn(OUT_CHANNEL_TIMEOUT,"Timeout",x); x += s;
    genOutChannelBtn(OUT_CHANNEL_PEEP,   "PEEP",   x); x += s;
    x = -0.5+(btn_w/2)+0.05;
    genInChannelBtn(IN_CHANNEL_MODE,   "Volume", x); x += s;
    genInChannelBtn(IN_CHANNEL_RATE,   "Rate",   x); x += s;
    genInChannelBtn(IN_CHANNEL_FLOW,   "Flow",   x); x += s;
    genInChannelBtn(IN_CHANNEL_OXY,    "Oxygen", x); x += s;
    genInChannelBtn(IN_CHANNEL_TIMEOUT,"Timeout",x); x += s;
    genInChannelBtn(IN_CHANNEL_PEEP,   "PEEP",   x); x += s;
    x = -0.5+(btn_w/2)+0.05;
    genGraphTypeBtn(GRAPH_TYPE_VOLUME,   "Volume",   x); x += s;
    genGraphTypeBtn(GRAPH_TYPE_PRESSURE, "Pressure", x); x += s;
    genGraphTypeBtn(GRAPH_TYPE_FLOW,     "Flow",     x); x += s;

    commit_btn = new ButtonBox(0,0,0,0, function()
    {
      blip_t = 0;
      patient_volume_graph.commit();
      patient_pressure_graph.commit();
      patient_flow_graph.commit();
    });
    commit_btn.title = "Commit";
    commit_btn.ww = 0.15;
    commit_btn.wx = 0.5-(commit_btn.ww/2)-0.05;
    commit_btn.wh = 0.1;
    commit_btn.wy = -0.5+(commit_btn.wh/2)+0.05;
    screenSpace(cam,canv,commit_btn);

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

    for(var i = 0; i < in_channel_btns.length; i++)
      clicker.filter(in_channel_btns[i]);
    for(var i = 0; i < graph_type_btns.length; i++)
      clicker.filter(graph_type_btns[i]);
    clicker.filter(commit_btn);
    dragger.filter(my_knob);
    clicker.flush();
    dragger.flush();

    if(selected_mode == MODE_VOLUME)   in_channel_btns[0].title = "Volume"
    if(selected_mode == MODE_PRESSURE) in_channel_btns[0].title = "Pressure"

/*
    patient_volume_graph.data.wavelength = clamp(0.01,1,patient_volume_graph.data.wavelength+v);
    patient_volume_graph.data.spacing    = clamp(0,1,patient_volume_graph.data.spacing+v);
    patient_volume_graph.data.amplitude  = clamp(0,1,patient_volume_graph.data.amplitude+v);
    patient_volume_graph.update();
*/

    var in_error = false;
    if(in_error) alert_t += 0.1;
    else         alert_t = 0;

    blip_t += 0.001;
    if(blip_t > 1) blip_t = 0;
  };

  self.draw = function()
  {
    switch(selected_graph_type)
    {
      case GRAPH_TYPE_VOLUME:   patient_volume_graph.draw();   break;
      case GRAPH_TYPE_PRESSURE: patient_pressure_graph.draw(); break;
      case GRAPH_TYPE_FLOW:     patient_flow_graph.draw();     break;
    }

    ctx.fillStyle = "#AAAAAA";
    ctx.fillRect(in_channel_btns[selected_channel].x,in_channel_btns[selected_channel].y,in_channel_btns[selected_channel].w,in_channel_btns[selected_channel].h);
    ctx.fillRect(graph_type_btns[selected_graph_type].x,graph_type_btns[selected_graph_type].y,graph_type_btns[selected_graph_type].w,graph_type_btns[selected_graph_type].h);
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000"
    ctx.font = "10px Arial";
    ctx.fillText("Graph Display:",graph_type_btns[0].x,graph_type_btns[0].y-10);
    for(var i = 0; i < graph_type_btns.length; i++)
      drawBtn(graph_type_btns[i]);

    ctx.fillText("Output:",out_channel_btns[0].x,out_channel_btns[0].y-10);
    var sub;
    for(var i = 0; i < out_channel_btns.length; i++)
    {
           if(out_channel_btns[i].title == "Volume")  sub = fdisp(in_volume)+" L";
      else if(out_channel_btns[i].title == "Rate")    sub = fdisp(in_rate)+" b/m";
      else if(out_channel_btns[i].title == "Flow")    sub = fdisp(in_flow)+" l/m";
      else if(out_channel_btns[i].title == "Oxygen")  sub = fdisp(in_oxy)+"% O2";
      else if(out_channel_btns[i].title == "Timeout") sub = fdisp(in_timeout)+" s";
      else if(out_channel_btns[i].title == "PEEP")    sub = fdisp(in_peep)+"";
      drawBtn(out_channel_btns[i],sub);
    }

    ctx.fillText("Input:",in_channel_btns[0].x,in_channel_btns[0].y-10);
    var sub;
    for(var i = 0; i < in_channel_btns.length; i++)
    {
      switch(in_channel_btns[i].channel)
      {
        case IN_CHANNEL_MODE:    sub = fdisp(in_volume)+" L";  break;
        case IN_CHANNEL_RATE:    sub = fdisp(in_rate)+" b/m";  break;
        case IN_CHANNEL_FLOW:    sub = fdisp(in_flow)+" l/m";  break;
        case IN_CHANNEL_OXY:     sub = fdisp(in_oxy)+"% O2";   break;
        case IN_CHANNEL_TIMEOUT: sub = fdisp(in_timeout)+" s"; break;
        case IN_CHANNEL_PEEP:    sub = fdisp(in_peep)+"";      break;
      }
      drawBtn(in_channel_btns[i],sub);
    }

    drawBtn(commit_btn);

    my_knob.draw(canv);
    ctx.font = "30px Arial";
    ctx.fillStyle = "#000000";

    if(alert_t)
    {
      ctx.fillStyle = "rgba(255,0,0,"+(psin(alert_t)/2)+")";
      ctx.fillRect(0,0,canv.width,canv.height);
    }
  };

  self.cleanup = function()
  {
  };

};

