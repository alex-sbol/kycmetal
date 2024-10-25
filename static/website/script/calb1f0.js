function CalcVar(str,isConst){
    this.str=str;
    this.isConst=isConst;
    this.type=1;
}

CalcVar.prototype.getVal=function(varobj){
    if(this.isConst) return parseFloat(this.str)||0;
    return parseFloat(varobj[this.str]);
};

CalcVar.prototype.nextTypes=function(){
    return [2,4];
};

CalcVar.prototype.toString=function(){
    var prefix='';
    if(!this.isConst){
        prefix='[';
        return prefix+this.str+']';
    }
    return prefix+this.str;
};

function CalcOp(str){
    this.str=str;
    this.type=2;
}

CalcOp.prototype.nextTypes=function(){
    return [1,3];
};

CalcOp.prototype.getLevel=function(){
    if(this.str=='*' || this.str=="index.html"){
        return 2;
    }
    return 1;
};

CalcOp.prototype.calc=function(num1,num2){
    var str=this.str;
    if(str=='+'){
        return num1+num2;
    }else if(str=='-'){
        return num1-num2;
    }else if(str=='*'){
        return num1*num2;
    }else if(str=='index.html'){
        if(num2==0) throw new Error("被除数不能为0");
        return num1/num2;
    }
};

CalcOp.prototype.toString=function(){
    return this.str;
};

function CalcLBrace(){
    this.type=3;
}

CalcLBrace.prototype.nextTypes=function(){
    return [1,3];
};

CalcLBrace.prototype.toString=function(){
    return "(";
};

function CalcRBrace(){
    this.type=4;
}

CalcRBrace.prototype.nextTypes=function(){
    return [2,4];
};

CalcRBrace.prototype.toString=function(){
    return ")";
};

function ParseFormula(calcStr){
    var calcarr=[];
    for(var i=0;i<calcStr.length;i++){
        var val=calcStr[i];
        if(val=='('){
            var calcobj=new CalcLBrace(true);
            calcarr.push(calcobj);
        }else if(val==')'){
            var calcobj=new CalcRBrace(false);
            calcarr.push(calcobj);
        }else if(['+','-','*','/'].indexOf(val)>=0){
            var calcobj=new CalcOp(val);
            calcarr.push(calcobj);
        }else if(val=='['){
            var vname='[';
            while(i<calcStr.length-1){
                var curv=calcStr[i+1];
                if(/[a-zA-Z0-9\]]/.test(curv)){
                    i++;
                    vname+=curv;
                }else{
                    break;
                }
            }
            if(vname=='') throw new Error("unknown char:" + val);
            var calcobj=new CalcVar(vname,false);
            calcarr.push(calcobj);
        }else if(/[0-9]/.test(val)){
            var vnum=val;
            while(i<calcStr.length-1){
                curv=calcStr[i+1];
                if(/[0-9.]/.test(curv)){
                    i++;
                    vnum+=curv;
                }else{
                    break;
                }
            }
            if(!/^\d+(\.\d*)?$/.test(vnum)){
                throw new Error("unknown char:" + val);
            }
            var calcobj=new CalcVar(vnum,true);
            calcarr.push(calcobj);
        }else{
            throw new Error("unknown char:" + val);
        }
    }
    return calcarr;
}

function ValidFormula(calcarr,partial){
    if(calcarr.length==0) return true;
    var validTypes=[1,3];
    var brace=0;
    for(var i=0;i<calcarr.length;i++){
        var calcobj=calcarr[i];
        if(validTypes.indexOf(calcobj.type)==-1){
            return false;
        }
        if(calcobj.type==1 && !calcobj.isConst){
            if(!/]$/.test(calcobj.str)){
                return false;
            }
        }
        validTypes=calcobj.nextTypes();
        if(calcobj.type==3) brace++;
        else if(calcobj.type==4){
            if(brace==0) return false;
            brace--;
        }
    }
    if(partial) return true;
    if([1,4].indexOf(calcarr[calcarr.length-1].type)==-1){
        return false;
    }
    return brace==0;
}

function CalcResult(calcarr,vars){
    var resultarr=helperFormula(calcarr,0,vars);
    return resultarr[0];
}

function helperFormula(calcarr,index,vars){
    var numStack=[];
    var opStack=[];
    for(var i=index;i<calcarr.length;i++){
        var calcobj=calcarr[i];
        if(calcobj.type==1){
            numStack.push(calcobj.getVal(vars));
        }else if(calcobj.type==2){
            while(opStack.length>0 && opStack[opStack.length-1].getLevel()>=calcobj.getLevel()){
                var op=opStack.pop();
                var num2=numStack.pop();
                var num1=numStack.pop();
                numStack.push(op.calc(num1,num2));
            }
            opStack.push(calcobj);
        }else if(calcobj.type==4){
            while(opStack.length>0){
                var op=opStack.pop();
                var num2=numStack.pop();
                var num1=numStack.pop();
                numStack.push(op.calc(num1,num2));
            }
            return [numStack[0],i];
        }else if(calcobj.type==3){
            var arr=helperFormula(calcarr,i+1,vars);
            numStack.push(arr[0]);
            i=arr[1];
        }
    }
    while(opStack.length>0){
        var op=opStack.pop();
        var num2=numStack.pop();
        var num1=numStack.pop();
        numStack.push(op.calc(num1,num2));
    }
    return [parseFloat((numStack[0]).toFixed(6)+0.000001), -1];
}
