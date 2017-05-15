var GamePlayScene = function(game, stage)
{
  var self = this;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;
  var n_ticks = 0;
  var cam = {wx:0,wy:0,ww:1,wh:2};
  var my_graph;
  var my_knob;
  var selected_channel = 0;
  var channel_colors;
  var channel_btns;
  var alert_t;
  var clicker;
  var dragger;

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
    self.dirty = true;;

    self.genCache = function()
    {
      self.cache = GenIcon(self.w,self.h);
    }

    var channel = function(graph)
    {
      var self = this;
      self.data = [];
      self.data_pts = 100;
      self.data_from_i = 0;
      self.data_t = 0;
      self.min_y = -1;
      self.max_y =  1;
      self.error_ranges = [];

      self.delta = function(i)
      {
        graph.dirty = true;
        self.data_t += i;

        while(self.data_t > 1)
        {
          self.data_t -= 1;
          self.data_from_i++;
          while(self.data_from_i > self.data.length-2)
          {
            self.data_from_i--;
            self.data_t = 1;
          }
        }

        while(self.data_t < 0)
        {
          self.data_t += 1;
          self.data_from_i--;
          while(self.data_from_i < 0)
          {
            self.data_from_i++;
            self.data_t = 0;
          }
        }
      }
    }

    self.channels = [];
    var c;
    var j;

    c = new channel(self);
    c.data = [];
    c.data_pts = 100;
    c.data_from_i = 0;
    c.data_t = 0;
    c.min_y = -1;
    c.max_y = 1;

    c.data.push([]); for(var i = 0; i < c.data_pts; i++) c.data[c.data.length-1].push(sin(i/10));
    c.data.push([]); for(var i = 0; i < c.data_pts; i++) c.data[c.data.length-1].push(cos(i/10));
    c.data.push([]); for(var i = 0; i < c.data_pts; i++) c.data[c.data.length-1].push(i/100);
    c.data.push([]); for(var i = 0; i < c.data_pts; i++) c.data[c.data.length-1].push(sqrt(i));

    c.error_ranges.push({min:2.3,max:4});

    self.channels[0] = c;


    c = new channel(self);
    c.data = [];
    c.data_pts = 100;
    c.data_from_i = 0;
    c.data_t = 0;
    c.min_y = -1;
    c.max_y = 1;

    c.data.push([]); for(var i = 0; i < c.data_pts; i++) c.data[c.data.length-1].push((i/100));
    c.data.push([]); for(var i = 0; i < c.data_pts; i++) c.data[c.data.length-1].push((i/100)*2);
    c.data.push([]); for(var i = 0; i < c.data_pts; i++) c.data[c.data.length-1].push(pow((i/100),2));
    c.data.push([]); for(var i = 0; i < c.data_pts; i++) c.data[c.data.length-1].push(pow(2,(i/100)));

    self.channels[1] = c;

    self.draw = function()
    {
      if(self.dirty)
      {
        self.cache.context.clearRect(0,0,self.w,self.h);
        var c;
        var x;
        var y;
        for(var i = 0; i < self.channels.length; i++)
        {
          c = self.channels[i];
          self.cache.context.strokeStyle = "#000000";
          if(selected_channel == i)
            self.cache.context.strokeStyle = channel_colors[i];
          self.cache.context.beginPath();
          y = lerp(c.data[c.data_from_i][0],c.data[c.data_from_i+1][0],c.data_t);
          self.cache.context.moveTo(0, clamp(0,self.h,mapVal(c.min_y, c.max_y, self.h, 0, y)));
          for(var j = 1; j < c.data_pts; j++)
          {
            x = j/(c.data_pts-1);
            y = lerp(c.data[c.data_from_i][j],c.data[c.data_from_i+1][j],c.data_t);
            self.cache.context.lineTo(
              clamp(0,self.w,mapVal(      0,       1, 0,      self.w, x)),
              clamp(0,self.h,mapVal(c.min_y, c.max_y, self.h,      0, y))
            );
          }
          self.cache.context.stroke();
        }
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
    my_graph.wy = 0.4;
    my_graph.ww = cam.ww-0.1;
    my_graph.wh = my_graph.ww/2;
    screenSpace(cam,canv,my_graph);
    my_graph.genCache();

    my_knob = new KnobBox(0,0,0,0, 0,1,0.1,0,function(v)
    {
      my_graph.channels[selected_channel].delta(v);
    });
    my_knob.wx = -0.3;
    my_knob.wy = -0.1;
    my_knob.ww = 0.2;
    my_knob.wh = 0.2;
    screenSpace(cam,canv,my_knob);

    channel_btns = [];
    channel_colors = [];

    btn = new ButtonBox(0,0,0,0, function(){selected_channel = 0; my_graph.dirty = true;})
    btn.wx = -0.25;
    btn.wy = -0.5;
    btn.ww = 0.2;
    btn.wh = 0.2;
    screenSpace(cam,canv,btn);
    channel_btns.push(btn);
    channel_colors.push("#880000");

    btn = new ButtonBox(0,0,0,0, function(){selected_channel = 1; my_graph.dirty = true;})
    btn.wx = 0.;
    btn.wy = -0.5;
    btn.ww = 0.2;
    btn.wh = 0.2;
    screenSpace(cam,canv,btn);
    channel_btns.push(btn);
    channel_colors.push("#008800");

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
    for(var i = 0; i < my_graph.channels.length; i++)
    {
      var c = my_graph.channels[i];
      for(var j = 0; j < c.error_ranges.length; j++)
      {
        var v = c.data_from_i+c.data_t;
        if(v > c.error_ranges[j].min && v < c.error_ranges[j].max) in_error = true;
      }
    }
    if(in_error) alert_t += 0.1;
    else         alert_t = 0;
  };

  self.draw = function()
  {
    my_graph.draw();

    ctx.fillStyle = channel_colors[selected_channel];
    ctx.fillRect(channel_btns[selected_channel].x,channel_btns[selected_channel].y,channel_btns[selected_channel].w,channel_btns[selected_channel].h);
    ctx.strokeStyle = "#000000";
    for(var i = 0; i < channel_btns.length; i++)
      ctx.strokeRect(channel_btns[i].x,channel_btns[i].y,channel_btns[i].w,channel_btns[i].h);

    my_knob.draw(canv);
    var sel_c = my_graph.channels[selected_channel];
    ctx.font = "30px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(fdisp(sel_c.data_from_i+sel_c.data_t),my_knob.x+my_knob.w+20,my_knob.y+my_knob.h/2+10);

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

