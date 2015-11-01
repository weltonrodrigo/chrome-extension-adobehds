/*
 * flowplayer.js 3.2.12. The Flowplayer API
 *
 * Copyright 2009-2011 Flowplayer Oy
 *
 * This file is part of Flowplayer.
 *
 * Flowplayer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Flowplayer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Flowplayer.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Date: ${date}
 * Revision: ${revision}
 */
! function() {
	function h(p) {
		console.log("$f.fireEvent", [].slice.call(p))
	}

	function l(r) {
		if (!r || typeof r != "object") {
			return r
		}
		var p = new r.constructor();
		for (var q in r) {
			if (r.hasOwnProperty(q)) {
				p[q] = l(r[q])
			}
		}
		return p
	}

	function n(u, r) {
		if (!u) {
			return
		}
		var p, q = 0,
			s = u.length;
		if (s === undefined) {
			for (p in u) {
				if (r.call(u[p], p, u[p]) === false) {
					break
				}
			}
		} else {
			for (var t = u[0]; q < s && r.call(t, q, t) !== false; t = u[++q]) {}
		}
		return u
	}

	function c(p) {
		return document.getElementById(p)
	}

	function j(r, q, p) {
		if (typeof q != "object") {
			return r
		}
		if (r && q) {
			n(q, function(s, t) {
				if (!p || typeof t != "function") {
					r[s] = t
				}
			})
		}
		return r
	}

	function o(t) {
		var r = t.indexOf(".");
		if (r != -1) {
			var q = t.slice(0, r) || "*";
			var p = t.slice(r + 1, t.length);
			var s = [];
			n(document.getElementsByTagName(q), function() {
				if (this.className && this.className.indexOf(p) != -1) {
					s.push(this)
				}
			});
			return s
		}
	}

	function g(p) {
		p = p || window.event;
		if (p.preventDefault) {
			p.stopPropagation();
			p.preventDefault()
		} else {
			p.returnValue = false;
			p.cancelBubble = true
		}
		return false
	}

	function k(r, p, q) {
		r[p] = r[p] || [];
		r[p].push(q)
	}

	function e(p) {
		return p.replace(/&amp;/g, "%26").replace(/&/g, "%26").replace(/=/g, "%3D")
	}

	function f() {
		return "_" + ("" + Math.random()).slice(2, 10)
	}
	var i = function(u, s, t) {
		var r = this,
			q = {},
			v = {};
		r.index = s;
		if (typeof u == "string") {
			u = {
				url: u
			}
		}
		j(this, u, true);
		n(("Begin*,Start,Pause*,Resume*,Seek*,Stop*,Finish*,LastSecond,Update,BufferFull,BufferEmpty,BufferStop").split(","), function() {
			var w = "on" + this;
			if (w.indexOf("*") != -1) {
				w = w.slice(0, w.length - 1);
				var x = "onBefore" + w.slice(2);
				r[x] = function(y) {
					k(v, x, y);
					return r
				}
			}
			r[w] = function(y) {
				k(v, w, y);
				return r
			};
			if (s == -1) {
				if (r[x]) {
					t[x] = r[x]
				}
				if (r[w]) {
					t[w] = r[w]
				}
			}
		});
		j(this, {
			onCuepoint: function(y, x) {
				if (arguments.length == 1) {
					q.embedded = [null, y];
					return r
				}
				if (typeof y == "number") {
					y = [y]
				}
				var w = f();
				q[w] = [y, x];
				if (t.isLoaded()) {
					t._api().fp_addCuepoints(y, s, w)
				}
				return r
			},
			update: function(x) {
				j(r, x);
				if (t.isLoaded()) {
					t._api().fp_updateClip(x, s)
				}
				var w = t.getConfig();
				var y = (s == -1) ? w.clip : w.playlist[s];
				j(y, x, true)
			},
			_fireEvent: function(w, z, x, B) {
				if (w == "onLoad") {
					n(q, function(C, D) {
						if (D[0]) {
							t._api().fp_addCuepoints(D[0], s, C)
						}
					});
					return false
				}
				B = B || r;
				if (w == "onCuepoint") {
					var A = q[z];
					if (A) {
						return A[1].call(t, B, x)
					}
				}
				if (z && "onBeforeBegin,onMetaData,onStart,onUpdate,onResume".indexOf(w) != -1) {
					j(B, z);
					if (z.metaData) {
						if (!B.duration) {
							B.duration = z.metaData.duration
						} else {
							B.fullDuration = z.metaData.duration
						}
					}
				}
				var y = true;
				n(v[w], function() {
					y = this.call(t, B, z, x)
				});
				return y
			}
		});
		if (u.onCuepoint) {
			var p = u.onCuepoint;
			r.onCuepoint.apply(r, typeof p == "function" ? [p] : p);
			delete u.onCuepoint
		}
		n(u, function(w, x) {
			if (typeof x == "function") {
				k(v, w, x);
				delete u[w]
			}
		});
		if (s == -1) {
			t.onCuepoint = this.onCuepoint
		}
	};
	var m = function(q, s, r, u) {
		var p = this,
			t = {},
			v = false;
		if (u) {
			j(t, u)
		}
		n(s, function(w, x) {
			if (typeof x == "function") {
				t[w] = x;
				delete s[w]
			}
		});
		j(this, {
			animate: function(z, A, y) {
				if (!z) {
					return p
				}
				if (typeof A == "function") {
					y = A;
					A = 500
				}
				if (typeof z == "string") {
					var x = z;
					z = {};
					z[x] = A;
					A = 500
				}
				if (y) {
					var w = f();
					t[w] = y
				}
				if (A === undefined) {
					A = 500
				}
				s = r._api().fp_animate(q, z, A, w);
				return p
			},
			css: function(x, y) {
				if (y !== undefined) {
					var w = {};
					w[x] = y;
					x = w
				}
				s = r._api().fp_css(q, x);
				j(p, s);
				return p
			},
			show: function() {
				this.display = "block";
				r._api().fp_showPlugin(q);
				return p
			},
			hide: function() {
				this.display = "none";
				r._api().fp_hidePlugin(q);
				return p
			},
			toggle: function() {
				this.display = r._api().fp_togglePlugin(q);
				return p
			},
			fadeTo: function(z, y, x) {
				if (typeof y == "function") {
					x = y;
					y = 500
				}
				if (x) {
					var w = f();
					t[w] = x
				}
				this.display = r._api().fp_fadeTo(q, z, y, w);
				this.opacity = z;
				return p
			},
			fadeIn: function(x, w) {
				return p.fadeTo(1, x, w)
			},
			fadeOut: function(x, w) {
				return p.fadeTo(0, x, w)
			},
			getName: function() {
				return q
			},
			getPlayer: function() {
				return r
			},
			_fireEvent: function(x, w, y) {
				if (x == "onUpdate") {
					var A = r._api().fp_getPlugin(q);
					if (!A) {
						return
					}
					j(p, A);
					delete p.methods;
					if (!v) {
						n(A.methods, function() {
							var C = "" + this;
							p[C] = function() {
								var D = [].slice.call(arguments);
								var E = r._api().fp_invoke(q, C, D);
								return E === "undefined" || E === undefined ? p : E
							}
						});
						v = true
					}
				}
				var B = t[x];
				if (B) {
					var z = B.apply(p, w);
					if (x.slice(0, 1) == "_") {
						delete t[x]
					}
					return z
				}
				return p
			}
		})
	};

	function b(r, H, u) {
		var x = this,
			w = null,
			E = false,
			v, t, G = [],
			z = {},
			y = {},
			F, s, q, D, p, B;
		j(x, {
			id: function() {
				return F
			},
			isLoaded: function() {
				return (w !== null && w.fp_play !== undefined && !E)
			},
			getParent: function() {
				return r
			},
			hide: function(I) {
				if (I) {
					r.style.height = "0px"
				}
				if (x.isLoaded()) {
					w.style.height = "0px"
				}
				return x
			},
			show: function() {
				r.style.height = B + "px";
				if (x.isLoaded()) {
					w.style.height = p + "px"
				}
				return x
			},
			isHidden: function() {
				return x.isLoaded() && parseInt(w.style.height, 10) === 0
			},
			load: function(K) {
				if (!x.isLoaded() && x._fireEvent("onBeforeLoad") !== false) {
					var I = function() {
						if (v && !flashembed.isSupported(H.version)) {
							r.innerHTML = ""
						}
						if (K) {
							K.cached = true;
							k(y, "onLoad", K)
						}
						flashembed(r, H, {
							config: u
						})
					};
					var J = 0;
					n(a, function() {
						this.unload(function(L) {
							if (++J == a.length) {
								I()
							}
						})
					})
				}
				return x
			},
			unload: function(K) {
				if (v.replace(/\s/g, "") !== "") {
					if (x._fireEvent("onBeforeUnload") === false) {
						if (K) {
							K(false)
						}
						return x
					}
					E = true;
					try {
						if (w) {
							if (w.fp_isFullscreen()) {
								w.fp_toggleFullscreen()
							}
							w.fp_close();
							x._fireEvent("onUnload")
						}
					} catch (I) {}
					var J = function() {
						w = null;
						r.innerHTML = v;
						E = false;
						if (K) {
							K(true)
						}
					};
					if (/WebKit/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent)) {
						setTimeout(J, 0)
					} else {
						J()
					}
				} else {
					if (K) {
						K(false)
					}
				}
				return x
			},
			getClip: function(I) {
				if (I === undefined) {
					I = D
				}
				return G[I]
			},
			getCommonClip: function() {
				return t
			},
			getPlaylist: function() {
				return G
			},
			getPlugin: function(I) {
				var K = z[I];
				if (!K && x.isLoaded()) {
					var J = x._api().fp_getPlugin(I);
					if (J) {
						K = new m(I, J, x);
						z[I] = K
					}
				}
				return K
			},
			getScreen: function() {
				return x.getPlugin("screen")
			},
			getControls: function() {
				return x.getPlugin("controls")._fireEvent("onUpdate")
			},
			getLogo: function() {
				try {
					return x.getPlugin("logo")._fireEvent("onUpdate")
				} catch (I) {}
			},
			getPlay: function() {
				return x.getPlugin("play")._fireEvent("onUpdate")
			},
			getConfig: function(I) {
				return I ? l(u) : u
			},
			getFlashParams: function() {
				return H
			},
			loadPlugin: function(L, K, N, M) {
				if (typeof N == "function") {
					M = N;
					N = {}
				}
				var J = M ? f() : "_";
				x._api().fp_loadPlugin(L, K, N, J);
				var I = {};
				I[J] = M;
				var O = new m(L, null, x, I);
				z[L] = O;
				return O
			},
			getState: function() {
				return x.isLoaded() ? w.fp_getState() : -1
			},
			play: function(J, I) {
				var K = function() {
					if (J !== undefined) {
						x._api().fp_play(J, I)
					} else {
						x._api().fp_play()
					}
				};
				if (x.isLoaded()) {
					K()
				} else {
					if (E) {
						setTimeout(function() {
							x.play(J, I)
						}, 50)
					} else {
						x.load(function() {
							K()
						})
					}
				}
				return x
			},
			getVersion: function() {
				var J = "flowplayer.js 3.2.12";
				if (x.isLoaded()) {
					var I = w.fp_getVersion();
					I.push(J);
					return I
				}
				return J
			},
			_api: function() {
				if (!x.isLoaded()) {
					throw "Flowplayer " + x.id() + " not loaded when calling an API method"
				}
				return w
			},
			setClip: function(I) {
				n(I, function(J, K) {
					if (typeof K == "function") {
						k(y, J, K);
						delete I[J]
					} else {
						if (J == "onCuepoint") {
							$f(r).getCommonClip().onCuepoint(I[J][0], I[J][1])
						}
					}
				});
				x.setPlaylist([I]);
				return x
			},
			getIndex: function() {
				return q
			},
			bufferAnimate: function(I) {
				w.fp_bufferAnimate(I === undefined || I);
				return x
			},
			_swfHeight: function() {
				return w.clientHeight
			}
		});
		n(("Click*,Load*,Unload*,Keypress*,Volume*,Mute*,Unmute*,PlaylistReplace,ClipAdd,Fullscreen*,FullscreenExit,Error,MouseOver,MouseOut").split(","), function() {
			var I = "on" + this;
			if (I.indexOf("*") != -1) {
				I = I.slice(0, I.length - 1);
				var J = "onBefore" + I.slice(2);
				x[J] = function(K) {
					k(y, J, K);
					return x
				}
			}
			x[I] = function(K) {
				k(y, I, K);
				return x
			}
		});
		n(("pause,resume,mute,unmute,stop,toggle,seek,getStatus,getVolume,setVolume,getTime,isPaused,isPlaying,startBuffering,stopBuffering,isFullscreen,toggleFullscreen,reset,close,setPlaylist,addClip,playFeed,setKeyboardShortcutsEnabled,isKeyboardShortcutsEnabled").split(","), function() {
			var I = this;
			x[I] = function(K, J) {
				if (!x.isLoaded()) {
					return x
				}
				var L = null;
				if (K !== undefined && J !== undefined) {
					L = w["fp_" + I](K, J)
				} else {
					L = (K === undefined) ? w["fp_" + I]() : w["fp_" + I](K)
				}
				return L === "undefined" || L === undefined ? x : L
			}
		});
		x._fireEvent = function(R) {
			if (typeof R == "string") {
				R = [R]
			}
			var S = R[0],
				P = R[1],
				N = R[2],
				M = R[3],
				L = 0;
			if (u.debug) {
				h(R)
			}
			if (!x.isLoaded() && S == "onLoad" && P == "player") {
				w = w || c(s);
				p = x._swfHeight();
				n(G, function() {
					this._fireEvent("onLoad")
				});
				n(z, function(T, U) {
					U._fireEvent("onUpdate")
				});
				t._fireEvent("onLoad")
			}
			if (S == "onLoad" && P != "player") {
				return
			}
			if (S == "onError") {
				if (typeof P == "string" || (typeof P == "number" && typeof N == "number")) {
					P = N;
					N = M
				}
			}
			if (S == "onContextMenu") {
				n(u.contextMenu[P], function(T, U) {
					U.call(x)
				});
				return
			}
			if (S == "onPluginEvent" || S == "onBeforePluginEvent") {
				var I = P.name || P;
				var J = z[I];
				if (J) {
					J._fireEvent("onUpdate", P);
					return J._fireEvent(N, R.slice(3))
				}
				return
			}
			if (S == "onPlaylistReplace") {
				G = [];
				var O = 0;
				n(P, function() {
					G.push(new i(this, O++, x))
				})
			}
			if (S == "onClipAdd") {
				if (P.isInStream) {
					return
				}
				P = new i(P, N, x);
				G.splice(N, 0, P);
				for (L = N + 1; L < G.length; L++) {
					G[L].index++
				}
			}
			var Q = true;
			if (typeof P == "number" && P < G.length) {
				D = P;
				var K = G[P];
				if (K) {
					Q = K._fireEvent(S, N, M)
				}
				if (!K || Q !== false) {
					Q = t._fireEvent(S, N, M, K)
				}
			}
			n(y[S], function() {
				Q = this.call(x, P, N);
				if (this.cached) {
					y[S].splice(L, 1)
				}
				if (Q === false) {
					return false
				}
				L++
			});
			return Q
		};

		function C() {
			if ($f(r)) {
				$f(r).getParent().innerHTML = "";
				q = $f(r).getIndex();
				a[q] = x
			} else {
				a.push(x);
				q = a.length - 1
			}
			B = parseInt(r.style.height, 10) || r.clientHeight;
			F = r.id || "fp" + f();
			s = H.id || F + "_api";
			H.id = s;
			v = r.innerHTML;
			if (typeof u == "string") {
				u = {
					clip: {
						url: u
					}
				}
			}
			u.playerId = F;
			u.clip = u.clip || {};
			if (r.getAttribute("href", 2) && !u.clip.url) {
				u.clip.url = r.getAttribute("href", 2)
			}
			if (u.clip.url) {
				u.clip.url = e(u.clip.url)
			}
			t = new i(u.clip, -1, x);
			u.playlist = u.playlist || [u.clip];
			var J = 0;
			n(u.playlist, function() {
				var M = this;
				if (typeof M == "object" && M.length) {
					M = {
						url: "" + M
					}
				}
				if (M.url) {
					M.url = e(M.url)
				}
				n(u.clip, function(N, O) {
					if (O !== undefined && M[N] === undefined && typeof O != "function") {
						M[N] = O
					}
				});
				u.playlist[J] = M;
				M = new i(M, J, x);
				G.push(M);
				J++
			});
			n(u, function(M, N) {
				if (typeof N == "function") {
					if (t[M]) {
						t[M](N)
					} else {
						k(y, M, N)
					}
					delete u[M]
				}
			});
			n(u.plugins, function(M, N) {
				if (N) {
					z[M] = new m(M, N, x)
				}
			});
			if (!u.plugins || u.plugins.controls === undefined) {
				z.controls = new m("controls", null, x)
			}
			z.canvas = new m("canvas", null, x);
			v = r.innerHTML;

			function L(M) {
				if (/iPad|iPhone|iPod/i.test(navigator.userAgent) && !/.flv$/i.test(G[0].url) && !K()) {
					return true
				}
				if (!x.isLoaded() && x._fireEvent("onBeforeClick") !== false) {
					x.load()
				}
				return g(M)
			}

			function K() {
				return x.hasiPadSupport && x.hasiPadSupport()
			}

			function I() {
				if (v.replace(/\s/g, "") !== "") {
					if (r.addEventListener) {
						r.addEventListener("click", L, false)
					} else {
						if (r.attachEvent) {
							r.attachEvent("onclick", L)
						}
					}
				} else {
					if (r.addEventListener && !K()) {
						r.addEventListener("click", g, false)
					}
					x.load()
				}
			}
			setTimeout(I, 0)
		}
		if (typeof r == "string") {
			var A = c(r);
			if (!A) {
				throw "Flowplayer cannot access element: " + r
			}
			r = A;
			C()
		} else {
			C()
		}
	}
	var a = [];

	function d(p) {
		this.length = p.length;
		this.each = function(r) {
			n(p, r)
		};
		this.size = function() {
			return p.length
		};
		var q = this;
		for (name in b.prototype) {
			q[name] = function() {
				var r = arguments;
				q.each(function() {
					this[name].apply(this, r)
				})
			}
		}
	}
	window.flowplayer = window.$f = function() {
		var q = null;
		var p = arguments[0];
		if (!arguments.length) {
			n(a, function() {
				if (this.isLoaded()) {
					q = this;
					return false
				}
			});
			return q || a[0]
		}
		if (arguments.length == 1) {
			if (typeof p == "number") {
				return a[p]
			} else {
				if (p == "*") {
					return new d(a)
				}
				n(a, function() {
					if (this.id() == p.id || this.id() == p || this.getParent() == p) {
						q = this;
						return false
					}
				});
				return q
			}
		}
		if (arguments.length > 1) {
			var u = arguments[1],
				r = (arguments.length == 3) ? arguments[2] : {};
			if (typeof u == "string") {
				u = {
					src: u
				}
			}
			u = j({
				bgcolor: "#000000",
				version: [10, 1],
				expressInstall: "http://releases.flowplayer.org/swf/expressinstall.swf",
				cachebusting: false
			}, u);
			if (typeof p == "string") {
				if (p.indexOf(".") != -1) {
					var t = [];
					n(o(p), function() {
						t.push(new b(this, l(u), l(r)))
					});
					return new d(t)
				} else {
					var s = c(p);
					return new b(s !== null ? s : l(p), l(u), l(r))
				}
			} else {
				if (p) {
					return new b(p, l(u), l(r))
				}
			}
		}
		return null
	};
	j(window.$f, {
		fireEvent: function() {
			var q = [].slice.call(arguments);
			var r = $f(q[0]);
			return r ? r._fireEvent(q.slice(1)) : null
		},
		addPlugin: function(p, q) {
			b.prototype[p] = q;
			return $f
		},
		each: n,
		extend: j
	});
	if (typeof jQuery == "function") {
		jQuery.fn.flowplayer = function(r, q) {
			if (!arguments.length || typeof arguments[0] == "number") {
				var p = [];
				this.each(function() {
					var s = $f(this);
					if (s) {
						p.push(s)
					}
				});
				return arguments.length ? p[arguments[0]] : new d(p)
			}
			return this.each(function() {
				$f(this, l(r), q ? l(q) : {})
			})
		}
	}
}();
! function() {
	var h = document.all,
		j = "http://get.adobe.com/flashplayer",
		c = typeof jQuery == "function",
		e = /(\d+)[^\d]+(\d+)[^\d]*(\d*)/,
		b = {
			width: "100%",
			height: "100%",
			id: "_" + ("" + Math.random()).slice(9),
			allowfullscreen: true,
			allowscriptaccess: "always",
			quality: "high",
			version: [3, 0],
			onFail: null,
			expressInstall: null,
			w3c: false,
			cachebusting: false
		};
	if (window.attachEvent) {
		window.attachEvent("onbeforeunload", function() {
			__flash_unloadHandler = function() {};
			__flash_savedUnloadHandler = function() {}
		})
	}

	function i(m, l) {
		if (l) {
			for (var f in l) {
				if (l.hasOwnProperty(f)) {
					m[f] = l[f]
				}
			}
		}
		return m
	}

	function a(f, n) {
		var m = [];
		for (var l in f) {
			if (f.hasOwnProperty(l)) {
				m[l] = n(f[l])
			}
		}
		return m
	}
	window.flashembed = function(f, m, l) {
		if (typeof f == "string") {
			f = document.getElementById(f.replace("#", ""))
		}
		if (!f) {
			return
		}
		if (typeof m == "string") {
			m = {
				src: m
			}
		}
		return new d(f, i(i({}, b), m), l)
	};
	var g = i(window.flashembed, {
		conf: b,
		getVersion: function() {
			var m, f;
			try {
				f = navigator.plugins["Shockwave Flash"].description.slice(16)
			} catch (o) {
				try {
					m = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
					f = m && m.GetVariable("$version")
				} catch (n) {
					try {
						m = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
						f = m && m.GetVariable("$version")
					} catch (l) {}
				}
			}
			f = e.exec(f);
			return f ? [1 * f[1], 1 * f[(f[1] * 1 > 9 ? 2 : 3)] * 1] : [0, 0]
		},
		asString: function(l) {
			if (l === null || l === undefined) {
				return null
			}
			var f = typeof l;
			if (f == "object" && l.push) {
				f = "array"
			}
			switch (f) {
				case "string":
					l = l.replace(new RegExp('(["\\\\])', "g"), "\\$1");
					l = l.replace(/^\s?(\d+\.?\d*)%/, "$1pct");
					return '"' + l + '"';
				case "array":
					return "[" + a(l, function(o) {
						return g.asString(o)
					}).join(",") + "]";
				case "function":
					return '"function()"';
				case "object":
					var m = [];
					for (var n in l) {
						if (l.hasOwnProperty(n)) {
							m.push('"' + n + '":' + g.asString(l[n]))
						}
					}
					return "{" + m.join(",") + "}"
			}
			return String(l).replace(/\s/g, " ").replace(/\'/g, '"')
		},
		getHTML: function(o, l) {
			o = i({}, o);
			var n = '<object width="' + o.width + '" height="' + o.height + '" id="' + o.id + '" name="' + o.id + '"';
			if (o.cachebusting) {
				o.src += ((o.src.indexOf("?") != -1 ? "&" : "?") + Math.random())
			}
			if (o.w3c || !h) {
				n += ' data="' + o.src + '" type="application/x-shockwave-flash"'
			} else {
				n += ' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'
			}
			n += ">";
			if (o.w3c || h) {
				n += '<param name="movie" value="' + o.src + '" />'
			}
			o.width = o.height = o.id = o.w3c = o.src = null;
			o.onFail = o.version = o.expressInstall = null;
			for (var m in o) {
				if (o[m]) {
					n += '<param name="' + m + '" value="' + o[m] + '" />'
				}
			}
			var p = "";
			if (l) {
				for (var f in l) {
					if (l[f]) {
						var q = l[f];
						p += f + "=" + (/function|object/.test(typeof q) ? g.asString(q) : q) + "&"
					}
				}
				p = p.slice(0, -1);
				n += '<param name="flashvars" value=\'' + p + "' />"
			}
			n += "</object>";
			return n
		},
		isSupported: function(f) {
			return k[0] > f[0] || k[0] == f[0] && k[1] >= f[1]
		}
	});
	var k = g.getVersion();

	function d(f, n, m) {
		if (g.isSupported(n.version)) {
			f.innerHTML = g.getHTML(n, m)
		} else {
			if (n.expressInstall && g.isSupported([6, 65])) {
				f.innerHTML = g.getHTML(i(n, {
					src: n.expressInstall
				}), {
					MMredirectURL: encodeURIComponent(location.href),
					MMplayerType: "PlugIn",
					MMdoctitle: document.title
				})
			} else {
				if (!f.innerHTML.replace(/\s/g, "")) {
					f.innerHTML = "<h2>Flash version " + n.version + " or greater is required</h2><h3>" + (k[0] > 0 ? "Your version is " + k : "You have no flash plugin installed") + "</h3>" + (f.tagName == "A" ? "<p>Click here to download latest version</p>" : "<p>Download latest version from <a href='" + j + "'>here</a></p>");
					if (f.tagName == "A" || f.tagName == "DIV") {
						f.onclick = function() {
							location.href = j
						}
					}
				}
				if (n.onFail) {
					var l = n.onFail.call(this);
					if (typeof l == "string") {
						f.innerHTML = l
					}
				}
			}
		}
		if (h) {
			window[n.id] = document.getElementById(n.id)
		}
		i(this, {
			getRoot: function() {
				return f
			},
			getOptions: function() {
				return n
			},
			getConf: function() {
				return m
			},
			getApi: function() {
				return f.firstChild
			}
		})
	}
	if (c) {
		jQuery.tools = jQuery.tools || {
			version: "3.2.12"
		};
		jQuery.tools.flashembed = {
			conf: b
		};
		jQuery.fn.flashembed = function(l, f) {
			return this.each(function() {
				$(this).data("flashembed", flashembed(this, l, f))
			})
		}
	}
}();
/**RTMP maps**/
var rtmpMap = {
	'cfx/st': {
		partial: '/st/'
	},
	'stream.abril': {
		partial: '/origin1/'
	},
	'akms.sambavideos': {
		partial: 'ondemand/'
	}
};

var mediaJson = sambaBridge.getMediaJson();
var basePath = sambaBridge.getBasePath() + "swf/";
var mediaDuration = mediaJson.duration || 0;
var queryParams = sambaBridge.queryParams;
var tokenTime, playerTimeInit;
var volumeInit = -1;
var playerThemeColor = (new RGB()).initWithHex(mediaJson.theme);
var metrics = {
	url: 'http://playerlogger.elasticbeanstalk.com/log/reportbw',
	method: 'POST',
	data: {
		u: window.location.href.match(/[^\?]*/)[0],
		kbps: [],
		latency: [],
		netStatus: [],
		err: [],
		tries: 0,
		dType: '',
		pos: 0,
		dur: mediaDuration/1000
	},
	lastTime: Date.now() - 45000,
	delay: 5000
};

if (queryParams.title)
	mediaJson.title = escape(queryParams.title);

mediaJson.title = (mediaJson.title.toLowerCase() === 'live' || mediaJson.title.toLowerCase() === 'mediaurl') ? '' : escape(mediaJson.title.replace(/[\"\']/g, ''));
mediaJson.autoStart = (queryParams.autoStart) ? queryParams.autoStart : false;
mediaJson.wideScreen = (queryParams.wideScreen && queryParams.jsApi) ? queryParams.wideScreen : false;
mediaJson.width = sambaContainer.dimensions.width;
mediaJson.height = sambaContainer.dimensions.height;
mediaJson.locale = localization;
// TODO: temporary workaround, remove later
mediaJson.outputList = mediaJson.outputList || mediaJson.playerMediaOutputList;
mediaJson.captionList = mediaJson.captionList || mediaJson.playerMediaCaptionList;
mediaJson.thumbnailList = mediaJson.thumbnailList || mediaJson.playerMediaThumbnailList;

// @rm
if (queryParams.akamai) {
	for (var i = mediaJson.outputList.length; i--;)
		mediaJson.outputList[i].urlType = "HDS";
}

// @rm
if (queryParams.hls)
	for (var i = mediaJson.outputList.length; i--;)
		mediaJson.outputList[i].urlType = "HLS";

//
var config = {
	key: "30a4d6604e58e87bd50",
	debug: queryParams.debug != null ? queryParams.debug : false,
	locale: mediaJson.locale,
	showErrors: false
};

var topMostZIndex = 50;
//
// Logo
if (mediaJson.watermark) {
	var logo = mediaJson.watermark;
	var position = {};

	switch (logo.position) {
		case "left-top":
			position.top = 20;
			position.left = 20;
			break;
		case "left-bottom":
			position.bottom = 40;
			position.left = 20;
			break;
		case "right-top":
			position.top = 20;
			position.right = 20;
			break;
		case "right-bottom":
			position.bottom = 40;
			position.right = 20;
			break;
		default:
			break;
	}

	config.logo = position;
	config.logo.url = logo.url;
	config.logo.fullscreenOnly = false;
}

//
var plugins = {};

// Custom fonts
plugins.fonts = {};

// plugin responsible for video switching
var pluginBrselect = {
	//url : basePath + "sambaplayer.bitrateselect.swf" ,
	hdButton: false,
	menu: "output_quality_text"
};
// plugin responsible for quality switching dock
var pluginMenu = {
	//url: basePath + "sambaplayer.menu.swf",
	bottom: 48,
	menuItem: {
		color: "#ffffff",
		fontColor: "#ffffff",
		height: 30
	},
	zIndex: topMostZIndex - 1
};
var pluginControls = {
	//url: basePath + 'sambaplayer.controls.swf',
	zIndex: topMostZIndex - 3,
	autoHide: {
		hideDuration: 800,
		mouseOutDelay: 150
		// FIXME: when "false", video size becomes small
		//enabled: queryParams.autoHideControls == null || queryParams.autoHideControls
	},
	wideScreen: mediaJson.wideScreen,
	volumeSliderColor: "#666666",
	bufferColor: "#4e4e4e",
	bufferGradient: "none",
	sliderColor: "#222222",
	sliderBorder: 0,
	scrubberHeightRatio: 0.4,
	scrubberBarHeightRatio: 0.4,
	scrubberEnabled: true,
	fullscreen: (mediaJson.playerConfig.fullscreen != undefined) ? mediaJson.playerConfig.fullscreen : true
};

if (mediaJson.playerConfig.mediaTitle) {
	pluginControls.title = escape(mediaJson.title);
	pluginControls.titleUrl = mediaJson.titleUrl;
}

//
// TODO: playerWideWidth and playerWideHeight values required from JSON or
// queryParams to enable widescreen functionality
/*
 * if (mediaJson.wideScreen) { pluginControls.onExpandWidescreen = function() {
 * var wrapper = $f().getParent(); wrapper.style.width =
 * mediaJson.playerParams.playerWideWidth + "px"; wrapper.style.height =
 * mediaJson.playerParams.playerWideHeight + "px"; var container =
 * wrapper.firstChild; container.style.width =
 * mediaJson.playerParams.playerWideWidth + "px"; container.style.height =
 * mediaJson.playerParams.playerWideHeight + "px"; };
 * pluginControls.onCollapseWidescreen = function() { var wrapper =
 * $f().getParent(); wrapper.style.width = mediaJson.width + "px";
 * wrapper.style.height = mediaJson.height + "px"; var container =
 * wrapper.firstChild; container.style.width = mediaJson.width + "px";
 * container.style.height = mediaJson.height + "px"; }; }
 */
//
if (queryParams.autoStart) {
	//sambaBridge.splashImage.parentNode.removeChild(sambaBridge.splashImage);
	//sambaBridge.playButton.parentNode.removeChild(sambaBridge.playButton);
}
config.clip = {
	scaling: "fit",
	autoPlay: true,
	pageUrl: escape(document.referrer)
	//eventCategory: mediaJson.title
		// se eu nao me engano é o titulo do video normalizado, porque se tiver acento
		// da pau
};
// play button
config.play = {
	//url : basePath + 'play.swf',
	pageUrl: escape(document.referrer),
	width: 90,
	height: 64,
	backgroundColor: 0x000000,
	backgroundAlpha: .8,
	alpha: 1
};

config.canvas = {
	// backgroundImage: "url(" + sambaBridge.getBestThumbnail() + ")",
	// background: '#000000 url(' + basePath + '/loading.swf?color=' +
	// playerThemeColor.toString() + ') no-repeat ' +
	// ((sambaBridge.width/2) - 40) + ' ' +
	// ((sambaBridge.height/2) - 40),
	backgroundGradient: 'none'
};

//
var isOvaExternal = false;
/*
 * config.screen = { width:sambaBridge.width,
 * height:sambaBridge.height }
 */
var sambaPlayerSrc = {
	src: basePath + "sambaplayer.swf",
	width: mediaJson.width,
	height: mediaJson.height
};

// Se não for Chrome
if(queryParams.wmode) {
	sambaPlayerSrc.wmode = queryParams.wmode;
}else if(!("chrome" in window) || window.sambaBridge.hasLead()) {
	sambaPlayerSrc.wmode = "transparent";
}else {
	sambaPlayerSrc.wmode = "direct";
}

pluginControls.onExpandWidescreen = function() {
	player.dispatchEvent({
		type: 'resize'
	});
};

pluginControls.onCollapseWidescreen = function() {
	player.dispatchEvent({
		type: 'resize'
	});
};

plugins.controls = pluginControls;

var isAudio = mediaJson.qualifierName === "AUDIO";

if (mediaJson.qualifierName == "VIDEO") {

	//
	var outputType = "PROGRESSIVE";
	var outputArray = [];
	var outputItem;
	//
	if (mediaJson.outputList) {
		//
		for (var i = mediaJson.outputList.length; i--;) {
			outputItem = mediaJson.outputList[i];
			//
			if (/\d+p/.test(outputItem.labelText)) {
				var defaultLabelFlag = (queryParams.startOutput == outputItem.labelText) ? true : (outputItem.labelText == mediaJson.defaultOutput && !queryParams.startOutput) ? true : false;

				outputArray.push({
					url: (outputItem.signedByTimeURL) ? Utils.urlProtocol(outputItem.signedByTimeURL, true) : Utils.urlProtocol(outputItem.url),
					bitrate: outputItem.videoBitrate || (i + 1)*230000,
					label: outputItem.labelText,
					isDefault: defaultLabelFlag,
					hd: outputItem.labelText.length > 1 && parseInt(outputItem.labelText.slice(0,
						outputItem.labelText.length - 1)) >= 720
				});

				if (outputItem.duration > mediaDuration)
					mediaDuration = outputItem.duration;

				if (outputItem.urlType !== "PROGRESSIVE")
					outputType = outputItem.urlType;
			}
		}
	}

	metrics.data.dType = outputType;
	outputItem = null;

	if (mediaJson.captionList && mediaJson.captionList.length > 0) {

		var captionList = [];

		for (var i = mediaJson.captionList.length; i--;) {
			var caption = mediaJson.captionList[i];
			captionList.push({
				url: caption.url,
				label: caption.language
			});
		}

		captionList.push({
			label: "disable_caption"
		});

		plugins.captions = {
			// url: basePath + "sambaplayer.captions.swf",
			button: false,
			menu: "caption_header_text",
			// pointer to a content plugin (see below)
			captionTarget: 'content',
			captions: captionList
		};
		// configure a content plugin so that it
		// looks good for showing subtitles
		plugins.content = {
			/*
			 * url: basePath + "sambaplayer.content.swf" ,
			 */
			bottom: 25,
			height: 40,
			zIndex: 1,
			backgroundColor: 'transparent',
			backgroundGradient: 'none',
			border: 0,
			textDecoration: 'outline',
			style: {
				body: {
					fontSize: 25,
					fontFamily: 'Helvetica',
					textAlign: 'center',
					color: '#ffffff'
				}
			}
		};
		plugins.menu = pluginMenu;
	}

	//
	if (outputType === "PROGRESSIVE") {
		//
		config.clip.provider = 'lighttpd';
		config.clip.urlResolvers = 'brselect';
		// plugin responsible for video switching
		plugins.brselect = pluginBrselect;
		// plugin responsible for http progressive video loading
		plugins.lighttpd = {
			/*
			 * url: basePath + "sambaplayer.pseudostreaming.swf" ,
			 */
			queryString: "?ec_seek=${start}"
		};
		// multiple qualities are available, init plugins
		if (outputArray.length > 1) {
			//
			config.clip.bitrates = outputArray;
			// plugin responsible for quality switching dock
			plugins.menu = pluginMenu;
			// single quality is available, don't need to have quality switching
			// plugins
		} else {
			//
			config.clip.url = outputArray[0].url;
			//
			delete plugins.brselect.menu;
		}
		//	TODO: CF progressive seek issue workaround, fix later
		plugins.lighttpd.pseudoSeek = outputArray[0].url.indexOf("d.sambavideos.sambatech.com") >= 0;
		config.clip.pseudoSeek = plugins.lighttpd.pseudoSeek;
	} else if (outputType === "RTMP") {
		//
		config.clip.provider = "rtmp";
		config.clip.urlResolvers = 'brselect';
		// plugin responsible for video switching
		plugins.brselect = pluginBrselect;
		//
		var baseUrl = "";
		var baseUrl2 = "";
		var a = 0;
		//

		if (outputArray.length > 1) {
			var urlBase = outputArray[0].url.split("");
			var urlBase2 = outputArray[1].url.split("");
			// retrieve common (the same) part of the video url
			for (var i = 0; i < urlBase.length; i++) {
				if (baseUrl == baseUrl2) {
					baseUrl += urlBase[i];
					baseUrl2 += urlBase2[i];
				} else {
					baseUrl = baseUrl.substr(0, baseUrl.length - 1);
					break;
				}
			}

			//Tratamento baseUrl
			baseUrl = checkBaseUrl(baseUrl);

			// remove common part from the url
			for (i = 0; i < outputArray.length; i++) {
				//
				outputArray[i].url = outputArray[i].url.substr(baseUrl.length);
				//
				if (outputArray[i].url.match(".*\.mp4$")) {
					outputArray[i].url = "mp4:" + outputArray[i].url;
				}
			}
			//
			config.clip.bitrates = outputArray;
			// plugin responsible for quality switching dock
			plugins.menu = pluginMenu;
		}
		else {
			var rtmpUrl = outputArray[0].url.match(/(rtmp.{0,1}:\/\/)(.*\/)(.*\/)(.*\/?)*/);

			if (rtmpUrl && rtmpUrl.length == 5) {
				baseUrl = checkBaseUrl(rtmpUrl[1] + rtmpUrl[2]);
				config.clip.url = outputArray[0].url.replace(baseUrl, "");

				if (config.clip.url.match(/\.mp4$/))
					config.clip.url = "mp4:" + config.clip.url;
			}
			else config.clip.url = outputArray[0].url;

			delete plugins.brselect.menu;
		}

		loadBwcheck(baseUrl);

		plugins.bwcheck.serverType = "fms";

		// RTMP streaming plugin
		plugins.rtmp = {
			//url: basePath + "sambaplayer.rtmp.swf" ,
			netConnectionUrl: baseUrl
		};

		loadSpeedButtons();
	}
	// HDS (Akamai)
	else if (outputType === "HDS") {
		//Juntando os manifestos
		var baseHDS = null,
			signature = null,
			outputList = mediaJson.outputList,
			isMulti = outputList.length > 2,
			splitLookup = 'video',
			media, index;

		for (var i = 0; i < outputList.length; ++i) {
			media = outputList[i];

			if (media.labelText === '_RAW')
				continue;

			media.url = media.signedByTimeURL || media.url;
			index = isMulti ? media.url.indexOf(splitLookup) + splitLookup.length + 1 : media.url.indexOf('?');

			if (signature === null)
				signature = media.url.substr(media.url.indexOf('?'));

			if (baseHDS === null) {
				baseHDS = index === -1 ? media.url : media.url.substr(0, index);

				if (isMulti === false)
					break;
			}

			baseHDS += ',' + media.url.substr(index, media.url.indexOf('.mp4') - index);
		}

		if (isMulti)
			baseHDS += ',.mp4.csmil/manifest.f4m';

		loadAkamai(queryParams.akamai == 1 ? 'http://cers11hds-vh.akamaihd.net/z/account/869/1/2015-01-20/video/,86d486aca1ed5cf54275401a31e26663/2913_041214_CTB_OAB_1_FASE_XVI_P_TRAB_AULA_06_PT_II_OK,5d2b09e8083c9d0e2f770a8e0e74a800/2913_041214_CTB_OAB_1_FASE_XVI_P_TRAB_AULA_06_PT_II_OK,5d6b1603387fc3a333c1066d78c1d9da/2913_041214_CTB_OAB_1_FASE_XVI_P_TRAB_AULA_06_PT_II_OK,72a5f2a31d444a71e0ad675a1cca6320/2913_041214_CTB_OAB_1_FASE_XVI_P_TRAB_AULA_06_PT_II_OK,.mp4.csmil/manifest.f4m' :
			queryParams.akamai == 2 ? 'http://treinavod2-vh.akamaihd.net/z/big2_,200k,400k,800k,.mp4.csmil/manifest.f4m' : baseHDS, queryParams.akamai ? '?hdnts=st=1415194947~exp=1415194977~acl=/*~hmac=777ad23a84f29419d088beb2a13cefa7d8fbb986d53abadb87c7f80eb1ea954f' : signature);

		baseHDS = null;
		media = null;
	}
	// HLS
	else if (outputType === "HLS") {
		loadHls();
		loadSpeedButtons();
	}

	if (mediaJson.thumbnailList && mediaJson.thumbnailList.length > 0) {
		var thumbnailArray = (queryParams.thumbnailURL) ? [{
			url: queryParams.thumbnailURL
		}] : mediaJson.thumbnailList;

		for(var i = thumbnailArray.length; i--;) {
			thumbnailArray[i].url = Utils.urlProtocol(thumbnailArray[i].url);
		}

		plugins.thumbnail = {
			/*
			 * url: basePath + 'sambaplayer.thumbnail.swf' ,
			 */
			loadAnimationColor: playerThemeColor.toRGBAString(1),
			width: "100%",
			height: "100%",
			zIndex: topMostZIndex - 4,
			thumbnailList: thumbnailArray
		};
	}

	output = null;
	// configureWatermark(plugins, mediaJson.watermark);
}
else if (isAudio) {
	// Reprodução automática para evitar thumbnail no início
	config.clip.autoPlay = true;

	config.screen = {
		width: 0,
		height: 0
	};
	
	plugins.controls.tooltips = {
		buttons: false
	};

	plugins.controls.autoHide = false;
	plugins.controls.titlebarEnabled = false;
	plugins.controls.fullscreen = false;
	plugins.controls.backgroundGradient = 'none';
	plugins.controls.backgroundColor = '#434343';
	plugins.controls.miniVerification = false;

	if (mediaJson.outputList[0].urlType == "PROGRESSIVE") {
		plugins.audio = {
			url: basePath + "sambaplayer.audio.swf"
		}
		config.clip.url = (mediaJson.outputList[0].signedByTimeURL) ? Utils.urlProtocol(mediaJson.outputList[0].signedByTimeURL) : Utils.urlProtocol(mediaJson.outputList[0].url);
		//rtmp audio
	} else if (mediaJson.outputList[0].urlType == "RTMP") {
		var outputArray = mediaJson.outputList;
		config.clip.provider = "rtmp";
		config.clip.urlResolvers = 'brselect';
		// plugin responsible for video switching
		plugins.brselect = pluginBrselect;

		var baseUrl = "";
		var baseUrl2 = "";
		var a = 0;
		var rtmpUrl = outputArray[0].url.match(/(rtmp.{0,1}:\/\/)(.*\/)(.*\/)(.*\/?)*/);

		if (rtmpUrl.length == 5) {
			baseUrl = rtmpUrl[1] + rtmpUrl[2];
			baseUrl = checkBaseUrl(baseUrl);

			config.clip.url = outputArray[0].url.replace(baseUrl, "");

			if (config.clip.url.match(".*\.mp3$")) {
				config.clip.url = "mp3:" + config.clip.url.replace(".mp3", "");
			}
		} else {
			config.clip.url = outputArray[0].url;
		}
		delete plugins.brselect.menu;
	}

	// RTMP streaming plugin
	plugins.rtmp = {
		url: basePath + "sambaplayer.rtmp.swf",
		netConnectionUrl: baseUrl,
		durationFunc: 'getStreamLength'
	};

	//removendo o share
	queryParams.enableShare = false;

	delete config.play;
}
// Live
else if (mediaJson.liveOutput) {
	// If param, overwrites API.
	var url = queryParams.alternateLive || mediaJson.liveOutput.baseUrl || "";
	var isSmil = url.match(/\.smil/i) !== null;

	url = url.replace(/\/$/, "");

	// If token comes "outside" the parameterized URI, adds it.
	// Some servers need tokens (e.g. Level3).
	if (queryParams.token && escape(url).indexOf("?") === -1)
		url += "?token=" + queryParams.token;

	config.clip.live = mediaJson.isLive = true;
	config.clip.start = -1;
	config.clip.url = url;
	// Updating info
	isSmil = url.indexOf("smil") !== -1;

	// HLS
	if (url.match(/\.m3u8/i) !== null)
		loadHls(url);
	// HDS (Akamai)
	else if (url.match(/^\w{3,6}\:\/\/[^\/]*(akamai|akahs)/) !== null)
		loadAkamai(url);
	// RTMP
	else if (isRtmpUrl(url) || isSmil) {
		config.clip.provider = "rtmp";

		loadBwcheck(String(url.match(/.+(?=\/[\w\.\-]+$)/) || ""));

		plugins.bwcheck.serverType = "fms";
		plugins.bwcheck.live = true;

		plugins.rtmp = {
			netConnectionUrl: plugins.bwcheck.netConnectionUrl
		};

		if (isSmil) {
			config.clip.urlResolvers.unshift("smil");
			plugins.smil = {};
		}
	}
	// HDS
	else if (url.match(/\.f4m|hds/i) !== null) {
		config.clip.provider = "httpstreaming";
		config.clip.urlResolvers = "f4m";
		config.clip.url += (config.clip.url.indexOf('.f4m') > -1) ? '' : ((config.clip.url.indexOf(/\/$/) == -1) ? '/' : '') + 'livestream.f4m';
		loadBwcheck(sambaPlayerSrc.src);

		plugins.bwcheck.live = true;

		plugins.httpstreaming = {};
		plugins.f4m = {
			retryInterval: 10,
			maxRetries: 1
		};
	}

	// Splash
	if (queryParams.thumbnailURL) {
		plugins.thumbnail = {
			loadAnimationColor: playerThemeColor.toRGBAString(1),
			width: "100%",
			height: "100%",
			zIndex: topMostZIndex - 4,
			thumbnailList: [{
				id: "abe81f96aa0335343b236220b61c3747",
				qualifierName: "THUMBNAIL",
				url: queryParams.thumbnailURL || '',
				width: 213,
				height: 120
			}]
		};
	}
} else {
	// TODO: parse error, unknown configuration input
}

/** SHARE **/
(function() {
	var shared = sambaBridge.checkShared();
	var hasShare = false;

	for (var k in shared)
		if (shared[k] && k !== "whatsapp")
			hasShare = true;

	if (hasShare && !queryParams.mediaURL) {
		var sharingDescription = mediaJson.title;
		var pageUrl = document.referrer || window.location.href;

		plugins.sharing = {
			//url : basePath + "sambaplayer.sharing.swf",
			zIndex: topMostZIndex - 5,
			embed: shared.embed,
			link: shared.url,
			twitter: false,
			facebook: false
		};

		if (shared.twitter) {
			plugins.sharing.twitter = {
				description: encodeURIComponent(sharingDescription),
				pageUrl: encodeURIComponent(pageUrl)
			};
		}

		if (shared.facebook) {
			var fbUrl = encodeURIComponent(document.location.href);

			plugins.sharing.facebook = {
				description: sharingDescription,
				redirectUi: encodeURIComponent(pageUrl),
				pageUrl: fbUrl
			};
		}

	}
})();

var ad = mediaJson.advertisings || [];
var adType = [];

for(var x=ad.length;x--;) {
	adType.push(ad[x].type);
}

if (ad.length > 0) {
	// IMA - https://developers.google.com/interactive-media-ads/
	if (ad[0].publisherId == null) {

		plugins.ima = {
			//url: basePath + 'sambaplayer.ima.swf',
			tag: escape(ad[0].url),
			adType: ad[0].type,
			adMessage: window.localization.ad_message
			//adSkipMessage: window.localization.ad_skip_message,
			//adSkipCountdown: window.localization.ad_skip_countdown
		};
		sambaPlayerSrc.src = basePath + "samba.player.ima.swf";
	}
	// LiveRail - http://support.liverail.com/technical-docs/run-time-parameters-specification
	// TODO: migrar para 'samba.player.common.js'
	else if (adType.join(',') !== 'overlay') {
		// Se houver lead ao final, ad será preroll
		var pos = (adType.join(',') === 'preroll') ? 'in::0%;' : (adType.join(',') === 'postroll') ?
				'in::100%' : 'in::0%;in::100%';


		plugins.liverail = {
			url: basePath + "sambaplayer.liverail.swf",
			LR_PUBLISHER_ID: ad[0].publisherId,
			LR_TAGS: ad[0].tags,
			LR_ADMAP: encodeURI(pos),
			LR_LAYOUT_SKIN_MESSAGE: window.localization.ad_message,
			LR_SKIP_MESSAGE: window.localization.ad_skip_message,
			LR_SKIP_COUNTDOWN: window.localization.ad_skip_countdown,
			LR_DEBUG: 0,
			LR_SCHEMA: 'vast2-vpaid',
			LR_AUTOPLAY: true,
			LR_VIDEO_ID: mediaJson.id,
			LR_TITLE: encodeURI(mediaJson.title),
			LR_SKIP_POSITION: '1,-5,1,-50'
		};
	}
}

// Security: Domain restriction: Support to Only play medias from domains
// registered on SambaVideos
plugins.error = {
	//url : basePath + "sambaplayer.errorscreen.swf",
	secureDomains: queryParams.mediaURL ? null : mediaJson.secureDomains,
	retryMessage: "error_retry_message",
	width: "100%",
	height: "100%",
	zIndex: topMostZIndex
};

var overColor = '#ffffff';

if (plugins.controls) {
	// plugins.controls.backgroundColor = (new
	// RGB()).initWithHex(mediaJson.controlBar.backgroundColor).toRGBAString(parseInt(mediaJson.controlBar.backgroundAlpha)
	// / 100);
	plugins.controls.buttonOverColor = overColor;
	plugins.controls.volumeColor = playerThemeColor.toRGBString();
	plugins.controls.progressColor = plugins.controls.volumeColor;
}
if (plugins.menu) {
	plugins.menu.overColor = overColor;
}
if (plugins.sharing) {
	plugins.sharing.overColor = overColor;
}
if (plugins.brselect) {
	plugins.brselect.themeColor = playerThemeColor.toRGBAString(0.8);
}
if (config.play) {
	config.play.bufferColor = playerThemeColor.toString();
	config.play.themeColor = playerThemeColor.toString();
}

config.plugins = plugins;

/** EVENTS **/

var quartiles = getQuartiles();
var hasStarted = false;

config.onBeforeClick = function(clip) {
	return player.dispatchEvent({
		type: 'beforeClick',
		clip: clip
	});
};

config.onLoad = function() {
	//Atualizando a altura caso o player esteja escondido
	sambaContainer.updateDimensions();

	if (queryParams.volume) {
		player.setVolume(queryParams.volume);
	}

	if (volumeInit > -1) {
		volumeInit = player.getVolume();
		player.setVolume(0);
	}

	if (mediaJson.playerConfig.enableControls != null && !mediaJson.playerConfig.enableControls) {
		player.getPlugin("controls").css({
			display: "none"
		});
	}

	// Destroying refs
	var params = document.getElementById("player").getElementsByTagName('object')[0].getElementsByTagName('param');

	for (var k in params)
		if (typeof params[k] === 'object' && params[k].getAttribute('name').toLowerCase() === 'flashvars')
			params[k].setAttribute('value', '');
};

config.onStart = function(clip) {
	// WORKAROUND: start got dispatched when akamai plugin's bitrate changes
	if (hasStarted)
		return;

	hasStarted = true;

	startOnProgress();

	if (player.dispatchEvent({
			type: 'beforeStart',
			clip: clip
		}) !== false) {
		player.dispatchEvent({
			type: 'start',
			clip: clip
		});
		player.dispatchEvent({
			type: 'mediaView',
			clip: clip,
			cuepoint: quartiles[0],
			percentage: quartiles[0].percentage
		});
	}

	metrics.lastTime = Date.now();
};

config.onPause = function(clip) {
	stopOnProgress(interval);
	player.dispatchEvent({
		type: 'pause',
		clip: clip
	});
	return false;
};

config.onResume = function(clip) {
	startOnProgress();
	player.dispatchEvent({
		type: 'resume',
		clip: clip
	});
};

config.clip.onSeek = function(clip) {
	player.dispatchEvent({
		type: 'seek',
		clip: clip,
		time: player.getTime()
	});
};

config.clip.onBeforePause = function(clip) {
	return player.dispatchEvent({
		type: 'beforePause',
		clip: clip
	});
};

config.clip.onBeforeResume = function(clip) {
	return player.dispatchEvent({
		type: 'beforeResume',
		clip: clip
	});
};

config.clip.onBeforeSeek = function(clip) {
	return player.dispatchEvent({
		type: 'beforeSeek',
		clip: clip,
		time: player.getTime()
	});
};

config.clip.onCuepoint = [quartiles.slice(1, -1), function(clip, cuepoint) {
	player.dispatchEvent({
		type: 'mediaView',
		clip: clip,
		cuepoint: cuepoint,
		percentage: cuepoint.percentage
	});
}];

var cuepointHandler = function(clip, cuepoint) {
	cuepoint.time /= 1000;
	
	player.dispatchEvent({
		type: 'cuepoint' + (cuepoint.type ? ':' + cuepoint.type : ''),
		clip: clip,
		cuepoint: cuepoint
	});
};

config.playlist = [{
	onCuepoint: [getCuepoints(), cuepointHandler]
}];

config.onCast = function(clip) {
	player.dispatchEvent({type: 'cast'});
};

config.onFinish = function(clip) {
	if (hasStarted === false)
		return;

	stopOnProgress(interval);
	player.dispatchEvent({
		type: 'finish',
		clip: clip
	});

	player.dispatchEvent({
		type: 'mediaView',
		clip: clip,
		cuepoint: quartiles[quartiles.length - 1],
		percentage: quartiles[quartiles.length - 1].percentage
	});
	hasStarted = false;
};

config.plugins.controls.onScrubberOver = function(e) {
	player.dispatchEvent({
		type: 'timelineOver',
		mouseX: e.mouseX,
		mouseY: e.mouseY
	});
};
config.plugins.controls.onScrubberOut = function(e) {
	player.dispatchEvent({
		type: 'timelineOut',
		mouseX: e.mouseX,
		mouseY: e.mouseY
	});
};
config.plugins.controls.onCuepointOver = function(e) {
	e.parameters.time = e.time/1000;

	player.dispatchEvent({
		type: 'cuepointOver',
		cuepoint: e.parameters
	});
};

config.onError = config.clip.onError = function(code, error) {
	switch (code) {
		case 200:
			if (mediaJson.security && mediaJson.security.on)
				mediaJson.errorType = "expired";
			else if (!player.getClip().live)
				mediaJson.errorType = "timeout";
			break;
		case 201:
			if (tokenTime && Date.now() - playerTimeInit > tokenTime)
				mediaJson.errorType = "forbidden";
			else if (!player.getClip().live)
				mediaJson.errorType = "timeout";
			break;
		case 203:
			mediaJson.errorType = "unavailable";
			break;
		default:
			logger.error("Unknown error: " + code + ": " + error);
	}

	metrics.data.err.push(code);

	if (mediaJson.errorType)
		window.sambaBridge.showError();

	sendMetrics();
};

//Teste carregar o swf antes e coloca-lo no cache
if (!queryParams.autoStart && !isAudio) {
	var img = document.createElement("img");
	img.src = sambaPlayerSrc.src;
}

var player = new flowplayer("player", sambaPlayerSrc, config);

// Register the player.
window.sambaBridge.setPlayer(player);

var _cast;

var beforeStartCastHandler = (function(e) {
	var tolerance = 2000;
	var timeId = setInterval((function() {
		if (this.getCurrentTime() > tolerance)
			return;	

		clearInterval(timeId);
		this.getControls().setWidgets({cast: true});
	}).bind(this), tolerance);
}).bind(player);

var beforePauseHandler = (function(e) {
	return false;
}).bind(player);

var beforeResumeHandler = (function(e) {
	if (_cast.currentMedia.playerState === chrome.cast.media.PlayerState.PLAYING)
		_cast.pause();
	else if (_cast.currentMedia.playerState === chrome.cast.media.PlayerState.PAUSED)
		_cast.play();

	return false;
}).bind(player);

var beforeSeekHandler = (function(e) {
	if (_cast.currentMedia.playerState === chrome.cast.media.PlayerState.IDLE)
		return;

	var wasPlaying = _cast.currentMedia.playerState === chrome.cast.media.PlayerState.PLAYING;

	_cast.seek(e.time);
	wasPlaying && _cast.play();
	//return false;
}).bind(player);

/** API **/

player.addCastButton = (function(cast) {
	if (isAudio)
		return;

	_cast = cast;

	if (hasStarted) {
		this.getControls().setWidgets({cast: true});
		return;
	}
	this.addEventListener('beforeStart', beforeStartCastHandler);
}).bind(player);

player.changeCastState = (function(value) {
	this.getControls().callWidgetFunc('cast', 'changeState', value);

	switch (value) {
	case 0:
		this.removeEventListener('beforePause', beforePauseHandler);
		this.removeEventListener('beforeResume', beforeResumeHandler);
		this.removeEventListener('beforeSeek', beforeSeekHandler);
		break;
	case 2:
		this.addEventListener('beforePause', beforePauseHandler);
		this.addEventListener('beforeResume', beforeResumeHandler);
		this.addEventListener('beforeSeek', beforeSeekHandler);
		break;
	}
}).bind(player);

player.getCurrentTime = (function() {
	return this.getTime();
}).bind(player);

player.getDuration = (function() {
	return mediaDuration/1000;
}).bind(player);

player.seekTo = player.seek;
player.seek = (function(time, fake) {
	if (fake) {
		this.getControls().callWidgetFunc('scrubber', 'setValue', Math.min(time/this.getDuration()*100, 100));
		return;
	}

	this.seekTo(time);
}).bind(player);

player.showAnnotation = (function(config) {
	document.body.appendChild(Annotations.getInstance().show(config));
}).bind(player);

player.addCuepoint = (function(time, type, visible) {
	this.onCuepoint([{
		time: time*1000,
		type: type,
		visible: visible
	}], cuepointHandler);

	this.getControls().updateCuepoints();
}).bind(player);

player.removeCuepoint = (function(time) {
	//this.getControls().removeCuepoint(time*1000);
}).bind(player);

player.setAutoHide = (function(value) {
	this.getControls().setAutoHide({enabled: value});
}).bind(player);

document.body.className = 'flowplayer';

postConfigs();
player.dispatchEvent({type: 'load'});

// backdoor (dur 5 mins .. max 10 mins): Math.ceil(Date.now()/1000/60 + 5).toString(36)
var now = Date.now();
var bd = parseInt(queryParams.backdoor, 36)*60*1000;

if (queryParams.backdoor == null || bd < now || bd > now + 300000) {
	outputArray = null;
	outputList = null;
	plugins = null;
	config = null;
}

//Funçao para monitorar o tempo do vídeo
var interval = null;

function startOnProgress() {
	interval = setInterval(function() {
		player.dispatchEvent({
			type: 'progress',
			time: player.getTime(),
			duration: player.getClip().live ? 0 : mediaDuration / 1000
		});
	}, 125);
}

function stopOnProgress(interval) {
	if (interval)
		clearInterval(interval);
}

// TODO: migrar para 'samba.player.common.js'
function getQuartiles() {
	var quartiles = [];
	var mediaJson = sambaBridge.getMediaJson();

	if (!queryParams.mediaURL) {
		var duration = mediaDuration;
		var names = (mediaJson.outputList) ? ["Started", "First Quartile", "Mid Point", "Third Quartile", "Completed"] : ["Started"];
		var total = names.length - 1;
		var f;

		for (var i = 0; i <= total; ++i) {
			f = i / total;
			quartiles.push({
				percentage: parseInt(f * 100) + "%",
				time: duration * f,
				quartile: names[i]
			});
		}
	}

	return quartiles;
}

// TODO: migrar para 'samba.player.common.js'
function getCuepoints() {
	var cuepoints = queryParams.cuepoints ? queryParams.cuepoints.split(",") : [];

	for (var i = 0; i < cuepoints.length; ++i)
		if (typeof cuepoints[i] != "object")
			cuepoints[i] = {
				time: parseInt(Number(cuepoints[i])*1000),
				parameters: {
					visible: true
				}
			};

	return cuepoints;
}

function configureWatermark(plugins, watermark) {
	//
	if (watermark && watermark.url) {
		plugins.watermark = {
			// url: basePath + 'sambaplayer.content.swf',
			border: 'none',
			background: 'transparent',
			backgroundGradient: 'none',
			borderRadius: 0,
			padding: -7,
			html: '<img src=\\"' + watermark.url + '\\" vspace=\\"5\\" hspace=\\"5\\" />'
		};
		//
		var markup = '<img src=\\"' + watermark.url + '\\" vspace=\\"5\\" hspace=\\"5\\"';
		//
		if (watermark.position.match(/top|up/)) {
			plugins.watermark.top = 0;
		}
		if (watermark.position.match("bottom")) {
			plugins.watermark.bottom = 0;
		}
		if (watermark.position.match("right")) {
			plugins.watermark.right = 0;
		}
		if (watermark.position.match("left")) {
			plugins.watermark.left = 0;
		}
		if (watermark.width) {
			plugins.watermark.width = parseInt(watermark.width);
			//
			markup = markup.concat(' width=\\"' + plugins.watermark.width + 'px\\"');
		}
		if (watermark.height) {
			plugins.watermark.height = parseInt(watermark.height);
			//
			markup = markup.concat(' height=\\"' + plugins.watermark.height + 'px\\"');
		}
		//
		plugins.watermark.html = markup + " />";
	}
}

function initXMLParser() {
		if (window.DOMParser) {
			parseXml = function(xmlStr) {
				return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
			};
		} else if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
			parseXml = function(xmlStr) {
				var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = "false";
				xmlDoc.loadXML(xmlStr);
				return xmlDoc;
			};
		} else {
			parseXml = function() {
				return null;
			};
		}
	}
	// Changes XML to JSON
function xmlToJson(xml) {
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj[attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for (var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
}

function RGB() {
	this.r = 0;
	this.g = 0;
	this.b = 0;
	this.initWithHex = function(hex) {
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});
		var result = /^.*([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		//
		if (result) {
			this.r = parseInt(result[1], 16);
			this.g = parseInt(result[2], 16);
			this.b = parseInt(result[3], 16);

			if (this.r < 10)
				this.r = "0" + this.r;

			if (this.g < 10)
				this.g = "0" + this.g;

			if (this.b < 10)
				this.b = "0" + this.b;
		}
		return this;
	};
	this.toRGBString = function() {
		return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
	}
	this.toRGBAString = function(a) {
		return "rgba(" + this.r + "," + this.g + "," + this.b + "," + a + ")";
	}
	this.toString = function(prefix) {
		prefix = prefix || "0x";
		var r = this.r.toString(16);
		var g = this.g.toString(16);
		var b = this.b.toString(16);
		return prefix + (r.length > 1 ? r : "0" + r) + (g.length > 1 ? g : "0" + g) + (b.length > 1 ? b : "0" + b);
	}
}

function checkBaseUrl(baseUrl) {

	for (var key in rtmpMap) {
		if (baseUrl.indexOf(key) > -1)
			baseUrl = baseUrl.substr(0, baseUrl.indexOf(rtmpMap[key].partial) + rtmpMap[key].partial.length);
	}
	return baseUrl;
}

//Filtro do Ova
function generateUniqueAds(ovaArray) {
	// TODO: melhorar
	var pre = [];
	var ove = [];
	var pos = [];

	var filteredOvaArray = [];
	var positions = [];
	var length = ovaArray.length;
	for (var i = length; i--;) {
		if (ovaArray[i].position == "pre-roll") {
			pre.push(ovaArray[i]);
		} else if (ovaArray[i].position == "post-roll") {
			ove.push(ovaArray[i]);
		} else {
			pos.push(ovaArray[i]);
		}
	}
	if (pre.length > 0)
		filteredOvaArray.push(pre[getRandomArbitary(0, pre.length - 1)]);

	if (ove.length > 0)
		filteredOvaArray.push(ove[getRandomArbitary(0, ove.length - 1)]);

	if (pos.length > 0)
		filteredOvaArray.push(pos[getRandomArbitary(0, pos.length - 1)]);

	return filteredOvaArray;
}

function getRandomArbitary(min, max) {
	return Math.ceil(Math.random() * (max - min) + min);
}

// TODO: migrar para 'Utils'
function isRtmpUrl(url) {
	// rtmp, rtmpt, rtmpe, rtmpte, rtmfp
	return url && url.match(/^rtm(p([te]?|te)|fp)\:/) != null;
}

function loadAkamai(url, signature) {
	if (url == null)
		return;

	if (signature) {
		config.clip.url = url + signature;
		tokenTime = signature.match(/(st|exp)\=(\d+)/gi);

		if (tokenTime && tokenTime.length > 1) {
			tokenTime = tokenTime[1].match(/\d+/)[0] - tokenTime[0].match(/\d+/)[0];
			playerTimeInit = Date.now();
		}
	}
	else config.clip.url = url;
	config.clip.provider = 'akamai';

	var resolutions = [];
	var reNum = /\d+/;
	var label;

	for (var i = mediaJson.outputList.length; i--;)
		if ((label = mediaJson.outputList[i].labelText).indexOf('RAW') === -1)
			resolutions.push(parseInt((label.match(reNum) || [])[0]));

	resolutions.sort(function(a, b) {
		return a - b;
	});

	plugins.akamai = {
		url: basePath + "AkamaiAdvancedFlowplayerProvider.swf",
		mbrStartingIndex: resolutions.indexOf(parseInt(((queryParams.startOutput || '').match(reNum) || [])[0]))
	};

	plugins.brselect = pluginBrselect;
	plugins.menu = pluginMenu;
	plugins.akamaiconf = {
		resolutions: resolutions
	};

	// Bundle to avoid conflicts with "f4m", "httpstreaming" and "bwcheck" plugins
	sambaPlayerSrc.src = basePath + "samba.player.akamai.swf";
}

/**
 * Cases:
 * 1) Default: auto
 * 2) startOutput=240p,360p,480p,720p,1080p
 * 3) startOutput=invalid: auto
 * 4) startOutput= : auto
 */
function loadHls(url) {
	var urls = (url) ? [Utils.urlProtocol(url)] : mediaJson.outputList;
	var currentUrl = url;
	if(urls.length > 1) {
		for(var k=urls.length; k--;) {
			currentUrl = (urls[k].signedByTimeURL) ? urls[k].signedByTimeURL : urls[k].url;
			if(urls[k].labelText === "abr_hls") {
				break;
			}
		}
	}

	config.clip.url = currentUrl;
	config.clip.provider = 'hls';
	config.clip.urlResolvers = ['hls'];

	var resMap = {
		"240": 0,
		"360": 1,
		"480": 2,
		"720": 3,
		"1080": 4
	};
	var res = queryParams.startOutput;// || mediaJson.defaultOutput;

	if (res && (res = res.match(/\d+/)))
		res = res[0];

	var maxOutputIndex = 4;

	// reconstruct map
	if (mediaJson.outputList) {
		maxOutputIndex = -1;
		resMap = {};

		var total = mediaJson.outputList.length;
		var label;

		for (var i = 0; i < total; ++i)
			if ((label = mediaJson.outputList[i].labelText).indexOf('p_hls') !== -1)
				resMap[label.match(/\d+/)[0]] = ++maxOutputIndex;
	}

	plugins.brselect = pluginBrselect;
	plugins.menu = pluginMenu;
	plugins.hls = {
		//url: basePath + 'flashlsFlowPlayer.swf',
		hls_debug: true,
		hls_debug2: true,
		hls_minbufferlength: -1,
		hls_maxbufferlength: 10,
		hls_lowbufferlength: 3,
		hls_startfromlevel: isNaN(resMap[res]) ? -1 : Math.min(resMap[res], maxOutputIndex) / maxOutputIndex,
		hls_seekfromlevel: -1,
		hls_live_flushurlcache: false,
		hls_seekmode: "ACCURATE",
		hls_manifestloadmaxretry: 2,
		hls_keyloadmaxretry: 2,
		hls_fragmentloadmaxretry: 2
		//autoDynamicStreamSwitch: false
	};
}
function loadBwcheck(conUrl) {
	if (typeof config.clip.urlResolvers === 'string')
		config.clip.urlResolvers = [config.clip.urlResolvers];
	else if (config.clip.urlResolvers instanceof Array === false)
		config.clip.urlResolvers = [];

	config.clip.urlResolvers.push('bwcheck');

	plugins.bwcheck = {
		dynamic: true,
		onStreamSwitchBegin: function(newItem, currentItem) {
			logger.info("Will switch to: " + newItem.streamName + " from " + currentItem.streamName);
		},
		onStreamSwitch: function(newItem) {
			logger.info("Switched to: " + newItem.streamName);
		},
		onBwDone: function(item, bitrate, latency) {
			logger.info("Bw: " + item.streamName + ", " + bitrate);

			if (metrics.data.dType.toLowerCase() != 'rtmp')
				return;

			setTimeout(function() {
				player.getPlugin('bwcheck').checkBandwidth();
			}, metrics.delay);

			if (bitrate == -1) {
				metrics.delay *= 2;

				if (metrics.delay > 60000)
					metrics.delay = 60000;
				return;
			}

			metrics.data.kbps.push(bitrate);
			metrics.data.latency.push(latency);

			metrics.data.pos = player.getCurrentTime();
			metrics.lastTime = Date.now();

			if (metrics.delay > 5000)
				metrics.delay /= 2;

			if (metrics.delay < 5000)
				metrics.delay = 5000;
		}
	};
	plugins.bwcheck.netConnectionUrl = conUrl;

	if (metrics.data.dType.toLowerCase() == 'rtmp') {
		config.onNetStatus = function(e, code) {
			metrics.data.netStatus.push(code);

			if (code == 'NetConnection.Connect.Closed' &&
					player.getCurrentTime() < player.getDuration())
				sendMetrics();
		};

		setInterval(function() {
			if (hasStarted && player.getPlugin('bwcheck') && Date.now() - metrics.lastTime > 45000)
				player.getPlugin('bwcheck').checkBandwidth();
		}, 5000);
	}
}
function sendMetrics() {
	corsRequest(JSON.parse(JSON.stringify(metrics)));
	metrics.data.netStatus = [];
	metrics.data.kbps = [];
	metrics.data.latency = [];
	metrics.data.err = [];
}
function corsRequest(obj, cb, retries) {
	var xhr = new XMLHttpRequest();
	
	if (retries == null)
		retries = 6;

	if ("withCredentials" in xhr) {
	// XHR for Chrome/Firefox/Opera/Safari.
		xhr.open(obj.method, obj.url, true);
	} else if (typeof XDomainRequest != "undefined") {
	// XDomainRequest for IE.
		xhr = new XDomainRequest();
		xhr.open(obj.method, obj.url);
	} else {
	// CORS not supported.
		xhr = null;
	}
	
	if(xhr) {
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onload = function(){
			if(xhr.readyState === 4 && xhr.status === 200)
				(cb || function(){})(xhr.response);
		};

		xhr.onerror = function(){
			if (retries-- <= 0)
				return;

			console && console.info('CORS: connection error (retries=' + retries + ')');

			setTimeout(function() {
				corsRequest(obj, cb, retries);
			}, 5000);
		};
		xhr.send(typeof obj.data === 'string' ? obj.data : JSON.stringify(obj.data));
	}else {
		evtDsp.trigger({type: '*:error', critical: false, error: {message: 'CORS not supported'}});
	}
}
function loadSpeedButtons() {
	if (queryParams.speed) {
		plugins.slowmotion = {};

		plugins.speedIndicator = {
			bottom: 50,
			right: 15,
			width: 170,
			height: 30,
			border: 'none',
			borderRadius: 5,
			opacity: 1,
			backgroundGradient: 'none',
			backgroundColor: 'rgba(0,0,0,0.7)',
			slowForwardLabel: window.localization['tooltip_btn_sfwd'] + ' ({speed}x)',
			fastForwardLabel: window.localization['tooltip_btn_ffwd'] + ' ({speed}x)',
			display: 'none',
			style: {
				body: {
					fontFamily: "Klavika",
					fontSize: 14,
					fontWeight: 'bold',
					textAlign: 'center',
					color: '#ffffff'
				}
			}
		};
		// TODO: plugins.menu = pluginMenu;
	}
}
function postConfigs() {
	if (isAudio) {
		// Stop at the end to avoid seekbar misbehavior
		player.addEventListener('finish', function() {
			player.stop();
		});

		// Cannot stop player immediatelly, so we need to wait a while (with no sound)
		if (mediaJson.autoStart === false) {
			var count = 0;

			volumeInit = 0;

			player.addEventListener('progress', function() {
				if (++count < 2)
					return;

				player.removeEventListener('progress', arguments.callee);
				player.stop();
				player.setVolume(volumeInit);
			});
		}
	}
}
