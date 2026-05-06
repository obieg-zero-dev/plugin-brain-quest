import type { PluginFactory, PostRecord } from '@obieg-zero/sdk'
import { CosmosGraph } from '@obieg-zero/cosmos-graph'
import { useBqGraphData } from '@obieg-zero/bq-cosmos'

// Loader paczek (typy danych, importTreeSeed, loadTree, loadNodeContent, RepoPicker) jest w plugin-bq-loader.
// Stąd konsumujemy bqLoader przez sdk.shared.

const plugin: PluginFactory = ({ React, ui, store, sdk, icons }) => {
  const { useState, useMemo, useEffect } = React
  const { Award, X, Zap, BookOpen, Package } = icons

  // Tylko gameplay state — typy danych paczki rejestruje plugin-bq-loader
  store.registerType('discovery', [
    { key: 'termId', label: 'Termin', required: true },
    { key: 'hits', label: 'Odkrycia' },
    { key: 'firstSeen', label: 'Pierwsze' },
    { key: 'lastSeen', label: 'Ostatnie' },
  ], 'Odkrycia')

  // Forwarder do bqLoader — konsumowany przez reader/arena przez bqHelpers (kompatybilność wstecz)
  const bqLoader = () => (sdk.shared.getState() as any)?.bqLoader as any
  const loadNodeContent = (treeId: string, nodeId: string) => bqLoader()?.loadNodeContent(treeId, nodeId)
  const loadLexiconFromRepo = (treeId: string, org: string, repo: string) => bqLoader()?.loadLexiconFromRepo(treeId, org, repo)

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


  // --- skill tree (fog of war) — guard + body, żeby wszystkie hooki działały zawsze w tej samej kolejności ---
  // SkillTree: zewnętrzny guard. Jedyna odpowiedzialność: sprawdzić warunek wstępny (treeId) i delegować.
  function SkillTree() {
    const { treeId } = useNav()
    if (!treeId) return <ui.Placeholder text="Wybierz drzewo z listy" />
    return <SkillTreeBody treeId={treeId} />
  }

  // SkillTreeBody: konsument szyny danych. Plugin nie transformuje — adapter dostarcza gotowe.
  function SkillTreeBody({ treeId }: { treeId: string }) {
    const { sel } = useNav()

    // Świeżo odkryte połączenia — flash z sdk.shared.bqFlash. Plugin-specific subskrypcja, zostaje.
    const flash = sdk.shared((s: any) => s?.bqFlash) as { fromNid?: string; toNid?: string } | undefined
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

    // Szyna danych — gameplay mode (gating + hits + nextNid + post id ↔ nid lookup)
    const data = useBqGraphData(store, treeId, {
      gateByDiscoveries: true,
      selectedPostId: sel,
    })

    if (!data.rawNodes.length) return <ui.Placeholder text="Zaimportuj paczkę bazową" />

    return (
      <CosmosGraph
        nodes={data.nodes}
        moons={data.moons}
        edges={data.edges}
        contextEdges={data.contextEdges}
        branches={data.branches}
        relTypes={data.relTypes}
        selectedNid={data.selectedNid}
        onSelectNode={(nid) => {
          const post = data.rawNodes.find(n => String(n.data.nodeId) === nid)
          if (!post) return
          useNav.setState({ sel: post.id, phase: 'detail' })
          sdk.shared.setState({ bq: { treeId, nodeId: nid, postId: post.id } })
        }}
        onDeselect={() => useNav.setState({ sel: null })}
        progress={{ hits: data.hits, flashPairs: discoveredPairs, nextNid: data.nextNid }}
        bigBranches={['epoki']}
      />
    )
  }

  // NodeDetail: zewnętrzny guard (sprawdza czy post istnieje), delegacja do body z gwarantowanym non-null nodem.
  function NodeDetail({ id }: { id: string }) {
    const node = store.usePost(id)
    if (!node) return null
    return <NodeDetailBody node={node} id={id} />
  }

  // NodeDetailBody: wszystkie hooki PRZED jakimkolwiek conditional return. Node jest gwarantowane non-null.
  function NodeDetailBody({ node, id }: { node: PostRecord; id: string }) {
    const treeId = useNav().treeId || ''
    const terms = store.useChildren(treeId, 'lexicon') as PostRecord[]
    const discoveries = store.usePosts('discovery') as PostRecord[]
    const contents = store.useChildren(id, 'content') as PostRecord[]
    const { nidMap } = useLexMaps()

    const nodeId = String(node.data.nodeId)
    const s = str(node)
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
    const discoveries = store.usePosts('discovery') as PostRecord[]
    // Szyna danych — adapter dostarcza nextNid + nidsByLex + rawNodes/rawLexicons. Plugin nie powtarza heurystyki.
    const data = useBqGraphData(store, treeId, { gateByDiscoveries: true })

    // Pair stats lokalnie — to plugin-specific metryka (% odkrytych co-occurrence pairs), nie część adaptera.
    // next-node z data.nextNid (jedno źródło prawdy, bez sort+join hot-path).
    const { density, discPairs, allPairs } = useMemo(() => {
      const nodeIdSet = new Set(data.rawNodes.map(n => String(n.data.nodeId)))
      const discTermIds = new Set(discoveries.map(d => String(d.data.termId)))
      const all = new Set<string>()
      const disc = new Set<string>()
      for (const t of data.rawLexicons) {
        const tn = Array.from(data.nidsByLex.get(t.id) || []).filter(x => nodeIdSet.has(x))
        const isDisc = discTermIds.has(t.id)
        for (let i = 0; i < tn.length; i++) for (let j = i + 1; j < tn.length; j++) {
          // Klucz pary: deterministyczny porządek bez sort+join (alokacje array+sort+string per pair).
          const a = tn[i], b = tn[j]
          const key = a < b ? `${a}\0${b}` : `${b}\0${a}`
          all.add(key)
          if (isDisc) disc.add(key)
        }
      }
      return { density: all.size ? Math.round(disc.size / all.size * 100) : 0, discPairs: disc.size, allPairs: all.size }
    }, [data.rawNodes, data.rawLexicons, data.nidsByLex, discoveries])

    const nextNode = useMemo(() => {
      if (!data.nextNid) return null
      return data.rawNodes.find(n => String(n.data.nodeId) === data.nextNid) || null
    }, [data.nextNid, data.rawNodes])

    if (!treeId) return <ui.Placeholder text="Wybierz drzewo" />
    const d = data.rawNodes.filter(n => Number(n.data.hits) > 0)
    const nodes = data.rawNodes
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

    if (!treeId && !trees.length) return (
      <ui.Page><ui.Stack>
        <ui.Placeholder text="Brak załadowanych paczek wiedzy"><Package size={32} /></ui.Placeholder>
        <ui.Button color="primary" block onClick={() => sdk.useHostStore.setState({ activeId: 'plugin-bq-loader' })}>
          <Package size={14} /> Otwórz menedżer paczek
        </ui.Button>
      </ui.Stack></ui.Page>
    )
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
