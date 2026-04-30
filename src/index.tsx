import type { PluginFactory, PostRecord } from '@obieg-zero/sdk'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceRadial, forceCollide, type Simulation } from 'd3-force'
import { zoom as d3zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom'
import { drag as d3drag } from 'd3-drag'
import { select } from 'd3-selection'

type SimNode = { id: string; nid: string; tier: number; branch: string; x: number; y: number; vx?: number; vy?: number; fx?: number | null; fy?: number | null }
type SimLink = { source: string | SimNode; target: string | SimNode; count?: number; relation?: string; strength?: number; kind: 'struct' | 'context' | 'flash' }

const GH_API = 'https://api.github.com'
const GH_RAW = 'https://raw.githubusercontent.com'

const plugin: PluginFactory = ({ React, ui, store, sdk, icons }) => {
  const { useState, useMemo, useCallback, useRef, useEffect } = React
  const { Award, X, Zap, BookOpen } = icons

  store.registerType('tree', [
    { key: 'title', label: 'Tytuł', required: true },
    { key: 'repo', label: 'Repo' },
  ], 'Drzewa wiedzy')
  store.registerType('branch', [
    { key: 'key', label: 'Klucz', required: true },
    { key: 'label', label: 'Etykieta', required: true },
    { key: 'color', label: 'Kolor' },
  ], 'Gałęzie')
  store.registerType('relType', [
    { key: 'key', label: 'Klucz', required: true },
    { key: 'label', label: 'Etykieta', required: true },
    { key: 'color', label: 'Kolor' },
  ], 'Typy relacji')
  store.registerType('node', [
    { key: 'nodeId', label: 'ID', required: true },
    { key: 'title', label: 'Tytuł', required: true },
    { key: 'branch', label: 'Gałąź' },
    { key: 'tier', label: 'Poziom' },
    { key: 'hits', label: 'Odkrycia' },
  ], 'Węzły')
  store.registerType('edge', [
    { key: 'fromNid', label: 'Od (nodeId)', required: true },
    { key: 'toNid', label: 'Do (nodeId)', required: true },
    { key: 'type', label: 'Typ' },
  ], 'Krawędzie')
  store.registerType('content', [
    { key: 'contentType', label: 'Typ', required: true },
    { key: 'text', label: 'Tekst', required: true },
    { key: 'answer', label: 'Odpowiedź' },
  ], 'Treści')
  store.registerType('lexicon', [
    { key: 'term', label: 'Termin', required: true },
    { key: 'definition', label: 'Definicja', required: true },
    { key: 'category', label: 'Kategoria' },
    { key: 'relation', label: 'Relacja' },
  ], 'Leksykon')
  store.registerType('lexNode', [
    { key: 'nid', label: 'NodeId', required: true },
  ], 'Powiązania term↔węzeł')
  store.registerType('form', [
    { key: 'value', label: 'Forma', required: true },
  ], 'Formy gramatyczne')
  store.registerType('quiz', [
    { key: 'question', label: 'Pytanie', required: true },
    { key: 'answer', label: 'Odpowiedź', required: true },
    { key: 'wrong1', label: 'Dystraktor 1' },
    { key: 'wrong2', label: 'Dystraktor 2' },
    { key: 'wrong3', label: 'Dystraktor 3' },
    { key: 'hint', label: 'Wskazówka' },
  ], 'Quizy')

  // Taksonomia relacji — per-tree (tree.data.relations), nieznane → fallback
  const FALLBACK_REL = { label: 'inne', color: 'neutral' }
  type RelDef = { label: string; color: string }

  // Semantic token → CSS var. Akceptuje też raw hex/var dla backward compat.
  const DAISY_TOKENS = new Set(['primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error', 'neutral', 'base-100', 'base-200', 'base-300', 'base-content'])
  const tok = (name: string): string => {
    if (!name) return 'var(--color-neutral)'
    if (name.startsWith('#') || name.startsWith('var(') || name.startsWith('rgb')) return name
    if (DAISY_TOKENS.has(name)) return `var(--color-${name})`
    return 'var(--color-neutral)'
  }
  store.registerType('discovery', [
    { key: 'termId', label: 'Termin', required: true },
    { key: 'hits', label: 'Odkrycia' },
    { key: 'firstSeen', label: 'Pierwsze' },
    { key: 'lastSeen', label: 'Ostatnie' },
  ], 'Odkrycia')

  // --- shared helpers (used by reader + arena) ---
  const edgeStr = (disc: PostRecord) => {
    const hits = Number(disc.data.hits) || 0
    const lastSeen = Number(disc.data.lastSeen) || Date.now()
    const days = (Date.now() - lastSeen) / 864e5
    return Math.min(hits / 5, 1) * Math.exp(-0.1 * days)
  }

  const discover = (termId: string) => {
    const all = store.getPosts('discovery') as PostRecord[]
    const existing = all.find(d => d.data.termId === termId)
    const now = Date.now()
    if (existing) {
      store.update(existing.id, { hits: (Number(existing.data.hits) || 0) + 1, lastSeen: now })
    } else {
      store.add('discovery', { termId, hits: 1, firstSeen: now, lastSeen: now })
    }
  }

  const unlockNode = (postId: string) => {
    const n = store.get(postId)
    if (n) store.update(postId, { hits: Math.min((Number(n.data.hits) || 0) + 1, 5) })
  }

  // bqHelpers ustawiane po definicji loadNodeContent poniżej

  // Hook: buduje mapy lexNode/form/quiz raz, używany w każdym pluginie BQ
  const useLexMaps = () => {
    const lexNodes = store.usePosts('lexNode') as PostRecord[]
    const forms = store.usePosts('form') as PostRecord[]
    const quizzes = store.usePosts('quiz') as PostRecord[]
    return useMemo(() => buildLexMaps(lexNodes, forms, quizzes), [lexNodes, forms, quizzes])
  }

  // Buduje mapy z dzieci leksykonu (lexNode/form/quiz) — zastępuje parsowanie JSON-stringów
  const buildLexMaps = (lexNodes: PostRecord[], forms: PostRecord[], quizzes: PostRecord[]) => {
    const nidMap = new Map<string, string[]>()
    for (const ln of lexNodes) {
      const lid = ln.parentId || ''
      if (!lid) continue
      const arr = nidMap.get(lid) || []
      arr.push(String(ln.data.nid))
      nidMap.set(lid, arr)
    }
    const formMap = new Map<string, string[]>()
    for (const f of forms) {
      const lid = f.parentId || ''
      if (!lid) continue
      const arr = formMap.get(lid) || []
      arr.push(String(f.data.value))
      formMap.set(lid, arr)
    }
    const quizMap = new Map<string, PostRecord>()
    for (const q of quizzes) {
      const lid = q.parentId || ''
      if (lid) quizMap.set(lid, q)
    }
    return { nidMap, formMap, quizMap }
  }

  // --- state ---
  const useNav = sdk.create(() => ({
    treeId: null as string | null,
    sel: null as string | null,
    phase: 'map' as 'map' | 'detail',
  }))

  const str = (n: PostRecord) => Math.min((Number(n.data.hits) || 0) / 5, 1)
  const jparse = <T,>(s: string, fb: T): T => { try { return JSON.parse(s) } catch { return fb } }


  // --- skill tree (fog of war) ---
  function SkillTree() {
    const { treeId, sel, phase } = useNav()
    const tree = store.usePost(treeId || '')
    const nodes = store.useChildren(treeId || '', 'node') as PostRecord[]
    const [revealed, setRevealed] = useState<Set<string>>(() => new Set())
    // Reset revealed przy zmianie drzewa — zapobiega leak'owi przez sesję
    useEffect(() => { setRevealed(new Set()) }, [treeId])

    // Odkryte połączenia z readera — limitowane do ostatnich 10
    const flash = sdk.shared((s: any) => s?.bqFlash) as { fromNid?: string; toNid?: string } | null
    const [discoveredPairs, setDiscoveredPairs] = useState<{ fromNid: string; toNid: string; fresh: boolean }[]>([])
    useEffect(() => { setDiscoveredPairs([]) }, [treeId])
    useEffect(() => {
      if (!flash || !flash.fromNid || !flash.toNid) return
      const fromNid = flash.fromNid, toNid = flash.toNid
      setDiscoveredPairs(prev => {
        const same = (p: { fromNid: string; toNid: string }) =>
          (p.fromNid === fromNid && p.toNid === toNid) || (p.fromNid === toNid && p.toNid === fromNid)
        if (prev.some(same)) return prev.map(p => same(p) ? { ...p, fresh: true } : p)
        return [...prev.map(p => ({ ...p, fresh: false })), { fromNid, toNid, fresh: true }].slice(-10)
      })
      sdk.shared.setState({ bqFlash: null })
    }, [flash])

    const edgeRecords = store.useChildren(treeId || '', 'edge') as PostRecord[]
    const branchRecords = store.useChildren(treeId || '', 'branch') as PostRecord[]
    const relTypeRecords = store.useChildren(treeId || '', 'relType') as PostRecord[]
    const edges = useMemo(() => edgeRecords.map(e => ({ from: String(e.data.fromNid), to: String(e.data.toNid) })), [edgeRecords])
    const branches = useMemo(() => {
      const m: Record<string, { label: string; color: string }> = {}
      for (const b of branchRecords) m[String(b.data.key)] = { label: String(b.data.label), color: String(b.data.color || 'neutral') }
      return m
    }, [branchRecords])
    const relations = useMemo(() => {
      const m: Record<string, RelDef> = {}
      for (const r of relTypeRecords) m[String(r.data.key)] = { label: String(r.data.label), color: String(r.data.color || 'neutral') }
      return m
    }, [relTypeRecords])
    const relDef = (r: string): RelDef => relations[r] || FALLBACK_REL

    const adj = useMemo(() => {
      const a = new Map<string, Set<string>>()
      for (const e of edges) {
        if (!a.has(e.from)) a.set(e.from, new Set()); if (!a.has(e.to)) a.set(e.to, new Set())
        a.get(e.from)!.add(e.to); a.get(e.to)!.add(e.from)
      }
      return a
    }, [edges])

    const { visible, frontier, discovered } = useMemo(() => {
      const disc = new Set<string>()
      for (const n of nodes) if (Number(n.data.hits) > 0) disc.add(String(n.data.nodeId))
      if (!disc.size) {
        const root = [...nodes].sort((a, b) => Number(a.data.tier) - Number(b.data.tier))[0]
        if (root) return { visible: new Set([String(root.data.nodeId)]), frontier: new Set([String(root.data.nodeId)]), discovered: disc }
        return { visible: new Set<string>(), frontier: new Set<string>(), discovered: disc }
      }
      const vis = new Set(disc)
      const front = new Set<string>()
      for (const nid of disc) for (const nb of adj.get(nid) || []) if (!disc.has(nb)) { vis.add(nb); front.add(nb) }
      return { visible: vis, frontier: front, discovered: disc }
    }, [nodes, adj])

    const rootNid = useMemo(() => {
      const sorted = [...nodes].sort((a, b) => Number(a.data.tier) - Number(b.data.tier))
      return sorted[0] ? String(sorted[0].data.nodeId) : null
    }, [nodes])

    // context edges: discovered terms with 2+ nodes → golden lines between those nodes
    const discoveries = store.usePosts('discovery') as PostRecord[]
    const terms = store.useChildren(treeId || '', 'lexicon') as PostRecord[]
    const { nidMap } = useLexMaps()
    const contextEdges = useMemo(() => {
      const discoveredTermIds = new Set(discoveries.map(d => String(d.data.termId)))
      if (!discoveredTermIds.size) return [] as { from: string; to: string; strength: number; relation: string; count: number }[]
      // key → { counts per relation, total }
      const map = new Map<string, { from: string; to: string; rels: Map<string, number> }>()
      for (const term of terms) {
        if (!discoveredTermIds.has(term.id)) continue
        const termNodes = nidMap.get(term.id) || []
        if (termNodes.length < 2) continue
        const rel = String(term.data.relation || 'inne')
        for (let i = 0; i < termNodes.length; i++)
          for (let j = i + 1; j < termNodes.length; j++) {
            if (!visible.has(termNodes[i]) || !visible.has(termNodes[j])) continue
            const [a, b] = [termNodes[i], termNodes[j]].sort()
            const key = `${a}:${b}`
            if (!map.has(key)) map.set(key, { from: a, to: b, rels: new Map() })
            const entry = map.get(key)!
            entry.rels.set(rel, (entry.rels.get(rel) || 0) + 1)
          }
      }
      // Dla każdej pary wybierz dominujący typ relacji
      const out: { from: string; to: string; strength: number; relation: string; count: number }[] = []
      for (const { from, to, rels } of map.values()) {
        let best = 'inne', bestCount = 0, total = 0
        for (const [r, c] of rels) { total += c; if (c > bestCount) { best = r; bestCount = c } }
        out.push({ from, to, relation: best, count: total, strength: Math.min(0.4 + total * 0.15, 0.9) })
      }
      return out
    }, [discoveries, terms, visible, nidMap])

    // "Co dalej?" — węzeł-sugestia do wypulsowania
    const nextNid = useMemo(() => {
      const discNodeIds = new Set(nodes.filter(n => Number(n.data.hits) > 0).map(n => String(n.data.nodeId)))
      if (!discNodeIds.size) return rootNid
      const scores = new Map<string, number>()
      for (const t of terms) {
        const tn = nidMap.get(t.id) || []
        if (!tn.some(x => discNodeIds.has(x))) continue
        for (const x of tn) if (!discNodeIds.has(x)) scores.set(x, (scores.get(x) || 0) + 1)
      }
      let best = '', bs = 0
      for (const [k, v] of scores) if (v > bs) { best = k; bs = v }
      return best || rootNid
    }, [nodes, terms, rootNid, nidMap])

    // theme colors (daisyUI 5 CSS vars)
    const C = {
      bg: 'var(--color-base-100)', surface: 'var(--color-base-200)', edge: 'var(--color-base-content)',
      warn: 'var(--color-warning)', primary: 'var(--color-primary)',
      text: 'var(--color-base-content)', muted: 'var(--color-base-300)',
    }

    const visNodes = useMemo(() => nodes.filter(n => visible.has(String(n.data.nodeId))), [nodes, visible])
    const visEdges = useMemo(() => edges.filter(e => visible.has(e.from) && visible.has(e.to)), [edges, visible])

    // ── d3-force: żywa konstelacja ─────────────────────────────────
    // Idiom: React renderuje strukturę raz, d3 mutuje SVG attrs on tick (zero re-renderów)
    const svgRef = useRef<SVGSVGElement>(null)
    const gRef = useRef<SVGGElement>(null)
    const simRef = useRef<Simulation<SimNode, SimLink> | null>(null)
    const simNodesRef = useRef<Map<string, SimNode>>(new Map())
    const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)

    // Buduj/aktualizuj węzły symulacji — zachowuj pozycje istniejących
    const simNodes = useMemo<SimNode[]>(() => {
      const out: SimNode[] = []
      const map = simNodesRef.current
      for (const n of visNodes) {
        const nid = String(n.data.nodeId)
        const branch = String(n.data.branch || '')
        const existing = map.get(nid)
        const tier = Number(n.data.tier) || 0
        if (existing) {
          existing.tier = tier
          existing.branch = branch
          out.push(existing)
        } else {
          // Nowy węzeł — rozsuń lekko od centrum w losowym kierunku, ale na właściwym tierze
          const angle = Math.random() * Math.PI * 2
          const r = tier * 180 + 40
          const node: SimNode = { id: n.id, nid, tier, branch, x: Math.cos(angle) * r, y: Math.sin(angle) * r }
          map.set(nid, node)
          out.push(node)
        }
      }
      // Sprzątanie usuniętych
      const visibleNids = new Set(visNodes.map(n => String(n.data.nodeId)))
      for (const k of map.keys()) if (!visibleNids.has(k)) map.delete(k)
      return out
    }, [visNodes])

    // Linki strukturalne (tier→tier) — siła trzymająca układ chronologiczny
    const structLinks = useMemo<SimLink[]>(() =>
      visEdges
        .filter(e => simNodesRef.current.has(e.from) && simNodesRef.current.has(e.to))
        .map(e => ({ source: e.from, target: e.to, kind: 'struct' as const })),
      [visEdges]
    )

    // Linki kontekstowe (z odkrytych terminów) — TO przyciąga lektury które dzielą motywy
    const contextLinks = useMemo<SimLink[]>(() =>
      contextEdges
        .filter(ce => simNodesRef.current.has(ce.from) && simNodesRef.current.has(ce.to))
        .map(ce => ({ source: ce.from, target: ce.to, count: ce.count, relation: ce.relation, strength: ce.strength, kind: 'context' as const })),
      [contextEdges]
    )

    // Linki bqFlash (świeżo odkryte przez reader) — chwilowo wzmocniona atrakcja
    const flashLinks = useMemo<SimLink[]>(() =>
      discoveredPairs
        .filter(p => simNodesRef.current.has(p.fromNid) && simNodesRef.current.has(p.toNid))
        .map(p => ({ source: p.fromNid, target: p.toNid, kind: 'flash' as const })),
      [discoveredPairs]
    )

    // Tick handler: bezpośrednia mutacja DOM (zero React re-renderów)
    const onTick = useCallback(() => {
      const g = gRef.current; if (!g) return
      // węzły
      const nodeEls = g.querySelectorAll<SVGGElement>('.bq-node')
      nodeEls.forEach(el => {
        const nid = el.dataset.nid; if (!nid) return
        const n = simNodesRef.current.get(nid); if (!n) return
        el.setAttribute('transform', `translate(${n.x},${n.y})`)
      })
      // krawędzie (struct/context/flash) — wszystkie mają data-from i data-to
      const edgeEls = g.querySelectorAll<SVGPathElement>('path[data-from]')
      edgeEls.forEach(el => {
        const a = simNodesRef.current.get(el.dataset.from || '')
        const b = simNodesRef.current.get(el.dataset.to || '')
        if (!a || !b) return
        const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.12
        const my = (a.y + b.y) / 2 - (b.x - a.x) * 0.12
        el.setAttribute('d', `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`)
      })
      // labelki kontekstowe — środek krawędzi (rect+text z data-ctx)
      const ctxLabels = g.querySelectorAll<SVGGElement>('g[data-ctx]')
      ctxLabels.forEach(el => {
        const a = simNodesRef.current.get(el.dataset.from || '')
        const b = simNodesRef.current.get(el.dataset.to || '')
        if (!a || !b) return
        el.setAttribute('transform', `translate(${(a.x + b.x) / 2},${(a.y + b.y) / 2})`)
      })
    }, [])

    // Inicjalizacja symulacji — tylko gdy zmienia się ZESTAW węzłów (porównanie po nidach)
    const nidsKey = useMemo(() => simNodes.map(n => n.nid).sort().join(','), [simNodes])
    useEffect(() => {
      const root = simNodes.find(n => n.nid === rootNid)
      if (root) { root.fx = 0; root.fy = 0 }

      const sim = forceSimulation<SimNode, SimLink>(simNodes)
        .force('link-struct', forceLink<SimNode, SimLink>(structLinks).id(d => d.nid).distance(140).strength(0.4))
        .force('link-context', forceLink<SimNode, SimLink>(contextLinks).id(d => d.nid)
          .distance(d => Math.max(60, 130 - (d.count || 1) * 8))
          .strength(d => Math.min(0.15 + (d.count || 1) * 0.12, 0.7)))
        .force('charge', forceManyBody().strength(-450))
        .force('center', forceCenter(0, 0))
        .force('radial', forceRadial<SimNode>(d => d.tier * 170, 0, 0).strength(0.12))
        .force('collide', forceCollide<SimNode>(d => d.branch === 'epoki' ? 95 : 55))
        .alphaDecay(0.05)
        .alphaMin(0.01)
        .on('tick', onTick)
      simRef.current = sim
      return () => { sim.stop(); simRef.current = null }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nidsKey, rootNid])

    // Aktualizuj linki strukturalne i kontekstowe gdy się zmieniają (bez resetu pozycji)
    useEffect(() => {
      const sim = simRef.current; if (!sim) return
      const fStruct = sim.force('link-struct') as any
      const fCtx = sim.force('link-context') as any
      if (fStruct) fStruct.links(structLinks)
      if (fCtx) fCtx.links(contextLinks)
      sim.alpha(0.6).restart()
    }, [structLinks, contextLinks])

    // Restart simulation gdy bqFlash dorzuci nowy link — chwilowy "pulse" reorganizacji
    useEffect(() => {
      if (flashLinks.length === 0) return
      simRef.current?.alpha(0.8).restart()
    }, [flashLinks])

    // d3-zoom: pan + zoom + touch wbudowane
    useEffect(() => {
      if (!svgRef.current || !gRef.current) return
      const svgSel = select(svgRef.current)
      const gSel = select(gRef.current)
      const z = d3zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 2.5])
        .on('zoom', e => gSel.attr('transform', e.transform.toString()))
      svgSel.call(z)
      // Wyśrodkuj graf: (0,0) w world coords trafia na środek SVG
      const rect = svgRef.current.getBoundingClientRect()
      svgSel.call(z.transform, zoomIdentity.translate(rect.width / 2, rect.height / 2).scale(0.8))
      zoomRef.current = z
      return () => { svgSel.on('.zoom', null) }
    }, [])

    // Płynne dojechanie kamery do wybranego węzła
    useEffect(() => {
      if (!sel || !svgRef.current || !zoomRef.current) return
      const node = simNodes.find(n => n.id === sel)
      if (!node) return
      const svgSel = select(svgRef.current)
      const rect = svgRef.current.getBoundingClientRect()
      svgSel.transition().duration(600)
        .call(zoomRef.current.transform, zoomIdentity.translate(rect.width / 2 - node.x * 0.9, rect.height / 2 - node.y * 0.9).scale(0.9))
    }, [sel, simNodes])

    // d3-drag na węzłach: subject czyta data-nid z elementu (zero data-binding)
    useEffect(() => {
      if (!gRef.current) return
      const dragBeh = d3drag<SVGGElement, unknown>()
        .clickDistance(5) // pozwól na małe ruchy bez zjadania kliknięcia
        .subject(function () {
          const nid = (this as SVGGElement).dataset.nid
          return nid ? simNodesRef.current.get(nid) : null
        })
        .on('start', (e: any) => {
          if (!e.subject) return
          if (!e.active) simRef.current?.alphaTarget(0.3).restart()
          e.subject.fx = e.subject.x
          e.subject.fy = e.subject.y
        })
        .on('drag', (e: any) => {
          if (!e.subject) return
          e.subject.fx = e.x
          e.subject.fy = e.y
        })
        .on('end', (e: any) => {
          if (!e.subject) return
          if (!e.active) simRef.current?.alphaTarget(0)
          if (e.subject.nid !== rootNid) { e.subject.fx = null; e.subject.fy = null }
        })
      select(gRef.current).selectAll<SVGGElement, unknown>('.bq-node').call(dragBeh as any)
    }, [simNodes, rootNid])

    // Pomocniczy lookup początkowej pozycji (pierwszy render — tick przepisze)
    const posOf = (nid: string) => simNodesRef.current.get(nid) || { x: 0, y: 0 }

    if (!treeId) return <ui.Placeholder text="Wybierz drzewo z listy" />
    if (!nodes.length) return <ui.Placeholder text="Zaimportuj paczkę bazową" />

    return (
        <svg ref={svgRef} style={{ width: '100%', height: '100%', cursor: 'grab', userSelect: 'none', display: 'block', touchAction: 'none', background: C.bg }}>
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="2" floodOpacity="0.25" />
            </filter>
          </defs>
          <g ref={gRef}>
            {/* structural edges — krzywe bezier, subtelne */}
            {visEdges.map((e, i) => (
              <path key={`s${i}`} data-from={e.from} data-to={e.to} d="" fill="none" style={{ stroke: C.edge }} strokeWidth={6} strokeLinecap="round" opacity={0.1} />
            ))}

            {/* context edges — kolor per typ relacji, krzywe */}
            {contextEdges.map((ce, i) => {
              const rd = relDef(ce.relation)
              const col = tok(rd.color)
              const label = `${rd.label}${ce.count > 1 ? ` ·${ce.count}` : ''}`
              const lw = label.length * 4.2 + 8
              return <g key={`ctx-${i}`}>
                <path data-from={ce.from} data-to={ce.to} d="" fill="none" style={{ stroke: col }} strokeWidth={3 + Math.min(ce.count, 3)} strokeLinecap="round" opacity={ce.strength * 0.75} filter="url(#glow)" />
                <g data-ctx data-from={ce.from} data-to={ce.to}>
                  <rect x={-lw / 2} y={-7} width={lw} height={12} rx={6} style={{ fill: C.bg, stroke: col }} strokeWidth={1} opacity={0.95} />
                  <text y={2} textAnchor="middle" style={{ fill: col, pointerEvents: 'none', fontWeight: 600 }} fontSize={8}>{label}</text>
                </g>
              </g>
            })}

            {/* odkryte połączenia z readera (flash) */}
            {discoveredPairs.map((pair, i) => (
              <path key={`dp-${i}`} data-from={pair.fromNid} data-to={pair.toNid} d="" fill="none" style={{ stroke: C.warn }}
                strokeWidth={pair.fresh ? 6 : 4} strokeLinecap="round" opacity={pair.fresh ? 0.9 : 0.55} filter="url(#glow)">
                {pair.fresh && <animate attributeName="opacity" values="1;0.4;1;0.9" dur="1s" repeatCount="3" fill="freeze" />}
              </path>
            ))}

            {/* nodes — Duolingo-style: grube, z elevation, duże ikony */}
            {visNodes.map(n => {
              const nid = String(n.data.nodeId), p = posOf(nid)
              const s = str(n), disc = discovered.has(nid), front = frontier.has(nid), mast = s >= 1
              const isNext = nid === nextNid && !disc
              const isSel = sel === n.id
              const isEpoka = String(n.data.branch) === 'epoki'
              const r = (mast ? 42 : disc ? 38 : 34) + (isEpoka ? 16 : 0)
              const bc = tok(branches[String(n.data.branch)]?.color || 'neutral')
              const fill = disc ? bc : C.surface
              const ringCol = disc ? bc : C.muted
              return (
                <g key={n.id} className="bq-node" data-nid={nid} transform={`translate(${p.x},${p.y})`} onClick={() => {
                  useNav.setState({ sel: n.id, phase: 'detail' })
                  sdk.shared.setState({ bq: { treeId, nodeId: nid, postId: n.id } })
                  setRevealed(prev => new Set(prev).add(nid))
                }} style={{ cursor: 'pointer' }}>
                  {isSel && <circle r={r + 10} fill="none" style={{ stroke: C.primary }} strokeWidth={3} opacity={0.7} />}
                  {isNext && [0, 0.7, 1.4].map((delay, k) => (
                    <circle key={`sonar-${k}`} r={r} fill="none" style={{ stroke: C.primary }} strokeWidth={7}>
                      <animate attributeName="r" values={`${r};${r + 34}`} dur="2.1s" begin={`${delay}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0" dur="2.1s" begin={`${delay}s`} repeatCount="indefinite" />
                      <animate attributeName="stroke-width" values="7;1" dur="2.1s" begin={`${delay}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                  <circle cy={4} r={r} style={{ fill: C.edge }} opacity={0.15} />
                  <circle r={r} style={{ fill, stroke: ringCol }} strokeWidth={disc ? 4 : 3} filter="url(#shadow)">
                    {disc && !mast && <animate attributeName="r" values={`${r};${r+3};${r}`} dur="2s" repeatCount="1" />}
                  </circle>
                  {mast && <circle r={r - 6} fill="none" style={{ stroke: C.bg }} strokeWidth={3} opacity={0.6} />}
                  {mast ? (
                    <text y={9} textAnchor="middle" fontSize={30} style={{ fill: C.bg, fontWeight: 700, pointerEvents: 'none' }}>★</text>
                  ) : disc ? (
                    <text y={7} textAnchor="middle" fontSize={20} style={{ fill: C.bg, fontWeight: 700, pointerEvents: 'none' }}>{Number(n.data.hits) || 0}</text>
                  ) : (
                    <text y={8} textAnchor="middle" fontSize={24} style={{ fill: C.muted, fontWeight: 700, pointerEvents: 'none' }}>{front ? '＋' : '🔒'}</text>
                  )}
                  <text y={r + 18} textAnchor="middle" style={{ fill: C.text, fontWeight: disc ? 700 : 500, pointerEvents: 'none' }}
                    fontSize={13} opacity={disc ? 1 : revealed.has(nid) ? 0.6 : 0.35}>
                    {disc || revealed.has(nid) ? String(n.data.title).slice(0, 18) : '???'}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
    )
  }

  function NodeDetail({ id }: { id: string }) {
    const node = store.usePost(id)
    const treeId = useNav().treeId || ''
    const terms = store.useChildren(treeId, 'lexicon') as PostRecord[]
    const discoveries = store.usePosts('discovery') as PostRecord[]
    const { nidMap } = useLexMaps()
    if (!node) return null
    const nodeId = String(node.data.nodeId)
    const s = str(node)
    const contents = store.useChildren(id, 'content') as PostRecord[]
    const slideCount = contents.filter(c => String(c.data.contentType) !== 'quiz').length

    // ile terminów ma ten węzeł i ile z nich odkrytych
    const nodeTerms = terms.filter(t => (nidMap.get(t.id) || []).includes(nodeId))
    const discSet = new Set(discoveries.map(d => String(d.data.termId)))
    const discNodeTerms = nodeTerms.filter(t => discSet.has(t.id)).length
    const totalNodeTerms = nodeTerms.length

    const hits = Number(node.data.hits) || 0
    const step1Done = hits > 0 || discNodeTerms > 0  // wszedł do węzła / coś odkrył
    const step2Done = discNodeTerms >= Math.max(3, Math.ceil(totalNodeTerms * 0.3))
    const step3Done = s >= 1

    const Step = ({ n, done, title, hint }: { n: number; done: boolean; title: string; hint: string }) => (
      <ui.Card color={done ? 'success' : 'neutral'}>
        <ui.Stack gap="sm">
          <ui.Row gap="sm">
            <ui.Badge color={done ? 'success' : 'neutral'}>{done ? '✓' : n}</ui.Badge>
            <ui.Text size="xs"><b>{title}</b></ui.Text>
          </ui.Row>
          <ui.Text muted size="2xs">{hint}</ui.Text>
        </ui.Stack>
      </ui.Card>
    )

    const go = (target: 'reader' | 'arena') => {
      const base = { treeId, nodeId, postId: id }
      if (target === 'reader') nav.toReader(base)
      else nav.toArena(base)
    }

    return (
      <ui.Card><ui.Stack>
        <ui.Row justify="between">
          <ui.Heading title={String(node.data.title)} />
          <ui.Row gap="sm">
            <ui.Badge>{s >= 1 ? '★ Opanowane' : hits > 0 ? 'Odkryte' : 'Nowe'}</ui.Badge>
            <ui.Button size="xs" color="ghost" onClick={() => useNav.setState({ phase: 'map', sel: null })}><X size={14} /></ui.Button>
          </ui.Row>
        </ui.Row>

        <ui.Grid cols={3} gap="sm">
          <Step n={1} done={step1Done}
            title="Przeczytaj"
            hint={slideCount ? `${slideCount} slajdów` : 'Wejdź do readera'} />
          <Step n={2} done={step2Done}
            title="Odkrywaj terminy"
            hint={totalNodeTerms ? `Zapamiętane: ${discNodeTerms}/${totalNodeTerms}` : 'Odkrywaj słowa'} />
          <Step n={3} done={step3Done}
            title="Wygraj arenę"
            hint={totalNodeTerms ? `Znasz ${discNodeTerms}/${totalNodeTerms} terminów` : 'Odblokuj sąsiadów'} />
        </ui.Grid>

        <ui.Grid cols={2} gap="sm">
          <ui.Button size="lg" color="primary" block onClick={() => go('reader')}>
            <BookOpen size={14} /> Czytaj i odkrywaj terminy
          </ui.Button>
          <ui.Button size="lg" color="primary" outline block onClick={() => go('arena')}>
            <Zap size={14} /> Arena {totalNodeTerms ? `(${discNodeTerms}/${totalNodeTerms})` : ''}
          </ui.Button>
        </ui.Grid>
      </ui.Stack></ui.Card>
    )
  }

  // --- GitHub source (SeedNode[] format) ---
  type GHRepo = { name: string; description: string | null }
  const DEFAULT_ORG = 'BrainEduPlay'

  // Rozbija jeden wpis leksykonu w starym formacie (z JSON-stringami) na płaskie rekordy:
  // lexicon + lexNode[] + form[] + quiz?
  const flattenLexEntry = (entry: any, treeId: string) => {
    const data = entry.data || {}
    const lexId = store.add('lexicon', {
      term: data.term,
      definition: data.definition,
      category: data.category,
      relation: data.relation,
    }, { parentId: treeId }).id
    const nodes: string[] = jparse<string[]>(String(data.nodes || '[]'), [])
    for (const nid of nodes) store.add('lexNode', { nid }, { parentId: lexId })
    const forms: string[] = jparse<string[]>(String(data.forms || '[]'), [])
    for (const v of forms) if (v) store.add('form', { value: v }, { parentId: lexId })
    const quiz = jparse<{ question?: string; answer?: string; wrong?: string[]; hint?: string }>(String(data.quiz || '{}'), {})
    if (quiz.question || quiz.answer) {
      store.add('quiz', {
        question: quiz.question || '',
        answer: quiz.answer || '',
        wrong1: quiz.wrong?.[0] || '',
        wrong2: quiz.wrong?.[1] || '',
        wrong3: quiz.wrong?.[2] || '',
        hint: quiz.hint || '',
      }, { parentId: lexId })
    }
  }

  const loadLexicon = async (base: string, tree: PostRecord) => {
    const nodes = store.getPosts('node').filter(n => n.parentId === tree.id) as PostRecord[]
    const fetches = nodes.map(async (n) => {
      try {
        const r = await fetch(`${base}/lexicon/${n.data.nodeId}.json`)
        if (!r.ok) return 0
        const entries = JSON.parse(await r.text()) as any[]
        let count = 0
        const existing = store.getPosts('lexicon').filter(x => x.parentId === tree.id) as PostRecord[]
        const existingNames = new Set(existing.map(x => String(x.data.term)))
        for (const l of entries) {
          if (existingNames.has(String(l.data?.term))) continue
          flattenLexEntry(l, tree.id)
          existingNames.add(String(l.data?.term))
          count++
        }
        return count
      } catch { return 0 }
    })
    const counts = await Promise.all(fetches)
    return counts.reduce((a, b) => a + b, 0)
  }

  // Tworzy płaskie rekordy z seed-formatu tree.json (zamiast importJSON).
  const importTreeSeed = (seeds: any[]): { treeId: string; treeTitle: string; count: number } | null => {
    const root = seeds[0]
    if (!root || root.type !== 'tree') return null
    const treeTitle = String(root.data?.title || '')
    const treeId = store.add('tree', { title: treeTitle }).id
    let count = 1
    // Słowniki gałęzi i typów relacji (Record<key, {label,color}>)
    for (const [field, type] of [['branches', 'branch'], ['relations', 'relType']] as const) {
      const dict = jparse<Record<string, { label: string; color: string }>>(String(root.data?.[field] || '{}'), {})
      for (const [key, def] of Object.entries(dict)) { store.add(type, { key, label: def.label, color: def.color }, { parentId: treeId }); count++ }
    }
    // Krawędzie
    for (const e of jparse<{ from: string; to: string; type?: string }[]>(String(root.data?.edges || '[]'), [])) {
      store.add('edge', { fromNid: e.from, toNid: e.to, type: e.type || '' }, { parentId: treeId }); count++
    }
    // Węzły (dzieci roota)
    for (const child of (root.children || [])) {
      if (child.type === 'node') { store.add('node', child.data, { parentId: treeId }); count++ }
    }
    return { treeId, treeTitle, count }
  }

  const loadTree = async (org: string, repo: string) => {
    try {
      const base = `${GH_RAW}/${org}/${repo}/main`
      const treeRes = await fetch(`${base}/tree.json`)
      if (!treeRes.ok) throw new Error(`tree.json: ${treeRes.status}`)
      const treeSeeds = JSON.parse(await treeRes.text())
      const imported = importTreeSeed(treeSeeds)
      if (!imported) { sdk.log(`${repo} — niepoprawny tree.json`, 'error'); return }

      const tree = store.get(imported.treeId) as PostRecord | undefined
      if (tree) {
        const lexCount = await loadLexicon(base, tree)
        sdk.log(`${repo} — ${imported.count + lexCount} rekordów`, 'ok')
        store.update(tree.id, { repo: `${org}/${repo}` })
      }
    } catch (e) { sdk.log(String(e), 'error') }
  }

  const loadLexiconFromRepo = async (treeId: string, org: string, repo: string) => {
    const tree = store.get(treeId)
    if (!tree) return
    const base = `${GH_RAW}/${org}/${repo}/main`
    const count = await loadLexicon(base, tree)
    sdk.log(`${repo} — ${count} nowych terminów`, 'ok')
  }

  // Lazy load content per node — wywoływany z readera przez sdk.shared
  const loadNodeContent = async (treeId: string, nodeId: string) => {
    const tree = store.get(treeId)
    if (!tree) return
    const repo = String(tree.data.repo || '')
    if (!repo) return

    // Znajdź post węzła
    const nodes = store.getPosts('node').filter(n => n.parentId === treeId) as PostRecord[]
    const node = nodes.find(n => String(n.data.nodeId) === nodeId)
    if (!node) return

    // Sprawdź czy content już załadowany
    const existing = store.getPosts('content').filter(c => c.parentId === node.id)
    if (existing.length > 0) return

    try {
      const r = await fetch(`${GH_RAW}/${repo}/main/content/${nodeId}.json`)
      if (!r.ok) return
      const entries = JSON.parse(await r.text()) as any[]
      for (const e of entries) {
        store.add(e.type, e.data, { parentId: node.id })
      }
    } catch (e) { sdk.log(`Content ${nodeId}: ${e}`, 'error') }
  }

  function RepoPicker() {
    const org = (store.useOption('bq:githubOrg') as string) || DEFAULT_ORG
    const [repos, setRepos] = useState<GHRepo[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      fetch(`${GH_API}/search/repositories?q=org:${org}+topic:brainquest&per_page=100`)
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then((d: { items: GHRepo[] }) => setRepos(d.items.sort((a, b) => a.name.localeCompare(b.name))))
        .catch(e => sdk.log(`GitHub: ${e}`, 'error'))
        .finally(() => setLoading(false))
    }, [org])

    return (
      <ui.Page><ui.Stack>
        <ui.Heading title="Wybierz przedmiot" subtitle="Kliknij aby rozpocząć naukę" />
        {loading && <ui.Spinner />}
        {repos.map(r => (
          <ui.Card key={r.name}>
            <ui.Row justify="between">
              <ui.Stack>
                <ui.Text bold>{r.description || r.name}</ui.Text>
                <ui.Text muted size="xs">{r.name}</ui.Text>
              </ui.Stack>
              <ui.Button color="primary" onClick={() => loadTree(org, r.name)}>Rozpocznij</ui.Button>
            </ui.Row>
          </ui.Card>
        ))}
        {!loading && !repos.length && <ui.Text muted>Brak dostępnych przedmiotów</ui.Text>}
      </ui.Stack></ui.Page>
    )
  }

  // Cascade cleanup: usunięcie drzewa → usuń wiszące discoveries (discovery to typ globalny, nie dziecko drzewa)
  const removeTreeWithDiscoveries = (treeId: string) => {
    const termIds = new Set(
      (store.getPosts('lexicon') as PostRecord[])
        .filter(l => l.parentId === treeId)
        .map(l => l.id)
    )
    const orphans = (store.getPosts('discovery') as PostRecord[])
      .filter(d => termIds.has(String(d.data.termId)))
    for (const d of orphans) store.remove(d.id)
    store.remove(treeId) // cascade usuwa branch/relType/edge/node/lexicon (i ich dzieci: lexNode/form/quiz/content)
    if (orphans.length) sdk.log(`Usunięto drzewo + ${orphans.length} odkryć`, 'ok')
  }

  // --- panels ---
  function TreeItem({ tree, active }: { tree: PostRecord; active: boolean }) {
    const nodes = store.useChildren(tree.id, 'node') as PostRecord[]
    const d = nodes.filter(n => Number(n.data.hits) > 0).length
    return <ui.ListItem active={active} label={String(tree.data.title)} detail={`${d}/${nodes.length} odkryte`}
      onClick={() => useNav.setState({ treeId: tree.id, sel: null, phase: 'map' })}
      action={<ui.RemoveButton onClick={() => { removeTreeWithDiscoveries(tree.id); if (active) useNav.setState({ treeId: null, sel: null, phase: 'map' }) }} />} />
  }

  function TreeList() {
    const { treeId } = useNav()
    const trees = store.usePosts('tree') as PostRecord[]
    if (!trees.length) return null
    return (
      <ui.Box header={<ui.Cell label>Drzewa wiedzy</ui.Cell>} body={<ui.Stack>
        {trees.map(t => <TreeItem key={t.id} tree={t} active={treeId === t.id} />)}
      </ui.Stack>} grow />
    )
  }

  function Progress() {
    const navTreeId = useNav().treeId
    const sharedTreeId = (sdk.shared((s: any) => s?.bq) as any)?.treeId as string | undefined
    const treeId = navTreeId || sharedTreeId || ''
    const nodes = store.useChildren(treeId, 'node') as PostRecord[]
    const terms = store.useChildren(treeId, 'lexicon') as PostRecord[]
    const discoveries = store.usePosts('discovery') as PostRecord[]
    const { nidMap } = useLexMaps()

    // Density + next-node suggestion (memoized)
    const { density, discPairs, allPairs, nextNode } = useMemo(() => {
      const nodeIdSet = new Set(nodes.map(n => String(n.data.nodeId)))
      const discTermIds = new Set(discoveries.map(d => String(d.data.termId)))
      const discNodeIds = new Set(nodes.filter(n => Number(n.data.hits) > 0).map(n => String(n.data.nodeId)))
      const all = new Set<string>()
      const disc = new Set<string>()
      const scores = new Map<string, number>()
      for (const t of terms) {
        const tn = (nidMap.get(t.id) || []).filter(x => nodeIdSet.has(x))
        const isDisc = discTermIds.has(t.id)
        for (let i = 0; i < tn.length; i++) for (let j = i + 1; j < tn.length; j++) {
          const key = [tn[i], tn[j]].sort().join(':')
          all.add(key)
          if (isDisc) disc.add(key)
        }
        // next-node scoring: term touches a discovered node → boost its other nodes
        if (discNodeIds.size && tn.some(x => discNodeIds.has(x))) {
          for (const x of tn) if (!discNodeIds.has(x)) scores.set(x, (scores.get(x) || 0) + 1)
        }
      }
      let bestNid = '', bestScore = 0
      for (const [k, v] of scores) if (v > bestScore) { bestNid = k; bestScore = v }
      const next = bestNid ? nodes.find(n => String(n.data.nodeId) === bestNid) || null : null
      return { density: all.size ? Math.round(disc.size / all.size * 100) : 0, discPairs: disc.size, allPairs: all.size, nextNode: next }
    }, [nodes, terms, discoveries, nidMap])

    if (!treeId) return <ui.Placeholder text="Wybierz drzewo" />
    const d = nodes.filter(n => Number(n.data.hits) > 0)
    return (
      <ui.Box header={<ui.Cell label>Postęp</ui.Cell>} body={d.length === 0
        ? <ui.Placeholder text="Odkrywaj węzły na mapie"><Award size={32} /></ui.Placeholder>
        : <ui.Stack>
          <ui.Stats>
            <ui.Stat title="Gęstość" value={`${density}%`} />
            <ui.Stat title="Połączenia" value={`${discPairs}/${allPairs}`} />
          </ui.Stats>
          <ui.Stats>
            <ui.Stat title="Odkryte" value={`${d.length}/${nodes.length}`} />
            <ui.Stat title="Opanowane" value={`${nodes.filter(n => str(n) >= 1).length}`} />
          </ui.Stats>
          {nextNode && <ui.Stack>
            <ui.Cell label>Co dalej?</ui.Cell>
            <ui.Button size="sm" color="primary" outline block onClick={() => {
              useNav.setState({ sel: nextNode.id, phase: 'detail' })
              sdk.shared.setState({ bq: { treeId, nodeId: String(nextNode.data.nodeId), postId: nextNode.id } })
            }}><Zap size={12} /> {String(nextNode.data.title)}</ui.Button>
          </ui.Stack>}
          {d.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6).map(n => (
            <ui.Row key={n.id} gap="sm">{str(n) >= 1 ? <Award size={12} /> : <Zap size={12} />}<ui.Text size="sm">{String(n.data.title)}</ui.Text></ui.Row>
          ))}
        </ui.Stack>} grow />
    )
  }


  // --- Shared CheatSheet: jedyne miejsce logiki "odkryte terminy" ---
  function CheatSheet({ filter, onBack, backIcon }: {
    filter?: (termId: string) => boolean
    onBack?: () => void
    backIcon?: any
  }) {
    const bq = sdk.shared((s: any) => s?.bq) as { treeId?: string } | undefined
    const treeId = bq?.treeId || useNav().treeId || ''
    const lexicon = store.useChildren(treeId, 'lexicon') as PostRecord[]
    const discoveries = store.usePosts('discovery') as PostRecord[]

    const items = useMemo(() => {
      const discSet = new Set(discoveries.map(d => String(d.data.termId)))
      return lexicon
        .filter(l => discSet.has(l.id) && (!filter || filter(l.id)))
        .map(l => ({ id: l.id, term: String(l.data.term || ''), definition: String(l.data.definition || '') }))
    }, [lexicon, discoveries, filter])

    const goRead = () => nav.toReader()

    const BackIcon = backIcon || X
    const header = onBack
      ? <><ui.Cell onClick={onBack}><BackIcon size={14} /></ui.Cell><ui.Cell label>Ściągawka</ui.Cell></>
      : <ui.Cell label>Ściągawka</ui.Cell>

    return (
      <ui.Box header={header} body={
        items.length === 0
          ? <ui.Stack gap="sm">
              <ui.Text size="sm" bold>Brak odkrytych terminów</ui.Text>
              <ui.Text size="xs" muted>
                Tu pojawi się ściągawka — terminy które znasz z czytania. Każdy odkryty termin = jedna znana odpowiedź w Arenie.
              </ui.Text>
              <ui.Text size="xs" muted>
                Wróć do readera i odkrywaj terminy klikając podświetlone słowa.
              </ui.Text>
              <ui.Button size="sm" color="primary" block onClick={goRead}><BookOpen size={12} /> Do readera</ui.Button>
            </ui.Stack>
          : <ui.Stack gap="sm">
              {items.map((t: { id: string; term: string; definition: string }) => (
                <ui.Card key={t.id}><ui.Stack gap="xs">
                  <ui.Text size="xs" bold>{t.term}</ui.Text>
                  <ui.Text size="xs" muted>{t.definition}</ui.Text>
                </ui.Stack></ui.Card>
              ))}
            </ui.Stack>
      } grow />
    )
  }

  // --- Navigation helpers (jedna prawda o przełączaniu pluginów) ---
  const getBq = () => (sdk.shared.getState() as any)?.bq as Record<string, any> | undefined
  const useBq = () => sdk.shared((s: any) => s?.bq) as Record<string, any> | undefined
  const goTo = (activeId: string, patch: Record<string, any> = {}) => {
    sdk.shared.setState({ bq: { ...(getBq() || {}), ...patch } })
    sdk.useHostStore.setState({ activeId })
  }
  const nav = {
    toMap:    (extra: Record<string, any> = {}) => goTo('plugin-brain-quest',        { phase: 'map', challenge: false, ...extra }),
    toReader: (extra: Record<string, any> = {}) => goTo('plugin-brain-quest-reader', { challenge: false, ...extra }),
    toArena:  (extra: Record<string, any> = {}) => goTo('plugin-brain-quest-arena',  { challenge: true, ...extra }),
  }

  sdk.shared.setState({ bqHelpers: { discover, unlockNode, edgeStr, loadNodeContent, loadLexiconFromRepo, jparse, str, buildLexMaps, useLexMaps, Progress, CheatSheet, nav, useBq, getBq } })

  function Center() {
    const { treeId, phase, sel } = useNav()
    const trees = store.usePosts('tree') as PostRecord[]

    useEffect(() => {
      if (!treeId && trees.length) useNav.setState({ treeId: trees[0].id })
    }, [treeId, trees.length])

    if (!treeId && !trees.length) return <RepoPicker />
    if (!treeId) return null

    return (
      <ui.OverlayContainer
        base={<SkillTree />}
        overlay={phase === 'detail' && sel ? <NodeDetail id={sel} /> : null}
        position="bottom"
      />
    )
  }

  sdk.registerView('bq.left', { slot: 'left', component: TreeList })
  sdk.registerView('bq.center', { slot: 'center', component: Center })
  sdk.registerView('bq.right', { slot: 'right', component: Progress })
  return { id: 'plugin-brain-quest', label: 'BrainQuest', icon: Award, version: '0.4.0' }
}
export default plugin
