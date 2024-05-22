var rm_width = 1200;
var rm_height = 800;
var block_width = 40;
var block_height = 40;
var flow_field = [];
var flow_field_width = Math.floor(rm_width/block_width);
var flow_field_height = Math.floor(rm_height/block_height);
var fr = 60;
var testship;
var _mouseX = 0;
var _mouseY = 0;
var ship_count_max = 125;
var ships = [];
var offset_iterate = 0;
var offset_iterate_amount = 0.02;
var show_field = false;
var welcome_time = 6 * fr;
var ship_img_url = "http://www.freeiconspng.com/uploads/red-arrow-up-png-8.png";
var ship_img;

var show_field_button = document.createElement("BUTTON");
show_field_button.innerHTML = "Show Flow Field";
show_field_button.onclick = function() {show_field = !show_field;};

function setup() {
  ship_img = loadImage(ship_img_url);
  createCanvas(rm_width, rm_height);
  frameRate(fr);
  noiseDetail(8, 0.2);
  document.body.appendChild(show_field_button);
  noFill();
  textSize(32);
  
  var yoff = 0;
  for(var k = 0; k < flow_field_width; k++) {
    var row = [];
    var xoff = 0;
    for(var i = 0; i < flow_field_height; i++) {
      var vec = new p5.Vector.fromAngle(map(noise(xoff, yoff),0,1,0,TWO_PI));
      vec.normalize();
      row.push(vec);
      xoff += 0.1;
    }
    yoff += 0.1;
    flow_field.push(row);
  }
}

function draw() {
  background(55);
  
  if(!isNaN(mouseX)) _mouseX = mouseX;
  if(!isNaN(mouseY)) _mouseY = mouseY;
  
  if(welcome_time > 0) {
    stroke(150);
    var msg_txt = "Click around to make ships!\nClick button to show field";
    text(msg_txt, rm_width/2-(7.5*msg_txt.length/2), rm_height/2);
    welcome_time--;
  }
  
  update_flow_field();
  
  if(show_field) {
    for(var i = 0; i < flow_field_height; i++) {
      for(var k = 0; k < flow_field_width; k++) {
        var cur_vec = flow_field[k][i];
        cur_vec.setMag(20);
        noFill();
        stroke('white');
        var cell_center_x = k * block_width + block_width/2;
        var cell_center_y = i * block_height + block_height/2;
        line(cell_center_x, cell_center_y, cell_center_x+cur_vec.x, cell_center_y + cur_vec.y);
        cur_vec.normalize();
      }
    }
  }
  //console.log(ships.length);
  //loop through ships
  for(var i = ships.length-1; i >= 0; i--) {
    var dest_ship = ships[i].keep_in_bounds();
    if(dest_ship) {
      ships.splice(i, 1);
    }
    else {
      var follow_vec = flow_field[Math.floor(ships[i].pos.x/block_width)][Math.floor(ships[i].pos.y/block_height)];
      ships[i].set_move_vector(follow_vec);//new p5.Vector(_mouseX, _mouseY));
      ships[i].update();
      ships[i].draw();
    }
  }
}

function update_flow_field() {
  var yoff = offset_iterate;
  for(var i = 0; i < flow_field_height; i++) {
    var xoff = offset_iterate;
    for(var k = 0; k < flow_field_width; k++) {
      var vec = flow_field[k][i];//new p5.Vector.fromAngle(map(noise(xoff, yoff),0,1,0,TWO_PI));
      vec = p5.Vector.fromAngle(map(noise(xoff, yoff),0,1,0,TWO_PI));
      vec.normalize();
      flow_field[k][i] = vec;
      xoff += 0.1;
    }
    yoff += 0.1;
  }
  console.log(noise(xoff, yoff));
  offset_iterate += offset_iterate_amount;
}

function mouseClicked() {
  if(_mouseX >= 0 && _mouseX < rm_width && _mouseY >= 0 && _mouseY < rm_height && ships.length < ship_count_max) {
    var new_ship = new Ship(_mouseX, _mouseY);
    ships.push(new_ship);
  }
}

function Ship(xx, yy) {
  this.pos = new p5.Vector(xx, yy);
  this.vel = new p5.Vector(0, 0);
  this.accel = new p5.Vector(0, 0);
  this.width = 24;
  this.height = 35;
  this.maxspd = 7; //default 7
  this.maxforce = 0.5; //default 0.5
  this.cur_rot = PI * 0.5;
  this.stroke_color = 'white';
  this.teleports = 6;
  
  this.keep_in_bounds = function() {
    var destroy = false;
    if(this.pos.x < 0 || this.pos.x > rm_width-1 || this.pos.y < 0 || this.pos.y > rm_height-1) {
      this.pos.x = constrain(rm_width-this.pos.x, 0, rm_width-1);
      this.pos.y = constrain(rm_height-this.pos.y, 0, rm_height-1);
      this.teleports--;
      if(this.teleports <= 0)
      {
        destroy = true;
        var rand_x = Math.floor(random(0, rm_width));
        var rand_y = Math.floor(random(0, rm_height));
        var edge = Math.floor(random(0, 4+1));
        var coords = [0, 0];
        if(edge == 0) { //up
          coords[0] = rand_x;
          coords[1] = 0;
        }
        else if(edge == 1) { //right
          coords[0] = rm_width-1;
          coords[1] = rand_y;
        }
        else if(edge == 2) { //down
          coords[0] = rand_x;
          coords[1] = rm_height-1;
        }
        else if(edge == 3) { //left
          coords[0] = 0;
          coords[1] = rand_y;
        }
        var new_ship = new Ship(coords[0], coords[1]);
        ships.push(new_ship);
      }
    }
    return destroy;
    /*else if(this.pos.x > rm_width-1) {
      this.pos.x = 0;
      this.pos.y = rm_height-this.pos.y;
    }
    if(this.pos.y < 0) {
      this.pos.y = rm_height-1;
      this.pos.x = rm_width-this.pos.x;
    }
    else if(this.pos.y > rm_height-1) {
      this.pos.y = 0;
      this.pos.x = rm_width-this.pos.x;
    }*/
  }
  
  this.applyforce = function(force) {
    this.accel.add(force);
  }
  
  this.set_move_vector = function(target) {
    var desired = target;
    desired.setMag(this.maxspd);
    var steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxforce);
    this.applyforce(steer);
  }
  
  this.seek = function(target) {
    var desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxspd);
    var steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxforce);
    this.applyforce(steer);
  }
  
  this.update = function() {
    this.vel.add(this.accel);
    this.vel.limit(this.maxspd);
    this.pos.add(this.vel);
    this.accel.mult(0);
    /*
    var mouse_vect = new p5.Vector(_mouseX, _mouseY);
    var desired_vel = p5.Vector.sub(mouse_vect, this.pos);
    desired_vel.setMag(Math.min(this.maxspd, this.pos.dist(mouse_vect)));
    var steer = p5.Vector.sub(desired_vel, this.vel);//this.vel);
    //console.log(steer.toString());
    var new_vel = p5.Vector.add(this.vel, steer);
    steer.setMag(Math.min(this.maxturn, this.vel.dist(p5.Vector.add(this.vel, steer))));
    //steer.limit(maxforce);
    console.log(steer.mag().toString());
    this.vel = p5.Vector.add(this.vel, steer);
    this.vel.setMag(this.maxspd);
    this.pos.add(this.vel);
    //console.log(_mouseX + " : " + this.pos.x);
    */
  }
  
  this.draw = function() {
    stroke(this.stroke_color);
    this.cur_rot = this.vel.heading() + PI*0.5;
    translate(this.pos.x, this.pos.y);
    rotate(this.cur_rot);
    //image(ship_img, this.width/2, this.height/2, this.width, this.height);
    triangle(-this.width/2, this.height/2,
            this.width/2, this.height/2,
            0, -this.height/2);
    rotate(-this.cur_rot);//-this.pos.angleBetween(this.vel));
    translate(-this.pos.x, -this.pos.y);
  }
}