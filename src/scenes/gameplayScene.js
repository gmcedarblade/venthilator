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
  var IN_CHANNEL_MODE    = ENUM; ENUM++;
  var IN_CHANNEL_RATE    = ENUM; ENUM++;
  var IN_CHANNEL_FLOW    = ENUM; ENUM++;
  var IN_CHANNEL_OXY     = ENUM; ENUM++;
  var IN_CHANNEL_TIMEOUT = ENUM; ENUM++;
  ENUM = 0;
  var GRAPH_TYPE_VOLUME   = ENUM; ENUM++;
  var GRAPH_TYPE_PRESSURE = ENUM; ENUM++;
  var GRAPH_TYPE_FLOW     = ENUM; ENUM++;
  ENUM = 0;
  var GRAPH_BASE       = ENUM; ENUM++;
  var GRAPH_DERIVATIVE = ENUM; ENUM++;

  var min_in_volume = 1;
  var max_in_volume = 2;
  var min_in_pressure = 1;
  var max_in_pressure = 2;
  var min_in_rate = 1;
  var max_in_rate = 2;
  var min_in_flow = 1;
  var max_in_flow = 2;
  var min_in_oxy = 1;
  var max_in_oxy = 2;
  var min_in_timeout = 1;
  var max_in_timeout = 2;

  //data
  var selected_mode = 0;
  var selected_channel = 0;
  var alert_t = 0;
  var in_volume = min_in_volume;
  var in_pressure = min_in_pressure;
  var in_rate = min_in_rate;
  var in_flow = min_in_flow;
  var in_oxy = min_in_oxy;
  var in_timeout = min_in_timeout;
  var patient_compliance = 1;
  var patient_volume = 0;
  var patient_pressure = 0;

  //ui state
  var selected_graph_type = 0;
  var selected_graph_mode = 0;

  //ui
  var patient_volume_graph;
  var deriv_graph;
  var commit_patient_volume_graph;
  var commit_deriv_graph;
  var my_knob;
  var channel_btns;
  var mode_btn;
  var graph_type_btn;
  var graph_mode_btn;
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
    self.pulses[j] = [];
    for(var i = 0; i < self.pulse_pts; i++)
      self.pulses[j][i] = pcos((i/self.pulse_pts)*twopi-pi);
    j++;
    self.pulses[j] = [];
    for(var i = 0; i < self.pulse_pts; i++)
      self.pulses[j][i] = -pcos((i/self.pulse_pts)*twopi-pi);
    j++;

    self.pulse_from_i = 0;
    self.pulse_t = 0;
    self.offset = 0.1;
    self.wavelength = 0.1;
    self.amplitude = 1.;
    self.spacing = 0.1;

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
      gen_data_t_in_state = self.offset;
      gen_data_advance_state();
      for(var i = 0; i < self.data_pts; i++)
      {
        if(gen_data_in_pulse)
          self.data[i] = self.sample_pulse(gen_data_t_in_state/self.wavelength)*self.amplitude;
        else
          self.data[i] = self.sample_pulse(0);

        gen_data_t_in_state += 1/self.data_pts;
        gen_data_advance_state();
      }
    }
    self.deriv_data = function(data)
    {
      for(var i = 0; i < self.data_pts-1; i++)
        self.data[i] = data.data[i+1]-data.data[i];
      self.data[self.data_pts-1] = self.data[self.data_pts-2];
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
    self.deriv_graph = new graph();
    self.commit_deriv_graph = new graph();

    self.data = new graph_data();
    self.data.gen_data();
    self.deriv_data = new graph_data();
    //self.deriv_data.min_y = -0.1;
    //self.deriv_data.max_y = 0.1;

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
      apply_size_graph(self.deriv_graph);
      apply_size_graph(self.commit_deriv_graph);
    }

    self.update = function()
    {
      self.data.gen_data();
      self.graph.consume_data(self.data);
      self.deriv_data.deriv_data(self.data);
      self.deriv_graph.consume_data(self.deriv_data);
    }
    self.commit = function()
    {
      self.commit_graph.consume_data(self.data);
      self.commit_deriv_graph.consume_data(self.deriv_data);
    }

    self.draw = function(deriv)
    {
      if(!deriv)
      {
        self.graph.draw();
        self.commit_graph.draw();
      }
      if(deriv)
      {
        self.deriv_graph.draw();
        self.commit_deriv_graph.draw();
      }
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

      ctx.drawImage(self.cache,self.x,self.y,self.w,self.h);
      ctx.strokeStyle = "#000000";
      ctx.strokeRect(self.x,self.y,self.w,self.h);
    }
  }

  var genBtn = function(channel, title, x)
  {
    btn = new ButtonBox(0,0,0,0, function(){selected_channel = channel; })
    btn.title = title;
    btn.wx = x;
    btn.wy = 0.1
    btn.ww = 0.15;
    btn.wh = 0.1;
    screenSpace(cam,canv,btn);
    channel_btns[channel] = btn;
  }
  var drawBtn = function(btn)
  {
    ctx.strokeRect(btn.x,btn.y,btn.w,btn.h);
    ctx.fillText(btn.title,btn.x+2,btn.y+btn.h/2+5);
  }

  self.ready = function()
  {
    cam.wh = isTo(canv.width,1,canv.height);

    patient_volume_graph = new graph_set();
    patient_volume_graph.wx = 0;
    patient_volume_graph.wy = 0.3;
    patient_volume_graph.ww = cam.ww-0.1;
    patient_volume_graph.wh = 0.2;
    screenSpace(cam,canv,patient_volume_graph);
    patient_volume_graph.apply_size();

    patient_volume_graph.update();
    patient_volume_graph.commit();

    my_knob = new KnobBox(0,0,0,0, -1,1,0.1,0,function(v)
    {
      switch(selected_channel)
      {
        case IN_CHANNEL_MODE:
               if(selected_mode == MODE_VOLUME)   in_volume   = clamp(min_in_volume,  max_in_volume,   in_volume  +v);
          else if(selected_mode == MODE_PRESSURE) in_pressure = clamp(min_in_pressure,max_in_pressure, in_pressure+v);
          patient_volume_graph.data.wavelength = clamp(0.01,1,patient_volume_graph.data.wavelength+v);
          break;
        case IN_CHANNEL_RATE:
          in_rate = clamp(min_in_rate,max_in_rate,in_rate+v);
          patient_volume_graph.data.spacing = clamp(0,1,patient_volume_graph.data.spacing+v);
          break;
        case IN_CHANNEL_FLOW:
          in_flow = clamp(min_in_flow,max_in_flow,in_flow+v);
          patient_volume_graph.data.amplitude = clamp(0,1,patient_volume_graph.data.amplitude+v);
          break;
        case IN_CHANNEL_OXY:
          in_oxy = clamp(min_in_oxy,max_in_oxy,in_oxy+v);
          break;
        case IN_CHANNEL_TIMEOUT:
          in_timeout = clamp(min_in_timeout,max_in_timeout,in_timeout+v);
          break;
      }
      my_knob.val = 0;
      patient_volume_graph.update();
    });
    my_knob.wx = -0.3;
    my_knob.wy = -0.1;
    my_knob.ww = 0.2;
    my_knob.wh = 0.2;
    screenSpace(cam,canv,my_knob);

    channel_btns = [];

    var x = -0.32;
    var s = 0.16;
    genBtn(IN_CHANNEL_MODE,   "Volume", x); x += s;
    genBtn(IN_CHANNEL_RATE,   "Rate",   x); x += s;
    genBtn(IN_CHANNEL_FLOW,   "Flow",   x); x += s;
    genBtn(IN_CHANNEL_OXY,    "Oxygen", x); x += s;
    genBtn(IN_CHANNEL_TIMEOUT,"Timeout",x); x += s;

    mode_btn = new ButtonBox(0,0,0,0, function(){ if(selected_mode == MODE_VOLUME) selected_mode = MODE_PRESSURE; else if(selected_mode == MODE_PRESSURE) selected_mode = MODE_VOLUME; })
    mode_btn.title = "Mode";
    mode_btn.wx = 0;
    mode_btn.wy = -0.5
    mode_btn.ww = 0.15;
    mode_btn.wh = 0.1;
    screenSpace(cam,canv,mode_btn);

    graph_mode_btn = new ButtonBox(0,0,0,0, function(){ if(selected_graph_mode == GRAPH_BASE) selected_graph_mode = GRAPH_DERIVATIVE; else if(selected_graph_mode == GRAPH_DERIVATIVE) selected_graph_mode = GRAPH_BASE; })
    graph_mode_btn.title = "Graph";
    graph_mode_btn.wx = 0;
    graph_mode_btn.wy = 0
    graph_mode_btn.ww = 0.15;
    graph_mode_btn.wh = 0.1;
    screenSpace(cam,canv,graph_mode_btn);

    commit_btn = new ButtonBox(0,0,0,0, function(){ patient_volume_graph.commit(); })
    commit_btn.title = "Commit";
    commit_btn.wx = 0.3;
    commit_btn.wy = -0.5
    commit_btn.ww = 0.15;
    commit_btn.wh = 0.1;
    screenSpace(cam,canv,commit_btn);

    alert_t = 0;

    clicker = new Clicker({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});
  };

  self.tick = function()
  {
    n_ticks++;

    for(var i = 0; i < channel_btns.length; i++)
      clicker.filter(channel_btns[i]);
    clicker.filter(mode_btn);
    clicker.filter(graph_mode_btn);
    clicker.filter(commit_btn);
    dragger.filter(my_knob);
    clicker.flush();
    dragger.flush();

    if(selected_mode == MODE_VOLUME)   channel_btns[0].title = "Volume"
    if(selected_mode == MODE_PRESSURE) channel_btns[0].title = "Pressure"

    var in_error = false;
    if(in_error) alert_t += 0.1;
    else         alert_t = 0;
  };

  self.draw = function()
  {
    if(selected_graph_mode == GRAPH_BASE)
      patient_volume_graph.draw();
    else if(selected_graph_mode == GRAPH_DERIVATIVE)
      patient_volume_graph.draw(1);

    ctx.fillStyle = "#000000"
    ctx.font = "10px Arial";
    ctx.fillText(fdisp(patient_volume_graph.data.wavelength),10,20);
    ctx.fillText(fdisp(patient_volume_graph.data.amplitude),40,20);
    ctx.fillText(fdisp(patient_volume_graph.data.spacing),70,20);
    ctx.fillText(fdisp(patient_volume_graph.data.offset),100,20);
    ctx.fillText(fdisp(patient_volume_graph.data.pulse_from_i+patient_volume_graph.data.pulse_t),140,20);

    ctx.fillStyle = "#AAAAAA";
    ctx.fillRect(channel_btns[selected_channel].x,channel_btns[selected_channel].y,channel_btns[selected_channel].w,channel_btns[selected_channel].h);
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000"
    ctx.font = "10px Arial";
    for(var i = 0; i < channel_btns.length; i++)
      drawBtn(channel_btns[i]);

    drawBtn(mode_btn);
    drawBtn(graph_mode_btn);
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

