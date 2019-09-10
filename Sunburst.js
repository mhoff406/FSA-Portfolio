///create margin variables

    var width = window.innerWidth;
    var height = window.innerHeight;
    var maxRadius = (Math.min(width, height) / 2.25) - 5;


///grab data
          var data = {
              "name": "TOTAL",
              "children": [
              {
                  "name": "Direct",
                  "children": [
                  {"name": "In-School", "value": 130.1},
                  {"name": "Grace", "value": 24.7},
                  {
                    "name": "Repayment",
                    "children":[
                    {"name": "Level: 10 Yrs or Less", "value": 219.9},
                    {"name": "Level: 10 Yrs or Greater", "value": 78.2},
                    {"name": "Graduated: 10 Yrs or less", "value": 88.3},
                    {"name": "Graduated: 10 Yrs or Greater", "value": 15.8},
                    {
                      "name": "Income Based",
                      "children":[
                        {"name": "Income-Contingent", "value": 30.9},
                        {"name": "Income Based", "value": 169.8},
                        {"name": "Pay As You Earn", "value": 85.3},
                        {"name": "Repay", "value": 144.8},
                      ]
                    },
                    {"name": "Alternative", "value": 36.6},
                    {"name": "Other", "value": 24.8}
                    ]
                  },
                  {"name": "Default", "value": 105.8},
                  {"name": "Other", "value": 8.4}
                  ]
                },
                  {
                  "name": "FFEL",
                  "children": [
                  {"name": "In-School", "value": 0.4},
                  {"name": "Grace", "value": 0.1},
                  {
                    "name": "Repayment",
                    "children":[
                    {"name": "Level: 10 Yrs or Less", "value": 17.05},
                    {"name": "Level: 10 Yrs or Greater", "value": 2.04},
                    {"name": "Graduated: 10 Yrs or less", "value": 5.61},
                    {"name": "Graduated: 10 Yrs or Greater", "value": 0.01},
                    {
                      "name": "Income Based",
                      "children":[
                    {"name": "Income-Contingent", "value": 0.03},
                    {"name": "Income Based", "value": 23.63},
                  ]
                },
                    {"name": "Default", "value": 0.14},
                    {"name": "Other", "value": 0.37}
                    ]
                  },
                  {"name": "Default", "value":66.5},
                  {"name": "Other", "value": 3.6}
                  ]
              },
                  {
                  "name": "Perkins",
                  "children": [
                  {"name": "Total", "value": 6.9}

              ]
            }
          ]
        }

      var formatNumber = d3.format(',d');

      var x = d3.scaleLinear()
          .range([0, 2 * Math.PI])
          .clamp(true);

      var y = d3.scaleSqrt()
          .range([maxRadius*.1, maxRadius]);

    var color = d3.scaleOrdinal(["#FFF5E6", "#0FBFBF", "#D697FF", "#829FD9", "#EB9A72", "#85A6A6", "#EA22A8"]);

      var partition = d3.partition();
///create the arcs
      var arc = d3.arc()
          .startAngle(d => x(d.x0))
          .endAngle(d => x(d.x1))
          .innerRadius(d => Math.max(0, y(d.y0)))
          .outerRadius(d => Math.max(0, y(d.y1)));

      var middleArcLine = d => {
          var halfPi = Math.PI/2;
          var angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
          var r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

          var middleAngle = (angles[1] + angles[0]) / 2;
          var invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
          if (invertDirection) { angles.reverse(); }

          var path = d3.path();
          path.arc(0, 0, r, angles[0], angles[1], invertDirection);
          return path.toString();
      };
///create labels, and orient them
      var textFits = d => {
          var CHAR_SPACE = 6;

          var deltaAngle = x(d.x1) - x(d.x0);
          var r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
          var perimeter = r * deltaAngle;

          return d.data.name.length * CHAR_SPACE < perimeter;
      };
///create svg element
      var svg = d3.select('#Sunburst').append('svg')
          .style('width', '100vw')
          .style('height', '100vh')
          .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
          .on('click', () => focusOn()); // Reset zoom on canvas click


          // Find the root node of our data, and begin sizing process.
          var root = d3.hierarchy(data)
              .sum(function (d) { return d.value});

          var slice = svg.selectAll('g.slice')
              .data(partition(root).descendants());

          slice.exit().remove();

          var newSlice = slice.enter()
              .append('g').attr('class', 'slice')
              .on('click', d => {
                  d3.event.stopPropagation();
                  focusOn(d);
              });

          newSlice.append('title')
              .text(d => d.data.name + '\n' + formatNumber(d.value));

          newSlice.append('path')
              .attr('class', 'main-arc')
              .style('fill', d => color((d.children ? d : d.parent).data.name))
              .attr('d', arc);

          newSlice.append('path')
              .attr('class', 'hidden-arc')
              .attr('id', (_, i) => `hiddenArc${i}`)
              .attr('d', middleArcLine);

          var text = newSlice.append('text')
              .attr('display', d => textFits(d) ? null : 'none');

          // Add white contour
          text.append('textPath')
              .attr('startOffset','50%')
              .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
              .text(d => d.data.name)
              .style('fill', 'none')
              .style('stroke', '#fff')
              .style('stroke-width', 0)
              .style('stroke-linejoin', 'round');

          text.append('textPath')
              .attr('startOffset','50%')
              .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
              .text(d => d.data.name);


      function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
          // Reset to top-level if no data point specified


///create Transition
          var transition = svg.transition()
              .duration(750)
              .tween('scale', () => {
                  var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                      yd = d3.interpolate(y.domain(), [d.y0, 1]);
                  return t => { x.domain(xd(t)); y.domain(yd(t)); };
              });

          transition.selectAll('path.main-arc')
              .attrTween('d', d => () => arc(d));

          transition.selectAll('path.hidden-arc')
              .attrTween('d', d => () => middleArcLine(d));

          transition.selectAll('text')
              .attrTween('display', d => () => textFits(d) ? null : 'none');

          moveStackToFront(d);

          //

          function moveStackToFront(elD) {
              svg.selectAll('.slice').filter(d => d === elD)
                  .each(function(d) {
                      this.parentNode.appendChild(this);
                      if (d.parent) { moveStackToFront(d.parent); }
                  })
}}
