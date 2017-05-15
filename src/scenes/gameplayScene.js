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

    var channel = function()
    {
      var self = this;
      self.data = [];
      self.data_layers = 0;
      self.data_pts = 100;
      self.data_from_i = 0;
      self.data_t = 0;
      self.min_y = -1;
      self.max_y =  1;

      self.delta = function(i)
      {
        self.data_t += i;

        while(self.data_t > 1)
        {
          self.data_t -= 1;
          self.data_from_i++;
          while(self.data_from_i > self.data_layers-2)
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

    c = new channel();
    c.data = [];
    c.data_pts = 100;
    c.data_from_i = 0;
    c.data_t = 0;
    c.min_y = -1;
    c.max_y = 1;

    c.data[c.data_layers] = []; for(var i = 0; i < c.data_pts; i++) c.data[c.data_layers].push(sin(i/10));
    c.data_layers++;
    c.data[c.data_layers] = []; for(var i = 0; i < c.data_pts; i++) c.data[c.data_layers].push(cos(i/10));
    c.data_layers++;
    c.data[c.data_layers] = []; for(var i = 0; i < c.data_pts; i++) c.data[c.data_layers].push(i/100);
    c.data_layers++;
    c.data[c.data_layers] = []; for(var i = 0; i < c.data_pts; i++) c.data[c.data_layers].push(sqrt(i));
    c.data_layers++;

    self.channels[0] = c;

    self.draw = function()
    {
      var c;
      var x;
      var y;
      for(var i = 0; i < self.channels.length; i++)
      {
        c = self.channels[i];
        ctx.beginPath();
        y = lerp(c.data[c.data_from_i][0],c.data[c.data_from_i+1][0],c.data_t);
        ctx.moveTo(self.x, clamp(self.y,self.y+self.h,mapVal(c.min_y, c.max_y, self.y+self.h, self.y, y)));
        for(var j = 1; j < c.data_pts; j++)
        {
          x = j/(c.data_pts-1);
          y = lerp(c.data[c.data_from_i][j],c.data[c.data_from_i+1][j],c.data_t);
          ctx.lineTo(
            clamp(self.x,self.x+self.w,mapVal(      0,       1, self.x,        self.x+self.w, x)),
            clamp(self.y,self.y+self.h,mapVal(c.min_y, c.max_y, self.y+self.h, self.y,        y))
          );
        }
        ctx.stroke();
      }
    }
  }

  self.ready = function()
  {
    cam.wh = isTo(canv.width,1,canv.height);

    my_graph = new graph();
    my_graph.wx = 0;
    my_graph.wy = 0;
    my_graph.ww = cam.ww;
    my_graph.wh = my_graph.ww/2;
    screenSpace(cam,canv,my_graph);

    my_knob = new KnobBox(0,0,0,0, 0,1,0.1,0,function(v)
    {
      for(var i = 0; i < my_graph.channels.length; i++)
        my_graph.channels[i].delta(v);
    });
    my_knob.wx = -0.25;
    my_knob.wy = 0.5;
    my_knob.ww = 0.1;
    my_knob.wh = 0.1;
    screenSpace(cam,canv,my_knob);

    dragger = new Dragger({source:stage.dispCanv.canvas});

  };

  self.tick = function()
  {
    n_ticks++;

    dragger.filter(my_knob);
    dragger.flush();

  };

  self.draw = function()
  {
    my_graph.draw();
    my_knob.draw(canv);
  };

  self.cleanup = function()
  {
  };

};

