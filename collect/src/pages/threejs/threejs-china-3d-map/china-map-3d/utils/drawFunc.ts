import * as THREE from 'three'
import * as d3 from 'd3'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { mapConfig } from './mapConfig'
import { extractOutline } from './outline'
import type { GeoJsonType, GeoJsonFeature, GeometryCoordinates, GeometryType, ExtendObject3D, ProjectionFnParam } from '../types'

export function getDynamicMapScale(
  mapObject3D: THREE.Object3D,
  containerRef: HTMLElement,
  divisor = 260,
): number {
  const width = containerRef.clientWidth
  const height = containerRef.clientHeight
  const refArea = width * height

  const boundingBox = new THREE.Box3().setFromObject(mapObject3D)
  const size = new THREE.Vector3()
  boundingBox.getSize(size)
  const autoScale = Math.sqrt(refArea / (size.x * size.y * divisor))
  return Math.max(autoScale, 1)
}

// 共享侧边 ShaderMaterial（所有省份使用相同 shader，避免重复编译）
let _sharedSideMaterial: THREE.ShaderMaterial | null = null
function getSharedSideMaterial(): THREE.ShaderMaterial {
  if (!_sharedSideMaterial) {
    _sharedSideMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color(mapConfig.mapSideColor1) },
        color2: { value: new THREE.Color(mapConfig.mapSideColor2) },
      },
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec3 vPosition;
        void main() {
          float t = 1.0 - vPosition.z / 6.0;
          vec3 mixColor = mix(color1, color2, t);
          gl_FragColor = vec4(mixColor, 1.0);
        }
      `,
    })
  }
  return _sharedSideMaterial
}

// 共享顶部 LineMaterial
let _sharedLineMaterial: LineMaterial | null = null
let _outlineMaterial: LineMaterial | null = null

function getSharedLineMaterial(): LineMaterial {
  if (!_sharedLineMaterial) {
    const lm = new (LineMaterial as any)({
      color: mapConfig.topLineColor,
      linewidth: mapConfig.topLineWidth,
    }) as LineMaterial
    lm.resolution.set(window.innerWidth, window.innerHeight)
    _sharedLineMaterial = lm
  }
  return _sharedLineMaterial
}

function getOutlineMaterial(): LineMaterial {
  if (!_outlineMaterial) {
    const lm = new (LineMaterial as any)({
      color: 0xBBEBFF,
      linewidth: 3,
      transparent: true,
      opacity: 0.8,
    }) as LineMaterial
    lm.resolution.set(window.innerWidth, window.innerHeight)
    _outlineMaterial = lm
  }
  return _outlineMaterial
}

export function drawExtrudeMesh(
  point: [number, number][],
  projectionFn: any,
  color: string,
): { mesh: THREE.Mesh; line: Line2 } {
  const shape = new THREE.Shape()
  const pointsArray: number[] = []

  for (let i = 0; i < point.length; i++) {
    const [x, y]: any = projectionFn(point[i])
    if (i === 0) {
      shape.moveTo(x, -y)
    }
    shape.lineTo(x, -y)
    pointsArray.push(x, -y, mapConfig.topLineZIndex)
  }

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: mapConfig.mapDepth,
    bevelEnabled: false,
  })

  const material = new THREE.MeshPhongMaterial({
    color,
    transparent: mapConfig.mapTransparent,
    opacity: mapConfig.mapOpacity,
  })

  const mesh: any = new THREE.Mesh(geometry, [material, getSharedSideMaterial()])
  mesh.userData = { isChangeColor: true }

  const lineGeometry = new LineGeometry()
  lineGeometry.setPositions(pointsArray)

  const line = new (Line2 as any)(lineGeometry, getSharedLineMaterial()) as Line2

  return { mesh, line }
}

/**
 * 分片创建地图 3D 对象，每 batchSize 个省份 yield 给浏览器一帧
 * 避免一次性同步创建所有几何体造成的长时间主线程阻塞（"卡顿"）
 */
export async function generateMapObject3D(
  mapdata: GeoJsonType,
  projectionFnParam: ProjectionFnParam,
  batchSize = 6,
  gradTexture?: THREE.Texture | null,
): Promise<{ mapObject3D: THREE.Object3D; label2dData: any[] }> {
  const mapObject3D = new THREE.Object3D()
  const { features: basicFeatures } = mapdata
  const { center, scale } = projectionFnParam

  const projectionFn = d3
    .geoMercator()
    .center(center)
    .scale(scale)
    .translate([0, 0])

  const label2dData: any[] = []

  function processFeature(basicFeatureItem: GeoJsonFeature) {
    const provinceMapObject3D = new THREE.Object3D() as ExtendObject3D
    provinceMapObject3D.customProperties = basicFeatureItem.properties

    const featureType = basicFeatureItem.geometry.type
    const featureCoords: GeometryCoordinates<GeometryType> =
      basicFeatureItem.geometry.coordinates
    const featureCenterCoord: any =
      basicFeatureItem.properties.centroid &&
      projectionFn(basicFeatureItem.properties.centroid)
    const featureName: string = basicFeatureItem.properties.name

    if (featureCenterCoord) {
      label2dData.push({
        featureCenterCoord,
        featureName,
        _adcode: basicFeatureItem.properties.adcode,
        name: basicFeatureItem.properties.name,
        level: basicFeatureItem.properties.level,
        childrenNum: basicFeatureItem.properties.childrenNum,
      })
    }

    if (featureType === 'MultiPolygon') {
      ;(featureCoords as [number, number][][][]).forEach((multiPolygon) => {
        multiPolygon.forEach((polygon) => {
          const { mesh, line } = drawExtrudeMesh(polygon, projectionFn, mapConfig.mapColor)
          provinceMapObject3D.add(mesh)
          provinceMapObject3D.add(line as any)
        })
      })
    }

    if (featureType === 'Polygon') {
      ;(featureCoords as [number, number][][]).forEach((polygon) => {
          const { mesh, line } = drawExtrudeMesh(polygon, projectionFn, mapConfig.mapColor)
        provinceMapObject3D.add(mesh)
        provinceMapObject3D.add(line as any)
      })
    }

    mapObject3D.add(provinceMapObject3D)
  }

  // 第一遍：计算边界（用于覆盖平面定位）
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const feature of basicFeatures) {
    const coords = feature.geometry.coordinates
    function visit(pt: unknown) {
      if (Array.isArray(pt) && typeof pt[0] === 'number') {
        const [px, py]: any = projectionFn([pt[0], pt[1]])
        if (px < minX) minX = px; if (px > maxX) maxX = px
        if (-py < minY) minY = -py; if (-py > maxY) maxY = -py
      } else if (Array.isArray(pt)) for (const item of pt) visit(item)
    }
    visit(coords)
  }

  for (let i = 0; i < basicFeatures.length; i++) {
    processFeature(basicFeatures[i])
    if ((i + 1) % batchSize === 0 && i + 1 < basicFeatures.length) {
      await new Promise((resolve) => requestAnimationFrame(resolve))
    }
  }

  // 覆盖平面：stencil 裁剪，只在地图轮廓内显示
  if (gradTexture) {
    const pw = maxX - minX, ph = maxY - minY

    // 省面写 stencil
    mapObject3D.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.userData?.isChangeColor && mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        for (const m of mats) {
          if (m instanceof THREE.MeshPhongMaterial) {
            m.stencilWrite = true; m.stencilRef = 1
            m.stencilFunc = THREE.AlwaysStencilFunc
            m.stencilFail = m.stencilZFail = m.stencilZPass = THREE.ReplaceStencilOp
          }
        }
      }
    })

    const mk = (t: THREE.Texture, z: number, op: number, o: number) => {
      const g = new THREE.PlaneGeometry(pw, ph)
      const m = new THREE.MeshBasicMaterial({
        map: t, transparent: true, opacity: op, depthWrite: false, depthTest: true,
        stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc,
        stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp,
      })
      const mesh = new THREE.Mesh(g, m)
      mesh.position.set((minX + maxX) / 2, (minY + maxY) / 2, z)
      mesh.renderOrder = o; mesh.raycast = () => {}
      mapObject3D.add(mesh)
    }
    mk(gradTexture, mapConfig.mapDepth + 0.05, 0.7, 2)

    // 国界线（所有省份的共用外轮廓，用相同样式绘制）
    const outlineRings = extractOutline(mapdata)
    if (outlineRings) {
      for (const ring of outlineRings) {
        const pts: number[] = []
        for (const [lng, lat] of ring) {
          const [px, py]: any = projectionFn([lng, lat])
          pts.push(px, -py, mapConfig.topLineZIndex)
        }
        const olGeo = new LineGeometry(); olGeo.setPositions(pts)
        const olLine = new (Line2 as any)(olGeo, getOutlineMaterial()) as Line2
        olLine.renderOrder = 4; mapObject3D.add(olLine as any)
      }
    }
  }

  return { mapObject3D, label2dData }
}

export function generateMapLabel2D(label2dData: any[]): THREE.Object3D {
  const labelObject2D = new THREE.Object3D()
  label2dData.forEach((item: any) => {
    const { featureCenterCoord, featureName } = item
    const labelObjectItem = draw2dLabel(featureCenterCoord, featureName)
    if (labelObjectItem) {
      labelObject2D.add(labelObjectItem)
    }
  })
  return labelObject2D
}

export const draw2dLabel = (coord: [number, number], provinceName: string): CSS2DObject | undefined => {
  if (coord && coord.length) {
    const innerHTML = `<div class="china-map-label" style="color: #fff; font-size: 12px">${provinceName}</div>`
    const labelDiv = document.createElement('div')
    labelDiv.innerHTML = innerHTML
    labelDiv.style.pointerEvents = 'none'
    const labelObject = new (CSS2DObject as any)(labelDiv) as CSS2DObject
    labelObject.position.set(coord[0], -coord[1], mapConfig.label2dZIndex)
    return labelObject
  }
  return undefined
}

export function generateMapSpot(label2dData: any[]): { spotObject3D: THREE.Object3D; spotList: any[] } {
  const spotObject3D = new THREE.Object3D()
  const spotList: any[] = []
  label2dData.forEach((item: any) => {
    const spot = drawSpot(item)
    if (spot) {
      spotObject3D.add(spot.hitArea)
      spotObject3D.add(spot.circle)
      spotObject3D.add(spot.ring)
      spotList.push(spot.ring)
    }
  })
  return { spotObject3D, spotList }
}

export const drawSpot = (item: any): { circle: THREE.Mesh; ring: any; hitArea: THREE.Mesh } | undefined => {
  const coord = item.featureCenterCoord as [number, number]
  if (!coord?.length) return undefined
  const circleGeo = new THREE.CircleGeometry(0.6, 64)
  const circleMat = new THREE.MeshBasicMaterial({ color: '#66FFFF', side: THREE.DoubleSide, depthTest: false, depthWrite: false })
  const circle = new THREE.Mesh(circleGeo, circleMat)
  circle.position.set(coord[0], -coord[1], mapConfig.spotZIndex + 0.3)
  circle.renderOrder = 10
  const ringGeo = new THREE.RingGeometry(0.6, 1.0, 64)
  const ringMat = new THREE.MeshBasicMaterial({ color: '#66FFFF', side: THREE.DoubleSide, depthTest: false, depthWrite: false, transparent: true, opacity: 0.8 })
  const ring: any = new THREE.Mesh(ringGeo, ringMat)
  ring.position.set(coord[0], -coord[1], mapConfig.spotZIndex + 0.3)
  ring.renderOrder = 10
  ring._s = 1
  ring.userData = { isChangeColor: true, isSpot: true }
  ring.customProperties = {
    name: item.name || item.featureName || item._adcode,
    adcode: item._adcode,
    level: item.level || 'city',
    childrenNum: item.childrenNum || 0,
  }
  // 不可见大热区，方便点击
  const hitGeo = new THREE.CircleGeometry(2.5, 32)
  const hitMat = new THREE.MeshBasicMaterial({ visible: false, depthTest: false, depthWrite: false })
  const hitArea = new THREE.Mesh(hitGeo, hitMat)
  hitArea.position.copy(ring.position)
  hitArea.renderOrder = ring.renderOrder
  hitArea.userData = { isChangeColor: true, isSpot: true }
  hitArea.customProperties = ring.customProperties
  return { circle, ring, hitArea }
}

// 飞线发光贴图（径向渐变，白色核心 + 青色外晕），用于彗星头/尾的 Sprite
let _glowTex: THREE.Texture | null = null
export function getGlowTexture(): THREE.Texture {
  if (!_glowTex) {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0.0, 'rgba(255,255,255,1)')
    g.addColorStop(0.25, 'rgba(180,255,255,0.9)')
    g.addColorStop(0.55, 'rgba(54,224,255,0.35)')
    g.addColorStop(1.0, 'rgba(54,224,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    _glowTex = new THREE.CanvasTexture(c)
  }
  return _glowTex
}

// 飞线共用粗线材质（Line2 屏幕像素宽度 + 顶点色 + 加法混合，配合 Bloom 发光）
let _flyLineMat: any = null
export function getFlyLineMaterial(): any {
  if (!_flyLineMat) {
    const lm = new (LineMaterial as any)({
      vertexColors: true,
      linewidth: 3.2,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      dashed: false,
    }) as any
    lm.resolution.set(window.innerWidth, window.innerHeight)
    _flyLineMat = lm
  }
  return _flyLineMat
}

// 窗口尺寸变化时同步飞线材质分辨率（Line2 必须）
export function setFlyLineResolution(w: number, h: number) {
  if (_flyLineMat) _flyLineMat.resolution.set(w, h)
}

const FLY_START_COLOR = new THREE.Color('#36e0ff') // 青
const FLY_END_COLOR = new THREE.Color('#7CFC00')   // 绿

export const drawFlySpot = (curve: THREE.QuadraticBezierCurve3): any => {
  // 彗星：头部白青强光 Sprite + 尾部青色拖尾 Sprite，沿曲线运动
  const group: any = new THREE.Group()
  const head = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: getGlowTexture(),
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    }),
  )
  head.scale.set(3.2, 3.2, 1)
  const tail = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: getGlowTexture(),
      color: 0x36e0ff,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    }),
  )
  tail.scale.set(2.0, 2.0, 1)
  group.add(head)
  group.add(tail)
  group.curve = curve
  group._s = 0
  group.userData = { tail }
  return group
}

export const drawLineBetween2Spot = (
  coordStart: [number, number],
  coordEnd: [number, number],
): { flyLine: THREE.Line2; flySpot: any } => {
  const [x0, y0] = coordStart
  const [x1, y1] = coordEnd
  const z = mapConfig.spotZIndex
  const dist = Math.hypot(x1 - x0, y1 - y0)
  // 弧长越大拱得越高，立体感更强
  const arcZ = 14 + Math.min(40, dist * 0.18)
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(x0, -y0, z),
    new THREE.Vector3((x0 + x1) / 2, -(y0 + y1) / 2, arcZ),
    new THREE.Vector3(x1, -y1, z),
  )

  const flySpot = drawFlySpot(curve)

  // 粗发光弧线（Line2 + 顶点色渐变 青→绿）
  const pts = curve.getPoints(60)
  const positions: number[] = []
  const colors: number[] = []
  const tmp = new THREE.Color()
  for (let j = 0; j < pts.length; j++) {
    const t = j / (pts.length - 1)
    tmp.copy(FLY_START_COLOR).lerp(FLY_END_COLOR, t)
    colors.push(tmp.r, tmp.g, tmp.b)
    positions.push(pts[j].x, pts[j].y, pts[j].z)
  }
  const lineGeo = new (LineGeometry as any)()
  lineGeo.setPositions(positions)
  lineGeo.setColors(colors)
  const flyLine = new (Line2 as any)(lineGeo, getFlyLineMaterial()) as THREE.Line2
  flyLine.renderOrder = 20

  return { flyLine, flySpot }
}
