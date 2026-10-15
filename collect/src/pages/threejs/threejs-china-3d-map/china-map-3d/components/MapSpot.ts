import * as THREE from 'three'
import { mapConfig } from '../utils/mapConfig'

export interface SpotItem {
  coord: [number, number]
  properties: {
    name: string
    adcode: number
    level: string
    childrenNum?: number
    projectIndex?: number
    projectId?: string
  }
  /** 单个标记的独立缩放，优先级高于 SpotOptions.scale */
  scale?: number
  /** 标记上方文字，如"XX项目"或项目名称 */
  label?: string
  /** 标记颜色，优先级高于 SpotOptions */
  color?: string
}

export interface SpotOptions {
  /** 是否显示锥体标记 */
  showCone?: boolean
  /** 圆环颜色 */
  ringColor?: string
  /** 锥体颜色 */
  coneColor?: string
  /** 锥体高度 */
  coneHeight?: number
  /** Z 轴层级 */
  zIndex?: number
  /** 整体缩放 */
  scale?: number
  /** 锥体 X 轴旋转角度（弧度），默认 225° (5π/4)，俯视时用 π 展示侧面 */
  tilt?: number
  /** 圆环绕 X 轴倾角（弧度），以圆心为轴，默认 0（平贴 XY 平面） */
  ringTilt?: number
  /** 文字标签 Y 轴额外偏移 */
  labelYOffset?: number
  /** 文字标签字体大小 */
  labelFontSize?: number
  /** 标记整体 Y 轴偏移（世界坐标） */
  yOffset?: number
}

// 共享隐藏 DOM，精确测量文字宽度
let _measureEl: HTMLSpanElement | null = null
function _measureTextWidth(text: string, fontSize: number): number {
  if (!_measureEl) {
    _measureEl = document.createElement('span')
    _measureEl.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-weight:900;font-family:Roboto,sans-serif;pointer-events:none'
    document.body.appendChild(_measureEl)
  }
  _measureEl.style.fontSize = `${fontSize}px`
  _measureEl.textContent = text
  return _measureEl.offsetWidth
}

const defaultOptions: Required<SpotOptions> = {
  showCone: true,
  ringColor: '#66FFFF',
  coneColor: '#66FFFF',
  coneHeight: 4,
  zIndex: 0,
  scale: 1,
  tilt: Math.PI * 5 / 4,
  ringTilt: 0,
  labelYOffset: 0,
  labelFontSize: 90,
  yOffset: 0,
}

/**
 * 创建地图标记组（圆环 + 可选的锥体 + 点击热区）
 */
export function createSpotGroup(items: SpotItem[], opts: SpotOptions = {}): {
  group: THREE.Object3D
  rings: THREE.Mesh[]
} {
  const o = { ...defaultOptions, ...opts }
  const z = mapConfig.spotZIndex + o.zIndex
  const group = new THREE.Object3D()
  const rings: THREE.Mesh[] = []

  const ringGeo = new THREE.RingGeometry(0.6, 1.0, 64)
  const ringMat = new THREE.MeshBasicMaterial({
    color: o.ringColor,
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    opacity: 0.8,
  })

  const circleGeo = new THREE.CircleGeometry(0.6, 64)
  const circleMat = new THREE.MeshBasicMaterial({
    color: o.ringColor,
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false,
  })

  const hitGeo = new THREE.CircleGeometry(4, 32)
  const hitMat = new THREE.MeshBasicMaterial({
    color: o.ringColor,
    opacity: 0.01,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })

  const coneH = o.coneHeight
  let markerGeo: THREE.ConeGeometry | null = null
  let markerMat: THREE.ShaderMaterial | null = null
  if (o.showCone) {
    markerGeo = new THREE.ConeGeometry(1.5, coneH, 32, 1, true)

    markerMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(o.coneColor) },
      },
      vertexShader: `
        varying float vH;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vH = (position.y + ${(coneH / 2).toFixed(1)}) / ${coneH.toFixed(1)};
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vH;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;
        void main() {
          vec3 lightDir = normalize(vec3(0.5, -0.8, 1.0));
          float diff = max(dot(vWorldNormal, lightDir), 0.0);
          float fresnel = pow(1.0 - abs(dot(vWorldNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          float shading = diff * 0.5 + 0.5;
          vec3 dark = uColor * 0.35;
          vec3 mid = uColor;
          vec3 tip = mix(uColor, vec3(1.0), 0.35);
          vec3 col = mix(dark, mid, vH * 1.2);
          col = mix(col, tip, pow(vH, 3.0));
          col *= shading;
          col += fresnel * uColor * 0.3;
          float alpha = 0.35 + vH * 0.45 + fresnel * 0.15;
          gl_FragColor = vec4(col, alpha);
        }
      `,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
    })
  }

  const tilt = o.tilt

  const labelFontSize = o.labelFontSize
  const labelCanvasH = Math.ceil(labelFontSize * 1.2 + 10)

  for (const item of items) {
    const [x, y] = item.coord
    const s = item.scale ?? o.scale

    // 每个 spot 用子 group 包裹，scale 不偏移位置
    const spotGroup = new THREE.Object3D()
    spotGroup.position.set(x, -y + 0.5 * s + o.yOffset, z)
    if (s !== 1) spotGroup.scale.setScalar(s)

    const spotColor = item.color || o.ringColor
    const _ringMat = item.color ? ringMat.clone() : ringMat
    if (item.color) { _ringMat.color.set(spotColor); _ringMat.opacity = 0.9 }
    const _circleMat = item.color ? circleMat.clone() : circleMat
    if (item.color) _circleMat.color.set(spotColor)

    // 圆环 —— 平贴保持可见面积最大，点击由 hitArea 负责
    const ring = new THREE.Mesh(ringGeo, _ringMat)
    ring.renderOrder = 10
    ring.rotation.x = o.ringTilt
    ;(ring as any)._s = 1
    ring.userData = { isChangeColor: true, isSpot: true }
    ;(ring as any).customProperties = { ...item.properties }

    // 中心圆（填充环内孔，携带相同属性避免点击穿透）
    const circle = new THREE.Mesh(circleGeo, _circleMat)
    circle.renderOrder = 10
    circle.rotation.x = o.ringTilt
    circle.userData = { isChangeColor: true, isSpot: true }
    ;(circle as any).customProperties = { ...item.properties }

    // 点击热区 —— 大号透明圆，承担主要点击命中，Y 对齐锥尖
    const hitArea = new THREE.Mesh(hitGeo, hitMat)
    hitArea.renderOrder = 10
    // hitArea 不倾斜，保持平贴 XY 面保证俯视相机射线命中
    hitArea.userData = { isChangeColor: true, isSpot: true }
    ;(hitArea as any).customProperties = { ...item.properties }

    // 锥尖位置：环、中心圆、热区都对齐到这里
    let tipDy = 0
    if (markerGeo && markerMat) {
      tipDy = Math.cos(tilt) * coneH / 2
      ring.position.y = tipDy
      circle.position.y = tipDy
      hitArea.position.y = tipDy
    }

    spotGroup.add(hitArea, circle, ring)

    // 3D 文字标签（Canvas → Sprite），宽度按字数自适配
    if (item.label) {
      const labelCanvasW = Math.max(labelCanvasH, Math.ceil(_measureTextWidth(item.label, labelFontSize) + 10))
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = labelCanvasW; canvas.height = labelCanvasH
      const cw = canvas.width, ch = canvas.height
      // 条纹背景
      const stripeW = 10, gapW = 10
      ctx.fillStyle = 'rgba(102, 255, 255, 0.30)'
      for (let sx = 0; sx < cw; sx += stripeW + gapW) {
        ctx.fillRect(sx, 0, stripeW, ch)
      }
      // 四角装饰
      ctx.fillStyle = '#6FF'
      ctx.fillRect(0, 0, 10, 4)
      ctx.fillRect(cw - 10, 0, 10, 4)
      ctx.fillRect(0, ch - 4, 10, 4)
      ctx.fillRect(cw - 10, ch - 4, 10, 4)
      // 文字
      ctx.font = `900 ${labelFontSize}px Roboto, sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 4
      ctx.fillStyle = '#66FFFF'
      ctx.fillText(item.label, cw / 2, ch / 2)
      // Sprite
      const tex = new THREE.CanvasTexture(canvas)
      tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false })
      const sprite: any = new THREE.Sprite(spriteMat)
      sprite.renderOrder = 20
      // 让 Sprite 参与射线检测（默认不支持）
      sprite.raycast = function (raycaster: THREE.Raycaster, intersects: any[]) {
        const box = new THREE.Box3().setFromObject(sprite)
        if (raycaster.ray.intersectsBox(box)) {
          intersects.push({ distance: raycaster.ray.origin.distanceTo(sprite.getWorldPosition(new THREE.Vector3())), object: sprite, point: sprite.getWorldPosition(new THREE.Vector3()) })
        }
      }
      sprite.userData = { isChangeColor: true, isSpot: true }
      ;(sprite as any).customProperties = { ...item.properties }
      const spriteAspect = labelCanvasW / labelCanvasH
      const spriteH = 3
      const spriteW = spriteH * spriteAspect
      sprite.position.set(0, tipDy + 3.5 + (o.labelYOffset ?? 0), 0)
      sprite.scale.set(spriteW, spriteH, 1)
      spotGroup.add(sprite)
    }

    rings.push(ring)
    group.add(spotGroup)

    // 锥形标记
    if (markerGeo && markerMat) {
      const markerGroup = new THREE.Object3D()
      markerGroup.position.set(x, -y + 0.5 * s + o.yOffset, z)
      if (s !== 1) markerGroup.scale.setScalar(s)

      const _coneMat = markerMat.clone()
      if (item.color) _coneMat.uniforms.uColor.value.set(spotColor)
      const marker = new THREE.Mesh(markerGeo, _coneMat)
      marker.position.set(0, 0, Math.abs(Math.sin(tilt)) * coneH / 2)
      marker.rotation.x = tilt
      marker.renderOrder = 10
      markerGroup.add(marker)
      group.add(markerGroup)
    }
  }

  return { group, rings }
}
