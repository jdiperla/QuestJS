"use strict";

const TITLE = "A First Step...";
const AUTHOR = "The Pixie"
const VERSION = "1.1";
const THANKS = ["Kyle", "Lara"];

// UI options
const PANES = 'Left';  //Can be set to Left, Right or None.
// Setting PANES to None will more than double the speed of your game!
const COMPASS = true;
const DIVIDER = "div.png";

const STATUS_PANE = "Status";  // Set to false to turn off
const STATUS_WIDTH_LEFT = 120; // How wide the columns are in the status pane
const STATUS_WIDTH_RIGHT = 40;

const USE_DROPDOWN_FOR_CONV = true;

const FAILS_COUNT_AS_TURNS = false;
const LOOK_COUNTS_AS_TURN = false;

const TEXT_INPUT = true;
const CURSOR = ">";
const CMD_ECHO = true;               // echo commands to the screen
const CONVERT_NUMBERS_IN_PARSER = false;


const LANG_FILENAME = "lang-en.js";  // set to the language file of your choice
const DEBUG = true;                  // set to false when releasing
const CUSTOM_EXITS = false;          // set to true to use custom exits, in exits.js
const FILES = ["code", "data"];

const PARSER_DEBUG = false;      // If true, will report the data the parser outputs
const SPLIT_LINES_ON = "<br>";   // Strings sent to msg will be broken into separate lines

const SECONDS_PER_TURN = 60;
const DATE_TIME_LOCALE = 'en-GB';
const DATE_TIME_START = new Date('February 14, 2019 09:43:00');
const DATE_TIME_OPTIONS = {
  year:"numeric",
  month:"short",
  day:"2-digit",
  hour:"2-digit",
  minute:"2-digit",
};

const ROOM_TEMPLATE = [
  "%",
  "You can see {objects} here.",
  "You can go {exits}.",
];



const STATUS = [
  "hitpoints",
  function() { return "<td>Spell points:</td><td>3</td>"; },
  function() { return "<td>Health points:</td><td>" + game.player.hitpoints + "</td>"; },
  function() { return '<td colspan="2">' + game.player.status + "</td>"; },
];


// Change the name values to alter how items are displayed
// You can add (or remove) inventories too
const INVENTORIES = [
  {name:'Items Held', alt:'itemsHeld', test:isHeldNotWorn, getLoc:function() { return game.player.name; } },
  {name:'Items Worn', alt:'itemsWorn', test:isWorn, getLoc:function() { return game.player.name; } },
  {name:'Items Here', alt:'itemsHere', test:isHere, getLoc:function() { return game.player.loc; } },
];






function intro() {
  msg("This is a quick example of what can be done in Quest 6.");
  msg("Your objective is to turn on the light in the basement, but there are, of course, numerous hoops to jump through.");
  msg("If you are successful, see if you can do it again, but getting Kyle to do everything. You should find that you can tell an NPC to do pretty much anything (except look at things for you and talk to people for you).");
}




// This function will be called at the start of the game, so can be used
// to introduce your game.
function setup() {
  game.player.hitpoints = 20;
  game.player.status = "You are feeling fine";
  game.player.slotsUsed = 0;
  for (let i = 0; i < skills.list.length; i++) {
    skills.addButton(skills.list[i]);
  }
  for (let key in w) {
    if (w[key].health !== undefined && w[key].maxHealth === undefined) {
      w[key].maxHealth = w[key].health;
    }
  }
  
//  parser.parse("attack goblin");
}












const ioCreateCustom = function() {
  document.writeln('<div id="rightpanel" class="sidepanes sidepanesRight">');
  document.writeln('<div id="rightstatus">');
  document.writeln('<table align="center">');
  document.writeln('<tr><td width="120"><b>Current weapon</b></td></tr>');
  document.writeln('<tr><td><img id="weaponImage" /></td></tr>');
  document.writeln('<tr><td><b>Health</b></td></tr>');
  document.writeln('<tr><td style="border: thin solid black;background:white;text-align:left;\"><span id="hits-indicator" style="background-color:green;padding-right:100px;"></span></td></tr>');
  document.writeln('<tr><td><b>Spell points</b></td></tr>');
  document.writeln('<tr><td style="border: thin solid black;background:white;text-align:left;\"><span id="hits-indicator" style="background-color:blue;padding-right:100px;"></span></td></tr>');
  document.writeln('<tr><td><b>Armour</b></td></tr>');
  document.writeln('<tr><td style="border: thin solid black;background:white;text-align:left;\"><span id="hits-indicator" style="background-color:red;padding-right:100px;"></span></td></tr>');
  document.writeln('</table>');
  document.writeln('</div>');

  document.writeln('<table align="center">');
  document.writeln('<tr><td id="cell0" width="40"></td><td id="cell1" width="40"></td><td id="cell2" width="40"></td></tr>');
  for (let i = 3; i < 24; i += 3) {
    document.write(`  <tr><td id="cell${i}"></td><td id="cell${i + 1}"></td><td id="cell${i + 2}"></td></tr>`);
  }
  document.writeln('</table>');
  document.writeln('</div>');
};  


const ioUpdateCustom = function() {
  $('#weaponImage').attr('src', 'images/icon-' + w[game.player.equipped].image + '.png');
  $('#hits-indicator').css('padding-right', 120 * game.player.health / game.player.maxHealth);
};








const skills = {
  list:[
    { name:"Basic attack", icon:"sword1", tooltip:"A simple attack", processAttack:function(attack, options) {}},
    
    { 
      name:"Double attack",
      icon:"sword2",
      tooltip:"Attack one foe twice, but at -2 to the attack roll", 
      attackNumber:2, 
      processAttack:function(attack, options) {
        attack.offensiveBonus -= 2;
      },
    },
    
    { 
      name:"Sweeping attack", 
      icon:"sword3", 
      tooltip:"Attack one foe for normal damage, and any other for 4 damage; at -3 to the attack roll for reach", 
      attackTarget:"foes", 
      processAttack:function(attack, options) {
        if (options.secondary) {
          attack.damageNumber = 0;
          attack.damageBonus = 4;
        }
        attack.offensiveBonus -= 3;
      },
    },
    
    { name:"Sword of Fire", icon:"sword-fire", tooltip:"Attack with a flaming sword", processAttack:function(attack, options) {
      attack.element = "fire";
    },},
    
    { name:"Ice Sword", icon:"sword-ice", tooltip:"Attack with a freezing blade", processAttack:function(attack, options) {
      attack.element = "ice";
    },},
  ],

  addButton:function(skill) {
    const cell = $('#cell' + game.player.slotsUsed);
    cell.html('<img src="images/icon-' + skill.icon + '.png" title="' + skill.tooltip + '" />');
    cell.click(skills.buttonClickHandler);
    cell.css("background-color", "black");
    cell.css("padding", "2px");
    cell.attr("name", skill.name);
    game.player.slotsUsed++;
  },

  resetButtons:function() {
    for (let i = 0; i < game.player.slotsUsed; i++) {
      $('#cell' + i).css("background-color", "black");
      $('#cell' + i).attr("name", "");
    }
  },

  buttonClickHandler:function(event) {
    skills.resetButtons();
    const cell = $("#" + event.currentTarget.id);
    cell.css("background-color", "yellow");
    cell.attr("name", "selected");
  },

  getSkillFromButtons:function() {
    for (let i = 1; i <= game.player.slotsUsed; i++) {
      if ($("#cell" + i).attr("name") === "selected") {
        return skills.list[i];
      }
    }
    return null;
  },
  
}










/*
const DISABLED = true;
var professions = [
  {name:"Farm hand", bonus:"strength"},
  {name:"Scribe", bonus:"intelligence"},
  {name:"Exotic dancer", bonus:"agility"},
  {name:"Merchant", bonus:"charisma"},
];

$(function() {
  if (DISABLED) {
    var p = getPlayer();
    p.job = professions[0];
    p.isFemale = true;
    p.fullname = "Shaala";
    return; 
  }
  var diag = $("#dialog");
  diag.prop("title", "Who are you?");
  var s;
  s = '<p>Name: <input id="namefield" type="text" value="Zoxx" /></p>';
  s += '<p>Male: <input type="radio" id="male" name="sex" value="male">&nbsp;&nbsp;&nbsp;&nbsp;';
  s += 'Female<input type="radio" id="female" name="sex" value="female" checked></p>';
  s += '<p>Job:<select id="job">'
  for (var i = 0; i < professions.length; i++) {
    s += '<option value="' + professions[i].name + '">' + professions[i].name + '</option>';
  }
  s += '</select></p>';
  
  diag.html(s);
  diag.dialog({
    modal:true,
    dialogClass: "no-close",
    width: 400,
    height: 300,
    buttons: [
      {
        text: "OK",
        click: function() {
          $(this).dialog("close");
          var p = getPlayer();
          job = $("#job").val();
          p.job = professions.find(function(el) { return el.name === job; });
          p.isFemale = $("#female").is(':checked');
          p.fullname = $("#namefield").val();
          if (TEXT_INPUT) { $('#textbox').focus(); }
        }
      }
    ]
  });
});

*/





const dialogeOptions = {
  para0Opts:[
    "a tiny village",
    "a provincial town",
    "the slums",
    "the merchant's quarter"
  ],

  para1Opts:[
    "loving the outdoors",
    "appreciating the finer things in life",
    "always hungry",
    "isolated from children of your own age"
  ],

  para2Opts:[
    "introspective",
    "precocious",
    "attractive",
    "curious",
  ],

  para3Opts:[
    "boy",
    "girl"
  ],

  para4Opts:[
    "getting into trouble",
    "with your nose in a book",
    "stealing things",
    "getting into fights",
    "arguing with the local priest"
  ],

  para5Opts:[
    "potion brewing",
    "crystal magic",
    "shadow magic",
    "nature magic"
  ],

  para6Opts:[
    "raven black",
    "dark brown",
    "brunette",
    "dark blond",
    "blond",
    "platinum blond",
    "ginger",
    "electric blue",
    "shocking pink",
  ],

para7Opts:[
  "brown",
  "green",
  "hazel",
  "blue",
  "aquamarine"
],

para8Opts:[
  "blue",
  "green",
  "orange",
],
};



var paraOpts = [];

var paraPositions = [];


var wizardMale = true;

function scrollWizard() {
  wizardMale = !wizardMale;
  $('#wizardname').html(wizardMale ? 'Master Shalazin' :  'Mistress Shalazin');
  $('#wizardwitch').html(wizardMale ? 'wizard' :  'witch');
  $('#wizardhe').html(wizardMale ? 'he' :  'she');
}

function scrollPara(element) {
  var paraNumber = parseInt(element.id.replace('para', ''));
  if (isNaN(paraNumber)) { return; }
  var para = $('#para' + paraNumber);
  if (typeof paraPositions[paraNumber] !== 'number') {
    var list = dialogeOptions['para' + paraNumber + 'Opts'];
    paraOpts[paraNumber] = list;
    paraPositions[paraNumber] = randomInt(list.length - 1);
  }
  paraPositions[paraNumber]++;
  if (paraPositions[paraNumber] >= paraOpts[paraNumber].length) {
    paraPositions[paraNumber] = 0;
  }
  para.html(paraOpts[paraNumber][paraPositions[paraNumber]]);
}    

function setValues() {
  game.player.alias = $('#name_input').val();
  game.player.isFemale = !wizardMale;
  game.player.background = $('#para4').html();
  game.player.magic = $('#para5').html();
  game.player.hairColour = $('#para6').html();
  game.player.eyeColour = $('#para7').html();
  game.player.spellColour = $('#para8').html();
  msg(game.player.alias);
  msg($("#diag-inner").text());
}

/*
$(document).ready(function () {
      $('.scrolling').each(function() {
        scrollPara(this);
      });
      that = $("#dialog_window_1");
      $('#dialog_window_1').dialog({
         height: 400,
         width: 640,
         buttons: {
            "Done": function() { setValues();}
        }
      });
      $("button[title='Close']")[0].style.display = 'none';
});
*/
function scrollWizard() {
  wizardMale = !wizardMale;
  $('#wizardname').html(wizardMale ? 'Master Shalazin' :  'Mistress Shalazin');
  $('#wizardwitch').html(wizardMale ? 'wizard' :  'witch');
  $('#wizardhe').html(wizardMale ? 'he' :  'she');
}

function showStartDiag() {

  var diag = $("#dialog");
  diag.prop("title", "Who are you?");
  var s;
  s = 'Name: <input type="text" id="name_input" value="Skybird"/><br/><br/>';
  s += '<div id="diag-inner">Born in <span id="para0" class="scrolling" onclick="scrollPara(this)"></span>, you grew up <span id="para1" class="scrolling" onclick="scrollPara(this)"></span>. ';
  s += 'You were a <span id="para2" class="scrolling" onclick="scrollPara(this)"></span> <span id="para3" class="scrolling" onclick="scrollPara(this)"></span>, ';
  s += 'always <span id="para4" class="scrolling" onclick="scrollPara(this)"></span>.';
  s += 'At the age of seven, you caught the eye of <span id="wizardname" class="scrolling" onclick="scrollWizard();">Master Shalazin</span>, ';
  s += 'a <span id="wizardwitch">wizard</span> ';
  s += 'who specialises in <span id="para5" class="scrolling" onclick="scrollPara(this)"></span>. ';
  s += 'Perhaps <span id="wizardhe">he</span> recognised potential in you, or just a pair of hands willing to work for next to nothing; may be just liked your ';
  s += '<span id="para6" class="scrolling" onclick="scrollPara(this)"></span> hair and <span id="para7" class="scrolling" onclick="scrollPara(this)"></span> eyes. ';
  s += 'Either way, you slowly learnt the basics of magic, and have recently learnt how to turn yourself <span id="para8" class="scrolling" onclick="scrollPara(this)"></span>. ';
  s += 'Perhaps more importantly, you have also learnt how to turn yourself back.</div>';

  diag.html(s);
  $('.scrolling').each(function() {
    scrollPara(this);
  });
  diag.dialog({
    modal:true,
    dialogClass: "no-close",
    width: 600,
    height: 600,
    buttons: [
      {
        text: "OK",
        click: function() {
          $(this).dialog("close");
          setValues(this);
          if (TEXT_INPUT) { $('#textbox').focus(); }
        }
      }
    ]
  });

}
