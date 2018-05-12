import { FogExp2, Color, Mesh, PlaneBufferGeometry, MeshBasicMaterial, Matrix4, Vector3 } from 'three';
import ThreeApp from '@jsantell/three-app';
import BarycentricMaterial from './lib/BarycentricMaterial.js';
import noisyBarycentricVertexShader from './lib/noisy-barycentric-vert.glsl';
import WAGNER from './lib/wagner/index.js';
import BloomPass from './lib/wagner/src/passes/bloom/MultiPassBloomPass';
import VPass from './lib/wagner/src/passes/vignette/VignettePass.js';

const CYCLE_TIME = 1000;
const MOVEMENT = 10;
const MOUNTAIN_NOISE_MOD = 0.2;
const MOUNTAIN_POS_DAMPEN = 0.004;
const MOUNTAIN_DEFORM_SPEED = 0.00003;

class App extends ThreeApp {
  init() {

    /* Create grid */

    const gridGeo = new PlaneBufferGeometry(1, 1, 10, 10);
    gridGeo.applyMatrix(new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), Math.PI / -2));
    BarycentricMaterial.applyBarycentricCoordinates(gridGeo);

    const gridMat = new BarycentricMaterial({
      color: new Color(0x222222),
      wireframeColor: new Color(0x46d6fd),
      alpha: 1.0,
      wireframeAlpha: 1.0,
      width: 2,
    });

    this.grid = new Mesh(gridGeo, gridMat);
    this.grid.scale.multiplyScalar(100);
    this.grid.position.z = -50;
    this.scene.add(this.grid);

    /* create mountains */

    // The barycentric material only works with certain combinations
    // of vertices. For some reason, this current one doesn't "work",
    // resulting in a more solid look, which turned out pretty cool,
    // so keeping it.
    const mountainGeo = new PlaneBufferGeometry(2, 1, 20, 10);
    mountainGeo.applyMatrix(new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), Math.PI / -2.5));
    BarycentricMaterial.applyBarycentricCoordinates(mountainGeo);

    const mountainMat = new BarycentricMaterial({
      color: new Color(0x222222),
      wireframeColor: new Color(0xb450ce),
      alpha: 1,
      wireframeAlpha: 1,
      width: 2,
      vertexShader: noisyBarycentricVertexShader,
    });
    mountainMat.uniforms.noiseMod = { value: MOUNTAIN_NOISE_MOD };
    mountainMat.uniforms.posDampen = { value: MOUNTAIN_POS_DAMPEN };
    mountainMat.uniforms.time = { value: 0 };
    mountainMat.uniformsNeedUpdate = true;

    this.mountain = new Mesh(mountainGeo, mountainMat);
    this.mountain.scale.multiplyScalar(100);
    this.mountain.position.z = -100;
    this.scene.add(this.mountain);

    /* scene settings */

    this.composer = new WAGNER.Composer(this.renderer);
    this.pass = new BloomPass({
      blurAmount: 0.4,
      applyZoomBlur: true,
      zoomBlurStrength: 4,
    });
    this.vpass = new VPass(2, 1.5);

    this.camera.position.y = 5;

    this.lastCycle = 0;
  }

  update(t, delta) {
    if ((t - this.lastCycle) > CYCLE_TIME) {
      this.grid.position.z = -50;
      this.lastCycle = t;
    } else {
      this.grid.position.z += delta * MOVEMENT * 0.001;
    }
    this.grid.position.x = Math.sin(t * 0.001) * 2;
    this.mountain.material.uniforms.time.value = t * MOUNTAIN_DEFORM_SPEED;
  }

  render() {
    this.composer.reset();
    this.composer.render(this.scene, this.camera);
    this.composer.pass(this.pass);
    this.composer.pass(this.vpass);
    this.composer.toScreen();
  }
}

window.app = new App();
