var GamePlayScene = function(game, stage)
{
  var self = this;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;
  var n_ticks = 0;
  var cam = {wx:0,wy:0,ww:1,wh:2};
  var my_graph;
  var deriv_graph;
  var my_data;
  var deriv_data;
  var my_knob;
  var selected_channel = 0;
  var channel_btns;
  var alert_t;
  var clicker;
  var dragger;

  var ENUM;
  ENUM = 0;
  var CHANNEL_WAVELENGTH = ENUM; ENUM++;
  var CHANNEL_AMPLITUDE  = ENUM; ENUM++;
  var CHANNEL_SPACING    = ENUM; ENUM++;
  var CHANNEL_OFFSET     = ENUM; ENUM++;
  var CHANNEL_PULSE      = ENUM; ENUM++;

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

  self.ready = function()
  {
    cam.wh = isTo(canv.width,1,canv.height);

    my_graph = new graph();
    my_graph.wx = 0;
    my_graph.wy = 0.3;
    my_graph.ww = cam.ww-0.1;
    my_graph.wh = 0.2;
    screenSpace(cam,canv,my_graph);
    my_graph.gen_cache();

    deriv_graph = new graph();
    deriv_graph.wx = 0;
    deriv_graph.wy = 0.52;
    deriv_graph.ww = cam.ww-0.1;
    deriv_graph.wh = 0.2;
    screenSpace(cam,canv,deriv_graph);
    deriv_graph.gen_cache();

    my_data = new graph_data();
    my_data.gen_data();
    deriv_data = new graph_data();
    deriv_data.min_y = -0.1;
    deriv_data.max_y = 0.1;
    deriv_data.deriv_data(my_data);
    my_graph.consume_data(my_data);
    deriv_graph.consume_data(deriv_data);

    my_knob = new KnobBox(0,0,0,0, -1,1,0.1,0,function(v)
    {
      switch(selected_channel)
      {
        case CHANNEL_WAVELENGTH:
          my_data.wavelength = clamp(0.01,1,my_data.wavelength+v);
          break;
        case CHANNEL_AMPLITUDE:
          my_data.amplitude = clamp(0,1,my_data.amplitude+v);
          break;
        case CHANNEL_SPACING:
          my_data.spacing = clamp(0,1,my_data.spacing+v);
          break;
        case CHANNEL_OFFSET:
          my_data.offset = clamp(-1,1,my_data.offset+v);
          break;
        case CHANNEL_PULSE:
          my_data.delta_pulse(v);
          break;
      }
      my_knob.val = 0;
      my_data.gen_data();
      deriv_data.deriv_data(my_data);
      my_graph.consume_data(my_data);
      deriv_graph.consume_data(deriv_data);
    });
    my_knob.wx = -0.3;
    my_knob.wy = -0.1;
    my_knob.ww = 0.2;
    my_knob.wh = 0.2;
    screenSpace(cam,canv,my_knob);

    channel_btns = [];

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

    var x = -0.32;
    var s = 0.16;
    genBtn(CHANNEL_WAVELENGTH,"wavelength",x); x += s;
    genBtn(CHANNEL_AMPLITUDE,"amplitude",x); x += s;
    genBtn(CHANNEL_SPACING,"spacing",x); x += s;
    genBtn(CHANNEL_OFFSET,"offset",x); x += s;
    genBtn(CHANNEL_PULSE,"pulse",x); x += s;

    alert_t = 0;

    clicker = new Clicker({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});
  };

  self.tick = function()
  {
    n_ticks++;

    for(var i = 0; i < channel_btns.length; i++)
      clicker.filter(channel_btns[i]);
    dragger.filter(my_knob);
    clicker.flush();
    dragger.flush();

    var in_error = false;
    if(in_error) alert_t += 0.1;
    else         alert_t = 0;
  };

  self.draw = function()
  {
    my_graph.draw();
    deriv_graph.draw();

    ctx.fillStyle = "#000000"
    ctx.font = "10px Arial";
    ctx.fillText(fdisp(my_data.wavelength),10,20);
    ctx.fillText(fdisp(my_data.amplitude),40,20);
    ctx.fillText(fdisp(my_data.spacing),70,20);
    ctx.fillText(fdisp(my_data.offset),100,20);
    ctx.fillText(fdisp(my_data.pulse_from_i+my_data.pulse_t),140,20);

    ctx.fillStyle = "#AAAAAA";
    ctx.fillRect(channel_btns[selected_channel].x,channel_btns[selected_channel].y,channel_btns[selected_channel].w,channel_btns[selected_channel].h);
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000"
    ctx.font = "10px Arial";
    for(var i = 0; i < channel_btns.length; i++)
    {
      ctx.strokeRect(channel_btns[i].x,channel_btns[i].y,channel_btns[i].w,channel_btns[i].h);
      ctx.fillText(channel_btns[i].title,channel_btns[i].x+2,channel_btns[i].y+channel_btns[i].h/2+5);
    }

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

