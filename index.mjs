import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { useMemo, useRef, useState, useId, useEffect } from "react";
function tree_add(d) {
  const x2 = +this._x.call(null, d), y2 = +this._y.call(null, d);
  return add(this.cover(x2, y2), x2, y2, d);
}
function add(tree, x2, y2, d) {
  if (isNaN(x2) || isNaN(y2)) return tree;
  var parent, node = tree._root, leaf = { data: d }, x0 = tree._x0, y0 = tree._y0, x1 = tree._x1, y1 = tree._y1, xm, ym, xp, yp, right, bottom, i, j;
  if (!node) return tree._root = leaf, tree;
  while (node.length) {
    if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y2 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
    if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
  }
  xp = +tree._x.call(null, node.data);
  yp = +tree._y.call(null, node.data);
  if (x2 === xp && y2 === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;
  do {
    parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
    if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y2 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
  } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | xp >= xm));
  return parent[j] = node, parent[i] = leaf, tree;
}
function addAll(data) {
  var d, i, n = data.length, x2, y2, xz = new Array(n), yz = new Array(n), x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (i = 0; i < n; ++i) {
    if (isNaN(x2 = +this._x.call(null, d = data[i])) || isNaN(y2 = +this._y.call(null, d))) continue;
    xz[i] = x2;
    yz[i] = y2;
    if (x2 < x0) x0 = x2;
    if (x2 > x1) x1 = x2;
    if (y2 < y0) y0 = y2;
    if (y2 > y1) y1 = y2;
  }
  if (x0 > x1 || y0 > y1) return this;
  this.cover(x0, y0).cover(x1, y1);
  for (i = 0; i < n; ++i) {
    add(this, xz[i], yz[i], data[i]);
  }
  return this;
}
function tree_cover(x2, y2) {
  if (isNaN(x2 = +x2) || isNaN(y2 = +y2)) return this;
  var x0 = this._x0, y0 = this._y0, x1 = this._x1, y1 = this._y1;
  if (isNaN(x0)) {
    x1 = (x0 = Math.floor(x2)) + 1;
    y1 = (y0 = Math.floor(y2)) + 1;
  } else {
    var z = x1 - x0 || 1, node = this._root, parent, i;
    while (x0 > x2 || x2 >= x1 || y0 > y2 || y2 >= y1) {
      i = (y2 < y0) << 1 | x2 < x0;
      parent = new Array(4), parent[i] = node, node = parent, z *= 2;
      switch (i) {
        case 0:
          x1 = x0 + z, y1 = y0 + z;
          break;
        case 1:
          x0 = x1 - z, y1 = y0 + z;
          break;
        case 2:
          x1 = x0 + z, y0 = y1 - z;
          break;
        case 3:
          x0 = x1 - z, y0 = y1 - z;
          break;
      }
    }
    if (this._root && this._root.length) this._root = node;
  }
  this._x0 = x0;
  this._y0 = y0;
  this._x1 = x1;
  this._y1 = y1;
  return this;
}
function tree_data() {
  var data = [];
  this.visit(function(node) {
    if (!node.length) do
      data.push(node.data);
    while (node = node.next);
  });
  return data;
}
function tree_extent(_) {
  return arguments.length ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0], [this._x1, this._y1]];
}
function Quad(node, x0, y0, x1, y1) {
  this.node = node;
  this.x0 = x0;
  this.y0 = y0;
  this.x1 = x1;
  this.y1 = y1;
}
function tree_find(x2, y2, radius) {
  var data, x0 = this._x0, y0 = this._y0, x1, y1, x22, y22, x3 = this._x1, y3 = this._y1, quads = [], node = this._root, q, i;
  if (node) quads.push(new Quad(node, x0, y0, x3, y3));
  if (radius == null) radius = Infinity;
  else {
    x0 = x2 - radius, y0 = y2 - radius;
    x3 = x2 + radius, y3 = y2 + radius;
    radius *= radius;
  }
  while (q = quads.pop()) {
    if (!(node = q.node) || (x1 = q.x0) > x3 || (y1 = q.y0) > y3 || (x22 = q.x1) < x0 || (y22 = q.y1) < y0) continue;
    if (node.length) {
      var xm = (x1 + x22) / 2, ym = (y1 + y22) / 2;
      quads.push(
        new Quad(node[3], xm, ym, x22, y22),
        new Quad(node[2], x1, ym, xm, y22),
        new Quad(node[1], xm, y1, x22, ym),
        new Quad(node[0], x1, y1, xm, ym)
      );
      if (i = (y2 >= ym) << 1 | x2 >= xm) {
        q = quads[quads.length - 1];
        quads[quads.length - 1] = quads[quads.length - 1 - i];
        quads[quads.length - 1 - i] = q;
      }
    } else {
      var dx = x2 - +this._x.call(null, node.data), dy = y2 - +this._y.call(null, node.data), d2 = dx * dx + dy * dy;
      if (d2 < radius) {
        var d = Math.sqrt(radius = d2);
        x0 = x2 - d, y0 = y2 - d;
        x3 = x2 + d, y3 = y2 + d;
        data = node.data;
      }
    }
  }
  return data;
}
function tree_remove(d) {
  if (isNaN(x2 = +this._x.call(null, d)) || isNaN(y2 = +this._y.call(null, d))) return this;
  var parent, node = this._root, retainer, previous, next, x0 = this._x0, y0 = this._y0, x1 = this._x1, y1 = this._y1, x2, y2, xm, ym, right, bottom, i, j;
  if (!node) return this;
  if (node.length) while (true) {
    if (right = x2 >= (xm = (x0 + x1) / 2)) x0 = xm;
    else x1 = xm;
    if (bottom = y2 >= (ym = (y0 + y1) / 2)) y0 = ym;
    else y1 = ym;
    if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
    if (!node.length) break;
    if (parent[i + 1 & 3] || parent[i + 2 & 3] || parent[i + 3 & 3]) retainer = parent, j = i;
  }
  while (node.data !== d) if (!(previous = node, node = node.next)) return this;
  if (next = node.next) delete node.next;
  if (previous) return next ? previous.next = next : delete previous.next, this;
  if (!parent) return this._root = next, this;
  next ? parent[i] = next : delete parent[i];
  if ((node = parent[0] || parent[1] || parent[2] || parent[3]) && node === (parent[3] || parent[2] || parent[1] || parent[0]) && !node.length) {
    if (retainer) retainer[j] = node;
    else this._root = node;
  }
  return this;
}
function removeAll(data) {
  for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
  return this;
}
function tree_root() {
  return this._root;
}
function tree_size() {
  var size = 0;
  this.visit(function(node) {
    if (!node.length) do
      ++size;
    while (node = node.next);
  });
  return size;
}
function tree_visit(callback) {
  var quads = [], q, node = this._root, child, x0, y0, x1, y1;
  if (node) quads.push(new Quad(node, this._x0, this._y0, this._x1, this._y1));
  while (q = quads.pop()) {
    if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
      var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
      if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
      if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
      if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
      if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
    }
  }
  return this;
}
function tree_visitAfter(callback) {
  var quads = [], next = [], q;
  if (this._root) quads.push(new Quad(this._root, this._x0, this._y0, this._x1, this._y1));
  while (q = quads.pop()) {
    var node = q.node;
    if (node.length) {
      var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
      if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
      if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
      if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
      if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
    }
    next.push(q);
  }
  while (q = next.pop()) {
    callback(q.node, q.x0, q.y0, q.x1, q.y1);
  }
  return this;
}
function defaultX(d) {
  return d[0];
}
function tree_x(_) {
  return arguments.length ? (this._x = _, this) : this._x;
}
function defaultY(d) {
  return d[1];
}
function tree_y(_) {
  return arguments.length ? (this._y = _, this) : this._y;
}
function quadtree(nodes, x2, y2) {
  var tree = new Quadtree(x2 == null ? defaultX : x2, y2 == null ? defaultY : y2, NaN, NaN, NaN, NaN);
  return nodes == null ? tree : tree.addAll(nodes);
}
function Quadtree(x2, y2, x0, y0, x1, y1) {
  this._x = x2;
  this._y = y2;
  this._x0 = x0;
  this._y0 = y0;
  this._x1 = x1;
  this._y1 = y1;
  this._root = void 0;
}
function leaf_copy(leaf) {
  var copy = { data: leaf.data }, next = copy;
  while (leaf = leaf.next) next = next.next = { data: leaf.data };
  return copy;
}
var treeProto = quadtree.prototype = Quadtree.prototype;
treeProto.copy = function() {
  var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1), node = this._root, nodes, child;
  if (!node) return copy;
  if (!node.length) return copy._root = leaf_copy(node), copy;
  nodes = [{ source: node, target: copy._root = new Array(4) }];
  while (node = nodes.pop()) {
    for (var i = 0; i < 4; ++i) {
      if (child = node.source[i]) {
        if (child.length) nodes.push({ source: child, target: node.target[i] = new Array(4) });
        else node.target[i] = leaf_copy(child);
      }
    }
  }
  return copy;
};
treeProto.add = tree_add;
treeProto.addAll = addAll;
treeProto.cover = tree_cover;
treeProto.data = tree_data;
treeProto.extent = tree_extent;
treeProto.find = tree_find;
treeProto.remove = tree_remove;
treeProto.removeAll = removeAll;
treeProto.root = tree_root;
treeProto.size = tree_size;
treeProto.visit = tree_visit;
treeProto.visitAfter = tree_visitAfter;
treeProto.x = tree_x;
treeProto.y = tree_y;
function constant$3(x2) {
  return function() {
    return x2;
  };
}
function jiggle(random) {
  return (random() - 0.5) * 1e-6;
}
function x$1(d) {
  return d.x + d.vx;
}
function y$1(d) {
  return d.y + d.vy;
}
function forceCollide(radius) {
  var nodes, radii, random, strength = 1, iterations = 1;
  if (typeof radius !== "function") radius = constant$3(radius == null ? 1 : +radius);
  function force() {
    var i, n = nodes.length, tree, node, xi, yi, ri, ri2;
    for (var k = 0; k < iterations; ++k) {
      tree = quadtree(nodes, x$1, y$1).visitAfter(prepare);
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        ri = radii[node.index], ri2 = ri * ri;
        xi = node.x + node.vx;
        yi = node.y + node.vy;
        tree.visit(apply);
      }
    }
    function apply(quad, x0, y0, x1, y1) {
      var data = quad.data, rj = quad.r, r = ri + rj;
      if (data) {
        if (data.index > node.index) {
          var x2 = xi - data.x - data.vx, y2 = yi - data.y - data.vy, l = x2 * x2 + y2 * y2;
          if (l < r * r) {
            if (x2 === 0) x2 = jiggle(random), l += x2 * x2;
            if (y2 === 0) y2 = jiggle(random), l += y2 * y2;
            l = (r - (l = Math.sqrt(l))) / l * strength;
            node.vx += (x2 *= l) * (r = (rj *= rj) / (ri2 + rj));
            node.vy += (y2 *= l) * r;
            data.vx -= x2 * (r = 1 - r);
            data.vy -= y2 * r;
          }
        }
        return;
      }
      return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
    }
  }
  function prepare(quad) {
    if (quad.data) return quad.r = radii[quad.data.index];
    for (var i = quad.r = 0; i < 4; ++i) {
      if (quad[i] && quad[i].r > quad.r) {
        quad.r = quad[i].r;
      }
    }
  }
  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length, node;
    radii = new Array(n);
    for (i = 0; i < n; ++i) node = nodes[i], radii[node.index] = +radius(node, i, nodes);
  }
  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };
  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };
  force.strength = function(_) {
    return arguments.length ? (strength = +_, force) : strength;
  };
  force.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant$3(+_), initialize(), force) : radius;
  };
  return force;
}
function index(d) {
  return d.index;
}
function find$1(nodeById, nodeId) {
  var node = nodeById.get(nodeId);
  if (!node) throw new Error("node not found: " + nodeId);
  return node;
}
function forceLink(links) {
  var id2 = index, strength = defaultStrength, strengths, distance = constant$3(30), distances, nodes, count, bias, random, iterations = 1;
  if (links == null) links = [];
  function defaultStrength(link) {
    return 1 / Math.min(count[link.source.index], count[link.target.index]);
  }
  function force(alpha) {
    for (var k = 0, n = links.length; k < iterations; ++k) {
      for (var i = 0, link, source, target, x2, y2, l, b; i < n; ++i) {
        link = links[i], source = link.source, target = link.target;
        x2 = target.x + target.vx - source.x - source.vx || jiggle(random);
        y2 = target.y + target.vy - source.y - source.vy || jiggle(random);
        l = Math.sqrt(x2 * x2 + y2 * y2);
        l = (l - distances[i]) / l * alpha * strengths[i];
        x2 *= l, y2 *= l;
        target.vx -= x2 * (b = bias[i]);
        target.vy -= y2 * b;
        source.vx += x2 * (b = 1 - b);
        source.vy += y2 * b;
      }
    }
  }
  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length, m2 = links.length, nodeById = new Map(nodes.map((d, i2) => [id2(d, i2, nodes), d])), link;
    for (i = 0, count = new Array(n); i < m2; ++i) {
      link = links[i], link.index = i;
      if (typeof link.source !== "object") link.source = find$1(nodeById, link.source);
      if (typeof link.target !== "object") link.target = find$1(nodeById, link.target);
      count[link.source.index] = (count[link.source.index] || 0) + 1;
      count[link.target.index] = (count[link.target.index] || 0) + 1;
    }
    for (i = 0, bias = new Array(m2); i < m2; ++i) {
      link = links[i], bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
    }
    strengths = new Array(m2), initializeStrength();
    distances = new Array(m2), initializeDistance();
  }
  function initializeStrength() {
    if (!nodes) return;
    for (var i = 0, n = links.length; i < n; ++i) {
      strengths[i] = +strength(links[i], i, links);
    }
  }
  function initializeDistance() {
    if (!nodes) return;
    for (var i = 0, n = links.length; i < n; ++i) {
      distances[i] = +distance(links[i], i, links);
    }
  }
  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };
  force.links = function(_) {
    return arguments.length ? (links = _, initialize(), force) : links;
  };
  force.id = function(_) {
    return arguments.length ? (id2 = _, force) : id2;
  };
  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };
  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant$3(+_), initializeStrength(), force) : strength;
  };
  force.distance = function(_) {
    return arguments.length ? (distance = typeof _ === "function" ? _ : constant$3(+_), initializeDistance(), force) : distance;
  };
  return force;
}
var noop = { value: () => {
} };
function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}
function Dispatch(_) {
  this._ = _;
}
function parseTypenames$1(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return { type: t, name };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._, T = parseTypenames$1(typename + "", _), t, i = -1, n = T.length;
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
      return;
    }
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};
function get$1(type, name) {
  for (var i = 0, n = type.length, c2; i < n; ++i) {
    if ((c2 = type[i]).name === name) {
      return c2.value;
    }
  }
}
function set$1(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({ name, value: callback });
  return type;
}
var frame = 0, timeout$1 = 0, interval = 0, pokeDelay = 1e3, taskHead, taskTail, clockLast = 0, clockNow = 0, clockSkew = 0, clock = typeof performance === "object" && performance.now ? performance : Date, setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
  setTimeout(f, 17);
};
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;
      else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time) {
  var t = new Timer();
  t.restart(callback, delay, time);
  return t;
}
function timerFlush() {
  now();
  ++frame;
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call.call(void 0, e);
    t = t._next;
  }
  --frame;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout$1 = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now2 = clock.now(), delay = now2 - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now2;
}
function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}
function sleep(time) {
  if (frame) return;
  if (timeout$1) timeout$1 = clearTimeout(timeout$1);
  var delay = time - clockNow;
  if (delay > 24) {
    if (time < Infinity) timeout$1 = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}
function timeout(callback, delay, time) {
  var t = new Timer();
  delay = delay == null ? 0 : +delay;
  t.restart((elapsed) => {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
}
const a = 1664525;
const c = 1013904223;
const m = 4294967296;
function lcg() {
  let s = 1;
  return () => (s = (a * s + c) % m) / m;
}
function x(d) {
  return d.x;
}
function y(d) {
  return d.y;
}
var initialRadius = 10, initialAngle = Math.PI * (3 - Math.sqrt(5));
function forceSimulation(nodes) {
  var simulation, alpha = 1, alphaMin = 1e-3, alphaDecay = 1 - Math.pow(alphaMin, 1 / 300), alphaTarget = 0, velocityDecay = 0.6, forces = /* @__PURE__ */ new Map(), stepper = timer(step), event = dispatch("tick", "end"), random = lcg();
  if (nodes == null) nodes = [];
  function step() {
    tick();
    event.call("tick", simulation);
    if (alpha < alphaMin) {
      stepper.stop();
      event.call("end", simulation);
    }
  }
  function tick(iterations) {
    var i, n = nodes.length, node;
    if (iterations === void 0) iterations = 1;
    for (var k = 0; k < iterations; ++k) {
      alpha += (alphaTarget - alpha) * alphaDecay;
      forces.forEach(function(force) {
        force(alpha);
      });
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        if (node.fx == null) node.x += node.vx *= velocityDecay;
        else node.x = node.fx, node.vx = 0;
        if (node.fy == null) node.y += node.vy *= velocityDecay;
        else node.y = node.fy, node.vy = 0;
      }
    }
    return simulation;
  }
  function initializeNodes() {
    for (var i = 0, n = nodes.length, node; i < n; ++i) {
      node = nodes[i], node.index = i;
      if (node.fx != null) node.x = node.fx;
      if (node.fy != null) node.y = node.fy;
      if (isNaN(node.x) || isNaN(node.y)) {
        var radius = initialRadius * Math.sqrt(0.5 + i), angle = i * initialAngle;
        node.x = radius * Math.cos(angle);
        node.y = radius * Math.sin(angle);
      }
      if (isNaN(node.vx) || isNaN(node.vy)) {
        node.vx = node.vy = 0;
      }
    }
  }
  function initializeForce(force) {
    if (force.initialize) force.initialize(nodes, random);
    return force;
  }
  initializeNodes();
  return simulation = {
    tick,
    restart: function() {
      return stepper.restart(step), simulation;
    },
    stop: function() {
      return stepper.stop(), simulation;
    },
    nodes: function(_) {
      return arguments.length ? (nodes = _, initializeNodes(), forces.forEach(initializeForce), simulation) : nodes;
    },
    alpha: function(_) {
      return arguments.length ? (alpha = +_, simulation) : alpha;
    },
    alphaMin: function(_) {
      return arguments.length ? (alphaMin = +_, simulation) : alphaMin;
    },
    alphaDecay: function(_) {
      return arguments.length ? (alphaDecay = +_, simulation) : +alphaDecay;
    },
    alphaTarget: function(_) {
      return arguments.length ? (alphaTarget = +_, simulation) : alphaTarget;
    },
    velocityDecay: function(_) {
      return arguments.length ? (velocityDecay = 1 - _, simulation) : 1 - velocityDecay;
    },
    randomSource: function(_) {
      return arguments.length ? (random = _, forces.forEach(initializeForce), simulation) : random;
    },
    force: function(name, _) {
      return arguments.length > 1 ? (_ == null ? forces.delete(name) : forces.set(name, initializeForce(_)), simulation) : forces.get(name);
    },
    find: function(x2, y2, radius) {
      var i = 0, n = nodes.length, dx, dy, d2, node, closest;
      if (radius == null) radius = Infinity;
      else radius *= radius;
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        dx = x2 - node.x;
        dy = y2 - node.y;
        d2 = dx * dx + dy * dy;
        if (d2 < radius) closest = node, radius = d2;
      }
      return closest;
    },
    on: function(name, _) {
      return arguments.length > 1 ? (event.on(name, _), simulation) : event.on(name);
    }
  };
}
function forceManyBody() {
  var nodes, node, random, alpha, strength = constant$3(-30), strengths, distanceMin2 = 1, distanceMax2 = Infinity, theta2 = 0.81;
  function force(_) {
    var i, n = nodes.length, tree = quadtree(nodes, x, y).visitAfter(accumulate);
    for (alpha = _, i = 0; i < n; ++i) node = nodes[i], tree.visit(apply);
  }
  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length, node2;
    strengths = new Array(n);
    for (i = 0; i < n; ++i) node2 = nodes[i], strengths[node2.index] = +strength(node2, i, nodes);
  }
  function accumulate(quad) {
    var strength2 = 0, q, c2, weight = 0, x2, y2, i;
    if (quad.length) {
      for (x2 = y2 = i = 0; i < 4; ++i) {
        if ((q = quad[i]) && (c2 = Math.abs(q.value))) {
          strength2 += q.value, weight += c2, x2 += c2 * q.x, y2 += c2 * q.y;
        }
      }
      quad.x = x2 / weight;
      quad.y = y2 / weight;
    } else {
      q = quad;
      q.x = q.data.x;
      q.y = q.data.y;
      do
        strength2 += strengths[q.data.index];
      while (q = q.next);
    }
    quad.value = strength2;
  }
  function apply(quad, x1, _, x2) {
    if (!quad.value) return true;
    var x3 = quad.x - node.x, y2 = quad.y - node.y, w = x2 - x1, l = x3 * x3 + y2 * y2;
    if (w * w / theta2 < l) {
      if (l < distanceMax2) {
        if (x3 === 0) x3 = jiggle(random), l += x3 * x3;
        if (y2 === 0) y2 = jiggle(random), l += y2 * y2;
        if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
        node.vx += x3 * quad.value * alpha / l;
        node.vy += y2 * quad.value * alpha / l;
      }
      return true;
    } else if (quad.length || l >= distanceMax2) return;
    if (quad.data !== node || quad.next) {
      if (x3 === 0) x3 = jiggle(random), l += x3 * x3;
      if (y2 === 0) y2 = jiggle(random), l += y2 * y2;
      if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
    }
    do
      if (quad.data !== node) {
        w = strengths[quad.data.index] * alpha / l;
        node.vx += x3 * w;
        node.vy += y2 * w;
      }
    while (quad = quad.next);
  }
  force.initialize = function(_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };
  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant$3(+_), initialize(), force) : strength;
  };
  force.distanceMin = function(_) {
    return arguments.length ? (distanceMin2 = _ * _, force) : Math.sqrt(distanceMin2);
  };
  force.distanceMax = function(_) {
    return arguments.length ? (distanceMax2 = _ * _, force) : Math.sqrt(distanceMax2);
  };
  force.theta = function(_) {
    return arguments.length ? (theta2 = _ * _, force) : Math.sqrt(theta2);
  };
  return force;
}
function forceRadial(radius, x2, y2) {
  var nodes, strength = constant$3(0.1), strengths, radiuses;
  if (typeof radius !== "function") radius = constant$3(+radius);
  if (x2 == null) x2 = 0;
  if (y2 == null) y2 = 0;
  function force(alpha) {
    for (var i = 0, n = nodes.length; i < n; ++i) {
      var node = nodes[i], dx = node.x - x2 || 1e-6, dy = node.y - y2 || 1e-6, r = Math.sqrt(dx * dx + dy * dy), k = (radiuses[i] - r) * strengths[i] * alpha / r;
      node.vx += dx * k;
      node.vy += dy * k;
    }
  }
  function initialize() {
    if (!nodes) return;
    var i, n = nodes.length;
    strengths = new Array(n);
    radiuses = new Array(n);
    for (i = 0; i < n; ++i) {
      radiuses[i] = +radius(nodes[i], i, nodes);
      strengths[i] = isNaN(radiuses[i]) ? 0 : +strength(nodes[i], i, nodes);
    }
  }
  force.initialize = function(_) {
    nodes = _, initialize();
  };
  force.strength = function(_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant$3(+_), initialize(), force) : strength;
  };
  force.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant$3(+_), initialize(), force) : radius;
  };
  force.x = function(_) {
    return arguments.length ? (x2 = +_, force) : x2;
  };
  force.y = function(_) {
    return arguments.length ? (y2 = +_, force) : y2;
  };
  return force;
}
var xhtml = "http://www.w3.org/1999/xhtml";
const namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function namespace(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? { space: namespaces[prefix], local: name } : name;
}
function creatorInherit(name) {
  return function() {
    var document2 = this.ownerDocument, uri = this.namespaceURI;
    return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator(name) {
  var fullname = namespace(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}
function none() {
}
function selector(selector2) {
  return selector2 == null ? none : function() {
    return this.querySelector(selector2);
  };
}
function selection_select(select2) {
  if (typeof select2 !== "function") select2 = selector(select2);
  for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select2.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection$1(subgroups, this._parents);
}
function array(x2) {
  return x2 == null ? [] : Array.isArray(x2) ? x2 : Array.from(x2);
}
function empty() {
  return [];
}
function selectorAll(selector2) {
  return selector2 == null ? empty : function() {
    return this.querySelectorAll(selector2);
  };
}
function arrayAll(select2) {
  return function() {
    return array(select2.apply(this, arguments));
  };
}
function selection_selectAll(select2) {
  if (typeof select2 === "function") select2 = arrayAll(select2);
  else select2 = selectorAll(select2);
  for (var groups = this._groups, m2 = groups.length, subgroups = [], parents = [], j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select2.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new Selection$1(subgroups, parents);
}
function matcher(selector2) {
  return function() {
    return this.matches(selector2);
  };
}
function childMatcher(selector2) {
  return function(node) {
    return node.matches(selector2);
  };
}
var find = Array.prototype.find;
function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selection_selectChild(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}
var filter = Array.prototype.filter;
function children() {
  return Array.from(this.children);
}
function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}
function selection_selectChildren(match) {
  return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}
function selection_filter(match) {
  if (typeof match !== "function") match = matcher(match);
  for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection$1(subgroups, this._parents);
}
function sparse(update) {
  return new Array(update.length);
}
function selection_enter() {
  return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
}
function EnterNode(parent, datum2) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum2;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function(child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function(selector2) {
    return this._parent.querySelector(selector2);
  },
  querySelectorAll: function(selector2) {
    return this._parent.querySelectorAll(selector2);
  }
};
function constant$2(x2) {
  return function() {
    return x2;
  };
}
function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0, node, groupLength = group.length, dataLength = data.length;
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function selection_data(value, key) {
  if (!arguments.length) return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
  if (typeof value !== "function") value = constant$2(value);
  for (var m2 = groups.length, update = new Array(m2), enter = new Array(m2), exit = new Array(m2), j = 0; j < m2; ++j) {
    var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength) ;
        previous._next = next || null;
      }
    }
  }
  update = new Selection$1(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}
function arraylike(data) {
  return typeof data === "object" && "length" in data ? data : Array.from(data);
}
function selection_exit() {
  return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
}
function selection_join(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter) enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update) update = update.selection();
  }
  if (onexit == null) exit.remove();
  else onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}
function selection_merge(context) {
  var selection2 = context.selection ? context.selection() : context;
  for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m2 = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m2; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Selection$1(merges, this._parents);
}
function selection_order() {
  for (var groups = this._groups, j = -1, m2 = groups.length; ++j < m2; ) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}
function selection_sort(compare) {
  if (!compare) compare = ascending;
  function compareNode(a2, b) {
    return a2 && b ? compare(a2.__data__, b.__data__) : !a2 - !b;
  }
  for (var groups = this._groups, m2 = groups.length, sortgroups = new Array(m2), j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection$1(sortgroups, this._parents).order();
}
function ascending(a2, b) {
  return a2 < b ? -1 : a2 > b ? 1 : a2 >= b ? 0 : NaN;
}
function selection_call() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}
function selection_nodes() {
  return Array.from(this);
}
function selection_node() {
  for (var groups = this._groups, j = 0, m2 = groups.length; j < m2; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }
  return null;
}
function selection_size() {
  let size = 0;
  for (const node of this) ++size;
  return size;
}
function selection_empty() {
  return !this.node();
}
function selection_each(callback) {
  for (var groups = this._groups, j = 0, m2 = groups.length; j < m2; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}
function attrRemove$1(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS$1(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant$1(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}
function attrConstantNS$1(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction$1(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);
    else this.setAttribute(name, v);
  };
}
function attrFunctionNS$1(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function selection_attr(name, value) {
  var fullname = namespace(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS$1 : attrRemove$1 : typeof value === "function" ? fullname.local ? attrFunctionNS$1 : attrFunction$1 : fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, value));
}
function defaultView(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}
function styleRemove$1(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant$1(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction$1(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);
    else this.style.setProperty(name, v, priority);
  };
}
function selection_style(name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove$1 : typeof value === "function" ? styleFunction$1 : styleConstant$1)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
}
function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];
    else this[name] = v;
  };
}
function selection_property(name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}
function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.remove(names[i]);
}
function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function selection_classed(name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}
function textRemove() {
  this.textContent = "";
}
function textConstant$1(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction$1(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function selection_text(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction$1 : textConstant$1)(value)) : this.node().textContent;
}
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function selection_html(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}
function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}
function selection_raise() {
  return this.each(raise);
}
function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function selection_lower() {
  return this.each(lower);
}
function selection_append(name) {
  var create2 = typeof name === "function" ? name : creator(name);
  return this.select(function() {
    return this.appendChild(create2.apply(this, arguments));
  });
}
function constantNull() {
  return null;
}
function selection_insert(name, before) {
  var create2 = typeof name === "function" ? name : creator(name), select2 = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function() {
    return this.insertBefore(create2.apply(this, arguments), select2.apply(this, arguments) || null);
  });
}
function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}
function selection_remove() {
  return this.each(remove);
}
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_clone(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}
function selection_datum(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}
function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}
function parseTypenames(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return { type: t, name };
  });
}
function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m2 = on.length, o; j < m2; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;
    else delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on) for (var j = 0, m2 = on.length; j < m2; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
        this.addEventListener(o.type, o.listener = listener, o.options = options);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, options);
    o = { type: typename.type, name: typename.name, value, listener, options };
    if (!on) this.__on = [o];
    else on.push(o);
  };
}
function selection_on(typename, value, options) {
  var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m2 = on.length, o; j < m2; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }
  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
  return this;
}
function dispatchEvent(node, type, params) {
  var window2 = defaultView(node), event = window2.CustomEvent;
  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window2.document.createEvent("Event");
    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    else event.initEvent(type, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}
function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}
function selection_dispatch(type, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
}
function* selection_iterator() {
  for (var groups = this._groups, j = 0, m2 = groups.length; j < m2; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) yield node;
    }
  }
}
var root = [null];
function Selection$1(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection() {
  return new Selection$1([[document.documentElement]], root);
}
function selection_selection() {
  return this;
}
Selection$1.prototype = selection.prototype = {
  constructor: Selection$1,
  select: selection_select,
  selectAll: selection_selectAll,
  selectChild: selection_selectChild,
  selectChildren: selection_selectChildren,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  join: selection_join,
  merge: selection_merge,
  selection: selection_selection,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  classed: selection_classed,
  text: selection_text,
  html: selection_html,
  raise: selection_raise,
  lower: selection_lower,
  append: selection_append,
  insert: selection_insert,
  remove: selection_remove,
  clone: selection_clone,
  datum: selection_datum,
  on: selection_on,
  dispatch: selection_dispatch,
  [Symbol.iterator]: selection_iterator
};
function select(selector2) {
  return typeof selector2 === "string" ? new Selection$1([[document.querySelector(selector2)]], [document.documentElement]) : new Selection$1([[selector2]], root);
}
function sourceEvent(event) {
  let sourceEvent2;
  while (sourceEvent2 = event.sourceEvent) event = sourceEvent2;
  return event;
}
function pointer(event, node) {
  event = sourceEvent(event);
  if (node === void 0) node = event.currentTarget;
  if (node) {
    var svg = node.ownerSVGElement || node;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }
    if (node.getBoundingClientRect) {
      var rect = node.getBoundingClientRect();
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    }
  }
  return [event.pageX, event.pageY];
}
const nonpassivecapture = { capture: true, passive: false };
function noevent$1(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
function dragDisable(view) {
  var root2 = view.document.documentElement, selection2 = select(view).on("dragstart.drag", noevent$1, nonpassivecapture);
  if ("onselectstart" in root2) {
    selection2.on("selectstart.drag", noevent$1, nonpassivecapture);
  } else {
    root2.__noselect = root2.style.MozUserSelect;
    root2.style.MozUserSelect = "none";
  }
}
function yesdrag(view, noclick) {
  var root2 = view.document.documentElement, selection2 = select(view).on("dragstart.drag", null);
  if (noclick) {
    selection2.on("click.drag", noevent$1, nonpassivecapture);
    setTimeout(function() {
      selection2.on("click.drag", null);
    }, 0);
  }
  if ("onselectstart" in root2) {
    selection2.on("selectstart.drag", null);
  } else {
    root2.style.MozUserSelect = root2.__noselect;
    delete root2.__noselect;
  }
}
function define(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}
function Color() {
}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*", reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", reHex = /^#([0-9a-f]{3,8})$/, reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`), reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`), reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`), reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`), reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`), reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
define(Color, color, {
  copy(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHex8() {
  return this.rgb().formatHex8();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format) {
  var m2, l;
  format = (format + "").trim().toLowerCase();
  return (m2 = reHex.exec(format)) ? (l = m2[1].length, m2 = parseInt(m2[1], 16), l === 6 ? rgbn(m2) : l === 3 ? new Rgb(m2 >> 8 & 15 | m2 >> 4 & 240, m2 >> 4 & 15 | m2 & 240, (m2 & 15) << 4 | m2 & 15, 1) : l === 8 ? rgba(m2 >> 24 & 255, m2 >> 16 & 255, m2 >> 8 & 255, (m2 & 255) / 255) : l === 4 ? rgba(m2 >> 12 & 15 | m2 >> 8 & 240, m2 >> 8 & 15 | m2 >> 4 & 240, m2 >> 4 & 15 | m2 & 240, ((m2 & 15) << 4 | m2 & 15) / 255) : null) : (m2 = reRgbInteger.exec(format)) ? new Rgb(m2[1], m2[2], m2[3], 1) : (m2 = reRgbPercent.exec(format)) ? new Rgb(m2[1] * 255 / 100, m2[2] * 255 / 100, m2[3] * 255 / 100, 1) : (m2 = reRgbaInteger.exec(format)) ? rgba(m2[1], m2[2], m2[3], m2[4]) : (m2 = reRgbaPercent.exec(format)) ? rgba(m2[1] * 255 / 100, m2[2] * 255 / 100, m2[3] * 255 / 100, m2[4]) : (m2 = reHslPercent.exec(format)) ? hsla(m2[1], m2[2] / 100, m2[3] / 100, 1) : (m2 = reHslaPercent.exec(format)) ? hsla(m2[1], m2[2] / 100, m2[3] / 100, m2[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a2) {
  if (a2 <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a2);
}
function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}
define(Rgb, rgb, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
  const a2 = clampa(this.opacity);
  return `${a2 === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a2 === 1 ? ")" : `, ${a2})`}`;
}
function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s, l, a2) {
  if (a2 <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a2);
}
function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl();
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, min = Math.min(r, g, b), max = Math.max(r, g, b), h = NaN, s = max - min, l = (max + min) / 2;
  if (s) {
    if (r === max) h = (g - b) / s + (g < b) * 6;
    else if (g === max) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}
function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}
define(Hsl, hsl, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl() {
    const a2 = clampa(this.opacity);
    return `${a2 === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a2 === 1 ? ")" : `, ${a2})`}`;
  }
}));
function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}
function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}
const constant$1 = (x2) => () => x2;
function linear(a2, d) {
  return function(t) {
    return a2 + t * d;
  };
}
function exponential(a2, b, y2) {
  return a2 = Math.pow(a2, y2), b = Math.pow(b, y2) - a2, y2 = 1 / y2, function(t) {
    return Math.pow(a2 + t * b, y2);
  };
}
function gamma(y2) {
  return (y2 = +y2) === 1 ? nogamma : function(a2, b) {
    return b - a2 ? exponential(a2, b, y2) : constant$1(isNaN(a2) ? b : a2);
  };
}
function nogamma(a2, b) {
  var d = b - a2;
  return d ? linear(a2, d) : constant$1(isNaN(a2) ? b : a2);
}
const interpolateRgb = (function rgbGamma(y2) {
  var color2 = gamma(y2);
  function rgb$1(start2, end) {
    var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
    return function(t) {
      start2.r = r(t);
      start2.g = g(t);
      start2.b = b(t);
      start2.opacity = opacity(t);
      return start2 + "";
    };
  }
  rgb$1.gamma = rgbGamma;
  return rgb$1;
})(1);
function interpolateNumber(a2, b) {
  return a2 = +a2, b = +b, function(t) {
    return a2 * (1 - t) + b * t;
  };
}
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, reB = new RegExp(reA.source, "g");
function zero(b) {
  return function() {
    return b;
  };
}
function one(b) {
  return function(t) {
    return b(t) + "";
  };
}
function interpolateString(a2, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
  a2 = a2 + "", b = b + "";
  while ((am = reA.exec(a2)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs;
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      if (s[i]) s[i] += bm;
      else s[++i] = bm;
    } else {
      s[++i] = null;
      q.push({ i, x: interpolateNumber(am, bm) });
    }
    bi = reB.lastIndex;
  }
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs;
    else s[++i] = bs;
  }
  return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
    for (var i2 = 0, o; i2 < b; ++i2) s[(o = q[i2]).i] = o.x(t);
    return s.join("");
  });
}
var degrees = 180 / Math.PI;
var identity$1 = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function decompose(a2, b, c2, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a2 * a2 + b * b)) a2 /= scaleX, b /= scaleX;
  if (skewX = a2 * c2 + b * d) c2 -= a2 * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c2 * c2 + d * d)) c2 /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a2 * d < b * c2) a2 = -a2, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a2) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX,
    scaleY
  };
}
var svgNode;
function parseCss(value) {
  const m2 = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m2.isIdentity ? identity$1 : decompose(m2.a, m2.b, m2.c, m2.d, m2.e, m2.f);
}
function parseSvg(value) {
  if (value == null) return identity$1;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity$1;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}
function interpolateTransform(parse, pxComma, pxParen, degParen) {
  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: interpolateNumber(xa, xb) }, { i: i - 2, x: interpolateNumber(ya, yb) });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a2, b, s, q) {
    if (a2 !== b) {
      if (a2 - b > 180) b += 360;
      else if (b - a2 > 180) a2 += 360;
      q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a2, b) });
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }
  function skewX(a2, b, s, q) {
    if (a2 !== b) {
      q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a2, b) });
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({ i: i - 4, x: interpolateNumber(xa, xb) }, { i: i - 2, x: interpolateNumber(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function(a2, b) {
    var s = [], q = [];
    a2 = parse(a2), b = parse(b);
    translate(a2.translateX, a2.translateY, b.translateX, b.translateY, s, q);
    rotate(a2.rotate, b.rotate, s, q);
    skewX(a2.skewX, b.skewX, s, q);
    scale(a2.scaleX, a2.scaleY, b.scaleX, b.scaleY, s, q);
    a2 = b = null;
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");
var epsilon2 = 1e-12;
function cosh(x2) {
  return ((x2 = Math.exp(x2)) + 1 / x2) / 2;
}
function sinh(x2) {
  return ((x2 = Math.exp(x2)) - 1 / x2) / 2;
}
function tanh(x2) {
  return ((x2 = Math.exp(2 * x2)) - 1) / (x2 + 1);
}
const interpolateZoom = (function zoomRho(rho, rho2, rho4) {
  function zoom(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(rho * t * S)
        ];
      };
    } else {
      var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1), b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s = t * S, coshr0 = cosh(r0), u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0)
        ];
      };
    }
    i.duration = S * 1e3 * rho / Math.SQRT2;
    return i;
  }
  zoom.rho = function(_) {
    var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
    return zoomRho(_1, _2, _4);
  };
  return zoom;
})(Math.SQRT2, 2, 4);
var emptyOn = dispatch("start", "end", "cancel", "interrupt");
var emptyTween = [];
var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;
function schedule(node, name, id2, index2, group, timing) {
  var schedules = node.__transition;
  if (!schedules) node.__transition = {};
  else if (id2 in schedules) return;
  create(node, id2, {
    name,
    index: index2,
    // For context during callback.
    group,
    // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}
function init(node, id2) {
  var schedule2 = get(node, id2);
  if (schedule2.state > CREATED) throw new Error("too late; already scheduled");
  return schedule2;
}
function set(node, id2) {
  var schedule2 = get(node, id2);
  if (schedule2.state > STARTED) throw new Error("too late; already running");
  return schedule2;
}
function get(node, id2) {
  var schedule2 = node.__transition;
  if (!schedule2 || !(schedule2 = schedule2[id2])) throw new Error("transition not found");
  return schedule2;
}
function create(node, id2, self) {
  var schedules = node.__transition, tween;
  schedules[id2] = self;
  self.timer = timer(schedule2, 0, self.time);
  function schedule2(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start2, self.delay, self.time);
    if (self.delay <= elapsed) start2(elapsed - self.delay);
  }
  function start2(elapsed) {
    var i, j, n, o;
    if (self.state !== SCHEDULED) return stop();
    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name) continue;
      if (o.state === STARTED) return timeout(start2);
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      } else if (+i < id2) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }
    timeout(function() {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING) return;
    self.state = STARTED;
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }
  function tick(elapsed) {
    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1), i = -1, n = tween.length;
    while (++i < n) {
      tween[i].call(node, t);
    }
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }
  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id2];
    for (var i in schedules) return;
    delete node.__transition;
  }
}
function interrupt(node, name) {
  var schedules = node.__transition, schedule2, active, empty2 = true, i;
  if (!schedules) return;
  name = name == null ? null : name + "";
  for (i in schedules) {
    if ((schedule2 = schedules[i]).name !== name) {
      empty2 = false;
      continue;
    }
    active = schedule2.state > STARTING && schedule2.state < ENDING;
    schedule2.state = ENDED;
    schedule2.timer.stop();
    schedule2.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule2.index, schedule2.group);
    delete schedules[i];
  }
  if (empty2) delete node.__transition;
}
function selection_interrupt(name) {
  return this.each(function() {
    interrupt(this, name);
  });
}
function tweenRemove(id2, name) {
  var tween0, tween1;
  return function() {
    var schedule2 = set(this, id2), tween = schedule2.tween;
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }
    schedule2.tween = tween1;
  };
}
function tweenFunction(id2, name, value) {
  var tween0, tween1;
  if (typeof value !== "function") throw new Error();
  return function() {
    var schedule2 = set(this, id2), tween = schedule2.tween;
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n) tween1.push(t);
    }
    schedule2.tween = tween1;
  };
}
function transition_tween(name, value) {
  var id2 = this._id;
  name += "";
  if (arguments.length < 2) {
    var tween = get(this.node(), id2).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }
  return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
}
function tweenValue(transition, name, value) {
  var id2 = transition._id;
  transition.each(function() {
    var schedule2 = set(this, id2);
    (schedule2.value || (schedule2.value = {}))[name] = value.apply(this, arguments);
  });
  return function(node) {
    return get(node, id2).value[name];
  };
}
function interpolate(a2, b) {
  var c2;
  return (typeof b === "number" ? interpolateNumber : b instanceof color ? interpolateRgb : (c2 = color(b)) ? (b = c2, interpolateRgb) : interpolateString)(a2, b);
}
function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function attrConstantNS(fullname, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function attrFunction(name, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function attrFunctionNS(fullname, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function transition_attr(name, value) {
  var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
  return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname) : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
}
function attrInterpolate(name, i) {
  return function(t) {
    this.setAttribute(name, i.call(this, t));
  };
}
function attrInterpolateNS(fullname, i) {
  return function(t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}
function attrTweenNS(fullname, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function attrTween(name, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function transition_attrTween(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  var fullname = namespace(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}
function delayFunction(id2, value) {
  return function() {
    init(this, id2).delay = +value.apply(this, arguments);
  };
}
function delayConstant(id2, value) {
  return value = +value, function() {
    init(this, id2).delay = value;
  };
}
function transition_delay(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get(this.node(), id2).delay;
}
function durationFunction(id2, value) {
  return function() {
    set(this, id2).duration = +value.apply(this, arguments);
  };
}
function durationConstant(id2, value) {
  return value = +value, function() {
    set(this, id2).duration = value;
  };
}
function transition_duration(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get(this.node(), id2).duration;
}
function easeConstant(id2, value) {
  if (typeof value !== "function") throw new Error();
  return function() {
    set(this, id2).ease = value;
  };
}
function transition_ease(value) {
  var id2 = this._id;
  return arguments.length ? this.each(easeConstant(id2, value)) : get(this.node(), id2).ease;
}
function easeVarying(id2, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (typeof v !== "function") throw new Error();
    set(this, id2).ease = v;
  };
}
function transition_easeVarying(value) {
  if (typeof value !== "function") throw new Error();
  return this.each(easeVarying(this._id, value));
}
function transition_filter(match) {
  if (typeof match !== "function") match = matcher(match);
  for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Transition(subgroups, this._parents, this._name, this._id);
}
function transition_merge(transition) {
  if (transition._id !== this._id) throw new Error();
  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m2 = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m2; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Transition(merges, this._parents, this._name, this._id);
}
function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0) t = t.slice(0, i);
    return !t || t === "start";
  });
}
function onFunction(id2, name, listener) {
  var on0, on1, sit = start(name) ? init : set;
  return function() {
    var schedule2 = sit(this, id2), on = schedule2.on;
    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
    schedule2.on = on1;
  };
}
function transition_on(name, listener) {
  var id2 = this._id;
  return arguments.length < 2 ? get(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
}
function removeFunction(id2) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition) if (+i !== id2) return;
    if (parent) parent.removeChild(this);
  };
}
function transition_remove() {
  return this.on("end.remove", removeFunction(this._id));
}
function transition_select(select2) {
  var name = this._name, id2 = this._id;
  if (typeof select2 !== "function") select2 = selector(select2);
  for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select2.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule(subgroup[i], name, id2, i, subgroup, get(node, id2));
      }
    }
  }
  return new Transition(subgroups, this._parents, name, id2);
}
function transition_selectAll(select2) {
  var name = this._name, id2 = this._id;
  if (typeof select2 !== "function") select2 = selectorAll(select2);
  for (var groups = this._groups, m2 = groups.length, subgroups = [], parents = [], j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children2 = select2.call(node, node.__data__, i, group), child, inherit2 = get(node, id2), k = 0, l = children2.length; k < l; ++k) {
          if (child = children2[k]) {
            schedule(child, name, id2, k, children2, inherit2);
          }
        }
        subgroups.push(children2);
        parents.push(node);
      }
    }
  }
  return new Transition(subgroups, parents, name, id2);
}
var Selection = selection.prototype.constructor;
function transition_selection() {
  return new Selection(this._groups, this._parents);
}
function styleNull(name, interpolate2) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, string10 = string1);
  };
}
function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function styleFunction(name, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
    if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function styleMaybeRemove(id2, name) {
  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
  return function() {
    var schedule2 = set(this, id2), on = schedule2.on, listener = schedule2.value[key] == null ? remove2 || (remove2 = styleRemove(name)) : void 0;
    if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
    schedule2.on = on1;
  };
}
function transition_style(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
  return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove(name)) : typeof value === "function" ? this.styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant(name, i, value), priority).on("end.style." + name, null);
}
function styleInterpolate(name, i, priority) {
  return function(t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}
function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}
function transition_styleTween(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}
function transition_text(value) {
  return this.tween("text", typeof value === "function" ? textFunction(tweenValue(this, "text", value)) : textConstant(value == null ? "" : value + ""));
}
function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}
function textTween(value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function transition_textTween(value) {
  var key = "text";
  if (arguments.length < 1) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, textTween(value));
}
function transition_transition() {
  var name = this._name, id0 = this._id, id1 = newId();
  for (var groups = this._groups, m2 = groups.length, j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit2 = get(node, id0);
        schedule(node, name, id1, i, group, {
          time: inherit2.time + inherit2.delay + inherit2.duration,
          delay: 0,
          duration: inherit2.duration,
          ease: inherit2.ease
        });
      }
    }
  }
  return new Transition(groups, this._parents, name, id1);
}
function transition_end() {
  var on0, on1, that = this, id2 = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = { value: reject }, end = { value: function() {
      if (--size === 0) resolve();
    } };
    that.each(function() {
      var schedule2 = set(this, id2), on = schedule2.on;
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }
      schedule2.on = on1;
    });
    if (size === 0) resolve();
  });
}
var id = 0;
function Transition(groups, parents, name, id2) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id2;
}
function newId() {
  return ++id;
}
var selection_prototype = selection.prototype;
Transition.prototype = {
  constructor: Transition,
  select: transition_select,
  selectAll: transition_selectAll,
  selectChild: selection_prototype.selectChild,
  selectChildren: selection_prototype.selectChildren,
  filter: transition_filter,
  merge: transition_merge,
  selection: transition_selection,
  transition: transition_transition,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: transition_on,
  attr: transition_attr,
  attrTween: transition_attrTween,
  style: transition_style,
  styleTween: transition_styleTween,
  text: transition_text,
  textTween: transition_textTween,
  remove: transition_remove,
  tween: transition_tween,
  delay: transition_delay,
  duration: transition_duration,
  ease: transition_ease,
  easeVarying: transition_easeVarying,
  end: transition_end,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};
function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}
var defaultTiming = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};
function inherit(node, id2) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id2])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id2} not found`);
    }
  }
  return timing;
}
function selection_transition(name) {
  var id2, timing;
  if (name instanceof Transition) {
    id2 = name._id, name = name._name;
  } else {
    id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }
  for (var groups = this._groups, m2 = groups.length, j = 0; j < m2; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule(node, name, id2, i, group, timing || inherit(node, id2));
      }
    }
  }
  return new Transition(groups, this._parents, name, id2);
}
selection.prototype.interrupt = selection_interrupt;
selection.prototype.transition = selection_transition;
const constant = (x2) => () => x2;
function ZoomEvent(type, {
  sourceEvent: sourceEvent2,
  target,
  transform,
  dispatch: dispatch2
}) {
  Object.defineProperties(this, {
    type: { value: type, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent2, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    transform: { value: transform, enumerable: true, configurable: true },
    _: { value: dispatch2 }
  });
}
function Transform(k, x2, y2) {
  this.k = k;
  this.x = x2;
  this.y = y2;
}
Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x2, y2) {
    return x2 === 0 & y2 === 0 ? this : new Transform(this.k, this.x + this.k * x2, this.y + this.k * y2);
  },
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function(x2) {
    return x2 * this.k + this.x;
  },
  applyY: function(y2) {
    return y2 * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x2) {
    return (x2 - this.x) / this.k;
  },
  invertY: function(y2) {
    return (y2 - this.y) / this.k;
  },
  rescaleX: function(x2) {
    return x2.copy().domain(x2.range().map(this.invertX, this).map(x2.invert, x2));
  },
  rescaleY: function(y2) {
    return y2.copy().domain(y2.range().map(this.invertY, this).map(y2.invert, y2));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var identity = new Transform(1, 0, 0);
Transform.prototype;
function nopropagation(event) {
  event.stopImmediatePropagation();
}
function noevent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
function defaultFilter(event) {
  return (!event.ctrlKey || event.type === "wheel") && !event.button;
}
function defaultExtent() {
  var e = this;
  if (e instanceof SVGElement) {
    e = e.ownerSVGElement || e;
    if (e.hasAttribute("viewBox")) {
      e = e.viewBox.baseVal;
      return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
    }
    return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
  }
  return [[0, 0], [e.clientWidth, e.clientHeight]];
}
function defaultTransform() {
  return this.__zoom || identity;
}
function defaultWheelDelta(event) {
  return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 2e-3) * (event.ctrlKey ? 10 : 1);
}
function defaultTouchable() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function defaultConstrain(transform, extent, translateExtent) {
  var dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0], dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0], dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1], dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1];
  return transform.translate(
    dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
    dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
  );
}
function d3zoom() {
  var filter2 = defaultFilter, extent = defaultExtent, constrain = defaultConstrain, wheelDelta = defaultWheelDelta, touchable = defaultTouchable, scaleExtent = [0, Infinity], translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]], duration = 250, interpolate2 = interpolateZoom, listeners = dispatch("start", "zoom", "end"), touchstarting, touchfirst, touchending, touchDelay = 500, wheelDelay = 150, clickDistance2 = 0, tapDistance = 10;
  function zoom(selection2) {
    selection2.property("__zoom", defaultTransform).on("wheel.zoom", wheeled, { passive: false }).on("mousedown.zoom", mousedowned).on("dblclick.zoom", dblclicked).filter(touchable).on("touchstart.zoom", touchstarted).on("touchmove.zoom", touchmoved).on("touchend.zoom touchcancel.zoom", touchended).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  zoom.transform = function(collection, transform, point, event) {
    var selection2 = collection.selection ? collection.selection() : collection;
    selection2.property("__zoom", defaultTransform);
    if (collection !== selection2) {
      schedule2(collection, transform, point, event);
    } else {
      selection2.interrupt().each(function() {
        gesture(this, arguments).event(event).start().zoom(null, typeof transform === "function" ? transform.apply(this, arguments) : transform).end();
      });
    }
  };
  zoom.scaleBy = function(selection2, k, p, event) {
    zoom.scaleTo(selection2, function() {
      var k0 = this.__zoom.k, k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return k0 * k1;
    }, p, event);
  };
  zoom.scaleTo = function(selection2, k, p, event) {
    zoom.transform(selection2, function() {
      var e = extent.apply(this, arguments), t0 = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p, p1 = t0.invert(p0), k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
    }, p, event);
  };
  zoom.translateBy = function(selection2, x2, y2, event) {
    zoom.transform(selection2, function() {
      return constrain(this.__zoom.translate(
        typeof x2 === "function" ? x2.apply(this, arguments) : x2,
        typeof y2 === "function" ? y2.apply(this, arguments) : y2
      ), extent.apply(this, arguments), translateExtent);
    }, null, event);
  };
  zoom.translateTo = function(selection2, x2, y2, p, event) {
    zoom.transform(selection2, function() {
      var e = extent.apply(this, arguments), t = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
      return constrain(identity.translate(p0[0], p0[1]).scale(t.k).translate(
        typeof x2 === "function" ? -x2.apply(this, arguments) : -x2,
        typeof y2 === "function" ? -y2.apply(this, arguments) : -y2
      ), e, translateExtent);
    }, p, event);
  };
  function scale(transform, k) {
    k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
    return k === transform.k ? transform : new Transform(k, transform.x, transform.y);
  }
  function translate(transform, p0, p1) {
    var x2 = p0[0] - p1[0] * transform.k, y2 = p0[1] - p1[1] * transform.k;
    return x2 === transform.x && y2 === transform.y ? transform : new Transform(transform.k, x2, y2);
  }
  function centroid(extent2) {
    return [(+extent2[0][0] + +extent2[1][0]) / 2, (+extent2[0][1] + +extent2[1][1]) / 2];
  }
  function schedule2(transition, transform, point, event) {
    transition.on("start.zoom", function() {
      gesture(this, arguments).event(event).start();
    }).on("interrupt.zoom end.zoom", function() {
      gesture(this, arguments).event(event).end();
    }).tween("zoom", function() {
      var that = this, args = arguments, g = gesture(that, args).event(event), e = extent.apply(that, args), p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point, w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]), a2 = that.__zoom, b = typeof transform === "function" ? transform.apply(that, args) : transform, i = interpolate2(a2.invert(p).concat(w / a2.k), b.invert(p).concat(w / b.k));
      return function(t) {
        if (t === 1) t = b;
        else {
          var l = i(t), k = w / l[2];
          t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k);
        }
        g.zoom(null, t);
      };
    });
  }
  function gesture(that, args, clean) {
    return !clean && that.__zooming || new Gesture(that, args);
  }
  function Gesture(that, args) {
    this.that = that;
    this.args = args;
    this.active = 0;
    this.sourceEvent = null;
    this.extent = extent.apply(that, args);
    this.taps = 0;
  }
  Gesture.prototype = {
    event: function(event) {
      if (event) this.sourceEvent = event;
      return this;
    },
    start: function() {
      if (++this.active === 1) {
        this.that.__zooming = this;
        this.emit("start");
      }
      return this;
    },
    zoom: function(key, transform) {
      if (this.mouse && key !== "mouse") this.mouse[1] = transform.invert(this.mouse[0]);
      if (this.touch0 && key !== "touch") this.touch0[1] = transform.invert(this.touch0[0]);
      if (this.touch1 && key !== "touch") this.touch1[1] = transform.invert(this.touch1[0]);
      this.that.__zoom = transform;
      this.emit("zoom");
      return this;
    },
    end: function() {
      if (--this.active === 0) {
        delete this.that.__zooming;
        this.emit("end");
      }
      return this;
    },
    emit: function(type) {
      var d = select(this.that).datum();
      listeners.call(
        type,
        this.that,
        new ZoomEvent(type, {
          sourceEvent: this.sourceEvent,
          target: zoom,
          transform: this.that.__zoom,
          dispatch: listeners
        }),
        d
      );
    }
  };
  function wheeled(event, ...args) {
    if (!filter2.apply(this, arguments)) return;
    var g = gesture(this, args).event(event), t = this.__zoom, k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))), p = pointer(event);
    if (g.wheel) {
      if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
        g.mouse[1] = t.invert(g.mouse[0] = p);
      }
      clearTimeout(g.wheel);
    } else if (t.k === k) return;
    else {
      g.mouse = [p, t.invert(p)];
      interrupt(this);
      g.start();
    }
    noevent(event);
    g.wheel = setTimeout(wheelidled, wheelDelay);
    g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));
    function wheelidled() {
      g.wheel = null;
      g.end();
    }
  }
  function mousedowned(event, ...args) {
    if (touchending || !filter2.apply(this, arguments)) return;
    var currentTarget = event.currentTarget, g = gesture(this, args, true).event(event), v = select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true), p = pointer(event, currentTarget), x0 = event.clientX, y0 = event.clientY;
    dragDisable(event.view);
    nopropagation(event);
    g.mouse = [p, this.__zoom.invert(p)];
    interrupt(this);
    g.start();
    function mousemoved(event2) {
      noevent(event2);
      if (!g.moved) {
        var dx = event2.clientX - x0, dy = event2.clientY - y0;
        g.moved = dx * dx + dy * dy > clickDistance2;
      }
      g.event(event2).zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = pointer(event2, currentTarget), g.mouse[1]), g.extent, translateExtent));
    }
    function mouseupped(event2) {
      v.on("mousemove.zoom mouseup.zoom", null);
      yesdrag(event2.view, g.moved);
      noevent(event2);
      g.event(event2).end();
    }
  }
  function dblclicked(event, ...args) {
    if (!filter2.apply(this, arguments)) return;
    var t0 = this.__zoom, p0 = pointer(event.changedTouches ? event.changedTouches[0] : event, this), p1 = t0.invert(p0), k1 = t0.k * (event.shiftKey ? 0.5 : 2), t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, args), translateExtent);
    noevent(event);
    if (duration > 0) select(this).transition().duration(duration).call(schedule2, t1, p0, event);
    else select(this).call(zoom.transform, t1, p0, event);
  }
  function touchstarted(event, ...args) {
    if (!filter2.apply(this, arguments)) return;
    var touches = event.touches, n = touches.length, g = gesture(this, args, event.changedTouches.length === n).event(event), started, i, t, p;
    nopropagation(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      p = [p, this.__zoom.invert(p), t.identifier];
      if (!g.touch0) g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
      else if (!g.touch1 && g.touch0[2] !== p[2]) g.touch1 = p, g.taps = 0;
    }
    if (touchstarting) touchstarting = clearTimeout(touchstarting);
    if (started) {
      if (g.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() {
        touchstarting = null;
      }, touchDelay);
      interrupt(this);
      g.start();
    }
  }
  function touchmoved(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t, p, l;
    noevent(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
      else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
    }
    t = g.that.__zoom;
    if (g.touch1) {
      var p0 = g.touch0[0], l0 = g.touch0[1], p1 = g.touch1[0], l1 = g.touch1[1], dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp, dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
      t = scale(t, Math.sqrt(dp / dl));
      p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
    } else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
    else return;
    g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
  }
  function touchended(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t;
    nopropagation(event);
    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() {
      touchending = null;
    }, touchDelay);
    for (i = 0; i < n; ++i) {
      t = touches[i];
      if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
      else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
    }
    if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
    if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
    else {
      g.end();
      if (g.taps === 2) {
        t = pointer(t, this);
        if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
          var p = select(this).on("dblclick.zoom");
          if (p) p.apply(this, arguments);
        }
      }
    }
  }
  zoom.wheelDelta = function(_) {
    return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant(+_), zoom) : wheelDelta;
  };
  zoom.filter = function(_) {
    return arguments.length ? (filter2 = typeof _ === "function" ? _ : constant(!!_), zoom) : filter2;
  };
  zoom.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), zoom) : touchable;
  };
  zoom.extent = function(_) {
    return arguments.length ? (extent = typeof _ === "function" ? _ : constant([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent;
  };
  zoom.scaleExtent = function(_) {
    return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom) : [scaleExtent[0], scaleExtent[1]];
  };
  zoom.translateExtent = function(_) {
    return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
  };
  zoom.constrain = function(_) {
    return arguments.length ? (constrain = _, zoom) : constrain;
  };
  zoom.duration = function(_) {
    return arguments.length ? (duration = +_, zoom) : duration;
  };
  zoom.interpolate = function(_) {
    return arguments.length ? (interpolate2 = _, zoom) : interpolate2;
  };
  zoom.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom : value;
  };
  zoom.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom) : Math.sqrt(clickDistance2);
  };
  zoom.tapDistance = function(_) {
    return arguments.length ? (tapDistance = +_, zoom) : tapDistance;
  };
  return zoom;
}
const NO_BRANCH = "_none";
const COSMOS = {
  star: "#fde68a",
  bgFrom: "#1a2440",
  bgTo: "#0a0e1a",
  label: "#fff",
  labelStroke: "#0a0e1a",
  highlight: "#fde68a",
  edgeLabel: "#cbd5e1",
  fallback: "#94a3b8",
  hud: "#cbd5e1",
  hudBg: "rgba(10,14,26,0.7)"
};
const DAISY_TOKENS = /* @__PURE__ */ new Set(["primary", "secondary", "accent", "info", "success", "warning", "error", "neutral"]);
const PALETTE = ["primary", "accent", "success", "warning", "secondary", "info", "error", "neutral"];
const SIM = {
  radial: 0.45,
  collide: 26,
  linkDistance: 80,
  linkStrength: 0.18,
  charge: -22,
  alpha: 0.85,
  // start z lekko niższym dyskomfortem (było 1.0) — krótszy "rozsyp" przy starcie
  alphaDecay: 0.07,
  // szybsze osiadanie (~45 ticków zamiast 80)
  alphaMin: 1e-3,
  velocityDecay: 0.55
  // mniej wobble po osiadaniu
};
const ZOOM = { min: 0.5, max: 5, resetMs: 350 };
const EMPTY_HITS = {};
const EMPTY_FLASH_PAIRS = [];
const MOON = {
  size: 7,
  sizeSelected: 9,
  rx: 2,
  orbitGap: 14,
  liftOff: 1.5
};
const SONAR = {
  rings: 2,
  duration: 5,
  scaleFrom: 1,
  scaleTo: 2.6,
  opacityFrom: 0.55,
  strokeWidth: 2.2
};
const COSMOS_KEYFRAMES_CSS = `
@keyframes cosmos-sonar { 0% { transform: scale(${SONAR.scaleFrom}); opacity: ${SONAR.opacityFrom}; } 100% { transform: scale(${SONAR.scaleTo}); opacity: 0; } }
@keyframes cosmos-flash { 0% { opacity: 0; stroke-width: 1; } 18% { opacity: 1; stroke-width: 5; } 100% { opacity: 0; stroke-width: 1; } }
@keyframes cosmos-next { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.18); opacity: 0.85; } }
`.trim();
const Keyframes = () => /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("style", { children: COSMOS_KEYFRAMES_CSS }) });
const LAYOUT = {
  cx: 300,
  cy: 300,
  rMin: 110,
  // promień najwęższej orbity
  minArc: 38,
  // min łuk (px) na węzeł — wymusza większą orbitę gdy gęsto
  baseStep: 95,
  // standardowy odstęp między orbitami
  defaultSize: 10
  // baseR planety gdy node.size pominięty
};
const tok = (name) => {
  if (!name) return COSMOS.fallback;
  if (name.startsWith("#") || name.startsWith("var(") || name.startsWith("rgb")) return name;
  if (DAISY_TOKENS.has(name)) return `var(--color-${name})`;
  return COSMOS.fallback;
};
const darken = (color2, amt = 0.45) => `color-mix(in srgb, ${color2} ${Math.round((1 - amt) * 100)}%, black)`;
const DIM_TARGET = darken(COSMOS.bgTo, 0.35);
const dim = (color2, amt = 0.7) => `color-mix(in srgb, ${color2} ${Math.round((1 - amt) * 100)}%, ${DIM_TARGET})`;
const hashStr = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) >>> 0;
  return h;
};
const planetRadius = (weight) => Math.max(6, Math.min(8 + weight, 18));
const safeIdAtom = (s) => s.replace(/[^a-zA-Z0-9_-]/g, "_");
const planetGeom = (baseR, state) => {
  const r = state === "selected" ? baseR + 4 : baseR;
  return {
    r,
    haloR: r + 28,
    // soft glow extent — szeroka kosmiczna aura
    liftOff: Math.max(2, r * 0.18),
    moonOrbitR: r + MOON.orbitGap
  };
};
const arrowGeom = (a2, b, targetR) => {
  const dx = b.x - a2.x, dy = b.y - a2.y;
  const d = Math.hypot(dx, dy) || 1;
  const tipX = b.x - dx / d * (targetR + 2);
  const tipY = b.y - dy / d * (targetR + 2);
  const ang = Math.atan2(dy, dx);
  const arrLen = 8, arrWide = 4;
  const baseX = tipX - arrLen * Math.cos(ang);
  const baseY = tipY - arrLen * Math.sin(ang);
  const w1x = baseX + arrWide * Math.sin(ang);
  const w1y = baseY - arrWide * Math.cos(ang);
  const w2x = baseX - arrWide * Math.sin(ang);
  const w2y = baseY + arrWide * Math.cos(ang);
  return {
    path: `M${tipX},${tipY} L${w1x},${w1y} L${w2x},${w2y} Z`,
    lineEnd: { x: baseX, y: baseY }
  };
};
const branchOf = (n) => n.branch || NO_BRANCH;
const computeUsedBranches = (nodes, branches) => {
  const byKey = new Map(branches.map((b) => [b.key, b]));
  const used = [];
  const seen = /* @__PURE__ */ new Set();
  for (const b of branches) {
    if (!seen.has(b.key) && nodes.some((n) => branchOf(n) === b.key)) {
      used.push(b.key);
      seen.add(b.key);
    }
  }
  if (nodes.some((n) => branchOf(n) === NO_BRANCH)) used.push(NO_BRANCH);
  return used.map((k, i) => {
    const def = byKey.get(k);
    return {
      key: k,
      label: def ? def.label : "bez gałęzi",
      color: (def == null ? void 0 : def.color) ? tok(def.color) : tok(PALETTE[i % PALETTE.length])
    };
  });
};
const computeLayout = (visibleNodes, allNodes, branches, visibleEdges) => {
  const countPerKeyAll = /* @__PURE__ */ new Map();
  for (const n of allNodes) {
    const k = branchOf(n);
    countPerKeyAll.set(k, (countPerKeyAll.get(k) || 0) + 1);
  }
  let prevR = LAYOUT.rMin;
  const orbits = computeUsedBranches(allNodes, branches).map((info, i) => {
    const cnt = countPerKeyAll.get(info.key) || 1;
    const required = cnt * LAYOUT.minArc / (2 * Math.PI);
    const r = Math.max(prevR + (i === 0 ? 0 : LAYOUT.baseStep), required);
    prevR = r;
    return { ...info, radius: r };
  });
  const parseTier = (n) => {
    if (typeof n.tier === "number") return n.tier;
    const parsed = parseInt(String(n.tier ?? ""), 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const initialSimNodes = [];
  for (const orbit of orbits) {
    const allOnBranch = allNodes.filter((n) => branchOf(n) === orbit.key);
    if (!allOnBranch.length) continue;
    const sorted = [...allOnBranch].sort((a2, b) => {
      const dt = parseTier(a2) - parseTier(b);
      return dt !== 0 ? dt : a2.nid.localeCompare(b.nid);
    });
    const slotByNid = new Map(sorted.map((n, idx) => [n.nid, idx]));
    const total = Math.max(sorted.length, 1);
    for (const n of visibleNodes.filter((x2) => branchOf(x2) === orbit.key)) {
      const j = slotByNid.get(n.nid) ?? 0;
      const a2 = j / total * Math.PI * 2 - Math.PI / 2;
      initialSimNodes.push({
        id: n.nid,
        x: LAYOUT.cx + Math.cos(a2) * orbit.radius,
        y: LAYOUT.cy + Math.sin(a2) * orbit.radius,
        targetR: orbit.radius,
        color: orbit.color,
        branch: orbit.key
      });
    }
  }
  const nidSet = new Set(initialSimNodes.map((n) => n.id));
  const simLinks = visibleEdges.map((e) => ({ source: e.from, target: e.to })).filter((l) => nidSet.has(l.source) && nidSet.has(l.target));
  return { initialSimNodes, simLinks, orbits };
};
const Label = (p) => {
  const baseSize = p.size ?? 10;
  const fs = baseSize / p.zoomFactor;
  const sw = baseSize * 0.18 / p.zoomFactor;
  return /* @__PURE__ */ jsx(
    "text",
    {
      x: p.x,
      y: p.y,
      textAnchor: "middle",
      fontSize: fs,
      fill: p.color,
      opacity: p.opacity ?? 1,
      style: {
        pointerEvents: "none",
        paintOrder: "stroke",
        letterSpacing: (p.uppercase ? 0.6 : 0.2) / p.zoomFactor,
        fontWeight: p.weight ?? 500,
        textTransform: p.uppercase ? "uppercase" : "none"
      },
      stroke: COSMOS.labelStroke,
      strokeWidth: sw,
      strokeOpacity: 0.7,
      children: p.text
    }
  );
};
const Edge = (p) => {
  const arrow = p.arrow ? arrowGeom(p.a, p.b, p.arrow.targetR) : null;
  const lineEnd = arrow ? arrow.lineEnd : p.b;
  const finalColor = p.dim > 0 ? dim(p.color, p.dim) : p.color;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "line",
      {
        x1: p.a.x,
        y1: p.a.y,
        x2: lineEnd.x,
        y2: lineEnd.y,
        stroke: finalColor,
        strokeWidth: p.sw,
        strokeLinecap: "round",
        strokeDasharray: p.dashed ? "4 3" : void 0,
        shapeRendering: "crispEdges",
        style: { transition: "stroke 350ms ease-out" }
      }
    ),
    arrow && /* @__PURE__ */ jsx(
      "path",
      {
        d: arrow.path,
        fill: finalColor,
        style: { transition: "fill 350ms ease-out" }
      }
    ),
    p.label && /* @__PURE__ */ jsx(
      Label,
      {
        x: (p.a.x + p.b.x) / 2,
        y: (p.a.y + p.b.y) / 2 - 4,
        text: p.label.text,
        color: p.label.color,
        size: p.label.size ?? 9,
        opacity: 0.95,
        weight: p.label.weight ?? 500,
        zoomFactor: p.zoomFactor
      }
    )
  ] });
};
const Star = (p) => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx("circle", { cx: p.cx, cy: p.cy, r: p.coreR ?? 6, fill: COSMOS.star }),
  /* @__PURE__ */ jsx("circle", { cx: p.cx, cy: p.cy, r: p.auraR ?? 14, fill: COSMOS.star, opacity: 0.2 })
] });
const Orbit = (p) => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    "circle",
    {
      cx: p.cx,
      cy: p.cy,
      r: p.radius,
      fill: "none",
      stroke: p.color,
      strokeOpacity: 0.35,
      strokeDasharray: "3 5",
      shapeRendering: "crispEdges"
    }
  ),
  /* @__PURE__ */ jsx(
    Label,
    {
      x: p.cx,
      y: p.cy - p.radius - 6,
      text: p.label,
      color: p.color,
      size: 9,
      opacity: 0.85,
      weight: 600,
      uppercase: true,
      zoomFactor: p.zoomFactor
    }
  )
] });
const CastShadow = (p) => {
  const fallbackId = useId();
  const prefix = p.instanceId ?? `cg-${fallbackId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const len = p.length ?? 110;
  const dx = p.planetX - p.sunX, dy = p.planetY - p.sunY;
  const d = Math.hypot(dx, dy) || 1;
  const ux = dx / d, uy = dy / d;
  const px = -uy, py = ux;
  const w0 = p.planetR * 0.9;
  const w1 = p.planetR * 0.45;
  const x1 = p.planetX + px * w0, y1 = p.planetY + py * w0;
  const x2 = p.planetX - px * w0, y2 = p.planetY - py * w0;
  const x3 = p.planetX - px * w1 + ux * len, y3 = p.planetY - py * w1 + uy * len;
  const x4 = p.planetX + px * w1 + ux * len, y4 = p.planetY + py * w1 + uy * len;
  const gradId = `${prefix}-shadow-${safeIdAtom(p.id)}`;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "linearGradient",
      {
        id: gradId,
        gradientUnits: "userSpaceOnUse",
        x1: p.planetX,
        y1: p.planetY,
        x2: p.planetX + ux * len,
        y2: p.planetY + uy * len,
        children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#000", stopOpacity: 0.32 }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#000", stopOpacity: 0 })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "polygon",
      {
        points: `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`,
        fill: `url(#${gradId})`,
        pointerEvents: "none"
      }
    )
  ] });
};
const Sonar = (p) => /* @__PURE__ */ jsx("g", { transform: `translate(${p.x} ${p.y})`, style: { pointerEvents: "none" }, children: Array.from({ length: SONAR.rings }, (_, i) => /* @__PURE__ */ jsx(
  "circle",
  {
    cx: 0,
    cy: 0,
    r: p.r,
    fill: "none",
    stroke: p.color,
    strokeWidth: SONAR.strokeWidth,
    style: {
      transformBox: "fill-box",
      transformOrigin: "center",
      animation: `cosmos-sonar ${SONAR.duration}s ease-out ${(i * SONAR.duration / SONAR.rings).toFixed(2)}s infinite`,
      opacity: 0
    }
  },
  i
)) });
const Planet = (p) => {
  const { r, haloR, liftOff } = planetGeom(p.baseR, p.state);
  const isSel = p.state === "selected";
  const isHl = p.state === "highlighted";
  const haloColor = isHl ? COSMOS.highlight : p.color;
  const tierFs = Math.max(7, p.baseR * 0.85) / p.zoomFactor;
  const isFrontier = !!p.frontier;
  const dimAmt = p.dimmed ? 0.7 : 0;
  const bodyColor = isFrontier ? darken(p.color, 0.6) : p.color;
  const bodyFill = dimAmt ? dim(bodyColor, dimAmt) : bodyColor;
  const liftFill = dimAmt ? dim(darken(p.color), dimAmt) : darken(p.color);
  const tierFill = dimAmt ? dim(COSMOS.labelStroke, dimAmt) : COSMOS.labelStroke;
  const strokeColor = isSel || isHl ? COSMOS.label : isFrontier ? p.color : "none";
  return (
    // Outer g: pozycja-z-sim przez SVG transform attribute. BEZ transition — sim ticks updatują się
    // natychmiast (każdy tick d3 wymusza nowe x,y; transition na pozycji = janky 5fps przy 60Hz tickach).
    // Inner elementy używają lokalnych koord (cx=0/cy=0) i mają transition TYLKO na zmianach stanu.
    /* @__PURE__ */ jsxs(
      "g",
      {
        transform: `translate(${p.x} ${p.y})`,
        onMouseEnter: p.onMouseEnter,
        onMouseLeave: p.onMouseLeave,
        style: isFrontier ? { opacity: 0.55, transition: "opacity 150ms" } : { transition: "opacity 150ms" },
        children: [
          p.isNext && /* @__PURE__ */ jsx(
            "circle",
            {
              cx: 0,
              cy: 0,
              r: haloR + 2,
              fill: "none",
              stroke: COSMOS.highlight,
              strokeWidth: 1.2,
              opacity: 0.7,
              style: {
                transformBox: "fill-box",
                transformOrigin: "center",
                animation: "cosmos-next 2.2s ease-in-out infinite"
              },
              pointerEvents: "none"
            }
          ),
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: 0,
              cy: 0,
              r: haloR,
              fill: haloColor,
              opacity: isSel || isHl ? 0.3 : 0,
              style: {
                transition: "r 250ms ease-out, opacity 300ms ease-out, fill 350ms ease-out",
                filter: "blur(10px)"
              },
              pointerEvents: "none"
            }
          ),
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: 0,
              cy: liftOff,
              r,
              fill: liftFill,
              style: { transition: "r 250ms ease-out, cy 250ms ease-out, fill 350ms ease-out" },
              pointerEvents: "none"
            }
          ),
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: 0,
              cy: 0,
              r,
              fill: bodyFill,
              stroke: strokeColor,
              strokeWidth: isFrontier ? 1.5 : 2,
              strokeDasharray: isFrontier ? "3 2" : void 0,
              style: {
                cursor: p.onClick ? "pointer" : "default",
                // Płynne przejścia: rozmiar (klik → grow), kolor (frontier → discovered), border (dashed → solid).
                transition: "r 250ms ease-out, fill 350ms ease-out, stroke 350ms ease-out, stroke-width 250ms ease-out, stroke-dasharray 350ms ease-out"
              },
              onClick: p.onClick ? (e) => {
                e.stopPropagation();
                p.onClick();
              } : void 0
            }
          ),
          isFrontier ? /* @__PURE__ */ jsx(
            "text",
            {
              x: 0,
              y: tierFs * 0.35,
              textAnchor: "middle",
              fontSize: tierFs,
              fill: p.color,
              fontWeight: 700,
              opacity: 0.9,
              pointerEvents: "none",
              children: "?"
            }
          ) : p.tier ? /* @__PURE__ */ jsx(
            "text",
            {
              x: 0,
              y: tierFs * 0.35,
              textAnchor: "middle",
              fontSize: tierFs,
              fill: tierFill,
              fontWeight: 700,
              pointerEvents: "none",
              children: p.tier.slice(0, 3)
            }
          ) : null
        ]
      }
    )
  );
};
const FlashEdge = (p) => /* @__PURE__ */ jsx(
  "line",
  {
    x1: p.a.x,
    y1: p.a.y,
    x2: p.b.x,
    y2: p.b.y,
    stroke: COSMOS.highlight,
    strokeLinecap: "round",
    strokeWidth: p.fresh ? 3 : 1.5,
    style: {
      animation: p.fresh ? "cosmos-flash 1.4s ease-out 1" : void 0,
      opacity: p.fresh ? void 0 : 0.45
    },
    shapeRendering: "crispEdges",
    pointerEvents: "none"
  }
);
const Moon = (p) => {
  const size = p.selected ? MOON.sizeSelected : MOON.size;
  const dimAmt = p.dimmed ? 0.7 : 0;
  const bodyFill = dimAmt ? dim(p.color, dimAmt) : p.color;
  const liftFill = dimAmt ? dim(darken(p.color), dimAmt) : darken(p.color);
  const rectTransition = "x 250ms ease-out, y 250ms ease-out, width 250ms ease-out, height 250ms ease-out, fill 350ms ease-out, stroke 250ms ease-out, stroke-opacity 250ms ease-out, stroke-width 250ms ease-out, filter 300ms ease-out";
  const glowFilter = p.related ? `drop-shadow(0 0 4px ${COSMOS.highlight})` : "drop-shadow(0 0 0 transparent)";
  return /* @__PURE__ */ jsxs("g", { transform: `translate(${p.x} ${p.y})`, children: [
    /* @__PURE__ */ jsx(
      "rect",
      {
        x: -size / 2,
        y: -size / 2 + MOON.liftOff,
        width: size,
        height: size,
        rx: MOON.rx,
        ry: MOON.rx,
        fill: liftFill,
        style: { transition: rectTransition },
        pointerEvents: "none"
      }
    ),
    /* @__PURE__ */ jsx(
      "rect",
      {
        x: -size / 2,
        y: -size / 2,
        width: size,
        height: size,
        rx: MOON.rx,
        ry: MOON.rx,
        fill: bodyFill,
        stroke: COSMOS.label,
        strokeOpacity: p.selected ? 0.7 : 0,
        strokeWidth: p.selected ? 2 : 1,
        style: {
          cursor: p.onClick ? "pointer" : "default",
          transition: rectTransition,
          filter: glowFilter
        },
        onClick: p.onClick ? (e) => {
          e.stopPropagation();
          p.onClick();
        } : void 0,
        children: /* @__PURE__ */ jsx("title", { children: p.title })
      }
    )
  ] });
};
function CosmosGraph(props) {
  const {
    nodes,
    moons = [],
    edges = [],
    contextEdges = [],
    branches,
    relTypes = [],
    selectedNid = null,
    selectedMoonId = null,
    highlightedNids,
    relatedMoonIds,
    onSelectNode,
    onSelectMoon,
    onDeselect,
    contextBranchPrefix,
    placeholder,
    progress,
    bigBranches = [],
    rootNid: rootNidProp = null
  } = props;
  const cx = LAYOUT.cx, cy = LAYOUT.cy;
  const gating = !!progress;
  const hits = (progress == null ? void 0 : progress.hits) ?? EMPTY_HITS;
  const flashPairs = (progress == null ? void 0 : progress.flashPairs) ?? EMPTY_FLASH_PAIRS;
  const nextNid = (progress == null ? void 0 : progress.nextNid) ?? null;
  const bigBranchSet = useMemo(() => new Set(bigBranches), [bigBranches]);
  const { visible, frontier } = useMemo(() => {
    var _a;
    if (!gating) {
      const all = new Set(nodes.map((n) => n.nid));
      return { visible: all, frontier: /* @__PURE__ */ new Set() };
    }
    const adj = /* @__PURE__ */ new Map();
    for (const e of edges) {
      if (!adj.has(e.from)) adj.set(e.from, /* @__PURE__ */ new Set());
      if (!adj.has(e.to)) adj.set(e.to, /* @__PURE__ */ new Set());
      adj.get(e.from).add(e.to);
      adj.get(e.to).add(e.from);
    }
    const disc = /* @__PURE__ */ new Set();
    for (const n of nodes) if ((hits[n.nid] || 0) > 0) disc.add(n.nid);
    if (!disc.size) {
      const tierOf = (n) => {
        if (typeof n.tier === "number") return n.tier;
        const parsed = parseInt(String(n.tier ?? ""), 10);
        return Number.isFinite(parsed) ? parsed : 0;
      };
      const sorted = [...nodes].sort((a2, b) => tierOf(a2) - tierOf(b));
      const rootId = rootNidProp || ((_a = sorted[0]) == null ? void 0 : _a.nid);
      if (rootId) return { visible: /* @__PURE__ */ new Set([rootId]), frontier: /* @__PURE__ */ new Set([rootId]) };
      return { visible: /* @__PURE__ */ new Set(), frontier: /* @__PURE__ */ new Set() };
    }
    const vis = new Set(disc);
    const front = /* @__PURE__ */ new Set();
    for (const nid of disc) for (const nb of adj.get(nid) || []) if (!disc.has(nb)) {
      vis.add(nb);
      front.add(nb);
    }
    return { visible: vis, frontier: front };
  }, [gating, nodes, edges, hits, rootNidProp]);
  const visNodes = useMemo(() => gating ? nodes.filter((n) => visible.has(n.nid)) : nodes, [gating, nodes, visible]);
  const visEdges = useMemo(() => gating ? edges.filter((e) => visible.has(e.from) && visible.has(e.to)) : edges, [gating, edges, visible]);
  const visContextEdges = useMemo(() => gating ? contextEdges.filter((e) => visible.has(e.from) && visible.has(e.to)) : contextEdges, [gating, contextEdges, visible]);
  const visMoons = useMemo(() => gating ? moons.filter((m2) => visible.has(m2.nodeId)) : moons, [gating, moons, visible]);
  const visFlashPairs = useMemo(() => flashPairs.filter((p) => visible.has(p.fromNid) && visible.has(p.toNid)), [flashPairs, visible]);
  const { initialSimNodes, simLinks, orbits } = useMemo(
    () => computeLayout(visNodes, nodes, branches, visEdges),
    [visNodes, nodes, branches, visEdges]
  );
  const branchColorByNid = useMemo(() => {
    const orbitColors = new Map(orbits.map((o) => [o.key, o.color]));
    const m2 = /* @__PURE__ */ new Map();
    for (const n of visNodes) m2.set(n.nid, orbitColors.get(branchOf(n)) || COSMOS.fallback);
    return m2;
  }, [visNodes, orbits]);
  const baseRByNid = useMemo(() => {
    const m2 = /* @__PURE__ */ new Map();
    for (const n of visNodes) m2.set(n.nid, n.size ?? LAYOUT.defaultSize);
    return m2;
  }, [visNodes]);
  const moonsByNid = useMemo(() => {
    const m2 = /* @__PURE__ */ new Map();
    for (const moon of visMoons) {
      if (!m2.has(moon.nodeId)) m2.set(moon.nodeId, []);
      m2.get(moon.nodeId).push(moon);
    }
    return m2;
  }, [visMoons]);
  const contextNids = useMemo(() => {
    const set2 = /* @__PURE__ */ new Set();
    if (!contextBranchPrefix) return set2;
    const prefix = contextBranchPrefix.toLowerCase();
    for (const n of visNodes) {
      if (n.branch.toLowerCase().startsWith(prefix)) set2.add(n.nid);
    }
    return set2;
  }, [visNodes, contextBranchPrefix]);
  const relColorByKey = useMemo(() => {
    const m2 = /* @__PURE__ */ new Map();
    for (const r of relTypes) m2.set(r.key, { label: r.label, color: tok(r.color) });
    return m2;
  }, [relTypes]);
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const zoomRef = useRef(null);
  const simRef = useRef(null);
  const simNodesRef = useRef(/* @__PURE__ */ new Map());
  const [zoomK, setZoomK] = useState(1);
  const [panning, setPanning] = useState(false);
  const [hovered, setHovered] = useState(null);
  const rawInstanceId = useId();
  const instanceId = useMemo(() => `cg-${rawInstanceId.replace(/[^a-zA-Z0-9_-]/g, "")}`, [rawInstanceId]);
  const [positions, setPositions] = useState(() => {
    const m2 = /* @__PURE__ */ new Map();
    for (const n of initialSimNodes) m2.set(n.id, { x: n.x ?? 0, y: n.y ?? 0 });
    return m2;
  });
  useEffect(() => {
    const persistent = simNodesRef.current;
    const simNodes = initialSimNodes.map((n) => {
      const existing = persistent.get(n.id);
      if (existing) {
        existing.targetR = n.targetR;
        existing.color = n.color;
        existing.branch = n.branch;
        return existing;
      }
      const fresh = { ...n };
      persistent.set(n.id, fresh);
      return fresh;
    });
    const visibleIds = new Set(initialSimNodes.map((n) => n.id));
    for (const id2 of Array.from(persistent.keys())) {
      if (!visibleIds.has(id2)) persistent.delete(id2);
    }
    const links = simLinks.map((l) => ({ source: l.source, target: l.target }));
    const sim = forceSimulation(simNodes).force("radial", forceRadial((d) => d.targetR, cx, cy).strength(SIM.radial)).force("collide", forceCollide(SIM.collide)).force("link", forceLink(links).id((d) => d.id).distance(SIM.linkDistance).strength(SIM.linkStrength)).force("charge", forceManyBody().strength(SIM.charge)).alpha(SIM.alpha).alphaDecay(SIM.alphaDecay).alphaMin(SIM.alphaMin).velocityDecay(SIM.velocityDecay).on("tick", () => {
      const next = /* @__PURE__ */ new Map();
      for (const n of simNodes) next.set(n.id, { x: n.x ?? 0, y: n.y ?? 0 });
      setPositions(next);
    });
    simRef.current = sim;
    return () => {
      sim.stop();
      simRef.current = null;
    };
  }, [initialSimNodes, simLinks, cx, cy]);
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svgSel = select(svgRef.current);
    const gSel = select(gRef.current);
    const zb = d3zoom().scaleExtent([ZOOM.min, ZOOM.max]).on("start", () => setPanning(true)).on("zoom", (event) => {
      gSel.attr("transform", event.transform.toString());
      setZoomK(event.transform.k);
    }).on("end", () => setPanning(false));
    svgSel.call(zb);
    zoomRef.current = zb;
    return () => {
      svgSel.on(".zoom", null);
      zoomRef.current = null;
    };
  }, []);
  const reset = () => {
    if (!svgRef.current || !zoomRef.current) return;
    select(svgRef.current).transition().duration(ZOOM.resetMs).call(zoomRef.current.transform, identity);
  };
  const setHoverIfIdle = (nid) => {
    if (panning) return;
    setHovered((prev) => prev === nid ? prev : nid);
  };
  const focusNid = selectedNid;
  const neighborSet = useMemo(() => {
    if (!focusNid) return null;
    const set2 = /* @__PURE__ */ new Set([focusNid]);
    for (const e of visEdges) {
      if (e.from === focusNid) set2.add(e.to);
      if (e.to === focusNid) set2.add(e.from);
    }
    for (const ce of visContextEdges) {
      if (ce.from === focusNid) set2.add(ce.to);
      if (ce.to === focusNid) set2.add(ce.from);
    }
    return set2;
  }, [focusNid, visEdges, visContextEdges]);
  const isNodeDimmed = (nid) => !!neighborSet && !neighborSet.has(nid);
  const isEdgeFocused = (a2, b) => !!neighborSet && (a2 === focusNid || b === focusNid);
  const isEdgeRelevant = (a2, b) => !!neighborSet && neighborSet.has(a2) && neighborSet.has(b);
  const showAllLabels = zoomK >= 1.5;
  const labelOpacity = (sel, hov) => sel ? 1 : hov ? 0.95 : showAllLabels ? 0.8 : 0;
  const z = Math.max(zoomK, 0.5);
  const edgeDim = (focused, relevant, idle, focusedDim, relevantDim, dimmedDim = 0.8) => !neighborSet ? idle : focused ? focusedDim : relevant ? relevantDim : dimmedDim;
  const orbitsLayer = useMemo(() => /* @__PURE__ */ jsx(Fragment, { children: orbits.map((o) => {
    const big = bigBranchSet.has(o.key);
    return /* @__PURE__ */ jsx("g", { style: big ? { strokeWidth: 1.5 } : void 0, children: /* @__PURE__ */ jsx(
      Orbit,
      {
        cx,
        cy,
        radius: o.radius,
        color: o.color,
        label: o.label,
        zoomFactor: z
      }
    ) }, o.key);
  }) }), [orbits, cx, cy, z, bigBranchSet]);
  const edgesLayer = useMemo(() => /* @__PURE__ */ jsx(Fragment, { children: visEdges.map((e, i) => {
    const a2 = positions.get(e.from), b = positions.get(e.to);
    if (!a2 || !b) return null;
    const hasType = !!e.type;
    const d = edgeDim(
      isEdgeFocused(e.from, e.to),
      isEdgeRelevant(e.from, e.to),
      0.35,
      // idle — wszystkie edges (typed/untyped) tej samej jasności co progression-style
      hasType ? 0.05 : 0.3,
      // focused
      hasType ? 0.4 : 0.45
      // relevant
    );
    const stronglyVisible = d < 0.6;
    return /* @__PURE__ */ jsx("g", { children: /* @__PURE__ */ jsx(
      Edge,
      {
        a: a2,
        b,
        color: branchColorByNid.get(e.to) || COSMOS.fallback,
        dim: d,
        sw: hasType ? stronglyVisible ? 2 : 1.5 : stronglyVisible ? 1.5 : 1,
        dashed: contextNids.has(e.from) || contextNids.has(e.to),
        arrow: hasType ? { targetR: baseRByNid.get(e.to) || LAYOUT.defaultSize } : void 0,
        label: e.type && !!neighborSet && isEdgeFocused(e.from, e.to) ? { text: e.type, color: COSMOS.edgeLabel } : void 0,
        zoomFactor: z
      }
    ) }, `e-${i}`);
  }) }), [visEdges, positions, neighborSet, focusNid, z, contextNids, baseRByNid, branchColorByNid]);
  const contextLayer = useMemo(() => /* @__PURE__ */ jsx(Fragment, { children: visContextEdges.map((ce, i) => {
    if (!neighborSet && ce.count < 2) return null;
    const a2 = positions.get(ce.from), b = positions.get(ce.to);
    if (!a2 || !b) return null;
    const def = relColorByKey.get(ce.relation);
    const relColor = (def == null ? void 0 : def.color) || COSMOS.fallback;
    const relLabel = (def == null ? void 0 : def.label) || ce.relation;
    const strength = Math.min(0.4 + ce.count * 0.15, 0.9);
    const d = edgeDim(
      isEdgeFocused(ce.from, ce.to),
      isEdgeRelevant(ce.from, ce.to),
      1 - Math.min(0.4 + strength * 0.25, 0.65),
      // idle — sweet spot 0.35-0.6 (35-60% color), match progression-style
      1 - Math.min(0.5 + strength * 0.4, 0.9),
      // focused
      0.5
      // relevant
    );
    return /* @__PURE__ */ jsx("g", { children: /* @__PURE__ */ jsx(
      Edge,
      {
        a: a2,
        b,
        color: relColor,
        dim: d,
        sw: 1 + Math.min(ce.count - 1, 2) * 0.4,
        dashed: contextNids.has(ce.from) || contextNids.has(ce.to),
        label: !!neighborSet && isEdgeFocused(ce.from, ce.to) ? { text: `${relLabel}${ce.count > 1 ? ` ·${ce.count}` : ""}`, color: relColor, size: 8, weight: 600 } : void 0,
        zoomFactor: z
      }
    ) }, `ctx-${i}`);
  }) }), [visContextEdges, positions, neighborSet, focusNid, z, contextNids, relColorByKey]);
  const flashLayer = useMemo(() => {
    if (!visFlashPairs.length) return null;
    return /* @__PURE__ */ jsx(Fragment, { children: visFlashPairs.map((fp, i) => {
      const a2 = positions.get(fp.fromNid), b = positions.get(fp.toNid);
      if (!a2 || !b) return null;
      return /* @__PURE__ */ jsx(FlashEdge, { a: a2, b, fresh: fp.fresh }, `fl-${i}-${fp.fromNid}-${fp.toNid}`);
    }) });
  }, [visFlashPairs, positions]);
  const HIGHLIGHT_LINES_CAP = 60;
  const highlightLines = useMemo(() => {
    if (!selectedMoonId || !highlightedNids) return null;
    const nids = Array.from(highlightedNids);
    const lines = [];
    outer: for (let i = 0; i < nids.length; i++) {
      for (let j = i + 1; j < nids.length; j++) {
        if (lines.length >= HIGHLIGHT_LINES_CAP) break outer;
        const a2 = positions.get(nids[i]);
        const b = positions.get(nids[j]);
        if (!a2 || !b) continue;
        lines.push(
          /* @__PURE__ */ jsx(
            Edge,
            {
              a: a2,
              b,
              color: COSMOS.highlight,
              dim: 0.45,
              sw: 1.5,
              zoomFactor: z
            },
            `hl-${i}-${j}`
          )
        );
      }
    }
    return /* @__PURE__ */ jsx(Fragment, { children: lines });
  }, [selectedMoonId, highlightedNids, positions, z]);
  const shadowsLayer = useMemo(() => /* @__PURE__ */ jsx(Fragment, { children: visNodes.map((n) => {
    if (frontier.has(n.nid)) return null;
    const p = positions.get(n.nid);
    if (!p) return null;
    return /* @__PURE__ */ jsx(
      CastShadow,
      {
        id: n.nid,
        instanceId,
        sunX: cx,
        sunY: cy,
        planetX: p.x,
        planetY: p.y,
        planetR: baseRByNid.get(n.nid) || LAYOUT.defaultSize
      },
      n.nid
    );
  }) }), [visNodes, positions, baseRByNid, cx, cy, frontier, instanceId]);
  const sonarLayer = useMemo(() => {
    if (!selectedNid) return null;
    const p = positions.get(selectedNid);
    if (!p) return null;
    const baseR = baseRByNid.get(selectedNid) || LAYOUT.defaultSize;
    const { r } = planetGeom(baseR, "selected");
    const color2 = branchColorByNid.get(selectedNid) || COSMOS.fallback;
    return /* @__PURE__ */ jsx(Sonar, { x: p.x, y: p.y, r, color: color2 });
  }, [selectedNid, positions, baseRByNid, branchColorByNid]);
  const setPlatesLayer = useMemo(() => {
    if (!selectedMoonId) return null;
    const plates = [];
    for (const n of visNodes) {
      const isFrontier = frontier.has(n.nid) && (hits[n.nid] || 0) === 0;
      if (isFrontier) continue;
      const myMoons = moonsByNid.get(n.nid) || [];
      if (!myMoons.length) continue;
      const p = positions.get(n.nid);
      if (!p) continue;
      const isSel = selectedNid === n.nid;
      const isHl = !!(highlightedNids == null ? void 0 : highlightedNids.has(n.nid));
      const state = isSel ? "selected" : isHl ? "highlighted" : "idle";
      const baseR = baseRByNid.get(n.nid) || LAYOUT.defaultSize;
      const moonOrbitR = planetGeom(baseR, state).moonOrbitR;
      myMoons.forEach((m2, i) => {
        if (m2.id !== selectedMoonId) return;
        const ang = i / Math.max(myMoons.length, 1) * Math.PI * 2;
        const x2 = p.x + Math.cos(ang) * moonOrbitR;
        const y2 = p.y + Math.sin(ang) * moonOrbitR;
        plates.push(
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: x2,
              cy: y2,
              r: MOON.sizeSelected + 95,
              fill: m2.color,
              style: { mixBlendMode: "screen", opacity: 0.16, filter: "blur(18px)" },
              pointerEvents: "none"
            },
            `plate-${n.nid}-${m2.id}`
          )
        );
      });
    }
    return /* @__PURE__ */ jsx(Fragment, { children: plates });
  }, [selectedMoonId, visNodes, positions, moonsByNid, baseRByNid, frontier, hits, selectedNid, highlightedNids]);
  const planetsLayer = useMemo(() => /* @__PURE__ */ jsx(Fragment, { children: visNodes.map((n) => {
    const p = positions.get(n.nid);
    if (!p) return null;
    const color2 = branchColorByNid.get(n.nid) || COSMOS.fallback;
    const isSel = selectedNid === n.nid;
    const isHl = !!(highlightedNids == null ? void 0 : highlightedNids.has(n.nid));
    const isFrontier = frontier.has(n.nid) && (hits[n.nid] || 0) === 0;
    const isDimmed = isNodeDimmed(n.nid);
    const state = isSel ? "selected" : isHl ? "highlighted" : "idle";
    const myMoons = isFrontier ? [] : moonsByNid.get(n.nid) || [];
    const baseR = baseRByNid.get(n.nid) || LAYOUT.defaultSize;
    const moonOrbitR = planetGeom(baseR, state).moonOrbitR;
    const isNext = nextNid === n.nid && !isSel;
    return /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx(
        Planet,
        {
          x: p.x,
          y: p.y,
          color: color2,
          baseR,
          state,
          tier: n.tier !== void 0 && n.tier !== "" ? String(n.tier) : void 0,
          zoomFactor: z,
          dimmed: isDimmed,
          frontier: isFrontier,
          isNext,
          onMouseEnter: () => setHoverIfIdle(n.nid),
          onMouseLeave: () => setHoverIfIdle(null),
          onClick: onSelectNode ? () => onSelectNode(n.nid) : void 0
        }
      ),
      myMoons.map((m2, i) => {
        const ang = i / Math.max(myMoons.length, 1) * Math.PI * 2;
        return /* @__PURE__ */ jsx(
          Moon,
          {
            x: p.x + Math.cos(ang) * moonOrbitR,
            y: p.y + Math.sin(ang) * moonOrbitR,
            color: m2.color,
            selected: selectedMoonId === m2.id,
            related: relatedMoonIds == null ? void 0 : relatedMoonIds.has(m2.id),
            dimmed: isDimmed,
            title: m2.title,
            onClick: onSelectMoon ? () => onSelectMoon(m2.id) : void 0
          },
          m2.id
        );
      })
    ] }, n.nid);
  }) }), [visNodes, positions, moonsByNid, baseRByNid, selectedNid, selectedMoonId, relatedMoonIds, highlightedNids, neighborSet, z, branchColorByNid, frontier, hits, nextNid, onSelectNode, onSelectMoon]);
  const labelsLayer = useMemo(() => /* @__PURE__ */ jsx(Fragment, { children: visNodes.map((n) => {
    const p = positions.get(n.nid);
    if (!p) return null;
    const isFrontier = frontier.has(n.nid) && (hits[n.nid] || 0) === 0;
    if (isFrontier) return null;
    const isSel = selectedNid === n.nid;
    const isHl = !!(highlightedNids == null ? void 0 : highlightedNids.has(n.nid));
    const isHov = hovered === n.nid;
    const op = labelOpacity(isSel || isHl, isHov);
    if (op <= 0) return null;
    const baseR = baseRByNid.get(n.nid) || LAYOUT.defaultSize;
    return /* @__PURE__ */ jsx(
      Label,
      {
        x: p.x,
        y: p.y + baseR + 14,
        text: n.title,
        color: COSMOS.label,
        size: 10,
        opacity: op,
        weight: 500,
        zoomFactor: z
      },
      n.nid
    );
  }) }), [visNodes, positions, baseRByNid, selectedNid, highlightedNids, hovered, zoomK, frontier, hits]);
  if (visNodes.length === 0) return /* @__PURE__ */ jsx(Fragment, { children: placeholder ?? null });
  return /* @__PURE__ */ jsxs("div", { style: { position: "relative", width: "100%", height: "100%" }, children: [
    /* @__PURE__ */ jsxs(
      "svg",
      {
        ref: svgRef,
        viewBox: "0 0 600 600",
        preserveAspectRatio: "xMidYMid meet",
        style: {
          display: "block",
          width: "100%",
          height: "100%",
          background: `radial-gradient(ellipse at center, ${COSMOS.bgFrom} 0%, ${COSMOS.bgTo} 100%)`,
          borderRadius: 8,
          cursor: panning ? "grabbing" : "grab",
          userSelect: "none"
        },
        onClick: () => onDeselect == null ? void 0 : onDeselect(),
        children: [
          /* @__PURE__ */ jsx(Keyframes, {}),
          /* @__PURE__ */ jsxs("g", { ref: gRef, style: { willChange: "transform" }, children: [
            setPlatesLayer,
            orbitsLayer,
            /* @__PURE__ */ jsx(Star, { cx, cy }),
            contextLayer,
            edgesLayer,
            flashLayer,
            highlightLines,
            shadowsLayer,
            sonarLayer,
            planetsLayer,
            labelsLayer
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { style: {
      position: "absolute",
      top: 8,
      right: 8,
      background: COSMOS.hudBg,
      padding: "4px 8px",
      borderRadius: 6,
      color: COSMOS.hud,
      fontSize: 11,
      display: "flex",
      alignItems: "center",
      gap: 8
    }, children: [
      /* @__PURE__ */ jsxs("span", { children: [
        Math.round(zoomK * 100),
        "%"
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: reset,
          style: {
            background: "transparent",
            border: "1px solid currentColor",
            color: "inherit",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: "inherit",
            cursor: "pointer"
          },
          children: "Reset"
        }
      )
    ] })
  ] });
}
const COSMOS_TOKENS = Object.freeze({
  PALETTE,
  planetRadius,
  tok,
  darken,
  hashStr
});
const CAT_COLORS = {
  motyw: "#f59e0b",
  topos: "#ef4444",
  gatunek: "#4a90e2",
  srodek: "#9b59b6",
  srodek_stylistyczny: "#9b59b6",
  postac: "#22c55e",
  pojecie: "#fde68a",
  "pojęcie": "#fde68a"
};
const catColor = (c2) => {
  if (CAT_COLORS[c2]) return CAT_COLORS[c2];
  if (!c2) return COSMOS_TOKENS.tok(COSMOS_TOKENS.PALETTE[0]);
  return COSMOS_TOKENS.tok(COSMOS_TOKENS.PALETTE[COSMOS_TOKENS.hashStr(c2) % COSMOS_TOKENS.PALETTE.length]);
};
const EDGE_KEY_SEP = "\0";
function useBqGraphData(store, treeId, opts = {}) {
  const tid = treeId || "";
  const { gateByDiscoveries = false, selectedMoonId = null, selectedPostId = null } = opts;
  const rawNodes = store.useChildren(tid, "node");
  const rawEdges = store.useChildren(tid, "edge");
  const rawBranches = store.useChildren(tid, "branch");
  const rawRelTypes = store.useChildren(tid, "relType");
  const rawLexicons = store.useChildren(tid, "lexicon");
  const rawAllLexNodes = store.usePosts("lexNode");
  const rawAllContent = store.usePosts("content");
  const rawDiscoveries = store.usePosts("discovery");
  const slidesByNodeId = useMemo(() => {
    const m2 = /* @__PURE__ */ new Map();
    for (const c2 of rawAllContent) {
      if (String(c2.data.contentType) === "quiz") continue;
      const pid = c2.parentId;
      if (pid) m2.set(pid, (m2.get(pid) || 0) + 1);
    }
    return m2;
  }, [rawAllContent]);
  const { lexsByNid, nidsByLex } = useMemo(() => {
    const lexById = new Map(rawLexicons.map((l) => [l.id, l]));
    const lexsByNid2 = /* @__PURE__ */ new Map();
    const nidsByLex2 = /* @__PURE__ */ new Map();
    for (const ln of rawAllLexNodes) {
      const lex = ln.parentId ? lexById.get(ln.parentId) : void 0;
      if (!lex) continue;
      const nid = String(ln.data.nid);
      if (!lexsByNid2.has(nid)) lexsByNid2.set(nid, []);
      lexsByNid2.get(nid).push(lex);
      if (!nidsByLex2.has(lex.id)) nidsByLex2.set(lex.id, /* @__PURE__ */ new Set());
      nidsByLex2.get(lex.id).add(nid);
    }
    return { lexsByNid: lexsByNid2, nidsByLex: nidsByLex2 };
  }, [rawLexicons, rawAllLexNodes]);
  const discoveredTermIds = useMemo(() => {
    if (!gateByDiscoveries) return null;
    return new Set(rawDiscoveries.map((d) => String(d.data.termId)));
  }, [gateByDiscoveries, rawDiscoveries]);
  const nodes = useMemo(() => rawNodes.map((n) => ({
    nid: String(n.data.nodeId),
    title: String(n.data.title),
    branch: String(n.data.branch || ""),
    tier: String(n.data.tier ?? ""),
    size: COSMOS_TOKENS.planetRadius(slidesByNodeId.get(n.id) || 0)
  })), [rawNodes, slidesByNodeId]);
  const edges = useMemo(() => rawEdges.map((e) => ({
    from: String(e.data.fromNid),
    to: String(e.data.toNid),
    type: e.data.type ? String(e.data.type) : void 0
  })), [rawEdges]);
  const branches = useMemo(() => rawBranches.map((b) => ({
    key: String(b.data.key),
    label: String(b.data.label),
    color: String(b.data.color || "neutral")
  })), [rawBranches]);
  const relTypes = useMemo(() => rawRelTypes.map((r) => ({
    key: String(r.data.key),
    label: String(r.data.label),
    color: String(r.data.color || "neutral")
  })), [rawRelTypes]);
  const moons = useMemo(() => {
    const out = [];
    for (const lex of rawLexicons) {
      if (discoveredTermIds && !discoveredTermIds.has(lex.id)) continue;
      const nids = nidsByLex.get(lex.id) || /* @__PURE__ */ new Set();
      for (const nid of nids) {
        out.push({
          nodeId: nid,
          id: lex.id,
          color: catColor(String(lex.data.category || "")),
          title: `${String(lex.data.term)} · ${String(lex.data.category || "inne")}`
        });
      }
    }
    return out;
  }, [rawLexicons, nidsByLex, discoveredTermIds]);
  const contextEdges = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const lex of rawLexicons) {
      if (discoveredTermIds && !discoveredTermIds.has(lex.id)) continue;
      const nidsArr = Array.from(nidsByLex.get(lex.id) || []);
      if (nidsArr.length < 2) continue;
      const rel = String(lex.data.relation || "inne");
      for (let i = 0; i < nidsArr.length; i++) {
        for (let j = i + 1; j < nidsArr.length; j++) {
          const [a2, b] = [nidsArr[i], nidsArr[j]].sort();
          const key = `${a2}${EDGE_KEY_SEP}${b}`;
          if (!map.has(key)) map.set(key, { from: a2, to: b, rels: /* @__PURE__ */ new Map() });
          const e = map.get(key);
          e.rels.set(rel, (e.rels.get(rel) || 0) + 1);
        }
      }
    }
    const out = [];
    for (const { from, to, rels } of map.values()) {
      let best = "inne", bestCount = 0, total = 0;
      for (const [r, c2] of rels) {
        total += c2;
        if (c2 > bestCount) {
          best = r;
          bestCount = c2;
        }
      }
      out.push({ from, to, relation: best, count: total });
    }
    return out;
  }, [rawLexicons, nidsByLex, discoveredTermIds]);
  const highlightedNids = useMemo(() => {
    if (!selectedMoonId) return void 0;
    return nidsByLex.get(selectedMoonId) || /* @__PURE__ */ new Set();
  }, [selectedMoonId, nidsByLex]);
  const relatedMoonIds = useMemo(() => {
    if (!selectedMoonId) return void 0;
    const myNids = nidsByLex.get(selectedMoonId) || /* @__PURE__ */ new Set();
    const ids = /* @__PURE__ */ new Set();
    for (const nid of myNids) {
      const here = lexsByNid.get(nid) || [];
      for (const l of here) if (l.id !== selectedMoonId) ids.add(l.id);
    }
    return ids;
  }, [selectedMoonId, nidsByLex, lexsByNid]);
  const hits = useMemo(() => {
    const m2 = {};
    for (const n of rawNodes) m2[String(n.data.nodeId)] = Number(n.data.hits) || 0;
    return m2;
  }, [rawNodes]);
  const nextNid = useMemo(() => {
    if (!gateByDiscoveries) return null;
    const discNodeIds = new Set(rawNodes.filter((n) => Number(n.data.hits) > 0).map((n) => String(n.data.nodeId)));
    if (!discNodeIds.size) {
      const sorted = [...rawNodes].sort((a2, b) => Number(a2.data.tier) - Number(b.data.tier));
      return sorted[0] ? String(sorted[0].data.nodeId) : null;
    }
    const scores = /* @__PURE__ */ new Map();
    for (const t of rawLexicons) {
      const tn = Array.from(nidsByLex.get(t.id) || []);
      if (!tn.some((x2) => discNodeIds.has(x2))) continue;
      for (const x2 of tn) if (!discNodeIds.has(x2)) scores.set(x2, (scores.get(x2) || 0) + 1);
    }
    let best = "", bs = 0;
    for (const [k, v] of scores) if (v > bs) {
      best = k;
      bs = v;
    }
    return best || null;
  }, [gateByDiscoveries, rawNodes, rawLexicons, nidsByLex]);
  const selectedNid = useMemo(() => {
    if (!selectedPostId) return null;
    const post = rawNodes.find((n) => n.id === selectedPostId);
    return post ? String(post.data.nodeId) : null;
  }, [selectedPostId, rawNodes]);
  return {
    nodes,
    moons,
    edges,
    contextEdges,
    branches,
    relTypes,
    highlightedNids,
    relatedMoonIds,
    hits,
    nextNid,
    selectedNid,
    rawNodes,
    rawLexicons,
    rawAllLexNodes,
    nidsByLex,
    lexsByNid
  };
}
const GH_API = "https://api.github.com";
const GH_RAW = "https://raw.githubusercontent.com";
const plugin = ({ React, ui, store, sdk, icons }) => {
  const { useState: useState2, useMemo: useMemo2, useEffect: useEffect2 } = React;
  const { Award, X, Zap, BookOpen } = icons;
  store.registerType("tree", [
    { key: "title", label: "Tytuł", required: true },
    { key: "repo", label: "Repo" }
  ], "Drzewa wiedzy");
  store.registerType("branch", [
    { key: "key", label: "Klucz", required: true },
    { key: "label", label: "Etykieta", required: true },
    { key: "color", label: "Kolor" }
  ], "Gałęzie");
  store.registerType("relType", [
    { key: "key", label: "Klucz", required: true },
    { key: "label", label: "Etykieta", required: true },
    { key: "color", label: "Kolor" }
  ], "Typy relacji");
  store.registerType("node", [
    { key: "nodeId", label: "ID", required: true },
    { key: "title", label: "Tytuł", required: true },
    { key: "branch", label: "Gałąź" },
    { key: "tier", label: "Poziom" },
    { key: "hits", label: "Odkrycia" }
  ], "Węzły");
  store.registerType("edge", [
    { key: "fromNid", label: "Od (nodeId)", required: true },
    { key: "toNid", label: "Do (nodeId)", required: true },
    { key: "type", label: "Typ" }
  ], "Krawędzie");
  store.registerType("content", [
    { key: "contentType", label: "Typ", required: true },
    { key: "text", label: "Tekst", required: true },
    { key: "answer", label: "Odpowiedź" }
  ], "Treści");
  store.registerType("lexicon", [
    { key: "term", label: "Termin", required: true },
    { key: "definition", label: "Definicja", required: true },
    { key: "category", label: "Kategoria" },
    { key: "relation", label: "Relacja" }
  ], "Leksykon");
  store.registerType("lexNode", [
    { key: "nid", label: "NodeId", required: true }
  ], "Powiązania term↔węzeł");
  store.registerType("quiz", [
    { key: "question", label: "Pytanie", required: true },
    { key: "answer", label: "Odpowiedź", required: true },
    { key: "wrong1", label: "Dystraktor 1" },
    { key: "wrong2", label: "Dystraktor 2" },
    { key: "wrong3", label: "Dystraktor 3" },
    { key: "hint", label: "Wskazówka" }
  ], "Quizy");
  store.registerType("discovery", [
    { key: "termId", label: "Termin", required: true },
    { key: "hits", label: "Odkrycia" },
    { key: "firstSeen", label: "Pierwsze" },
    { key: "lastSeen", label: "Ostatnie" }
  ], "Odkrycia");
  const edgeStr = (disc) => {
    const hits = Number(disc.data.hits) || 0;
    const lastSeen = Number(disc.data.lastSeen) || Date.now();
    const days = (Date.now() - lastSeen) / 864e5;
    return Math.min(hits / 5, 1) * Math.exp(-0.1 * days);
  };
  const discover = (termId) => {
    const all = store.getPosts("discovery");
    const existing = all.find((d) => d.data.termId === termId);
    const now2 = Date.now();
    if (existing) {
      store.update(existing.id, { hits: (Number(existing.data.hits) || 0) + 1, lastSeen: now2 });
    } else {
      store.add("discovery", { termId, hits: 1, firstSeen: now2, lastSeen: now2 });
    }
  };
  const unlockNode = (postId) => {
    const n = store.get(postId);
    if (n) store.update(postId, { hits: Math.min((Number(n.data.hits) || 0) + 1, 5) });
  };
  const useLexMaps = () => {
    const lexNodes = store.usePosts("lexNode");
    const quizzes = store.usePosts("quiz");
    return useMemo2(() => buildLexMaps(lexNodes, quizzes), [lexNodes, quizzes]);
  };
  const buildLexMaps = (lexNodes, quizzes) => {
    const nidMap = /* @__PURE__ */ new Map();
    for (const ln of lexNodes) {
      const lid = ln.parentId || "";
      if (!lid) continue;
      const arr = nidMap.get(lid) || [];
      arr.push(String(ln.data.nid));
      nidMap.set(lid, arr);
    }
    const quizMap = /* @__PURE__ */ new Map();
    for (const q of quizzes) {
      const lid = q.parentId || "";
      if (lid) quizMap.set(lid, q);
    }
    return { nidMap, quizMap };
  };
  const useNav = sdk.create(() => ({
    treeId: null,
    sel: null,
    phase: "map"
  }));
  const str = (n) => Math.min((Number(n.data.hits) || 0) / 5, 1);
  const jparse = (s, fb) => {
    try {
      return JSON.parse(s);
    } catch {
      return fb;
    }
  };
  function SkillTree() {
    const { treeId } = useNav();
    if (!treeId) return /* @__PURE__ */ jsx(ui.Placeholder, { text: "Wybierz drzewo z listy" });
    return /* @__PURE__ */ jsx(SkillTreeBody, { treeId });
  }
  function SkillTreeBody({ treeId }) {
    const { sel } = useNav();
    const flash = sdk.shared((s) => s == null ? void 0 : s.bqFlash);
    const [discoveredPairs, setDiscoveredPairs] = useState2([]);
    useEffect2(() => {
      setDiscoveredPairs([]);
    }, [treeId]);
    useEffect2(() => {
      if (!flash || !flash.fromNid || !flash.toNid) return;
      const fromNid = flash.fromNid, toNid = flash.toNid;
      setDiscoveredPairs((prev) => {
        const same = (p) => p.fromNid === fromNid && p.toNid === toNid || p.fromNid === toNid && p.toNid === fromNid;
        if (prev.some(same)) return prev.map((p) => same(p) ? { ...p, fresh: true } : p);
        return [...prev.map((p) => ({ ...p, fresh: false })), { fromNid, toNid, fresh: true }].slice(-10);
      });
      sdk.shared.setState({ bqFlash: null });
    }, [flash]);
    const data = useBqGraphData(store, treeId, {
      gateByDiscoveries: true,
      selectedPostId: sel
    });
    if (!data.rawNodes.length) return /* @__PURE__ */ jsx(ui.Placeholder, { text: "Zaimportuj paczkę bazową" });
    return /* @__PURE__ */ jsx(
      CosmosGraph,
      {
        nodes: data.nodes,
        moons: data.moons,
        edges: data.edges,
        contextEdges: data.contextEdges,
        branches: data.branches,
        relTypes: data.relTypes,
        selectedNid: data.selectedNid,
        onSelectNode: (nid) => {
          const post = data.rawNodes.find((n) => String(n.data.nodeId) === nid);
          if (!post) return;
          useNav.setState({ sel: post.id, phase: "detail" });
          sdk.shared.setState({ bq: { treeId, nodeId: nid, postId: post.id } });
        },
        onDeselect: () => useNav.setState({ sel: null }),
        progress: { hits: data.hits, flashPairs: discoveredPairs, nextNid: data.nextNid },
        bigBranches: ["epoki"]
      }
    );
  }
  function NodeDetail({ id: id2 }) {
    const node = store.usePost(id2);
    if (!node) return null;
    return /* @__PURE__ */ jsx(NodeDetailBody, { node, id: id2 });
  }
  function NodeDetailBody({ node, id: id2 }) {
    const treeId = useNav().treeId || "";
    const terms = store.useChildren(treeId, "lexicon");
    const discoveries = store.usePosts("discovery");
    const contents = store.useChildren(id2, "content");
    const { nidMap } = useLexMaps();
    const nodeId = String(node.data.nodeId);
    const s = str(node);
    const slideCount = contents.filter((c2) => String(c2.data.contentType) !== "quiz").length;
    const nodeTerms = terms.filter((t) => (nidMap.get(t.id) || []).includes(nodeId));
    const discSet = new Set(discoveries.map((d) => String(d.data.termId)));
    const discNodeTerms = nodeTerms.filter((t) => discSet.has(t.id)).length;
    const totalNodeTerms = nodeTerms.length;
    const hits = Number(node.data.hits) || 0;
    const step1Done = hits > 0 || discNodeTerms > 0;
    const step2Done = discNodeTerms >= Math.max(3, Math.ceil(totalNodeTerms * 0.3));
    const step3Done = s >= 1;
    const Step = ({ n, done, title, hint }) => /* @__PURE__ */ jsx(ui.Card, { color: done ? "success" : "neutral", children: /* @__PURE__ */ jsxs(ui.Stack, { gap: "sm", children: [
      /* @__PURE__ */ jsxs(ui.Row, { gap: "sm", children: [
        /* @__PURE__ */ jsx(ui.Badge, { color: done ? "success" : "neutral", children: done ? "✓" : n }),
        /* @__PURE__ */ jsx(ui.Text, { size: "xs", children: /* @__PURE__ */ jsx("b", { children: title }) })
      ] }),
      /* @__PURE__ */ jsx(ui.Text, { muted: true, size: "2xs", children: hint })
    ] }) });
    const go = (target) => {
      const base = { treeId, nodeId, postId: id2 };
      if (target === "reader") nav.toReader(base);
      else nav.toArena(base);
    };
    return /* @__PURE__ */ jsx(ui.Card, { children: /* @__PURE__ */ jsxs(ui.Stack, { children: [
      /* @__PURE__ */ jsxs(ui.Row, { justify: "between", children: [
        /* @__PURE__ */ jsx(ui.Heading, { title: String(node.data.title) }),
        /* @__PURE__ */ jsxs(ui.Row, { gap: "sm", children: [
          /* @__PURE__ */ jsx(ui.Badge, { children: s >= 1 ? "★ Opanowane" : hits > 0 ? "Odkryte" : "Nowe" }),
          /* @__PURE__ */ jsx(ui.Button, { size: "xs", color: "ghost", onClick: () => useNav.setState({ phase: "map", sel: null }), children: /* @__PURE__ */ jsx(X, { size: 14 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(ui.Grid, { cols: 3, gap: "sm", children: [
        /* @__PURE__ */ jsx(
          Step,
          {
            n: 1,
            done: step1Done,
            title: "Przeczytaj",
            hint: slideCount ? `${slideCount} slajdów` : "Wejdź do readera"
          }
        ),
        /* @__PURE__ */ jsx(
          Step,
          {
            n: 2,
            done: step2Done,
            title: "Odkrywaj terminy",
            hint: totalNodeTerms ? `Zapamiętane: ${discNodeTerms}/${totalNodeTerms}` : "Odkrywaj słowa"
          }
        ),
        /* @__PURE__ */ jsx(
          Step,
          {
            n: 3,
            done: step3Done,
            title: "Wygraj arenę",
            hint: totalNodeTerms ? `Znasz ${discNodeTerms}/${totalNodeTerms} terminów` : "Odblokuj sąsiadów"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(ui.Grid, { cols: 2, gap: "sm", children: [
        /* @__PURE__ */ jsxs(ui.Button, { size: "lg", color: "primary", block: true, onClick: () => go("reader"), children: [
          /* @__PURE__ */ jsx(BookOpen, { size: 14 }),
          " Czytaj i odkrywaj terminy"
        ] }),
        /* @__PURE__ */ jsxs(ui.Button, { size: "lg", color: "primary", outline: true, block: true, onClick: () => go("arena"), children: [
          /* @__PURE__ */ jsx(Zap, { size: 14 }),
          " Arena ",
          totalNodeTerms ? `(${discNodeTerms}/${totalNodeTerms})` : ""
        ] })
      ] })
    ] }) });
  }
  const DEFAULT_ORG = "BQ-content";
  const flattenLexEntry = (entry, treeId) => {
    var _a, _b, _c;
    const data = entry.data || {};
    const lexId = store.add("lexicon", {
      term: data.term,
      definition: data.definition,
      category: data.category,
      relation: data.relation
    }, { parentId: treeId }).id;
    const nodes = jparse(String(data.nodes || "[]"), []);
    for (const nid of nodes) store.add("lexNode", { nid }, { parentId: lexId });
    const quiz = jparse(String(data.quiz || "{}"), {});
    if (quiz.question || quiz.answer) {
      store.add("quiz", {
        question: quiz.question || "",
        answer: quiz.answer || "",
        wrong1: ((_a = quiz.wrong) == null ? void 0 : _a[0]) || "",
        wrong2: ((_b = quiz.wrong) == null ? void 0 : _b[1]) || "",
        wrong3: ((_c = quiz.wrong) == null ? void 0 : _c[2]) || "",
        hint: quiz.hint || ""
      }, { parentId: lexId });
    }
  };
  const loadLexicon = async (base, tree) => {
    const nodes = store.getPosts("node").filter((n) => n.parentId === tree.id);
    const fetches = nodes.map(async (n) => {
      var _a, _b;
      try {
        const r = await fetch(`${base}/lexicon/${n.data.nodeId}.json`);
        if (!r.ok) return 0;
        const entries = JSON.parse(await r.text());
        let count = 0;
        const existing = store.getPosts("lexicon").filter((x2) => x2.parentId === tree.id);
        const existingNames = new Set(existing.map((x2) => String(x2.data.term)));
        for (const l of entries) {
          if (existingNames.has(String((_a = l.data) == null ? void 0 : _a.term))) continue;
          flattenLexEntry(l, tree.id);
          existingNames.add(String((_b = l.data) == null ? void 0 : _b.term));
          count++;
        }
        return count;
      } catch {
        return 0;
      }
    });
    const counts = await Promise.all(fetches);
    return counts.reduce((a2, b) => a2 + b, 0);
  };
  const importTreeSeed = (seeds) => {
    var _a, _b, _c;
    const root2 = seeds[0];
    if (!root2 || root2.type !== "tree") return null;
    const treeTitle = String(((_a = root2.data) == null ? void 0 : _a.title) || "");
    const treeId = store.add("tree", { title: treeTitle }).id;
    let count = 1;
    for (const [field, type] of [["branches", "branch"], ["relations", "relType"]]) {
      const dict = jparse(String(((_b = root2.data) == null ? void 0 : _b[field]) || "{}"), {});
      for (const [key, def] of Object.entries(dict)) {
        store.add(type, { key, label: def.label, color: def.color }, { parentId: treeId });
        count++;
      }
    }
    for (const e of jparse(String(((_c = root2.data) == null ? void 0 : _c.edges) || "[]"), [])) {
      store.add("edge", { fromNid: e.from, toNid: e.to, type: e.type || "" }, { parentId: treeId });
      count++;
    }
    for (const child of root2.children || []) {
      if (child.type === "node") {
        store.add("node", child.data, { parentId: treeId });
        count++;
      }
    }
    return { treeId, treeTitle, count };
  };
  const loadTree = async (org, repo) => {
    try {
      const base = `${GH_RAW}/${org}/${repo}/main`;
      const treeRes = await fetch(`${base}/tree.json`);
      if (!treeRes.ok) throw new Error(`tree.json: ${treeRes.status}`);
      const treeSeeds = JSON.parse(await treeRes.text());
      const imported = importTreeSeed(treeSeeds);
      if (!imported) {
        sdk.log(`${repo} — niepoprawny tree.json`, "error");
        return;
      }
      const tree = store.get(imported.treeId);
      if (tree) {
        const lexCount = await loadLexicon(base, tree);
        sdk.log(`${repo} — ${imported.count + lexCount} rekordów`, "ok");
        store.update(tree.id, { repo: `${org}/${repo}` });
      }
    } catch (e) {
      sdk.log(String(e), "error");
    }
  };
  const loadLexiconFromRepo = async (treeId, org, repo) => {
    const tree = store.get(treeId);
    if (!tree) return;
    const base = `${GH_RAW}/${org}/${repo}/main`;
    const count = await loadLexicon(base, tree);
    sdk.log(`${repo} — ${count} nowych terminów`, "ok");
  };
  const loadNodeContent = async (treeId, nodeId) => {
    const tree = store.get(treeId);
    if (!tree) return;
    const repo = String(tree.data.repo || "");
    if (!repo) return;
    const nodes = store.getPosts("node").filter((n) => n.parentId === treeId);
    const node = nodes.find((n) => String(n.data.nodeId) === nodeId);
    if (!node) return;
    const existing = store.getPosts("content").filter((c2) => c2.parentId === node.id);
    if (existing.length > 0) return;
    try {
      const r = await fetch(`${GH_RAW}/${repo}/main/content/${nodeId}.json`);
      if (!r.ok) return;
      const entries = JSON.parse(await r.text());
      for (const e of entries) {
        store.add(e.type, e.data, { parentId: node.id });
      }
    } catch (e) {
      sdk.log(`Content ${nodeId}: ${e}`, "error");
    }
  };
  function RepoPicker() {
    const org = store.useOption("bq:githubOrg") || DEFAULT_ORG;
    const [repos, setRepos] = useState2([]);
    const [loading, setLoading] = useState2(true);
    useEffect2(() => {
      fetch(`${GH_API}/search/repositories?q=org:${org}+topic:brainquest&per_page=100`).then((r) => r.ok ? r.json() : Promise.reject(r.status)).then((d) => setRepos(d.items.sort((a2, b) => a2.name.localeCompare(b.name)))).catch((e) => sdk.log(`GitHub: ${e}`, "error")).finally(() => setLoading(false));
    }, [org]);
    return /* @__PURE__ */ jsx(ui.Page, { children: /* @__PURE__ */ jsxs(ui.Stack, { children: [
      /* @__PURE__ */ jsx(ui.Heading, { title: "Wybierz przedmiot", subtitle: "Kliknij aby rozpocząć naukę" }),
      loading && /* @__PURE__ */ jsx(ui.Spinner, {}),
      repos.map((r) => /* @__PURE__ */ jsx(ui.Card, { children: /* @__PURE__ */ jsxs(ui.Row, { justify: "between", children: [
        /* @__PURE__ */ jsxs(ui.Stack, { children: [
          /* @__PURE__ */ jsx(ui.Text, { bold: true, children: r.description || r.name }),
          /* @__PURE__ */ jsx(ui.Text, { muted: true, size: "xs", children: r.name })
        ] }),
        /* @__PURE__ */ jsx(ui.Button, { color: "primary", onClick: () => loadTree(org, r.name), children: "Rozpocznij" })
      ] }) }, r.name)),
      !loading && !repos.length && /* @__PURE__ */ jsx(ui.Text, { muted: true, children: "Brak dostępnych przedmiotów" })
    ] }) });
  }
  const removeTreeWithDiscoveries = (treeId) => {
    const termIds = new Set(
      store.getPosts("lexicon").filter((l) => l.parentId === treeId).map((l) => l.id)
    );
    const orphans = store.getPosts("discovery").filter((d) => termIds.has(String(d.data.termId)));
    for (const d of orphans) store.remove(d.id);
    store.remove(treeId);
    if (orphans.length) sdk.log(`Usunięto drzewo + ${orphans.length} odkryć`, "ok");
  };
  function TreeItem({ tree, active }) {
    const nodes = store.useChildren(tree.id, "node");
    const d = nodes.filter((n) => Number(n.data.hits) > 0).length;
    return /* @__PURE__ */ jsx(
      ui.ListItem,
      {
        active,
        label: String(tree.data.title),
        detail: `${d}/${nodes.length} odkryte`,
        onClick: () => useNav.setState({ treeId: tree.id, sel: null, phase: "map" }),
        action: /* @__PURE__ */ jsx(ui.RemoveButton, { onClick: () => {
          removeTreeWithDiscoveries(tree.id);
          if (active) useNav.setState({ treeId: null, sel: null, phase: "map" });
        } })
      }
    );
  }
  function TreeList() {
    const { treeId } = useNav();
    const trees = store.usePosts("tree");
    if (!trees.length) return null;
    return /* @__PURE__ */ jsx(ui.Box, { header: /* @__PURE__ */ jsx(ui.Cell, { label: true, children: "Drzewa wiedzy" }), body: /* @__PURE__ */ jsx(ui.Stack, { children: trees.map((t) => /* @__PURE__ */ jsx(TreeItem, { tree: t, active: treeId === t.id }, t.id)) }), grow: true });
  }
  function Progress() {
    var _a;
    const navTreeId = useNav().treeId;
    const sharedTreeId = (_a = sdk.shared((s) => s == null ? void 0 : s.bq)) == null ? void 0 : _a.treeId;
    const treeId = navTreeId || sharedTreeId || "";
    const nodes = store.useChildren(treeId, "node");
    const terms = store.useChildren(treeId, "lexicon");
    const discoveries = store.usePosts("discovery");
    const { nidMap } = useLexMaps();
    const { density, discPairs, allPairs, nextNode } = useMemo2(() => {
      const nodeIdSet = new Set(nodes.map((n) => String(n.data.nodeId)));
      const discTermIds = new Set(discoveries.map((d2) => String(d2.data.termId)));
      const discNodeIds = new Set(nodes.filter((n) => Number(n.data.hits) > 0).map((n) => String(n.data.nodeId)));
      const all = /* @__PURE__ */ new Set();
      const disc = /* @__PURE__ */ new Set();
      const scores = /* @__PURE__ */ new Map();
      for (const t of terms) {
        const tn = (nidMap.get(t.id) || []).filter((x2) => nodeIdSet.has(x2));
        const isDisc = discTermIds.has(t.id);
        for (let i = 0; i < tn.length; i++) for (let j = i + 1; j < tn.length; j++) {
          const key = [tn[i], tn[j]].sort().join(":");
          all.add(key);
          if (isDisc) disc.add(key);
        }
        if (discNodeIds.size && tn.some((x2) => discNodeIds.has(x2))) {
          for (const x2 of tn) if (!discNodeIds.has(x2)) scores.set(x2, (scores.get(x2) || 0) + 1);
        }
      }
      let bestNid = "", bestScore = 0;
      for (const [k, v] of scores) if (v > bestScore) {
        bestNid = k;
        bestScore = v;
      }
      const next = bestNid ? nodes.find((n) => String(n.data.nodeId) === bestNid) || null : null;
      return { density: all.size ? Math.round(disc.size / all.size * 100) : 0, discPairs: disc.size, allPairs: all.size, nextNode: next };
    }, [nodes, terms, discoveries, nidMap]);
    if (!treeId) return /* @__PURE__ */ jsx(ui.Placeholder, { text: "Wybierz drzewo" });
    const d = nodes.filter((n) => Number(n.data.hits) > 0);
    return /* @__PURE__ */ jsx(ui.Box, { header: /* @__PURE__ */ jsx(ui.Cell, { label: true, children: "Postęp" }), body: d.length === 0 ? /* @__PURE__ */ jsx(ui.Placeholder, { text: "Odkrywaj węzły na mapie", children: /* @__PURE__ */ jsx(Award, { size: 32 }) }) : /* @__PURE__ */ jsxs(ui.Stack, { children: [
      /* @__PURE__ */ jsxs(ui.Stats, { children: [
        /* @__PURE__ */ jsx(ui.Stat, { title: "Gęstość", value: `${density}%` }),
        /* @__PURE__ */ jsx(ui.Stat, { title: "Połączenia", value: `${discPairs}/${allPairs}` })
      ] }),
      /* @__PURE__ */ jsxs(ui.Stats, { children: [
        /* @__PURE__ */ jsx(ui.Stat, { title: "Odkryte", value: `${d.length}/${nodes.length}` }),
        /* @__PURE__ */ jsx(ui.Stat, { title: "Opanowane", value: `${nodes.filter((n) => str(n) >= 1).length}` })
      ] }),
      nextNode && /* @__PURE__ */ jsxs(ui.Stack, { children: [
        /* @__PURE__ */ jsx(ui.Cell, { label: true, children: "Co dalej?" }),
        /* @__PURE__ */ jsxs(ui.Button, { size: "sm", color: "primary", outline: true, block: true, onClick: () => {
          useNav.setState({ sel: nextNode.id, phase: "detail" });
          sdk.shared.setState({ bq: { treeId, nodeId: String(nextNode.data.nodeId), postId: nextNode.id } });
        }, children: [
          /* @__PURE__ */ jsx(Zap, { size: 12 }),
          " ",
          String(nextNode.data.title)
        ] })
      ] }),
      d.sort((a2, b) => b.updatedAt - a2.updatedAt).slice(0, 6).map((n) => /* @__PURE__ */ jsxs(ui.Row, { gap: "sm", children: [
        str(n) >= 1 ? /* @__PURE__ */ jsx(Award, { size: 12 }) : /* @__PURE__ */ jsx(Zap, { size: 12 }),
        /* @__PURE__ */ jsx(ui.Text, { size: "sm", children: String(n.data.title) })
      ] }, n.id))
    ] }), grow: true });
  }
  function CheatSheet({ filter: filter2, onBack, backIcon }) {
    const bq = sdk.shared((s) => s == null ? void 0 : s.bq);
    const treeId = (bq == null ? void 0 : bq.treeId) || useNav().treeId || "";
    const lexicon = store.useChildren(treeId, "lexicon");
    const discoveries = store.usePosts("discovery");
    const items = useMemo2(() => {
      const discSet = new Set(discoveries.map((d) => String(d.data.termId)));
      return lexicon.filter((l) => discSet.has(l.id) && (!filter2 || filter2(l.id))).map((l) => ({ id: l.id, term: String(l.data.term || ""), definition: String(l.data.definition || "") }));
    }, [lexicon, discoveries, filter2]);
    const goRead = () => nav.toReader();
    const BackIcon = backIcon || X;
    const header = onBack ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(ui.Cell, { onClick: onBack, children: /* @__PURE__ */ jsx(BackIcon, { size: 14 }) }),
      /* @__PURE__ */ jsx(ui.Cell, { label: true, children: "Ściągawka" })
    ] }) : /* @__PURE__ */ jsx(ui.Cell, { label: true, children: "Ściągawka" });
    return /* @__PURE__ */ jsx(ui.Box, { header, body: items.length === 0 ? /* @__PURE__ */ jsxs(ui.Stack, { gap: "sm", children: [
      /* @__PURE__ */ jsx(ui.Text, { size: "sm", bold: true, children: "Brak odkrytych terminów" }),
      /* @__PURE__ */ jsx(ui.Text, { size: "xs", muted: true, children: "Tu pojawi się ściągawka — terminy które znasz z czytania. Każdy odkryty termin = jedna znana odpowiedź w Arenie." }),
      /* @__PURE__ */ jsx(ui.Text, { size: "xs", muted: true, children: "Wróć do readera i odkrywaj terminy klikając podświetlone słowa." }),
      /* @__PURE__ */ jsxs(ui.Button, { size: "sm", color: "primary", block: true, onClick: goRead, children: [
        /* @__PURE__ */ jsx(BookOpen, { size: 12 }),
        " Do readera"
      ] })
    ] }) : /* @__PURE__ */ jsx(ui.Stack, { gap: "sm", children: items.map((t) => /* @__PURE__ */ jsx(ui.Card, { children: /* @__PURE__ */ jsxs(ui.Stack, { gap: "xs", children: [
      /* @__PURE__ */ jsx(ui.Text, { size: "xs", bold: true, children: t.term }),
      /* @__PURE__ */ jsx(ui.Text, { size: "xs", muted: true, children: t.definition })
    ] }) }, t.id)) }), grow: true });
  }
  const getBq = () => {
    var _a;
    return (_a = sdk.shared.getState()) == null ? void 0 : _a.bq;
  };
  const useBq = () => sdk.shared((s) => s == null ? void 0 : s.bq);
  const goTo = (activeId, patch = {}) => {
    sdk.shared.setState({ bq: { ...getBq() || {}, ...patch } });
    sdk.useHostStore.setState({ activeId });
  };
  const nav = {
    toMap: (extra = {}) => goTo("plugin-brain-quest", { phase: "map", challenge: false, ...extra }),
    toReader: (extra = {}) => goTo("plugin-brain-quest-reader", { challenge: false, ...extra }),
    toArena: (extra = {}) => goTo("plugin-brain-quest-arena", { challenge: true, ...extra })
  };
  sdk.shared.setState({ bqHelpers: { discover, unlockNode, edgeStr, loadNodeContent, loadLexiconFromRepo, jparse, str, buildLexMaps, useLexMaps, Progress, CheatSheet, nav, useBq, getBq } });
  function Center() {
    const { treeId, phase, sel } = useNav();
    const trees = store.usePosts("tree");
    useEffect2(() => {
      if (!treeId && trees.length) useNav.setState({ treeId: trees[0].id });
    }, [treeId, trees.length]);
    if (!treeId && !trees.length) return /* @__PURE__ */ jsx(RepoPicker, {});
    if (!treeId) return null;
    return /* @__PURE__ */ jsx(
      ui.OverlayContainer,
      {
        base: /* @__PURE__ */ jsx(SkillTree, {}),
        overlay: phase === "detail" && sel ? /* @__PURE__ */ jsx(NodeDetail, { id: sel }) : null,
        position: "bottom"
      }
    );
  }
  sdk.registerView("bq.left", { slot: "left", component: TreeList });
  sdk.registerView("bq.center", { slot: "center", component: Center });
  sdk.registerView("bq.right", { slot: "right", component: Progress });
  return { id: "plugin-brain-quest", label: "BrainQuest", icon: Award, version: "0.4.0" };
};
export {
  plugin as default
};
