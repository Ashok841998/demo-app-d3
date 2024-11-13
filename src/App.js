import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './App.css';

const data = {
  nodes: [
    { id: 'Order_Processing', x: 2, y: 200, width: 180, height: 100, count: '3', Isparent: 1, startPosition:'right', isMultilayer: true },
    { id: 'vivi_Placer', x: 350, y: 200, width: 180, height: 100, count: '1', Isparent: 1, startPosition:'right', isMultilayer: true },
    { id: 'rms_queue_worker', x: 700, y: 200, width: 180, height: 100, count: '1', Isparent: 1, startPosition:'right', isMultilayer: true },
    { id: 'rms', x: 1100, y: -40, width: 180, height: 100, count: '', Isparent: 1, startPosition:'right', isMultilayer: true },
    { id: 'vendor app', x: 1600, y: -40, width: 180, height: 100, count: '', Isparent: 0, startPosition:'top', isMultilayer: false },
    { id: 'External POS 1', x: 1600, y: 600, width: 180, height: 100, count: '', Isparent: 0, startPosition:'right', isMultilayer: false },
    { id: 'CRM', x: 700, y: -200, width: 180, height: 100, count: '', Isparent: 0, startPosition:'right', isMultilayer: false },
    { id: 'introciter', x: 1100, y: 500, width: 180, height: 100, count: '', Isparent: 0, startPosition:'right', isMultilayer: false },
    { id: 'External POS', x: 1600, y: 300, width: 180, height: 100, count: '', Isparent: 0, startPosition:'bottom', isMultilayer: false },
  ],
  childnodes: [
    { childId: 'create_order_queue', parentId: 'Order_Processing', x: -150, y: -150 },
    { childId: 'update_order_queue', parentId: 'Order_Processing', x: -150, y: -60 },
    { childId: 'arrival_time_update', parentId: 'Order_Processing', x: -150, y: 80 },
    { childId: 'relay_delay_bcp', parentId: 'Order_Processing', x: -120, y: 200 },
    { childId: 'create_order_consumer', parentId: 'vivo_placer', x: -120, y: 200 },
    { childId: 'update_order_consumer', parentId: 'vivo_placer', x: -120, y: 200 },
    { childId: 'arrival_update_consumer', parentId: 'vivo_placer', x: -120, y: 200 },
    { childId: '/relay_delay_update', parentId: 'vivo_placer', x: -120, y: 200 },
  ],
  links: [
    { source: 'Order_Processing', target: 'vivi_Placer', arrow:''},
    { source: 'vivi_Placer', target: 'rms_queue_worker', arrow:'' },
    { source: 'rms_queue_worker', target: 'rms',  arrow:'up' },
    { source: 'rms_queue_worker', target: 'introciter', arrow:'down' },
    { source: 'CRM', target: 'rms', arrow:'down' },
    { source: 'introciter', target: 'External POS 1', arrow:'down' },
    { source: 'vendor app', target: 'rms', arrow:'left' },
    { source: 'External POS', target: 'introciter', arrow:'left' },
  ],
  childLinks: [
    { source: 'create_order_queue', x: 10, y:-10, width: 0, height: 0, target: 'vivi_Placer' },
    { source: 'update_order_queue', x: 0, y: 0, width: 0, height: 0, target: 'vivi_Placer' },
    { source: 'arrival_time_update', x: 0, y: 0, width: 0, height: 0, target: 'vivi_Placer' },
    { source: 'relay_delay_bcp', x: 0, y: 0, width: 0, height:0,target: 'vivi_Placer' },
    { source: 'create_order_consumer', x: 0, y: 0, width: 0, height:0,target: 'rms_queue_worker' },
    { source: 'update_order_consumer', x: 0, y: 0, width: 0, height:0,target: 'rms_queue_worker' },
    { source: 'arrival_update_consumer', x: 0, y: 0, width: 0, height:0,target: 'rms_queue_worker' },
    { source: 'relay_delay_update', x: 0, y: 0, width: 0, height:0,target: 'rms_queue_worker' },
  ]
};

function App() {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current) return;
    const width = 2300;
    const height = 200;
    const boxWidth = 180;
    const boxHeight = 100;

    const svg = d3.select(svgRef.current);

    svg.attr('viewBox', `-400 150 ${width} ${height}`);

    svg.selectAll('*').remove();

    const nodesById = data.nodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});

    const isHorizontal = (source, target) => {
      return Math.abs(source.y - target.y) < 20; // Adjust tolerance as needed
    };

    const pathGenerator = (source, target) => {
      const midX = (source.x + source.width + target.x) / 2;
      const endXPos = target.isMultilayer ? target.x - 18 : target.x ;
      return `M${source.x + source.width} ${source.y + source.height / 2}
      L${midX} ${source.y + source.height / 2}, 
      L${midX} ${target.y + target.height / 2},      
      L${endXPos} ${target.y + target.height / 2}`;
    };
  
    const horizontalPath = (source, target) => {
      const startXPos = source.isMultilayer ? source.x + source.width + 13 : source.x + source.width ;
      const endXPos = target.isMultilayer ? target.x - 18 : target.x ;
      return `M${startXPos} ${source.y + source.height / 2} 
        L${endXPos} ${target.y + target.height / 2}`;
    }
    
    const topPathGenerator = (source,target) => {
      const midX1 = source.x + source.width/2;
      const midX2 = target.x + target.width/2;

      return`M${midX1} ${source.y}
      L${midX1} ${source.y - 50}
      L${midX2} ${target.y - 50}
      L${midX2} ${target.y}`;
    }

    const bottomPathGenerator = (source,target) => {
      const midX1 = source.x + source.width/2;
      const midX2 = target.x + target.width/2;

      return`M${midX1} ${source.y + source.height}
      L${midX1} ${source.y + source.height + 50}
      L${midX2} ${target.y - 50}
      L${midX2} ${target.y}`;
    }

    function placeArrows(path) {
      const pathLength = path.node().getTotalLength();  // Total path length
      const arrowPos = pathLength / 2;  // First arrow at 1/3 of the path length
    
      // Get the exact points for the arrows
      const point1 = path.node().getPointAtLength(arrowPos);  
      // Create two small circles (for visualization) at the positions of the arrows
      // svg.append('circle')
      // .attr('cx', point1.x)
      // .attr('cy', point1.y)
      // .attr('r', 5)
      // .attr('fill', 'red');

      let iconHref = 'special_arrow.svg';
      const link = `${path.datum().source}-to-${path.datum().target}`;
      switch (link) {
        case 'rms_queue_worker-to-rms':
          iconHref = 'up.svg';
          break;
        case 'rms_queue_worker-to-introciter':
          iconHref = 'down.svg';
          break;
        case 'CRM-to-rms':
          iconHref = 'down.svg';
          break;
        case 'introciter-to-External POS 1':
          iconHref = 'down.svg';
          break;
        case 'vendor app-to-rms':
          iconHref = 'left.svg';
          break;
        case 'External POS-to-introciter':
          iconHref = 'left.svg';
          break;
        default:
          break;
      }
      svg.append('image')
        .attr('xlink:href', iconHref)
        .attr('x', point1.x - 7.5)
        .attr('y', point1.y - 7.5)
        .attr('width', 15)
        .attr('height', 15)
        .datum(path.datum());
        
        
      // Add arrow markers at the calculated points
      svg.append('use')
        .attr('x', point1.x - 5)    // Adjust x to center the arrowhead marker
        .attr('y', point1.y - 5)    // Adjust y to center the arrowhead marker
        .attr('href', '#arrowhead'); // Reference the arrowhead marker
    
    }

   svg.append('defs')
    .append('marker')
    .attr('id', 'circle-start') 
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 5)             
    .attr('refY', 5)             
    .attr('markerWidth', 12)     
    .attr('markerHeight', 5)    
    .append('circle')            
    .attr('cx', 12)               
    .attr('cy', 5)               
    .attr('r', 4)                
    .attr('fill', '#999'); 

    svg.append('defs')
    .append('marker')
    .attr('id', 'circle-top') 
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 5)             
    .attr('refY', 12)             
    .attr('markerWidth', 5)     
    .attr('markerHeight', 12)    
    .append('circle')            
    .attr('cx', 5)               
    .attr('cy', 5)               
    .attr('r', 4)                
    .attr('fill', '#999');

    svg.append('defs')
    .append('marker')
    .attr('id', 'circle-bottom') 
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 5)             
    .attr('refY', -2)             
    .attr('markerWidth', 12)     
    .attr('markerHeight', 5)    
    .append('circle')            
    .attr('cx', 5)               
    .attr('cy', 5)               
    .attr('r', 4)                
    .attr('fill', '#999');
  
    svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrow')
    .attr("viewBox", "0 0 10 10")
    .attr('refX', 12)
    .attr('refY', 5)
    .attr('markerWidth', 7)
    .attr('markerHeight',7)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 0 0 L 10 5 L 0 10')
    .attr('fill', 'none');
    
    svg.append('defs')
    .append('marker')
    .attr('id', 'arrowhead')         
    .attr('viewBox', '0 0 10 10')    
    .attr('refX', 5)                 
    .attr('refY', 5)                 
    .attr('markerWidth', 6)          
    .attr('markerHeight', 6)         
    .attr('orient', 'auto')         
    .append('path')                 
    .attr('d', 'M 0 0 L 10 5 L 0 10')
    .attr('fill', 'black');           
    

    
  // Add the paths for links using Bezier curve
  const path = svg
  .append('g')
  .attr('class', 'links')
  .selectAll('path')
  .data(data.links)
  .enter()
  .append('path')
  .attr('class', d => `${d.source}`)
  .attr('d', d => {
    const source = nodesById[d.source];
    const target = nodesById[d.target];
    
    if(source.startPosition === 'top') {
      return topPathGenerator(source, target)
    }else if(source.startPosition === 'bottom') {
      return bottomPathGenerator(source, target)
    }else {
      if (isHorizontal(source, target)) {
        // Straight path (horizontal)
        return horizontalPath(source, target);
      } else {
        // Curved path (Bezier curve)
        return pathGenerator(source, target);
      }
    }
  })
  .attr('stroke', '#999')
  .attr('stroke-width', 2)
  .attr('marker-start', d=> {
    const source = data.nodes.find(node => node.id === d.source);
    return source.startPosition === 'top' ? `url(#circle-top)` :   source.startPosition === 'bottom' ? `url(#circle-bottom)` :`url(#circle-start)`})  
  .attr('marker-end', 'url(#arrow)')
  .attr('fill', 'none');

  // Call placeArrows to add arrows at 1/3 and 2/3 of each path
  path.each(function() {
    placeArrows(d3.select(this));  // Pass the current path element to placeArrows
  });
      
    // svg
    //   .append('g')
    //   .attr('class', 'rectangles')
    //   .selectAll('g')
    //   .data(data.links)
    //   .enter()
    //   .append('g') // Append a group for rect and text
    //   .append('rect')
    //   .attr('x', d => {
    //     const source = data.nodes.find(node => node.id === d.source);
    //     const target = data.nodes.find(node => node.id === d.target);
    //     if (isHorizontal(source, target)) {
    //       return Math.min(source.x, target.x) + 276;
    //     } else {
    //       return (source.x + target.x) / 1.99;
    //     }
    //   })
    //   .attr('y', d => {
    //     const source = data.nodes.find(node => node.id === d.source);
    //     const target = data.nodes.find(node => node.id === d.target);
    //     if (isHorizontal(source, target)) {
    //       return Math.min(source.y, target.y) - 60
    //     } else {
    //       return (source.y + target.y) / 1.6;
    //     }
    //   })
    //   .attr('width', 45)
    //   .attr('height', 20)
    //   .attr('fill', '#E6F9F5')
    //   .attr('stroke', '#83DCB3')
    //   .attr('stroke-width', 1);
    // svg
    //   .select('g.rectangles')
    //   .selectAll('g')
    //   .append('text')
    //   .text(d => d.greenlbl)
    //   .attr('x', 22.5)
    //   .attr('y', 12)
    //   .attr('text-anchor', 'middle')
    //   .attr('font-size', '12px')
    //   .attr('font-weight', 'bold')
    //   .attr('fill', '#83DCB3');
    svg
      .append('g')
      .selectAll('circle')
      .data(data.links.filter(d => isHorizontal(data.nodes.find(node => node.id === d.source), data.nodes.find(node => node.id === d.target)) && data.nodes.find(node => node.id === d.source).Isparent === 1))
      .attr('class', d => `parent ${d.source}`)
      .enter()
      .append('g') // Append a group for circle and image
      .attr('transform', function (d) {
        if (d.source && d.target) {
          const source = data.nodes.find(node => node.id === d.source);
          const target = data.nodes.find(node => node.id === d.target);
          const midpoint = calculateMidpoint(source, target);
          return `translate(${midpoint.x + 85}, ${midpoint.y + 52})`; // Center the group at the midpoint
        }
      })
      .attr('stroke','#7393B3')
      .attr('stroke-width', 0.5)
      .each(function (d) {
        d3.select(this)
          .append('circle')
          .attr('r', 25)
          .attr('fill', '#FFFFFF')

        d3.select(this)
          .append('image')
          .attr('xlink:href', 'Vector.svg')
          .attr('x', -10) 
          .attr('y', -10) 
          .attr('width', 20) 
          .attr('height', 20)

        d3.select(this)
          .append('rect')
          .attr('width', 30)  
          .attr('height', 20) 
          .attr('x', -15)     
          .attr('y', 15)      
          .attr('fill', 'white')
          .attr('rx', 6)        
          .attr('ry', 6)  

        d3.select(this)
          .append('text')
          .text('+2')
          .attr('x',-1)
          .attr('y',28)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', 'black');
      });
    function calculateMidpoint(source, target) {
      const x = (source.x + target.x) / 2;
      const y = (source.y + target.y) / 2;
      return { x, y };
    }
    const node = svg
      .append('g')
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    node
      .append('rect')
      .attr('width', 176)
      .attr('height', 85)
      .attr('rx', 1)
      .attr('ry', 1)
      .attr('stroke', d => d.id === "rms" ? '#e1e9ff' : '#cdb9ed')
      .attr('fill', 'white')
      .attr('stroke-width', 6)
      .attr('transform', 'rotate(7.93, -60, 160)')
      .style('display', d => (d.Isparent ? 'block' : 'none'));

    node
      .append('rect')
      .attr('width', 176)
      .attr('height', 85)
      .attr('rx', 1)
      .attr('ry', 1)
      .attr('stroke', d => d.id === "rms" ?'#e1e9ff':'#cdb9ed')
      .attr('fill', 'white')
      .attr('stroke-width', 6)
      .attr('transform', 'rotate(-6.93, 240, 100)')
      .attr('x', -10)
      .style('display', d => (d.Isparent ? 'block' : 'none'));

    node
      .append('rect')
      .attr('width', boxWidth)
      .attr('height', boxHeight)
      .attr('rx', 1)
      .attr('ry', 1)
      .attr('stroke', d => d.id === "introciter" ? '#e0f2ff' : d.id === "CRM" ? '#e1e9ff' : d.id === "vendor app" ? '#e3f6fc' : '#FFEDC7')
      .attr('fill', 'white')
      .attr('stroke-width', 6)
      .attr('class', d => d.id)
      .each(function(d) {
        const grid = d3.select(this.parentNode)
          .append('g')
          .attr('transform', `translate(${boxWidth / 2 - 40}, ${boxHeight / 2})`);

        grid
          .append('image')
          .attr('xlink:href', d => ["Order_Processing", "vivi_Placer", "rms_queue_worker", "rms"].includes(d.id) ? 'bx_collection.svg' : ["CRM", "introciter"].includes(d.id) ? 'diag-shape.svg' : 'streamline_web.svg')
          .attr('x', -20)
          .attr('y', -15)
          .attr('width', 20)
          .attr('height', 20);

        grid
          .append('text')
          .text(d => d.id)
          .attr('x', 10)
          .attr('y', 0)
          .attr('font-size', '14px')
          .attr('fill', '#333')
          .attr('text-anchor', 'start');
      });

    node
      .append('rect')
      .attr('x', boxWidth / 2.1 - 15)  
      .attr('y', boxHeight + 7 - 15) 
      .attr('width', 40)    
      .attr('height', 20)   
      .attr('fill', 'white') 
      .attr('stroke', '#333') 
      .attr('rx', 5)        
      .attr('ry', 5)
      .attr('stroke-width', 1) 
      .attr('class', 'Counter')
      .style('display', d => (d.count ? 'inline' : 'none'));

    node
      .append('text')
      .text(d => (d.count ? `+${d.count}` : ''))
      .attr('x', boxWidth / 2)
      .attr('y', boxHeight + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', 'black');

    d3.selectAll('.Counter')
      .on('click', function (event, d) {
        if (d.count) {
          if (d.id ==='Order_Processing'){
            d3.select(this.parentNode).selectAll('.Order_Processing').style('display', 'none');
            d3.select(this.parentNode).selectAll('rect').style('display', 'none');
            d3.select(this.parentNode).selectAll('text').style('display', 'none');
            d3.select(this.parentNode).selectAll('circle').style('display', 'none');
            d3.select(this.parentNode).selectAll('image').style('display', 'none');
            d3.select('.links').select(`.${d.id}`).style('display', 'none');
            d3.selectAll('g').select(`.${d.id}`).style('display', 'none');
            const childNodes = data.childnodes.filter(cn => cn.parentId === d.id);
            const viviPlacerNode = data.nodes.find(node => node.id === 'vivi_Placer');
            const viviPlacerX = viviPlacerNode.x + boxWidth / 2;
            const viviPlacerY = viviPlacerNode.y + boxHeight / 2;

            // Calculate the bounding box for the dotted rectangle
            const padding = 100; // Extra padding around the child nodes
            const minX = d.x + Math.min(...childNodes.map(cn => cn.x)) - padding;
            const minY = d.y + Math.min(...childNodes.map((cn, index) => cn.y + index * 80)) - 80 - padding;
            const maxX = d.x + Math.max(...childNodes.map(cn => cn.x)) + 140 + padding;
            const maxY = d.y + Math.max(...childNodes.map((cn, index) => cn.y + index * 80)) + padding;

            // Append the dotted border rectangle
            const borderGroup = svg.append('g').attr('class', 'dotted-border');
            borderGroup
              .append('rect')
              .attr('x', minX)
              .attr('y', minY)
              .attr('width', maxX - minX)
              .attr('height', maxY - minY)
              .attr('stroke', '#888')
              .attr('stroke-width', 1.5)
              .attr('stroke-dasharray', '4,4') // Dotted line style
              .attr('fill', 'none')
              .attr('class', 'dotted-border-rect')
            borderGroup
              .append('image')
              .attr('xlink:href', 'Frame 23.svg')
              .attr('width', 40)
              .attr('class', 'pop-out')
              .attr('height', 40)
              .attr('transform', `translate(${maxX - 20}, ${minY})`);
            borderGroup
              .append('rect')
              .attr('width', 140)
              .attr('height', 30)
              .attr('rx', 10)
              .attr('ry', 10)
              .attr('stroke', '#ddd')
              .style('fill', 'white')
              .attr('stroke-width', 2)
              .attr('transform', `translate(-200, -140)`);
            borderGroup.append('text')
              .attr('transform', `translate(-190,-120)`)
              .text(d.id)
              .attr('stroke', '#888')
              .attr('stroke-width', 1.5)
              .attr('fill', 'white')
            // Append each child node
            childNodes.forEach((cn, index) => {
              const childNodeGroup = svg.append('g')
                .attr('class', cn.childId)
                .attr('transform', `translate(${d.x + cn.x}, ${d.y + cn.y})`);

              childNodeGroup
                .append('rect')
                .attr('width', 155)
                .attr('height', 60)
                .attr('rx', 5)
                .attr('ry', 5)
                .attr('stroke', '#ddd')
                .style('fill', '#8F00FF')
                .attr('stroke-width', 2)
                .attr('transform', `translate(0, ${-80 + (index * 80)})`);

              // Add an image inside the rectangle
              childNodeGroup
                .append('image')
                .attr('xlink:href', 'SNS.svg')
                .attr('width', 20)
                .attr('height', 20)
                .attr('x', 7)
                .attr('y', -61 + (index * 80)); 

              // Child Node Label
              childNodeGroup
                .append('text')
                .attr('x', 90) // Adjust x position to align with the image
                .attr('y', -45 + (index * 80))
                .text(cn.childId)
                .attr('text-anchor', 'middle')
                .attr('font-size', '14px')
                .attr('fill', 'white')
                .attr('font-family', 'JetBrains Mono');

              // Additional Rectangle Element
              const extraRectYPosition = 0 + (index * 80); // Dynamic y position for the extra rectangle
              childNodeGroup
                .append('rect')
                .attr('width', 140)
                .attr('height', 60)
                .attr('rx', 0)
                .attr('ry', 0)
                .attr('stroke', '#ddd')
                .style('fill', 'white')
                .attr('stroke-width', 2)
                .attr('transform', `translate(0, ${extraRectYPosition})`);


              // Calculate the center position of this rectangle for the line connection
              const extraRectCenterX = d.x + cn.x + 140 / 2;
              const extraRectCenterY = d.y + cn.y + extraRectYPosition + 60 / 2;
              const decreaselinePath = cn.y < 140 ? 2 : 15;

              // Draw line from the center of the additional rectangle to 'vivi_Placer'
              svg.select('.links')
                .append('line')
                .attr('x1', extraRectCenterX + 70)
                .attr('y1', extraRectCenterY - decreaselinePath)
                .attr('x2', viviPlacerX)
                .attr('y2', viviPlacerY)
                .attr('stroke', '#999')
                .attr('stroke-width', 1)
                .attr('marker-end', 'url(#arrow)');

              // Path generator function for child nodes
              for (let i = 0; i < 3; i++) {
                childNodeGroup
                  .append('image')
                  .attr('xlink:href', 'ri_mail-line.svg')
                  .attr('width', 30)
                  .attr('height',30)
                  .attr('x', 10 + (i * 45))
                  .attr('y', 15)
                  .attr('transform', `translate(0, ${extraRectYPosition})`);
              }
              svg.select('.links')
                .selectAll('line')
                .attr('x2', 345)
            });
            svg.selectAll('.pop-out').on('click', (event, d) => {
              event.stopPropagation();
              if (svg.selectAll('.pop-out-two').empty()) {
                d3.select(this.parentNode).selectAll('.Order_Processing').style('display', 'block');
                d3.select(this.parentNode).selectAll('rect').style('display', 'block');
                d3.select(this.parentNode).selectAll('text').style('display', 'block');
                d3.select(this.parentNode).selectAll('circle').style('display', 'block');
                d3.select(this.parentNode).selectAll('image').style('display', 'block');
                d3.select('g').selectAll('.Order_Processing').style('display', 'block');
                svg.selectAll('.pop-out').remove();
                svg.selectAll('.dotted-border-rect,.dotted-border').remove();
                svg.selectAll('.create_order_queue,.update_order_queue,.arrival_time_update,.relay_delay_bcp,line').remove();
              }
            });
          }
          if (d.id === 'vivi_Placer' && !d3.select('.dotted-border').select('.pop-out').empty()) {
            d3.select(this.parentNode).selectAll('.vivi_Placer').style('display', 'none');
            d3.select(this.parentNode).selectAll('rect').style('display', 'none');
            d3.select(this.parentNode).selectAll('text').style('display', 'none');
            const borderGrouptwo = svg.append('g').attr('class', 'dotted-border-two');
            const group = borderGrouptwo
                .append('g')
                .attr('transform', 'rotate(90) translate(0,80)')
                .attr('class', 'dotted-border-rect-group');

            group.append('image')
              .attr('xlink:href', 'Frame 23.svg')
              .attr('class', 'pop-out-two')
                .attr('x', 10) 
                .attr('y', -680) 
                .attr('width', 40)
                .attr('height', 70)


            group.append('circle')
              .attr('cx', 450)
              .attr('cy', -650)
              .attr('r', 50)
              .attr('fill', 'white')
              .attr('stroke', '#888')

            borderGrouptwo
              .append('rect')
              .attr('x', 345)
              .attr('y', 70)
              .attr('width', 200)
              .attr('height', 358)
              .attr('stroke', '#888')
              .attr('stroke-width', 1.5)
              .attr('fill', '#C2E6F7')
              
              
            group.append('rect')
                .attr('x', 10)
                .attr('y', -651)
                .attr('width', 500)
                .attr('height', 250)
                .attr('stroke', '#888')
                .attr('stroke-width', 1.5)
                .attr('stroke-dasharray', '4,4')
                .attr('fill', 'none')

            borderGrouptwo.append('image')
              .attr('xlink:href', 'redis.svg')
                .attr('x', 540) 
                .attr('y', 340) 
                .attr('width', 60)
                .attr('height', 70)
              .attr('transform', 'rotate(0) translate(0,80)');
          
              borderGrouptwo.selectAll('.inner-rect')
                .data(d3.range(4))
                .enter()
                .append('rect')
                .attr('class', 'inner-rect')
                .attr('x', 355) 
                .attr('y', (d, i) => 100 + 80 * i) 
                .attr('width', 180) 
                .attr('height', 60) 
                .attr('stroke', '#555')
                .attr('stroke-width', 1)
                .attr('fill', 'white');

              borderGrouptwo.selectAll('.inner-text')
                .data(d3.range(4))
                .enter()
                .append('text')
                .attr('x', 530) // Adjust x position to be in front of the rectangle
                .attr('y', (d, i) => 130 + 80 * i)
                .attr('text-anchor', 'end') // Align text to the end
                .attr('dominant-baseline', 'middle')
                .attr('fill', 'black')
                .text((d, i) => ['create_order_consumer', 'update_order_consumer', 'arrival_update_consumer', '/relay_delay_update'][i]);
               d3.select('.links').selectAll('path').filter(function() { return d3.select(this).classed('vivi_Placer'); }).style('display', 'block');
                svg.select('.links')
                  .selectAll('line')
                  .attr('x2', 320)

            svg.selectAll('.pop-out-two').on('click', (event, d) => {
              svg.selectAll('.dotted-border-two').remove();
              d3.select(this.parentNode).selectAll('.vivi_Placer').style('display', 'block');
              d3.select(this.parentNode).selectAll('rect').style('display', 'block');
              d3.select(this.parentNode).selectAll('text').style('display', 'block');
              svg.select('.links')
                .selectAll('line')
                .attr('x2', 345)
            });
          }

        }
      });
  }, []);

  return (
    <div className="App" style={{ overflowX: 'auto', width: '100%', height: '100vh' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100vh"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', overflowX: 'auto' }}
      ></svg>
    </div>
  );
}

export default App;




