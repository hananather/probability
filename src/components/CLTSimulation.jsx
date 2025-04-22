"use client";
import { useState, useEffect } from "react";
import React, { memo } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";

// demo canvas settings
const margin = { top: 15, right: 5, bottom: 15, left: 5 };
const width = 800;
const height = 500;

function CLTSimulation() {
  const [alpha, setAlpha] = useState(1);
  const [beta, setBeta] = useState(3.5);
  const [n, setN] = useState(10);
  const [draws, setDraws] = useState(5);
  const [showNorm, setShowNorm] = useState(true);

  // run the D3 CLT demo imperatively
  useEffect(() => {
    // clear previous
    d3.select("#clt-graph").selectAll("*").remove();
    function clt() {
      var dt=100, nLocal=n, alphaLocal=alpha, betaLocal=beta;
      var drawsLocal=draws, counts=[];
      var y1=height/3, y2=height/4, bins=20, interval;
      var svg = d3.select("#clt-graph").append("svg")
          .attr("width","100%")
          .attr("height","100%")
          .attr("viewBox","0 0 "+(width+margin.left+margin.right)+" "+(height+margin.top+margin.bottom))
          .attr("preserveAspectRatio","xMidYMid meet")
        .append("g").attr("transform","translate("+margin.left+","+margin.top+")");
      var x = d3.scaleLinear().domain([0,1]).range([0,width]);
      var yH = d3.scaleLinear().domain([0,3]).range([0,height-2*y1]);
      var yB = d3.scaleLinear().domain([0,3]).range([0,y1]);
      const pdfStroke = '#14b8a6';
      const pdfFill = 'rgba(20,184,166,0.2)';
      const normStroke = '#38a169';
      const histFill = '#14b8a6';
      const textColor = '#fff';
      const axisColor = '#fff';
      // Ball color palette for dropped samples
      const ballColors = [
        '#f59e42', // orange
        '#38bdf8', // sky blue
        '#f472b6', // pink
        '#a3e635', // lime
        '#facc15', // yellow
        '#818cf8', // indigo
        '#34d399', // emerald
        '#f87171', // red
        '#c084fc', // violet
        '#fb7185', // rose
      ];
      svg.append("clipPath")
        .attr("id","view_clt")
        .append("rect")
        .attr("x", 0)
        .attr("y", height - (2*y1 - y2))
        .attr("width", width)
        .attr("height", 2*y1 - y2);
      function hBar(y, label){
        const g = svg.append("g").attr("class", "axis");
        g.append("line")
          .attr("x1", x(0))
          .attr("x2", x(1))
          .attr("y1", y)
          .attr("y2", y)
          .attr("stroke", axisColor);
        g.append("text")
          .attr("x", x(0))
          .attr("y", y)
          .attr("dy", "1em")
          .attr("fill", axisColor)
          .text(label);
      }
      hBar(y1,"draw");hBar(y1+y2,"average");hBar(3*y1,"count");
      var pdfPath = svg.append("path")
          .attr("id", "pdf")
          .attr("stroke", pdfStroke)
          .attr("fill", "none")
          .attr("stroke-width", 2),
        pdfArea = svg.append("path")
          .attr("id", "pdfArea")
          .attr("fill", pdfFill)
          .attr("opacity", 0.2),
        normPath = svg.append("path")
          .attr("id", "cdf")
          .attr("clip-path", "url(#view_clt)")
          .attr("stroke", normStroke)
          .attr("fill", "none")
          .attr("stroke-width", 2)
          .attr("opacity", 0)
          .lower();
      function drawSampling(){
        var clipV=(3*y1)/yB.range()[1];
        var betaPDF=d3.range(0,1.05,0.05).map(t=>[t,Math.min(jStat.beta.pdf(t,alphaLocal,betaLocal),clipV)]);
        var line=d3.line().x(d=>x(d[0])).y(d=>y1-yB(d[1])).curve(d3.curveBasis);
        var area=d3.area().x(d=>x(d[0])).y0(y1).y1(d=>y1-yB(d[1])).curve(d3.curveBasis);
        pdfPath.datum(betaPDF).attr("d",line);
        pdfArea.datum(betaPDF).attr("d",area);
        var normLine=d3.line().x(d=>x(d[0])).y(d=>3*y1-yH(d[1])).curve(d3.curveBasis);
        if(nLocal===1){normPath.datum(betaPDF).attr("d",normLine);yH.domain([0,3]);}
        else{var mu=jStat.beta.mean(alphaLocal,betaLocal);
          var sigma=Math.sqrt(jStat.beta.variance(alphaLocal,betaLocal)/nLocal);
          var xMode=mu; yH.domain([0,jStat.normal.pdf(xMode,mu,sigma)]);
          var normPDF=d3.range(0,1.05,0.01).map(t=>[t,jStat.normal.pdf(t,mu,sigma)]);
          normPath.datum(normPDF).attr("d",normLine);
        }
        normPath.attr("opacity", showNorm?1:0);
      }
      var histogramGen=d3.histogram().domain(x.domain()).thresholds(x.ticks(bins));
      var bars=svg.append("g").attr("class","histogram");
      function drawHistogram(){
        var hist=histogramGen(counts);
        var hPeak=d3.max(hist,d=>d.length);
        var normPeak=nLocal===1?3:(1/(Math.sqrt(2*Math.PI)*Math.sqrt(jStat.beta.variance(alphaLocal,betaLocal)/nLocal)));
        var ymax=Math.max(hPeak,normPeak);
        yH.domain([0,ymax]);
        var gs=bars.selectAll("g").data(hist);
        var e=gs.enter().append("g").attr("class","bar"); 
        e.append("rect"); 
        e.append("text")
          .attr("class", "hist-label")
          .attr("text-anchor", "middle");
        gs.select("rect")
          .attr("fill", histFill)
          .attr("x", d => x(d.x0) + 1)
          .attr("width", x(hist[0].x1 - hist[0].x0) - 1)
          .transition().duration(250)
          .attr("y", d => 3*y1 - yH(d.length))
          .attr("height", d => yH(d.length));
        gs.select("text.hist-label")
          .attr("fill", textColor)
          .attr("x", d => x(d.x0 + 0.5*(hist[0].x1 - hist[0].x0)))
          .attr("y", d => 3*y1 - yH(d.length/2))
          .attr("font-size", "1.1em")
          .attr("font-weight", 600)
          .text(d => {
            if (d.length > 0 && counts.length > 0) {
              const pct = Math.round((d.length / counts.length) * 100);
              return pct > 0 ? pct + "%" : "";
            }
            return "";
          });
        gs.exit().remove();
      }
      function tick(){
        var sample=d3.range(nLocal).map(()=>jStat.beta.sample(alphaLocal,betaLocal));
        var meanVal=d3.mean(sample);
        var balls = svg.append("g").selectAll("circle").data(sample).enter().append("circle")
          .attr("cx", d => x(d))
          .attr("cy", y1)
          .attr("r", 5)
          .attr("fill", (d, i) => ballColors[i % ballColors.length])
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.2);
        var inF=0,done=0;
        balls.transition().duration(dt).attr("cy",y1+y2-5)
          .each(()=>inF++).on("end",function(){ if(!--inF){balls.transition().duration(400)
              .attr("cx", x(meanVal))
              .attr("cy", 3*y1 - 3)
              .attr("r", 3)
              .each(()=>done++).on("end",function(){ if(!--done){counts.push(meanVal);drawSampling();drawHistogram();}d3.select(this).remove();});}});
      }
      function start(){var maxB=200,maxK=Math.max(1,Math.floor(maxB/nLocal));var K=drawsLocal>maxK?(console.warn(`Capping draws to ${maxK}`),maxK):drawsLocal;dt=350/Math.pow(1.04,K);var c=0;interval=setInterval(()=>{tick();if(++c===K)clearInterval(interval);},dt);}
      function reset(){clearInterval(interval);counts=[];svg.selectAll(".bar, circle").remove();yH.domain([0,3]);drawSampling();}
      d3.select("#alpha_clt").on("input",function(){alphaLocal=+this.value;d3.select("#alpha_clt-value").text(alphaLocal);reset();});
      d3.select("#beta_clt").on("input",function(){betaLocal=+this.value;d3.select("#beta_clt-value").text(betaLocal);reset();});
      d3.select("#sample").on("input",function(){nLocal=+this.value;d3.select("#sample-value").text(nLocal);reset();});
      d3.select("#draws").on("input",function(){drawsLocal=+this.value;d3.select("#draws-value").text(drawsLocal);});
      d3.select("#theoretical").on("change", function() {
        setShowNorm(this.checked);
      });
      d3.select("#form_clt").on("click",()=>{clearInterval(interval);start();});
      drawSampling();
    }
    clt();
    return ()=>d3.select("#clt-graph").selectAll("*").remove();
  },[alpha,beta,n,draws,showNorm]);

  // Reset entire page state
  function handleReset() {
    window.location.reload();
  }

  return (
    <section id="clt-demo" className="space-y-4">
      <h3 className="text-lg font-semibold">Central Limit Theorem – Beta(α, β) → Normal(μ, σ/√n)</h3>
      <div className="controls flex flex-wrap gap-4 items-center">
        α <input id="alpha_clt" type="range" min="0.5" max="6" step="0.1" defaultValue="1" className="w-32" />
        <span id="alpha_clt-value">1</span>
        β <input id="beta_clt" type="range" min="0.5" max="6" step="0.1" defaultValue="3.5" className="w-32" />
        <span id="beta_clt-value">3.5</span>
        n <input id="sample" type="range" min="1" max="50" step="1" defaultValue="10" className="w-32" />
        <span id="sample-value">10</span>
        draws <input id="draws" type="range" min="1" max="100" step="1" defaultValue="5" className="w-32" />
        <span id="draws-value">5</span>
        <label><input id="theoretical" type="checkbox" defaultChecked /> Show Normal overlay</label>
        <button id="form_clt" className="px-3 py-1 bg-blue-600 text-white rounded">Drop samples</button>
        <button onClick={handleReset} className="px-3 py-1 bg-red-600 text-white rounded">Reset</button>
      </div>
      <div id="clt-graph" style={{width:"100%",maxWidth:"800px",height:"500px",margin:"auto"}} />
    </section>
  );
}

export default memo(CLTSimulation);
