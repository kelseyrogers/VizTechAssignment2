
var particleSystem = [];
var attractors = [];
var table;
var categoryTable;
var aggregated = {};
var categories = {};

function preload(){
    table = loadTable("data/investments.csv", "csv", "header");
    categoryTable = loadTable("data/companies_categories.csv", "csv", "header");
}

function setup() {
    
    var canvas = createCanvas(windowWidth, windowHeight);
    background(360);
    frameRate(30);
    
    colorMode(HSB, 360, 100, 100, 100);
    
    var at = new Attractor(createVector(width/2, height/2), 1);
    attractors.push(at);
    
    print(table.getRowCount() + "total rows in table");
    
    for (var r = 0; r< table.getRowCount(); r++){
        var cname = table.getString(r, "company_name");
        var invested = table.getString(r, "amount_usd");
        invested = parseInt(invested);
        if(!isNaN(invested)){
            if(aggregated.hasOwnProperty(cname)){
                aggregated[cname]= aggregated[cname]+invested;
            }else{
                aggregated[cname] = invested;
            }
        }
    }
    
    
    var aAggregated = [];
    Object.keys(aggregated).forEach(function(name_){
        var company = {};
        company.name = name_;
        company.sum = aggregated[name_]
        aAggregated.push(company);
    });
    
    aAggregated.sort(function(companyA, companyB){
        return companyB.sum - companyA.sum;
    });
    
    
    
    print(aAggregated[0].name + " : " +aAggregated[0].sum);
    
    var aCategories = [];
    
    for (var r = 0; r<categoryTable.getRowCount(); r++){
        var cname = categoryTable.getString(r, "name");
        var category_ = categoryTable.getString(r, "category_code");
        //look into aCategories see if it already has a "category_code"
        var foundRow = aCategories.find(function(row){
            return row.category == category_;
        });
        if(foundRow){
            foundRow.count++;
        }else{
            var row = {};
            row.category = category_;
            row.count = 1;
            aCategories.push(row);
        }
    }
    
            
    aCategories.sort(
        function(categoryA, categoryB){
            return categoryB.count - categoryA.count;
    });
            
            
    print(aCategories);
    
    //change the colors of the particles to their corresponding color according with the categories
    //for each particle make particle.color = {h, s, b};
    
    /*particleSystem.forEach(function(p){
        
    });*/
    
    //we are creating 100 particles for the first 100 top companies (aAggregated provides the top companies)
    for(var i=0; i<175; i++){
        //get the category code
        var company_name = aAggregated[i].name;
        var company_sum = aAggregated[i].sum;
        var row = categoryTable.findRow(company_name, "name");
       
            var category = row.getString("category_code");
            var p = new Particle(company_name, company_sum, category);
            particleSystem.push(p);
      
        
    }
    
    
    
}
   

/*var foundCompany = aAggregated.find(function(element, index, array){
            if(element.name == compname) return true;
            else return false;  */

function draw(){
    
    background(0);
    
    //pairwise comparisons
   for(var STEPS = 0; STEPS<4; STEPS++){
        for(var i=0; i<particleSystem.length-1;i++){
            for(var j=i+1;j<particleSystem.length; j++){
                var pa = particleSystem[i];
                var pb = particleSystem[j];
                var ab = p5.Vector.sub(pb.pos, pa.pos);
                var distSq = ab.magSq();
                if(distSq <= sq(pa.radius + pb.radius)){
                    var dist = sqrt(distSq);
                    var overlap = (pa.radius + pb.radius) - dist;
                    ab.div(dist);
                    ab.mult(overlap*0.5);
                    pb.pos.add(ab);
                    ab.mult(-1);
                    pa.pos.add(ab);
                    pa.vel.mult(0.97);
                    pb.vel.mult(.97);
                }
            }
        }
   }    
    
    particleSystem.forEach(function(p) {
        p.draw();
        p.update();
    });

    
    attractors.forEach(function(at){
        
        at.draw();
        
    });
}


function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
    
}

var Particle = function(name, sum, category){
    
    //this.fill = (200, 40, 100, 80);
    this.category = category;
    
    this.name = name;
    this.sum = sum;
    
    switch(this.category){
        case "web":
            this.color = {h : 35, s : 50, b : 100};
            break;
        case "software":
            this.color = {h : 40, s : 50, b : 100};
            break;
        case "biotech":
            this.color = {h : 50, s : 50, b : 100};
            break;
        case "mobile":
            this.color = {h : 60, s : 50, b : 100};
            break;
        case "enterprise":
            this.color = {h : 70, s : 50, b : 100};
            break;
        case "ecommerce":
            this.color = {h : 85, s : 50, b : 100};
            break;
        case "games_video":
            this.color = {h : 90, s : 50, b : 100};
            break;
        case "advertising":
            this.color = {h : 100, s : 50, b : 100};
            break;
        case "cleantech":
            this.color = {h : 110, s : 50, b : 100};
            break;
        case "social":
            this.color = {h : 125, s : 50, b : 100};
            break;
        case "medical":
            this.color = {h : 135, s : 50, b : 100};
            break;
        
            //ADD MORE CASES FOR DIFFERENT CATEGORIES AND ADJUST COLORS TO LOOK BETTER
        default:
            this.color = {h : 0, s: 50, b : 100};
    }
    
    
    
    
    this.radius = sqrt(sum)/4000;
    var initialRadius = this.radius;
    
    this.psize = sqrt(sum)/1000;
    
    var tempAng = random(TWO_PI);
    this.pos = createVector(cos(tempAng), sin(tempAng));
    
    this.pos.div(this.radius);
    this.pos.mult(1000);
    var isMouseOver = false;
    
    this.pos.set(this.pos.x + width/2, this.pos.y + height/2);
    
    var acc = createVector(0, 0);
    this.vel = createVector(0, 0);
    var maximumRadius = 70;
    
    
    this.update = function(){
        
        checkMouse(this);
        
        attractors.forEach(function(A){
            var att = p5.Vector.sub(A.getPos(), this.pos); 
            var distanceSq = att.magSq();
            if(distanceSq >1){
                att.normalize();
                att.div(10);
                att.mult(1*A.getStrength());
                acc.add(att);
            }
        }, this);
        
        this.vel.add(acc);
        this.pos.add(this.vel);
        acc.mult(0);
}
    
    
    this.getPos = function(){
        return pos.copy();
    }    
    
    this.draw = function(){
        
        
        noStroke();
        //fill(100, 40, 100, 80);
        if(isMouseOver){
            fill(this.color.h, this.color.s+40, this.color.b);
        }else{
            fill(this.color.h, this.color.s, this.color.b);
        }
        
        ellipse(this.pos.x, 
                this.pos.y,                                           
                this.radius*2, 
                this.radius*2);
        if(this.radius==maximumRadius){
            textFont("Avenir");
            fill(0, 0, 0);
            textAlign(CENTER);
            textSize(16);
            text(this.name, this.pos.x, this.pos.y-10); 
            textSize(10);
            text("Total Investments(USD):", this.pos.x, this.pos.y+4);
            text("$"+nfc(this.sum, 0), this.pos.x, this.pos.y+15);
            text("Category:"+this.category, this.pos.x, this.pos.y+25);
        }
        
    }
    
    this.getSize = function(){
        return psize;
    }
    
    function checkMouse(instance){
        var mousePos = createVector(mouseX, mouseY);
        if(mousePos.dist(instance.pos) <= instance.radius){
            incRadius(instance);
            isMouseOver = true;
        }else{
            decRadius(instance);
            isMouseOver = false;
        }
    }
    
    function incRadius(instance){
        instance.radius+=4;
        if(instance.radius > maximumRadius){
            instance.radius = maximumRadius;
        }
    }
    
    function decRadius(instance){
        instance.radius-=4;
        if(instance.radius < initialRadius){
            instance.radius = initialRadius;
        }
    }
    
}

var Attractor = function(pos,s){
    var pos = pos.copy();
    var strength = s;
    this.draw = function(){
        noStroke();
        fill(100, 100, 100, 100);
        //ellipse(pos.x, pos.y, strength, strength);
    }
    
    this.getStrength = function(){
        return strength;
    }
    this.getPos = function(){
        return pos.copy();
    }

}

