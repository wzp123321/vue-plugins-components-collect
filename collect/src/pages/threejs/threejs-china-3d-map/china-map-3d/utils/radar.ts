import * as THREE from 'three'

export interface RadarOption {
  position: THREE.Vector3
  radius: number
  color: string
  opacity: number
  angle: number
  speed: number
}

export const radarData: RadarOption[] = [
  {
    position: new THREE.Vector3(0, 0, 0),
    radius: 50,
    color: '#0A1E70',
    opacity: 0.5,
    angle: Math.PI * 2,
    speed: 2,
  },
  {
    position: new THREE.Vector3(0, 0, 0),
    radius: 30,
    color: '#C2C4D6',
    opacity: 0.5,
    angle: Math.PI * 2,
    speed: 2,
  },
]

const vertexShader = `
precision mediump float;
precision highp int;

varying vec2 vPosition;
void main () {
    vPosition = vec2(position.x, position.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const fragmentShader = `
precision mediump float;
precision highp int;

uniform float uTime;
uniform float u_radius;
uniform float u_speed;
uniform float u_opacity;
uniform float u_width;
uniform vec3 u_color;

varying vec2 vPosition;
#define PI 3.14159265359

void main () {
    float currentRadius = u_speed * uTime;
    float angle = atan(vPosition.y, vPosition.x) + PI;
    float angleT = mod(currentRadius + angle, PI * 2.0);
    float dist = distance(vec2(0.0, 0.0), vPosition);
    
    float tempOpacity = 0.0;
    float circleWidth = 5.0;
    if (dist < u_radius && dist > u_radius - circleWidth) {
        float pct = smoothstep(u_radius - circleWidth, u_radius, dist);
        tempOpacity = sin(pct * PI);
    }

    if (dist < (u_radius - 5.0)) {
        tempOpacity = 1.0 - angleT / u_width;
    }

    gl_FragColor = vec4(u_color, u_opacity * tempOpacity);
}`

export function drawRadar(options: RadarOption, ratio: { value: number }) {
  const { position, radius, color, opacity, speed, angle } = options
  const size = radius * 2
  const plane = new THREE.PlaneGeometry(size, size)
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: ratio,
      u_radius: { value: radius },
      u_speed: { value: speed },
      u_opacity: { value: opacity },
      u_width: { value: angle },
      u_color: { value: new THREE.Color(color) },
    },
    vertexShader,
    fragmentShader,
  })
  const planeMesh = new THREE.Mesh(plane, material)
  planeMesh.position.copy(position)
  return planeMesh
}
