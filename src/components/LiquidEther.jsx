import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './LiquidEther.css';

export default function LiquidEther({
  mouseForce = 20,
  cursorSize = 100,
  isViscous = false,
  viscous = 30,
  iterationsViscous = 32,
  iterationsPoisson = 32,
  dt = 0.014,
  BFECC = true,
  resolution = 0.5,
  isBounce = false,
  colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
  style = {},
  className = '',
  autoDemo = true,
  autoSpeed = 0.5,
  autoIntensity = 2.2,
  takeoverDuration = 0.25,
  autoResumeDelay = 1000,
  autoRampDuration = 0.6
}) {
  const mountRef = useRef(null);
  const webglRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const rafRef = useRef(null);
  const intersectionObserverRef = useRef(null);
  const isVisibleRef = useRef(true);
  const resizeRafRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    function makePaletteTexture(stops) {
      let arr;
      if (Array.isArray(stops) && stops.length > 0) {
        if (stops.length === 1) arr = [stops[0], stops[0]];
        else arr = stops;
      } else {
        arr = ['#ffffff', '#ffffff'];
      }
      const w = arr.length;
      const data = new Uint8Array(w * 4);
      for (let i = 0; i < w; i++) {
        const c = new THREE.Color(arr[i]);
        data[i * 4 + 0] = Math.round(c.r * 255);
        data[i * 4 + 1] = Math.round(c.g * 255);
        data[i * 4 + 2] = Math.round(c.b * 255);
        data[i * 4 + 3] = 255;
      }
      const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      return tex;
    }

    const paletteTex = makePaletteTexture(colors);
    const bgVec4 = new THREE.Vector4(0, 0, 0, 0); 

    class CommonClass {
      constructor() {
        this.width = 0; this.height = 0; this.aspect = 1; this.pixelRatio = 1;
        this.time = 0; this.delta = 0; this.container = null; this.renderer = null; this.clock = null;
      }
      init(container) {
        this.container = container;
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        this.resize();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.autoClear = false;
        this.renderer.setClearColor(new THREE.Color(0x000000), 0);
        this.renderer.setPixelRatio(this.pixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.display = 'block';
        this.clock = new THREE.Clock();
        this.clock.start();
      }
      resize() {
        if (!this.container) return;
        const rect = this.container.getBoundingClientRect();
        this.width = Math.max(1, Math.floor(rect.width));
        this.height = Math.max(1, Math.floor(rect.height));
        this.aspect = this.width / this.height;
        if (this.renderer) this.renderer.setSize(this.width, this.height, false);
      }
      update() {
        this.delta = this.clock.getDelta();
        this.time += this.delta;
      }
    }
    const Common = new CommonClass();

    class MouseClass {
      constructor() {
        this.mouseMoved = false; this.coords = new THREE.Vector2(); this.coords_old = new THREE.Vector2();
        this.diff = new THREE.Vector2(); this.isHoverInside = false; this.hasUserControl = false;
        this.isAutoActive = false; this.autoIntensity = 2.0; this.takeoverActive = false;
        this.takeoverFrom = new THREE.Vector2(); this.takeoverTo = new THREE.Vector2();
        this._onMouseMove = this.onDocumentMouseMove.bind(this);
        this._onTouchStart = this.onDocumentTouchStart.bind(this);
        this._onTouchMove = this.onDocumentTouchMove.bind(this);
      }
      init(container) {
        this.container = container;
        this.listenerTarget = (container.ownerDocument && container.ownerDocument.defaultView) || window;
        this.listenerTarget.addEventListener('mousemove', this._onMouseMove);
        this.listenerTarget.addEventListener('touchstart', this._onTouchStart, { passive: true });
        this.listenerTarget.addEventListener('touchmove', this._onTouchMove, { passive: true });
      }
      dispose() {
        if (this.listenerTarget) {
          this.listenerTarget.removeEventListener('mousemove', this._onMouseMove);
          this.listenerTarget.removeEventListener('touchstart', this._onTouchStart);
          this.listenerTarget.removeEventListener('touchmove', this._onTouchMove);
        }
      }
      isPointInside(clientX, clientY) {
        if (!this.container) return false;
        const rect = this.container.getBoundingClientRect();
        return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      }
      setCoords(x, y) {
        const rect = this.container.getBoundingClientRect();
        const nx = (x - rect.left) / rect.width;
        const ny = (y - rect.top) / rect.height;
        this.coords.set(nx * 2 - 1, -(ny * 2 - 1));
        this.mouseMoved = true;
      }
      onDocumentMouseMove(event) {
        this.isHoverInside = this.isPointInside(event.clientX, event.clientY);
        if (!this.isHoverInside) return;
        if (this.isAutoActive && !this.hasUserControl) {
            this.takeoverActive = true;
            this.hasUserControl = true;
            this.isAutoActive = false;
        }
        this.setCoords(event.clientX, event.clientY);
        this.hasUserControl = true;
      }
      onDocumentTouchStart(event) {
        if (event.touches.length !== 1) return;
        this.isHoverInside = this.isPointInside(event.touches[0].clientX, event.touches[0].clientY);
        if (this.isHoverInside) { this.setCoords(event.touches[0].clientX, event.touches[0].clientY); this.hasUserControl = true; }
      }
      onDocumentTouchMove(event) {
        if (event.touches.length !== 1) return;
        if (this.isPointInside(event.touches[0].clientX, event.touches[0].clientY)) this.setCoords(event.touches[0].clientX, event.touches[0].clientY);
      }
      update() {
        this.diff.subVectors(this.coords, this.coords_old);
        this.coords_old.copy(this.coords);
        if (this.isAutoActive && !this.takeoverActive) this.diff.multiplyScalar(this.autoIntensity);
      }
    }
    const Mouse = new MouseClass();

    class AutoDriver {
      constructor(mouse, manager, opts) {
        this.mouse = mouse; this.manager = manager; this.enabled = opts.enabled; this.speed = opts.speed;
        this.target = new THREE.Vector2(); this.current = new THREE.Vector2(); this.active = true;
        this.pickNewTarget();
      }
      pickNewTarget() {
        this.target.set((Math.random() * 2 - 1) * 0.8, (Math.random() * 2 - 1) * 0.8);
      }
      update() {
        if (!this.enabled || this.mouse.hasUserControl) return;
        this.mouse.isAutoActive = true;
        const dir = new THREE.Vector2().subVectors(this.target, this.current);
        if (dir.length() < 0.05) this.pickNewTarget();
        dir.normalize();
        this.current.addScaledVector(dir, this.speed * 0.016);
        this.mouse.coords.copy(this.current);
      }
    }

    const face_vert = `attribute vec3 position; uniform vec2 boundarySpace; varying vec2 uv; void main(){ vec3 pos = position; vec2 scale = 1.0 - boundarySpace * 2.0; pos.xy = pos.xy * scale; uv = vec2(0.5)+(pos.xy)*0.5; gl_Position = vec4(pos, 1.0); }`;
    const line_vert = `attribute vec3 position; uniform vec2 px; varying vec2 uv; void main(){ vec3 pos = position; uv = 0.5 + pos.xy * 0.5; vec2 n = sign(pos.xy); pos.xy = abs(pos.xy) - px * 1.0; pos.xy *= n; gl_Position = vec4(pos, 1.0); }`;
    const mouse_vert = `attribute vec3 position; attribute vec2 uv; uniform vec2 center; uniform vec2 scale; uniform vec2 px; varying vec2 vUv; void main(){ vec2 pos = position.xy * scale * 2.0 * px + center; vUv = uv; gl_Position = vec4(pos, 0.0, 1.0); }`;
    const advection_frag = `precision highp float; uniform sampler2D velocity; uniform float dt; uniform bool isBFECC; uniform vec2 fboSize; varying vec2 uv; void main(){ vec2 ratio = max(fboSize.x, fboSize.y) / fboSize; vec2 vel = texture2D(velocity, uv).xy; vec2 uv2 = uv - vel * dt * ratio; gl_FragColor = vec4(texture2D(velocity, uv2).xy, 0.0, 0.0); }`;
    const color_frag = `precision highp float; uniform sampler2D velocity; uniform sampler2D palette; uniform vec4 bgColor; varying vec2 uv; void main(){ vec2 vel = texture2D(velocity, uv).xy; float lenv = clamp(length(vel), 0.0, 1.0); vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb; gl_FragColor = vec4(mix(bgColor.rgb, c, lenv), mix(bgColor.a, 1.0, lenv)); }`;
    const divergence_frag = `precision highp float; uniform sampler2D velocity; uniform float dt; uniform vec2 px; varying vec2 uv; void main(){ float x0 = texture2D(velocity, uv-vec2(px.x, 0.0)).x; float x1 = texture2D(velocity, uv+vec2(px.x, 0.0)).x; float y0 = texture2D(velocity, uv-vec2(0.0, px.y)).y; float y1 = texture2D(velocity, uv+vec2(0.0, px.y)).y; gl_FragColor = vec4((x1 - x0 + y1 - y0) / 2.0 / dt); }`;
    const externalForce_frag = `precision highp float; uniform vec2 force; varying vec2 vUv; void main(){ vec2 circle = (vUv - 0.5) * 2.0; float d = 1.0 - min(length(circle), 1.0); gl_FragColor = vec4(force * d * d, 0.0, 1.0); }`;
    const poisson_frag = `precision highp float; uniform sampler2D pressure; uniform sampler2D divergence; uniform vec2 px; varying vec2 uv; void main(){ float p0 = texture2D(pressure, uv + vec2(px.x * 2.0, 0.0)).r; float p1 = texture2D(pressure, uv - vec2(px.x * 2.0, 0.0)).r; float p2 = texture2D(pressure, uv + vec2(0.0, px.y * 2.0)).r; float p3 = texture2D(pressure, uv - vec2(0.0, px.y * 2.0)).r; gl_FragColor = vec4((p0 + p1 + p2 + p3) / 4.0 - texture2D(divergence, uv).r); }`;
    const pressure_frag = `precision highp float; uniform sampler2D pressure; uniform sampler2D velocity; uniform vec2 px; uniform float dt; varying vec2 uv; void main(){ float p0 = texture2D(pressure, uv + vec2(px.x, 0.0)).r; float p1 = texture2D(pressure, uv - vec2(px.x, 0.0)).r; float p2 = texture2D(pressure, uv + vec2(0.0, px.y)).r; float p3 = texture2D(pressure, uv - vec2(0.0, px.y)).r; gl_FragColor = vec4(texture2D(velocity, uv).xy - vec2(p0 - p1, p2 - p3) * 0.5 * dt, 0.0, 1.0); }`;
    const viscous_frag = `precision highp float; uniform sampler2D velocity; uniform sampler2D velocity_new; uniform float v; uniform vec2 px; uniform float dt; varying vec2 uv; void main(){ vec2 old = texture2D(velocity, uv).xy; vec2 n0 = texture2D(velocity_new, uv + vec2(px.x * 2.0, 0.0)).xy; vec2 n1 = texture2D(velocity_new, uv - vec2(px.x * 2.0, 0.0)).xy; vec2 n2 = texture2D(velocity_new, uv + vec2(0.0, px.y * 2.0)).xy; vec2 n3 = texture2D(velocity_new, uv - vec2(0.0, px.y * 2.0)).xy; gl_FragColor = vec4((4.0 * old + v * dt * (n0 + n1 + n2 + n3)) / (4.0 * (1.0 + v * dt)), 0.0, 0.0); }`;

    class ShaderPass {
      constructor(props) {
        this.props = props || {}; this.uniforms = this.props.material?.uniforms;
        this.scene = new THREE.Scene(); this.camera = new THREE.Camera();
        if (this.uniforms) {
          this.material = new THREE.RawShaderMaterial(this.props.material);
          this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), this.material));
        }
      }
      update() { Common.renderer.setRenderTarget(this.props.output || null); Common.renderer.render(this.scene, this.camera); Common.renderer.setRenderTarget(null); }
    }

    class Advection extends ShaderPass {
      constructor(p) {
        super({ material: { vertexShader: face_vert, fragmentShader: advection_frag, uniforms: { boundarySpace: { value: p.cellScale }, fboSize: { value: p.fboSize }, velocity: { value: p.src.texture }, dt: { value: p.dt }, isBFECC: { value: true } } }, output: p.dst });
      }
      update(p) { this.uniforms.dt.value = p.dt; super.update(); }
    }

    class ExternalForce extends ShaderPass {
      constructor(p) {
        super({ output: p.dst });
        this.mouse = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.RawShaderMaterial({ vertexShader: mouse_vert, fragmentShader: externalForce_frag, blending: THREE.AdditiveBlending, depthWrite: false, uniforms: { px: { value: p.cellScale }, force: { value: new THREE.Vector2() }, center: { value: new THREE.Vector2() }, scale: { value: new THREE.Vector2() } } }));
        this.scene.add(this.mouse);
      }
      update(p) {
        const u = this.mouse.material.uniforms;
        u.force.value.set((Mouse.diff.x / 2) * p.mouse_force, (Mouse.diff.y / 2) * p.mouse_force);
        u.center.value.set(Math.min(Math.max(Mouse.coords.x, -1), 1), Math.min(Math.max(Mouse.coords.y, -1), 1));
        u.scale.value.set(p.cursor_size, p.cursor_size);
        super.update();
      }
    }

    class Divergence extends ShaderPass {
      constructor(p) { super({ material: { vertexShader: face_vert, fragmentShader: divergence_frag, uniforms: { boundarySpace: { value: p.boundarySpace }, velocity: { value: p.src.texture }, px: { value: p.cellScale }, dt: { value: p.dt } } }, output: p.dst }); }
      update(p) { this.uniforms.velocity.value = p.vel.texture; super.update(); }
    }

    class Poisson extends ShaderPass {
      constructor(p) { super({ material: { vertexShader: face_vert, fragmentShader: poisson_frag, uniforms: { boundarySpace: { value: p.boundarySpace }, pressure: { value: p.dst_.texture }, divergence: { value: p.src.texture }, px: { value: p.cellScale } } }, output: p.dst, output0: p.dst_, output1: p.dst }); }
      update(p) {
        let out;
        for (let i = 0; i < p.iterations; i++) {
          this.uniforms.pressure.value = (i % 2 === 0 ? this.props.output0 : this.props.output1).texture;
          out = this.props.output = i % 2 === 0 ? this.props.output1 : this.props.output0;
          super.update();
        }
        return out;
      }
    }

    class Pressure extends ShaderPass {
      constructor(p) { super({ material: { vertexShader: face_vert, fragmentShader: pressure_frag, uniforms: { boundarySpace: { value: p.boundarySpace }, pressure: { value: p.src_p.texture }, velocity: { value: p.src_v.texture }, px: { value: p.cellScale }, dt: { value: p.dt } } }, output: p.dst }); }
      update(p) { this.uniforms.velocity.value = p.vel.texture; this.uniforms.pressure.value = p.pressure.texture; super.update(); }
    }

    class Simulation {
      constructor(options) {
        this.options = { ...options }; this.fbos = { vel_0: null, vel_1: null, div: null, pressure_0: null, pressure_1: null };
        this.fboSize = new THREE.Vector2(); this.cellScale = new THREE.Vector2(); this.boundarySpace = new THREE.Vector2();
        this.init();
      }
      init() {
        const width = Math.max(1, Math.round(this.options.resolution * Common.width));
        const height = Math.max(1, Math.round(this.options.resolution * Common.height));
        this.cellScale.set(1.0 / width, 1.0 / height); this.fboSize.set(width, height);
        const opts = { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
        for (let key in this.fbos) this.fbos[key] = new THREE.WebGLRenderTarget(width, height, opts);
        this.advection = new Advection({ cellScale: this.cellScale, fboSize: this.fboSize, dt: this.options.dt, src: this.fbos.vel_0, dst: this.fbos.vel_1 });
        this.externalForce = new ExternalForce({ cellScale: this.cellScale, cursor_size: this.options.cursor_size, dst: this.fbos.vel_1 });
        this.divergence = new Divergence({ cellScale: this.cellScale, boundarySpace: this.boundarySpace, src: this.fbos.vel_1, dst: this.fbos.div, dt: this.options.dt });
        this.poisson = new Poisson({ cellScale: this.cellScale, boundarySpace: this.boundarySpace, src: this.fbos.div, dst: this.fbos.pressure_1, dst_: this.fbos.pressure_0 });
        this.pressure = new Pressure({ cellScale: this.cellScale, boundarySpace: this.boundarySpace, src_p: this.fbos.pressure_0, src_v: this.fbos.vel_1, dst: this.fbos.vel_0, dt: this.options.dt });
      }
      resize() {
        const width = Math.max(1, Math.round(this.options.resolution * Common.width));
        const height = Math.max(1, Math.round(this.options.resolution * Common.height));
        this.cellScale.set(1.0 / width, 1.0 / height); this.fboSize.set(width, height);
        for (let key in this.fbos) this.fbos[key].setSize(width, height);
      }
      update() {
        this.boundarySpace.copy(this.cellScale);
        this.advection.update({ dt: this.options.dt });
        this.externalForce.update({ cursor_size: this.options.cursor_size, mouse_force: this.options.mouse_force, cellScale: this.cellScale });
        this.divergence.update({ vel: this.fbos.vel_1 });
        const pressure = this.poisson.update({ iterations: this.options.iterations_poisson });
        this.pressure.update({ vel: this.fbos.vel_1, pressure });
      }
    }

    class WebGLManager {
      constructor(props) {
        Common.init(props.$wrapper); Mouse.init(props.$wrapper);
        this.autoDriver = new AutoDriver(Mouse, this, { enabled: props.autoDemo, speed: props.autoSpeed });
        this.simulation = new Simulation(props);
        this.outputScene = new THREE.Scene(); this.camera = new THREE.Camera();
        this.outputMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.RawShaderMaterial({ vertexShader: face_vert, fragmentShader: color_frag, transparent: true, depthWrite: false, uniforms: { velocity: { value: this.simulation.fbos.vel_0.texture }, palette: { value: paletteTex }, bgColor: { value: bgVec4 } } }));
        this.outputScene.add(this.outputMesh);
        props.$wrapper.prepend(Common.renderer.domElement);
        this._loop = this.loop.bind(this);
      }
      resize() { Common.resize(); this.simulation.resize(); }
      loop() {
        if (!this.running) return;
        if (this.autoDriver) this.autoDriver.update();
        Mouse.update(); Common.update(); this.simulation.update();
        Common.renderer.setRenderTarget(null); Common.renderer.render(this.outputScene, this.camera);
        rafRef.current = requestAnimationFrame(this._loop);
      }
      start() { if (!this.running) { this.running = true; this._loop(); } }
      pause() { this.running = false; if (rafRef.current) cancelAnimationFrame(rafRef.current); }
      dispose() { Mouse.dispose(); if (Common.renderer) Common.renderer.dispose(); }
    }

    const webgl = new WebGLManager({ $wrapper: mountRef.current, autoDemo, autoSpeed, resolution, dt, cursor_size: cursorSize, mouse_force: mouseForce, iterations_poisson: iterationsPoisson });
    webglRef.current = webgl;
    webgl.start();

    const ro = new ResizeObserver(() => webgl.resize());
    ro.observe(mountRef.current);
    
    return () => { webgl.pause(); webgl.dispose(); ro.disconnect(); };
  }, [colors, resolution, autoDemo]);

  return <div ref={mountRef} className={`liquid-ether-container ${className}`} style={style} />;
}