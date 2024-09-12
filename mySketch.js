let t = 0;
let mP = 60;

function setup() {
	createCanvas(600, 600);
	background(0);
	testSnake = new Head(100, 150, 30, 10, 50);
	noiseDetail(4, 0.5);
	noStroke();
}

class FeelerTail {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	move(inX, inY) {
		let [x, y] = feelerMoveFunc(inX, this.x, inY, this.y, this.xF, this.yF);
		this.x = x;
		this.y = y;
	}
	draw() {
	}
}

class Feeler {
	constructor(x, y, xF, yF, segNum) {
		this.x = x;
		this.y = y;
		this.seg = segNum;
		this.xF = xF;
		this.yF = yF;
		this.segNum = segNum
				
		if(segNum > 0) {
			this.next = new Feeler(this.x, this.y, this.xF, this.yF, segNum-1);
		}
		else {
			this.next = new FeelerTail(this.x, this.y);
		}
	}
	move(inX, inY) {
		let [x, y] = feelerMoveFunc(inX, this.x, inY, this.y, this.xF, this.yF);
		this.x = x
		this.y = y
		this.next.move(this.x, this.y);
	}
	draw() {
		push();
		stroke(255);
		strokeWeight(this.segNum * 0.015);
		line(this.x, this.y, this.next.x, this.next.y);
		fill(255, 255, 255, 1);
		circle(int(this.x), int(this.y), 2);
		pop();
		this.next.draw();
	}
}

function feelerMoveFunc(inX, prevX, inY, prevY, rX, rY) {//, restLen, k) {
		let xeno = 0.1;
		prevX = prevX*(1-xeno) + inX*xeno + rX;
		prevY = prevY*(1-xeno) + inY*xeno + rY;
		
		return [prevX, prevY];
}

class Knee {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.restLenUp = 120 + random(-30, 30);
		this.restLenDow = 120 + random(-30, 30);
		
	}
	move(hipx, hipy, footx, footy) {
		let k = 0.5;
		let d = dist(this.x, this.y, hipx, hipy);
		let disten = d - this.restLenUp;
		let f = k*disten;
		let fx = f*((hipx - this.x)/d);
		let fy = f*((hipy - this.y)/d);
		
		d = dist(this.x, this.y, footx, footy);
		disten = d - this.restLenDow;
		f = k*disten;
		fx += f*((footx - this.x)/d);
		fy += f*((footy - this.y)/d);
		
		this.x += fx
		this.y += fy
	}
	draw() {
		circle(this.x, this.y, 2);
	}
}

class Leg {
	constructor(x, y) {
		this.hipx = x;
		this.hipy = y;
		let [footx, footy] = nearestBorder(x, y, -1, -1);
		this.footx = footx;
		this.footy = footy;
		this.knee = new Knee(x, y);
		this.knee2 = new Knee(x, y);
	}
	move(x, y) {
		this.hipx = x;
		this.hipy = y;
		let [footx, footy] = nearestBorder(x, y, this.footx, this.footy);
		this.footx = footx;
		this.footy = footy;
		this.knee.move(this.hipx, this.hipy, this.footx, this.footy);
		this.knee2.move(this.hipx, this.hipy, this.footx, this.footy);
	}
	draw() {
		push();
		stroke(255);
		strokeWeight(0.5);
		line(this.hipx, this.hipy, this.knee.x, this.knee.y);
		line(this.knee.x, this.knee.y, this.footx, this.footy);
		this.knee.draw();
		circle(this.footx, this.footy, 1);
		pop();
	}
}

class Tail {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	move(inX, inY) {
		let [x, y] = moveFunc(inX, this.x, inY, this.y);
		this.x = x;
		this.y = y;
	}
	draw() {
		circle(int(this.x), int(this.y), 8);
	}
}

class Segment {
	constructor(x, y, segNum) {
		this.x = x;
		this.y = y;
		this.seg = segNum;
		this.hasLeg = false;
		//this.feeler = new Feeler(this.x, this.y, random(-3, 3), random(-3, 3), 10);
		if(segNum % 2 == 0) {
			this.leg = new Leg(this.x, this.y);
			this.hasLeg = true;
		}
		if(segNum > 0) {
			this.next = new Segment(this.x, this.y, segNum-1);
		}
		else {
			this.next = new Tail(this.x, this.y);
		}
	}
	move(inX, inY) {
		let [x, y] = moveFunc(inX, this.x, inY, this.y);
		this.x = x
		this.y = y
		this.next.move(this.x, this.y);
		//this.feeler.move(this.x, this.y)
		if(this.hasLeg) {
			this.leg.move(this.x, this.y);
		}
	}
	draw() {
		if(this.hasLeg) {
			this.leg.draw();
		}
		circle(int(this.x), int(this.y), 8);
		push();
		stroke(255);
		strokeWeight(20);
		line(this.x, this.y, this.next.x, this.next.y);
		pop();
		this.next.draw();
		//this.feeler.draw()
		push();
		stroke(255);
		strokeWeight(0.05);
		//line(this.x, this.y, this.feeler.x, this.feeler.y);
		pop();
	}
}

class Head {
  constructor(x, y, segTot, feelerLen, feelerTot) {
    this.x = x;
    this.y = y;
    this.len = segTot;
		this.r = 200;
		this.th = 0;
		
		this.tail = new Tail(this.x, this.y);
		this.nextSeg = this.tail;
		
		this.feelerTot = feelerTot;
		this.feelerSet = [];
		for(let i = 0; i < feelerTot; i++) {
			this.feelerSet.push(new Feeler(this.x, this.y, random(-1, 1), random(-1, 1), feelerLen));
		}
		
		this.next = new Segment(this.x, this.y, segTot);
  }
	move() {
		if(mouseIsPressed) {
			mP = 2;
			this.r = 300 - (noise(t/60))*100
		}
		else {
			mP = 1;
			this.r = 300 - (noise(t/60))*250
		}
		this.th += (((noise(t/60) - 0.5)*mP)/(2 + 5*noise(t/15)))
		
		this.x = 300 + this.r*cos(this.th);
		this.y = 300 + this.r*sin(this.th);
		this.next.move(int(this.x), int(this.y));
		for(let i = 0; i < this.feelerTot; i++) {
			this.feelerSet[i].move(this.x, this.y);
		}
		t += 1
		//t += (noise(millis()/1000)*noise(millis()/1000)*(noise(millis()/1000)-0.5));
		
		/*if(noise(millis()/600 + 1000) < 0.1) {
			this.x = int(noise(t)*(600));
			this.y = int(noise(t + 1000)*(600));
			this.next.move(int(this.x), int(this.y));
			for(let i = 0; i < this.feelerTot; i++) {
				this.feelerSet[i].move(this.x, this.y);
			}
			t += 1/120;
		}
		else {
			this.x = int(noise(t)*600);
			this.y = int(noise(t + 600)*600);
			this.next.move(int(this.x), int(this.y));
			for(let i = 0; i < this.feelerTot; i++) {
				this.feelerSet[i].move(this.x, this.y);
			}
			t += 1/240;
		}*/
		
		
	}
	draw() {
		push();
		fill(255, 0, 0);
		circle(this.x, this.y, 5);
		pop();
		push();
		stroke(255);
		strokeWeight(20);
		line(this.x, this.y, this.next.x, this.next.y);
		pop();
		this.next.draw()
		for(let i = 0; i < this.feelerTot; i++) {
			this.feelerSet[i].draw();
		}
		push();
		stroke(255);
		strokeWeight(0.165);
		for(let i = 0; i < this.feelerTot; i++) {
			line(this.x, this.y, this.feelerSet[i].x, this.feelerSet[i].y);
		}
		pop();
	}
}
			
function moveFunc(inX, prevX, inY, prevY) {//, restLen, k) {
		let k = 0.8;
		let restLen = 6;
		let d = dist(inX, inY, prevX, prevY);
		let disten = d - restLen;
		let f = k*disten;
		let fx = f*((inX - prevX)/d)
		let fy = f*((inY - prevY)/d)
		
		return [prevX + fx, prevY + fy];
}

function nearestBorder(curX, curY, prevX, prevY) {
	let stepSize = 400;
	let closest = min(curX, curY, 600-curX, 600-curY);
	if(closest == curX) {
		if(prevX == 0 && abs(curY-prevY) < stepSize) {
			return [0, prevY];
		}
		else {
			return [0, curY + random(-stepSize/2, stepSize/2)];
		}
	}
	else if(closest == curY) {
		if(prevY == 0 && abs(curX-prevX) < stepSize) {
			return [prevX, 0];
		}
		else {
			return [curX + random(-stepSize/2, stepSize/2), 0];
		}
	}
	else if(closest == 600-curX) {
		if(prevX == 600 && abs(curY-prevY) < stepSize) {
			return [600, prevY];
		}
		else {
			return [600, curY + random(-stepSize/2, stepSize/2)];
		}
	}
	else {
		if(prevY == 600 && abs(curX-prevX) < stepSize) {
			return [prevX, 600];
		}
		else {
			return [curX + random(-stepSize/2, stepSize/2), 600];
		}
	}
}

function draw() {
	background(0);
	push();
	noFill();
	stroke(50);
	strokeWeight(2);
	square(1, 1, 598)
	pop();
	testSnake.move();
	testSnake.draw();
}
