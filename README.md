# Custom ARISE Virtual Ventilator Documentation #

---

By: Greg Cedarblade

Created:01/17/2018   Updated:01/19/2018

Languages: HTML, CSS, JavaScript

Developed for the Act 4 Healthcare ARISE project, for use in ARISE simulation scenarios involving a Ventilator and for use in the ARISE Serious Games.

---

## Features ##

---

This customization simulates a ventilator machine. The ventilator allows users to pratice setting ventilator settings and alarms, along with changing the settings if required by orders while the virtual machine is running. 

This customization has been modified from its original programming depending on the requirements needed for each scenario or game.

---

## Using the ARISE Virtual Ventilator Customizatoin Code ##

---

#### index page ####

The index page is what displays the virtual ventilator and links all the JavaScript code together.

There are 29 different JavaScript scripts that are linked in the HTML that are all required for the virtual ventilator to function.

There are two more sections of embedded JavaScript in the index HTML.
 - The first checks to see if the JavaScript and ARIS are ready and also holds the functions for beginning and passing/failing functions
 - The pass/fail functions give the player in ARIS an item depending on if they pass or fail. These item names will need to be changed depending on what item you want to give to the player if they pass or fail.

 ```javascript
function playerSuccess() {
    var ventPass = 'nameOfPassItem';
    var ventPass = ARIS.cache.idForItemName(ventPass);
    ARIS.givePlayerItemCount(ventPass,1);
    ARIS.exit();
}

function playerFailure() {
    var ventFail = 'ventFail';
    var ventFail = ARIS.cache.idForItemName(ventFail);
    ARIS.givePlayerItemCount(ventFail,1);
    ARIS.exit();
}
 ```

 -The second is the code needed for saving user settings in the virtual ventilator.

 ```javascript
    var playerVolume = 0;
    var playerPressure = 0;
    var playerRate = 0;
    var playerFlow = 0;
    var playerOxygen = 0;
    var playerITime = 0;
    var playerPeep = 0;

    //Variables for the JSON object
    var myObject, myJSON, text, object;

    function getVentSettings(setVolume, setPressure, setRate, setFlow, setOxygen, setITime, setPeep) {

    playerVolume = setVolume;
    playerPressure = setPressure;
    playerRate = setRate;
    playerFlow = setFlow;
    playerOxygen = setOxygen;
    playerITime = setITime;
    playerPeep = setPeep;

    //Storing data
    myObject = { "volume":playerVolume, "pressure":playerPressure,      "rate":playerRate, "flow":playerFlow, "oxygen":playerOxygen, "itime":playerITime, "peep":playerPeep };
    myJSON = JSON.stringify(myObject);
    localStorage.setItem("ventPlayerSet", myJSON);

    }

    //Retrieving data
    text = localStorage.getItem("ventPlayerSet");
    object = JSON.parse(text);
 ```

---

#### gameplayScene.js ####
----

gameplayScene.js contains the code that can be manipulated to change the functionality of the ventilator.

In gameplayScene.js we are able to set the appearance, max and min values (predetermined or last saved by user input), and what values need to be
 checked against user inputs.

 - The first spot is where we are able to set the virtual ventilator to what ever the user sets the ventilator settings to or a predeterminded value we want them to start with.

 ```javascript
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
 ```

 -The second bit of code directly after these variables is where we set the max and min of the alarms the user last saved, or set the predetermined values of the alarms.

 ```javascript
    var norm_in_alarm_min_pressure             = mapVal(min_in_alarm_pressure,             max_in_alarm_pressure,             0,1, localStorage.getItem("alarmPlayerSet") ? alarmParse.minPressureAlarm:0);

    var norm_in_alarm_max_pressure             = mapVal(min_in_alarm_pressure,             max_in_alarm_pressure,             0,1, localStorage.getItem("alarmPlayerSet") ? alarmParse.maxPressureAlarm:80);

    var norm_in_alarm_min_rate                 = mapVal(min_in_alarm_rate,                 max_in_alarm_rate,                 0,1, localStorage.getItem("alarmPlayerSet") ? alarmParse.minRateAlarm:0);

    var norm_in_alarm_max_rate                 = mapVal(min_in_alarm_rate,                 max_in_alarm_rate,                 0,1, localStorage.getItem("alarmPlayerSet") ? alarmParse.maxRateAlarm:60);

    var norm_in_alarm_min_exhale_minute_volume = mapVal(min_in_alarm_exhale_minute_volume, max_in_alarm_exhale_minute_volume, 0,1, localStorage.getItem("alarmPlayerSet") ? alarmParse.minFlowAlarm:0);

    var norm_in_alarm_max_exhale_minute_volume = mapVal(min_in_alarm_exhale_minute_volume, max_in_alarm_exhale_minute_volume, 0,1, localStorage.getItem("alarmPlayerSet") ? alarmParse.maxFlowAlarm:45);

    var norm_in_alarm_min_apnea                = mapVal(min_in_alarm_apnea               , max_in_alarm_apnea               , 0,1, localStorage.getItem("alarmPlayerSet") ? alarmParse.minApneaAlarm:-999999);

    var norm_in_alarm_max_apnea                = mapVal(min_in_alarm_apnea               , max_in_alarm_apnea               , 0,1, localStorage.getItem("alarmPlayerSet") ? alarmParse.maxApneaAlarm:45);
 ```

 -This next variable is use for letting the virtual ventilator know if it should be running or not. Depending on the scenario, we have used this as its default of 0 or 1 if we need the ventilator to be running. If the user has saved settings then the variable will be set to 1 so that it will be running when they come back to the virtual ventilator if they have gone off to view other material in the scenario or serious game.

 ```javascript
 //sets blip_running to true if the JSON object is set, false if not.
  var blip_running = localStorage.getItem("ventPlayerSet") ? 1:0;
 ```

 -Now let's take a look at the function evaluate_patient. In this function, we only worry about the checks that are done in the last part of the function. These IF statements check the volume, rate, oxygen, and peep settings that the user inputs in the virtual ventilator on the main ventilator page. These statements check against the max and min values in the condition, and if the user input falls outside of the min and max values, it will return false for the setting(s). False will result in the user receiving a fail item, determined in the index.html. If the user inputs remain inside the min and max parameters, the function returns true allowing the user to receive the pass item determined in the index.html.

 **Note:** There are some virtual ventilator games where the ventilator settings are done in two different steps, and a few that are done all in one step.

 ```javascript
     if(fdisp(in_volume, 3) < 0.600 || fdisp(in_volume, 3) > 0.600) { console.log("vol");  return false; }
    if(fdisp(in_rate, 1) < 17.5 || fdisp(in_rate,1) > 24.5) { console.log("rate");  return false; }
    if(fdisp(in_peep, 1) < 8 || fdisp(in_peep,1) > 8) { console.log("peep"); return false; }
    if(fdisp(in_oxy, 2) < 39.5 || fdisp(in_oxy, 2) > 55.5) { console.log("oxy");  return false; }
 ```

 -The next function is evaluate_alarms. In this function, like in the previous function, we only worry about the IF statements. These check what the user sets the max and min values of the alarms too. The user receives a pass or fail depending on if they go outside the set max and min values for pressure, rate, ve, and apnea.

 ```javascript
    if(fdisp(in_alarm_max_pressure,0)             > 40.1 || fdisp(in_alarm_max_pressure,0)             < 33.9) { console.log("pressure alarm max"); return false; }

    if(fdisp(in_alarm_min_pressure,0)             > 21.1 || fdisp(in_alarm_min_pressure,0)             < 14.9) { console.log("pressure alarm min"); return false; }

    if(fdisp(in_alarm_max_rate,0)                 > 30.1 || fdisp(in_alarm_max_rate,0)                 < 17.9) { console.log("rate alarm max");     return false; }

    if(fdisp(in_alarm_min_rate,0)                 > 12.1 || fdisp(in_alarm_min_rate,0)                 <  3.9) { console.log("rate alarm min");     return false; }

    if(fdisp(in_alarm_max_exhale_minute_volume,1) > 16.1 || fdisp(in_alarm_max_exhale_minute_volume,1) < 11.9) { console.log("emv alarm max");      return false; }

    if(fdisp(in_alarm_min_exhale_minute_volume,1) >  6.1 || fdisp(in_alarm_min_exhale_minute_volume,1) <  3.9) { console.log("emv alarm min");      return false; }

    if(fdisp(in_alarm_max_apnea,0)                > 20.1) { console.log("apnea alarm max");      return false; }
 ```

-In the alarm function, there is a function called self.draw. This function is where we can change how the alarm screen looks.

```javascript
self.draw = function() {
    // code for styling for alarm page
    ctx.strokeStyle = black;
    ctx.fillStyle = light_gray;
    ctx.strokeRect(self.x,self.y,self.w,self.h);
    ctx.fillRect(self.x,self.y,self.w,self.h);

    ctx.textAlign = "center";
    ctx.fillStyle = black;
    ctx.font = "20px Helvetica";
    ctx.fillStyle = black;
    ctx.fillText(title,self.x,self.y-70);
    ctx.font = "14px Helvetica";
    ctx.fillText(label,self.x,self.y-50);

    ctx.textAlign = "left";
    ctx.fillStyle = green;
    if(min_selected()) {                                
    canv.fillRoundRect(self.min_box.x,self.min_box.y,self.min_box.w,self.min_box.h,5);
    ctx.fillStyle = white;
    ctx.font = "14px Helvetica";
    ctx.fillText("min",self.min_box.x+7,self.min_box.y+20);
    ctx.font = "12px Helvetica";
    ctx.fillText(min_text(),self.min_box.x+7,self.min_box.y+33);
    } else {
    ctx.fillStyle = black;
    ctx.font = "14px Helvetica";
    ctx.fillText("min",self.min_box.x+7,self.min_box.y+20);
    ctx.font = "12px Helvetica";
    ctx.fillText(min_text(),self.min_box.x+7,self.min_box.y+33);
    }
    ctx.strokeStyle = gray;
    ctx.fillStyle = white;
    canv.strokeRoundRect(self.min_box.x,self.min_box.y,self.min_box.w,self.min_box.h,5);
    ctx.fillRect(self.x-2,self.min_box.y-2,self.w+4,4);
    ctx.strokeRect(self.x-2,self.min_box.y-2,self.w+4,4);

    ctx.fillStyle = green;
    if(max_selected()) { canv.fillRoundRect(self.max_box.x,self.max_box.y,self.max_box.w,self.max_box.h,5);
    ctx.fillStyle = white;
    ctx.font = "14px Helvetica";
    ctx.fillText("max",self.max_box.x+7,self.max_box.y+20);
    ctx.font = "12px Helvetica";
    ctx.fillText(max_text(),self.max_box.x+7,self.max_box.y+33);
    } else {
    ctx.fillStyle = black;
    ctx.font = "14px Helvetica";
    ctx.fillText("max",self.max_box.x+7,self.max_box.y+20);
    ctx.font = "12px Helvetica"; ctx.fillText(max_text(),self.max_box.x+7,self.max_box.y+33);
    } 
    ctx.strokeStyle = gray;
    ctx.fillStyle = white;
    canv.strokeRoundRect(self.max_box.x,self.max_box.y,self.max_box.w,self.max_box.h,5);
    ctx.strokeRect(self.x-2,self.max_box.y+self.max_box.h-2,self.w+4,4);
    ctx.fillRect(self.x-2,self.max_box.y+self.max_box.h-2,self.w+4,4);

    ctx.fillText(minmin_text(),self.x+4,self.y+self.h+20);
    ctx.fillText(maxmax_text(),self.x+4,self.y-4);

    if(blip_running)
    {
    ctx.fillStyle = black;
    ctx.fillRect(self.x-1,self.y+self.h-(self.h*self.v)-1,self.w+2,2);
    // Function for the text that is output for the pressure,
    // rate, VE, and Apnea for the alarms that is not UI capable
    ctx.fillText(text(),self.x+self.w+5,self.y+self.h-(self.v*self.h));
    }
}
```

-Around line 800 there is a function named drawBtn. This function is used for creating and styling the buttons on the lower right of each of the pages. 

```javascript
var drawBtn = function(btn,sub,subsub) {
    if (cur_screen == SCREEN_VENTILATOR) {
        ctx.fillStyle = green;
    } else {
        ctx.fillStyle = gray;
    }
    canv.fillRoundRect(btn.x,btn.y,btn.w,btn.h,5);
    ctx.fillStyle = white;
    ctx.font = "18px Helvetica";
    ctx.fillText(btn.title,btn.x+10,btn.y+btn.h/2+8);
    if(sub) ctx.fillText(sub,btn.x+2,btn.y+btn.h/2+5);
    if(subsub) ctx.fillText(subsub,btn.x+2,btn.y+btn.h/2+15);
}
```
-After that, we use the function exitNotificationsScreenSettings to style the confirmation screen for either the ventilator or the alarms or both depending on the game.

```javascript
var exitNotificationScreenSettings = function() {    
    var gridPattern = ctx.createPattern(img, 'repeat');
    ctx.fillStyle = gridPattern;
    
    ctx.fillRect(0,0,bogus_canv.width,bogus_canv.height);
    
    ctx.drawImage(icon_warning_img, bogus_canv.width*.3, bogus_canv.height*.15);

    ctx.fillStyle = black;
    x = 50;
    ctx.font = "35px Helvetica";
    y = 400;
    yd = 35;
    ctx.font = "35px Helvetica";
    ctx.fillText("Waiting for patient",x+15,y-25); y+=yd;
    y+=yd;
    ctx.fillText("connection...",x+55,y); y+=yd;
    y = 380;
    yd = 25;
    ctx.fillText("",x,y); y+=yd;
}
```

-The next function we deal with is the commit_vent_btn around line 1150. This is the button the user will press to have the virtual ventilator accept their settings for the ventilator. When they tap this button the graphs will restart, and the top outputs will show the results of the newly entered settings, but the settings will not be checked for accuracy. Only when the user goes to the confirmation screen and chooses to commit the settings, will the settings be checked if they are correct. If the user does not choose to commit their settings and leaves the virtual ventilator and returns, these settings will still display as the saved values.

```javascript
commit_vent_btn = new ButtonBox(0,0,0,0, function() {
      /*
      Comment out so there is no ability for the 
      user to commit changes to the vent settings if needed
      */
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
```

-Inside the commit_vent_btn, there is a function named getVentSettings. This function retrieves all the current settings for the virtual ventilator. This function **does not** get the alarm settings. The five lines of code after the function are what give the button its text and width/height. We can change these as needed per game or scenario.

```javascript
getVentSettings(fdisp(in_volume,3), fdisp(in_pressure,2), fdisp(in_rate,2), fdisp(in_flow,2), fdisp(in_oxy,2), fdisp(in_itime, 2), fdisp(in_peep,0));

     update_alarms();
});
commit_vent_btn.title = "Test Lung";
commit_vent_btn.ww = 0.25;
commit_vent_btn.wx = 0.15;
commit_vent_btn.wh = 0.08;
commit_vent_btn.wy = -0.42;
```

-The only thing that we need to worry about for the commit_alarm_btn that comes after commit_vent_btn is the title setting which is outside the function. For this game, it is "Commit Changes." 

```javascript
commit_alarm_btn.title = "Commit Changes";
```

-About line 1245 there is a function named self.tick. Inside this function is a switch statement, that determines what screen the virtual ventilator is on and sets up the touch ability for the user to interact with knobs and buttons. In order to remove functionality of the knob or buttons, we comment out the click.filter() code. If it is a button that is not allowed to be pressed, we also change up its appearance by changing the color to a gray.

```javascript
switch(cur_screen){

    case SCREEN_VENTILATOR:
        for(var i = 0; i < in_channel_btns.length; i++)
            clicker.filter(in_channel_btns[i]);
        //clickability for "test lung"
        clicker.filter(commit_vent_btn);
        clicker.filter(patient_btn);
        clicker.filter(alarms_btn);
        //clickability for "Connect Patient" on main vent screen
        clicker.filter(next_btn);
        //touch ability for making adjustments to vent settings
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
```

-The last part of code we change is in the self.draw function around line 1380. Where we change the appearance of the ventilator screen, as well as the alarms page.

```javascript
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
      ctx.drawImage(icon_alarms_img,380,15,30,40);
      ctx.font = "25px Helvetica";
      ctx.fillStyle = black;
      ctx.fillText("Alarms",300,45);

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

      ctx.fillStyle = black;
     ctx.fillText(title,commit_alarm_btn.x,commit_alarm_btn.y-40);
      
      ctx.font = "22px Helvetica";
      
      ctx.fillText(sub,commit_alarm_btn.x,commit_alarm_btn.y-12);
      ctx.fillStyle = red;
      drawBtn(commit_alarm_btn);

      ctx.fillStyle = slate_gray;
      ctx.font = "22px Helvetica"
      canv.fillRoundRect(x_btn.x-90,x_btn.y+5,x_btn.w+60,x_btn.h+5,5);
      ctx.fillStyle = white;
      ctx.fillText(x_btn.title,x_btn.x-85,x_btn.y+x_btn.h/2+18);
      canv.fillStyle = green;
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
          case IN_CHANNEL_PEEP:  sub = fdisp(commit_in_peep,  1)+" cm H₂0"; subsub = fdisp(in_peep,  1)+" cm H₂0"; break;
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
        case IN_CHANNEL_PEEP:  sub = fdisp(in_peep,  1)+" cm H₂0"; break;
      }
      ctx.fillStyle = white;
      ctx.fillText(in_channel_btns[selected_channel].title,commit_vent_btn.x,commit_vent_btn.y-40);
      ctx.font = "22px Helvetica";
      ctx.fillText(sub,commit_vent_btn.x,commit_vent_btn.y-12);
      drawBtn(commit_vent_btn);

      ctx.drawImage(knob_range_img,vent_knob.x,vent_knob.y,vent_knob.w,vent_knob.h);
      ctx.drawImage(knob_img,vent_knob.x+10,vent_knob.y+10,vent_knob.w-20,vent_knob.h-20);
      ctx.drawImage(knob_indicator_img,vent_knob.x+vent_knob.w/2+cos(vent_knob.viz_theta)*vent_knob.w/3.5-4,vent_knob.y+vent_knob.h/2+sin(vent_knob.viz_theta)*vent_knob.w/3.5-4,8,8);

      ctx.strokeStyle = black;
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
      canv.fillStyle = green;
      // connect patient on the vent screen
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
  ```