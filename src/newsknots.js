var TimeKnots = {
  draw: function(id, events, options) {
    var cfg = {
      width: 600,
      height: 200,
      radius: 10,
      lineWidth: 4,
      color: "#999",
      background: "#FFF",
      dateFormat: "%Y/%m/%d %H:%M:%S",
      showLabels: false,
      labelFormat: "%Y/%m/%d %H:%M:%S",
      seriesColor: d3.scale.category20(),
    };

    //default configuration overrid
    if (options != undefined) {
      for (var i in options) {
        cfg[i] = options[i];
      }
    }

    var svg = d3.select(id).append('svg').attr("width", cfg.width).attr("height", cfg.height);
    //Calculate times in terms of timestamps
    var timestamps = events.map(function(d) {
      return Date.parse(d.publishedAt);
    }); //new Date(d.date).getTime()});
    var maxValue = d3.max(timestamps);
    var minValue = d3.min(timestamps);
    var margin = (d3.max(events.map(function(d) {
      return d.radius
    })) || cfg.radius) * 1.5 + cfg.lineWidth;
    var step = ((cfg.width - 2 * margin) / (maxValue - minValue));
    var series = [];
    if (maxValue == minValue) {
      step = 0;
      margin = cfg.width / 2
    }

    svg.selectAll("line")
      .data(events).enter().append("line")
      .attr("class", "timeline-line")
      .attr("x1", function(d, i) {
        var datum = new Date(d.publishedAt).getTime();
        var x = Math.floor(step * (datum - minValue) + margin);
        var dPrev = events[i-1];
        if (dPrev != null) {
          if (Math.abs(x - dPrev.x1) < (cfg.radius * 2)) {
            x = dPrev.x1;
          }
        }
        d.x1 = x;
        return x;
      })
      .attr("x2", function(d, i) {
        var dd = events[i - 1] != null ? events[i - 1] : d;
        var datum = new Date(dd.publishedAt).getTime();
        var x = Math.floor(step * (datum - minValue) + margin);
        var dPrev = events[i-2];
        if (dPrev != null) {
          if (Math.abs(x - dPrev.x2) < (cfg.radius * 2)) {
            x = dPrev.x2;
          }
        }
        dd.x2 = x;
        return x;
      })
      .attr("y1", function(d, i) {
        var datum = new Date(d.publishedAt).getTime();
        var x = Math.floor(step * (datum - minValue) + margin);
        var y = Math.floor(cfg.height / 4);
        var dPrev = events[i-1];
        if (dPrev != null) {
          if (Math.abs(x - dPrev.cx) < (cfg.radius * 2)) {
            y = dPrev.cy + cfg.radius * 2 + 5;
            x = dPrev.cx;
          }
        }
        d.cy = y;
        d.cx = x;
        return y;
      })
      .attr("y2", function(d, i) {
        return Math.floor(cfg.height / 4)
      })
      .style("stroke", function(d) {
        if (d.color != undefined) {
          return d.color
        }
        if (d.series != undefined) {
          if (series.indexOf(d.series) < 0) {
            series.push(d.series);
          }
          return cfg.seriesColor(series.indexOf(d.series));
        }
        return cfg.color
      })
      .style("stroke-width", cfg.lineWidth);

    tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
      var stuff = '<img src="' + d.urlToImage +
        '" style="float:left; margin-right:4px;" width="86px">';
      stuff = stuff + '<h6>' + d.title + '<h6>';
      stuff = stuff + "<small>" + d.source.name + "</small>";
      return stuff;
    });
    tip.direction('s');
    tip.offset([15, 0]);
    svg.call(tip);

    svg.selectAll("circle")
      .data(events).enter()
      .append("circle")
      .attr("class", "timeline-event")
      .attr("r", function(d) {
        if (d.radius != undefined) {
          return d.radius
        }
        return cfg.radius
      })
      .style("stroke", function(d) {
        if (d.color != undefined) {
          return d.color
        }
        if (d.series != undefined) {
          if (series.indexOf(d.series) < 0) {
            series.push(d.series);
          }
          console.log(d.series, series, series.indexOf(d.series));
          return cfg.seriesColor(series.indexOf(d.series));
        }
        return cfg.color
      })
      .style("stroke-width", function(d) {
        if (d.lineWidth != undefined) {
          return d.lineWidth
        }
        return cfg.lineWidth
      })
      .style("fill", function(d) {
        if (d.background != undefined) {
          return d.background
        }
        return cfg.background
      })
      .attr("cy", function(d,i) {
        var datum = new Date(d.publishedAt).getTime();
        var x = Math.floor(step * (datum - minValue) + margin);
        var y = Math.floor(cfg.height / 4);
        var dPrev = events[i-1];
        if (dPrev != null) {
          if (Math.abs(x - dPrev.cx) < (cfg.radius * 2)) {
            y = dPrev.cy + cfg.radius * 2 + 5;
            x = dPrev.cx;
          }
        }
        d.cy = y;
        d.cx = x;
        return y;
      })
      .attr("cx", function(d,i) {
        var datum = new Date(d.publishedAt).getTime();
        var x = Math.floor(step * (datum - minValue) + margin);
        var dPrev = events[i-1];
        if (dPrev != null) {
          if (Math.abs(x - dPrev.cx) < (cfg.radius * 2)) {
            x = dPrev.cx;
          }
        }
        d.cx = x;
        return x;
      }).on("mouseover", function(d) {
        d3.select(this)
          .style("fill", function(d) {
            if (d.color != undefined) {
              return d.color
            }
            return cfg.color
          }).transition()
          .duration(100).attr("r", function(d) {
            if (d.radius != undefined) {
              return Math.floor(d.radius * 1.5)
            }
            return Math.floor(cfg.radius * 1.5)
          });
        tip.show(d);
      })
      .on("mouseout", function(d) {
        tip.hide(d);
        d3.select(this)
          .style("fill", function(d) {
            if (d.background != undefined) {
              return d.background
            }
            return cfg.background
          }).transition()
          .duration(100).attr("r", function(d) {
            if (d.radius != undefined) {
              return d.radius
            }
            return cfg.radius
          });
      })
      .on("click", function(d) {
        window.open(d.url);
      });

    //Adding start and end labels
    if (cfg.showLabels != false) {
      var format = d3.time.format(cfg.labelFormat);
      var startString = format(new Date(minValue));
      var endString = format(new Date(maxValue));
      svg.append("text")
        .text(startString).style("font-size", "70%")
        .attr("x", function(d) {
          return d3.max([0, (margin - this.getBBox().width / 2)])
        })
        .attr("y", function(d) {
          return Math.floor(cfg.height / 4 - (margin + this.getBBox().height))
        });

      svg.append("text")
        .text(endString).style("font-size", "70%")
        .attr("x", function(d) {
          return cfg.width - d3.max([this.getBBox().width, (margin + this.getBBox().width / 2)])
        })
        .attr("y", function(d) {
          return Math.floor(cfg.height / 4 - (margin + this.getBBox().height))
        })
    }
  }
}