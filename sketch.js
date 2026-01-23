let x;　//プレーヤーのx座標
let y;　//プレイヤーのy座標
let z;
let mazemasu = 10;
let mazeK_ten = [];   //迷路を確認する時に迷路の中を行ったり来たりする点、本体
let mazeK_ten_copy = [];  //迷路の点をコピーした時に入れる仮の配列
let mazeK_memory = [];  //すでに行った場所を記録する配列
let correct = false;
let mazeten = [];
let title = true
let failed = 0;
let gamesize = 600
let wallwidth = 2
let waywidth = 10
let wallheight = 10
let movemagni = 1;
let cam;
let camang=[0,Math.PI/4];
let fov = 1.5;
let savedposition = [];
let cammoving = [0,0,0,4,0];

function setup() {
  
  createCanvas(windowWidth,windowHeight);
  background(220);
  
  
  x = wallwidth + waywidth/2
  y = wallheight/2
  z = wallwidth + waywidth/2
  
}

function randam() {
    return random(0, 1) < 0.60 ? 0 : 1;
}

function mazesakusei() {
  
  mazeten = [];
  
  for (let i = 0; i < mazemasu; i++) {
    
    for (let q = 0; q < mazemasu; q++) {
      
      mazeten.push([q,i,randam(), randam()])
      
    }
    
  }
  
}

function mazeK() {
  
  mazeK_ten = [[1,1]];
  mazeK_ten_copy = [];
  mazeK_memory = [];
  for(let i=0;i < mazemasu**2 && mazeK_ten.length > 0;i++){
    
    for(let q=0;q < mazemasu**2 && q < mazeK_ten.length;q++){
      
      if(!fukumazeK(...mazeK_ten[q])){
        
        if(mazeK_ten[q][0]==mazemasu&&mazeK_ten[q][1]==mazemasu){
           correct = true
           return
        }
           
        mazeK_memory.push([...mazeK_ten[q]])

        if(mazeten[(mazeK_ten[q][1]-1)*mazemasu+mazeK_ten[q][0]][3] == 0 && mazeK_ten[q][0] != mazemasu){
           mazeK_ten_copy.push([mazeK_ten[q][0]+1,mazeK_ten[q][1]])
        }
        
        if(mazeK_ten[q][1] != mazemasu){
          if(mazeten[mazeK_ten[q][1]*mazemasu+mazeK_ten[q][0]-1][2] == 0){
             mazeK_ten_copy.push([mazeK_ten[q][0],mazeK_ten[q][1]+1])
          }
        }
        
        if(mazeten[(mazeK_ten[q][1]-1)*mazemasu+mazeK_ten[q][0]-1][3] == 0 && mazeK_ten[q][0] != 1){
           mazeK_ten_copy.push([mazeK_ten[q][0]-1,mazeK_ten[q][1]])
        }
        
        if(mazeten[(mazeK_ten[q][1]-1)*mazemasu+mazeK_ten[q][0]-1][2] == 0 && mazeK_ten[q][1] != 1){
           mazeK_ten_copy.push([mazeK_ten[q][0],mazeK_ten[q][1]-1])
        }
          
      }
          
        
    }
      
    mazeK_ten = mazeK_ten_copy
    mazeK_ten_copy = [];
      
  }
    
}

function fukumazeK(X,Y){
  
  for(let t = 0 ;t < mazemasu**2 && t < mazeK_memory.length ; t++){
    
   if(mazeK_memory[t][0] == X&&mazeK_memory[t][1] == Y){
      return true
    }
    
  }
  
  return false
  
}

function kabekakunin(){
  
  for(let i = 0 ; i < mazeten.length ; i++){
    
    if(mazeten[i][2]==1&&x+1>mazeten[i][0]*(wallwidth+waywidth)&&x-1<(mazeten[i][0]+1)*(wallwidth+waywidth)+wallwidth&&z+1>mazeten[i][1]*(wallwidth+waywidth)&&z-1<mazeten[i][1]*(wallwidth+waywidth)+wallwidth){
      return true
    }
    
    if(mazeten[i][3]==1&&x+1>mazeten[i][0]*(wallwidth+waywidth)&&x-1<mazeten[i][0]*(wallwidth+waywidth)+wallwidth&&z+1>mazeten[i][1]*(wallwidth+waywidth)&&z-1<(mazeten[i][1]+1)*(wallwidth+waywidth)+wallwidth){
      return true
    }
  }
  
  if(x-1<wallwidth||x+1>mazemasu*(wallwidth+waywidth)||z-1<wallwidth||z+1>mazemasu*(wallwidth+waywidth)){
       return true
  }
  
}
  
function kabetyousei(a){

  for(let i = 1;i<50;i++){
    x += i*0.01
    if(kabekakunin()){
      x -= i*0.01
    }else{
      return
    }
      
    z += i*0.01
    if(kabekakunin()){
      z -= i*0.01
    }else{
      return
    }
      
    x -= i*0.01
    if(kabekakunin()){
      x += i*0.01
    }else{
      return
    }
      
    z -= i*0.01
    if(kabekakunin()){
      z += i*0.01
    }else{
      return
    } 
    
  }
      
  x = savedposition[0]
  y = savedposition[1]
  z = savedposition[2]
  
}
      
function cam_move(){
  
  if(cammoving[3]==1){
    cammoving[4]+=0.005
    if(cammoving[0]>=0.3){
      cammoving[3]=2
      cammoving[4]=0.06
      cammoving[0]=0.3
    }
  }
  
  if(cammoving[3]==2){
    cammoving[4]-=0.005
    if(cammoving[0]>=0.6){
      cammoving[3]=3
      cammoving[4]=0
      cammoving[0]=0.6
    }
  }
  
  if(cammoving[3]==3){
    cammoving[4]-=0.005
    if(cammoving[0]<=0.3){
      cammoving[3]=4
      cammoving[4]=-0.06
      cammoving[0]=0.3
    }
  }
  
  if(cammoving[3]==4){
    cammoving[4]+=0.005
    if(cammoving[0]<=0){
      cammoving[4]=0
      cammoving[0]=0
    }
  }
  
  cammoving[0] += cammoving[4]
  
}
      
function playercontrol(){
  cam.camera(x,
             y+cammoving[0],
             z,
    cos(camang[0]+cammoving[1])*cos(camang[1]+cammoving[2])*100+x,
    sin(camang[0]+cammoving[1])*100+y,
    cos(camang[0]+cammoving[1])*sin(camang[1]+cammoving[2])*100+z,
             0,
             1,
             0)
  
  savedposition = [x,y,z]
    
    if(keyIsDown(16)){
      movemagni=0.33
    }else{
      movemagni=1
    }
    
    if (keyIsDown(68)) {//d
      x -= sin(camang[1])*0.12*movemagni
      z += cos(camang[1])*0.12*movemagni;
      if(cammoving[3]==4&&cammoving[0]>=0){
        cammoving[3] = 1
      }
    }
    
    if (keyIsDown(65)) {//a
      x += sin(camang[1])*0.12*movemagni
      z -= cos(camang[1])*0.12*movemagni;
      if(cammoving[3]==4&&cammoving[0]>=0){
        cammoving[3] = 1
      }
    }
    
    if (keyIsDown(83)) {//s
      x -= cos(camang[1])*0.10*movemagni
      z -= sin(camang[1])*0.10*movemagni;
      if(cammoving[3]==4&&cammoving[0]>=0){
        cammoving[3] = 1
      }
    }
    
    if (keyIsDown(87)) {//w
        x += cos(camang[1])*0.15*movemagni
        z += sin(camang[1])*0.15*movemagni;
      if(cammoving[3]==4&&cammoving[0]>=0){
        cammoving[3] = 1
      }
    }
    
    if(kabekakunin()){
        kabetyousei()
    }
    
    if(keyIsDown(UP_ARROW) && camang[0] > -1.3){
      camang[0] -= 0.05
    }
    
     if(keyIsDown(DOWN_ARROW) && camang[0] < 1.3){
      camang[0] += 0.05
    }
    
     if(keyIsDown(RIGHT_ARROW)){
      camang[1] += 0.05
    }
    
     if(keyIsDown(LEFT_ARROW)){
      camang[1] -= 0.05
    }
    
    cam_move()
  
}
      
function drawmaze(){
  
  for (let i = 0; i < mazeten.length; i++) {
        
      if((mazeten[i][0]-x/(wallwidth+waywidth))**2+(mazeten[i][1]-z/(wallwidth+waywidth))**2<64){

        if (mazeten[i][2] == 1) {
          push();
          translate((mazeten[i][0]+1)*wallwidth+(mazeten[i][0]+0.5)*waywidth,wallheight/2,(mazeten[i][1]+0.5)*wallwidth+mazeten[i][1]*waywidth)
          box(wallwidth*2+waywidth,wallheight,wallwidth)
          pop();
        }

        if (mazeten[i][3] == 1) {
          push();
          translate((mazeten[i][0]+0.5)*wallwidth+mazeten[i][0]*waywidth,wallheight/2,(mazeten[i][1]+1)*wallwidth+(mazeten[i][1]+0.5)*waywidth)
          box(wallwidth,wallheight,wallwidth*2+waywidth)
          pop();
        }

      }
    }
    
    push();
    translate(((mazemasu+1)*wallwidth+mazemasu*waywidth)/2,wallheight/2,wallwidth/2)
    box((mazemasu+1)*wallwidth+mazemasu*waywidth,wallheight,wallwidth)
    pop();
    
    push();
    translate(wallwidth/2,wallheight/2,((mazemasu+1)*wallwidth+mazemasu*waywidth)/2)
    box(wallwidth,wallheight,(mazemasu+1)*wallwidth+mazemasu*waywidth)
    pop();
    
    push();
    translate(((mazemasu+1)*wallwidth+mazemasu*waywidth)/2,wallheight/2,(mazemasu+0.5)*wallwidth+mazemasu*waywidth)
    box((mazemasu+1)*wallwidth+mazemasu*waywidth,wallheight,wallwidth)
    pop();
    
    push();
    translate((mazemasu+0.5)*wallwidth+mazemasu*waywidth,wallheight/2,((mazemasu+1)*wallwidth+mazemasu*waywidth)/2)
    box(wallwidth,wallheight,(mazemasu+1)*wallwidth+mazemasu*waywidth)
    pop();
    
    push();
    fill(200)
    translate(((wallwidth+waywidth)*mazemasu+wallwidth)/2,wallheight+1,((wallwidth+waywidth)*mazemasu+wallwidth)/2)
    box((wallwidth+waywidth)*mazemasu+wallwidth,2,(wallwidth+waywidth)*mazemasu+wallwidth)
    pop()
    
    push();
    fill(0)
    translate(((wallwidth+waywidth)*mazemasu+wallwidth)/2,-1,((wallwidth+waywidth)*mazemasu+wallwidth)/2)
    box((wallwidth+waywidth)*mazemasu+wallwidth,2,(wallwidth+waywidth)*mazemasu+wallwidth)
    pop()
    
    push()
    fill(255,255,255,100)
    ambientLight(255)
    translate((wallwidth+waywidth)*mazemasu-waywidth/2,5,(wallwidth+waywidth)*mazemasu-waywidth/2)
    box(waywidth-0.1,wallheight-0.1,waywidth-0.1)
    pop()
  
}

function draw() {
  
  noStroke()
  fill(0);
  
  if(!title){
    
    background(0);
    
    playercontrol()
    
    fill(255,255,0)
    ambientLight(0)
    pointLight(150,150,150,x,y,z)
    lightFalloff(0.5,0.08,0.001)
    
    //spotLight(255,0,0,19,5,19,0,1,0,20,10)
    
    drawmaze()
    
  }
  
  if(title){
    
    stroke(0)  
    strokeWeight(2)
    
    textSize(windowWidth/6)
    text("迷路",windowWidth/3,windowHeight/3)
    fill(220)
    rect(windowWidth/4,windowHeight*2/3,windowWidth/2,windowHeight/4)
    fill(0)
    textSize(windowWidth/8)
    text(" START! ",windowWidth*7/32,windowHeight*6/7)
    
    if(failed>0){
      text("Failed",windowWidth/2,windowHeight/2)
      failed-=1
    }
    
    if(mouseIsPressed == true && windowWidth/4 < mouseX && mouseX < windowWidth*3/4 && mouseY < windowHeight*11/12 && windowHeight*2/3 < mouseY){
      
      for(let i = 0 ; i < 100 && !correct; i++){
        background(220)
        mazesakusei()
        mazeK()
        
      }
      
      if(correct){
        title=false;
        createCanvas(windowWidth,windowHeight,WEBGL);
        cam = createCamera();
        cam.camera(x,y,z+500,0,0,0,0,1,0);
        cam.perspective(PI*(fov-1)/fov,width/height,0.01,100)
        
      }else{
        failed = 20
      }
      
    }
    
  }

}