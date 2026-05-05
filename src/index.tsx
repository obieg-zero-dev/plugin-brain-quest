import type { PluginFactory, PostRecord } from '@obieg-zero/sdk'
import { CosmosGraph } from '@obieg-zero/cosmos-graph'
import { useBqGraphData } from '@obieg-zero/bq-cosmos'

const GH_API = 'https://api.github.com'
const GH_RAW = 'https://raw.githubusercontent.com'

const plugin: PluginFactory = ({ React, ui, store, sdk, icons }) => {
  const { useState, useMemo, useEffect } = React
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
  store.registerType('quiz', [
    { key: 'question', label: 'Pytanie', required: true },
    { key: 'answer', label: 'Odpowiedź', required: true },
    { key: 'wrong1', label: 'Dystraktor 1' },
    { key: 'wrong2', label: 'Dystraktor 2' },
    { key: 'wrong3', label: 'Dystraktor 3' },
    { key: 'hint', label: 'Wskazówka' },
  ], 'Quizy')

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

  const useLexMaps = () => {
    const lexNodes = store.usePosts('lexNode') as PostRecord[]
    const quizzes = store.usePosts('quiz') as PostRecord[]
    return useMemo(() => buildLexMaps(lexNodes, quizzes), [lexNodes, quizzes])
  }

  const buildLexMaps = (lexNodes: PostRecord[], quizzes: PostRecord[]) => {
    const nidMap = new Map<string, string[]>()
    for (const ln of lexNodes) {
      const lid = ln.parentId || ''
      if (!lid) continue
      const arr = nidMap.get(lid) || []
      arr.push(String(ln.data.nid))
      nidMap.set(lid, arr)
    }
    const quizMap = new Map<string, PostRecord>()
    for (const q of quizzes) {
      const lid = q.parentId || ''
      if (lid) quizMap.set(lid, q)
    }
    return { nidMap, quizMap }
  }

  // --- state ---
  const useNav = sdk.create(() => ({
    treeId: null as string | null,
    sel: null as string | null,
    phase: 'map' as 'map' | 'detail',
  }))

  const str = (n: PostRecord) => Math.min((Number(n.data.hits) || 0) / 5, 1)
  const jparse = <T,>(s: string, fb: T): T => { try { return JSON.parse(s) } catch { return fb } }


  // --- skill tree (fog of war) — wrapper nad współdzielonym CosmosGraph + useBqGraphData ---
  function SkillTree() {
    const { treeId, sel } = useNav()

    // Świeżo odkryte połączenia — przychodzi z readera przez sdk.shared.bqFlash
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

    const discoveries = store.usePosts('discovery') as PostRecord[]

    // JEDEN adapter dla obu pluginów BQ — z gateByDiscoveries=true (gameplay: tylko odkryte termy).
    const data = useBqGraphData(store as any, treeId, { gateByDiscoveries: true })

    // Plugin-specific: progress.hits i nextNid (z hits + nidsByLex).
    const hits = useMemo(() => {
      const m: Record<string, number> = {}
      for (const n of data.rawNodes) m[String(n.data.nodeId)] = Number(n.data.hits) || 0
      return m
    }, [data.rawNodes])

    const nextNid = useMemo(() => {
      const discNodeIds = new Set(data.rawNodes.filter(n => Number(n.data.hits) > 0).map(n => String(n.data.nodeId)))
      if (!discNodeIds.size) {
        const sorted = [...data.rawNodes].sort((a, b) => Number(a.data.tier) - Number(b.data.tier))
        return sorted[0] ? String(sorted[0].data.nodeId) : null
      }
      const scores = new Map<string, number>()
      for (const t of data.rawLexicons) {
        const tn = Array.from(data.nidsByLex.get(t.id) || [])
        if (!tn.some(x => discNodeIds.has(x))) continue
        for (const x of tn) if (!discNodeIds.has(x)) scores.set(x, (scores.get(x) || 0) + 1)
      }
      let best = '', bs = 0
      for (const [k, v] of scores) if (v > bs) { best = k; bs = v }
      return best || null
    }, [data.rawNodes, data.rawLexicons, data.nidsByLex])

    if (!treeId) return <ui.Placeholder text="Wybierz drzewo z listy" />
    if (!data.rawNodes.length) return <ui.Placeholder text="Zaimportuj paczkę bazową" />

    // CosmosGraph operuje na nid (logiczny id). Plugin trzyma `sel` jako post id.
    const selectedNid = useMemo(() => {
      if (!sel) return null
      const post = data.rawNodes.find(n => n.id === sel)
      return post ? String(post.data.nodeId) : null
    }, [sel, data.rawNodes])

    return (
      <CosmosGraph
        nodes={data.nodes}
        moons={data.moons}
        edges={data.edges}
        contextEdges={data.contextEdges}
        branches={data.branches}
        relTypes={data.relTypes}
        selectedNid={selectedNid}
        onSelectNode={(nid) => {
          const post = data.rawNodes.find(n => String(n.data.nodeId) === nid)
          if (!post) return
          useNav.setState({ sel: post.id, phase: 'detail' })
          sdk.shared.setState({ bq: { treeId, nodeId: nid, postId: post.id } })
        }}
        onDeselect={() => useNav.setState({ sel: null })}
        progress={{ hits, flashPairs: discoveredPairs, nextNid }}
        bigBranches={['epoki']}
      />
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
  const DEFAULT_ORG = 'BQ-content'

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
