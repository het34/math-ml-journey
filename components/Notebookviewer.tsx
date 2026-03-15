'use client'

import { useState } from 'react'
import type { NotebookCell, CellOutput } from '@/types'

// ─── Minimal markdown renderer ───────────────────────────────────────────────
// Handles: **bold**, `code`, bullet lists, headings — enough for Gemini output
function renderMarkdown(src: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = []

    src.split('\n').forEach((line, i) => {
        const trimmed = line.trim()

        // Heading
        const h3 = trimmed.match(/^###\s+(.+)/)
        const h2 = trimmed.match(/^##\s+(.+)/)
        const h1 = trimmed.match(/^#\s+(.+)/)
        if (h1) { nodes.push(<h3 key={i} className="text-text font-medium text-lg mt-5 mb-1">{h1[1]}</h3>); return }
        if (h2) { nodes.push(<h4 key={i} className="text-text font-medium text-base mt-4 mb-1">{h2[1]}</h4>); return }
        if (h3) { nodes.push(<h5 key={i} className="text-text font-medium text-sm mt-3 mb-1">{h3[1]}</h5>); return }

        // Bullet list
        const bullet = trimmed.match(/^[\*\-]\s+(.+)/)
        if (bullet) {
            nodes.push(
                <div key={i} className="flex gap-2 items-start my-0.5">
                    <span className="text-accent mt-1.5 text-[8px]">◆</span>
                    <span className="text-muted text-sm leading-relaxed">{inlineFormat(bullet[1])}</span>
                </div>
            )
            return
        }

        // Empty line → spacer
        if (!trimmed) { nodes.push(<div key={i} className="h-2" />); return }

        // Normal paragraph line
        nodes.push(
            <p key={i} className="text-muted text-sm leading-relaxed">
                {inlineFormat(trimmed)}
            </p>
        )
    })

    return nodes
}

// Handles **bold** and `inline code` inside a line
function inlineFormat(text: string): React.ReactNode {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/)
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('`') && part.endsWith('`')) {
                    return (
                        <code key={i} className="text-code font-mono text-xs bg-bg px-1.5 py-0.5 rounded border border-border">
                            {part.slice(1, -1)}
                        </code>
                    )
                }
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="text-text font-medium">{part.slice(2, -2)}</strong>
                }
                return part
            })}
        </>
    )
}

// ─── Copy button ─────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button
            onClick={handleCopy}
            className={`
        flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono
        border transition-all duration-200
        ${copied
                    ? 'border-green-700/50 text-green-400 bg-green-900/20'
                    : 'border-border text-muted hover:border-accent/50 hover:text-accent bg-transparent'
                }
      `}
        >
            {copied ? '✓ copied' : 'copy'}
        </button>
    )
}

// ─── Output block ─────────────────────────────────────────────────────────────
function OutputBlock({ output }: { output: CellOutput }) {
    if (output.type === 'image') {
        return (
            <div className="mt-3 rounded-xl overflow-hidden border border-border bg-white">
                <img
                    src={`data:image/png;base64,${output.content}`}
                    alt="Cell output"
                    className="w-full h-auto"
                />
            </div>
        )
    }
    if (output.type === 'error') {
        return (
            <div className="mt-2 rounded-lg border border-red-800/50 bg-red-900/10 px-4 py-3">
                <pre className="text-red-400 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                    {output.content}
                </pre>
            </div>
        )
    }
    return (
        <div className="mt-2 rounded-lg border border-border bg-[#0D0D10] px-4 py-3">
            <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                {output.content}
            </pre>
        </div>
    )
}

// ─── Code cell ────────────────────────────────────────────────────────────────
function CodeCellBlock({ source, outputs, cellNumber }: { source: string; outputs: CellOutput[]; cellNumber: number }) {
    return (
        <div>
            <div className="rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-[#1A1A20] border-b border-border">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                        <span className="text-muted text-xs font-mono ml-2 opacity-50">
                            In [{cellNumber}]
                        </span>
                    </div>
                    <CopyButton text={source} />
                </div>
                <pre className="bg-surface px-5 py-4 overflow-x-auto text-sm leading-relaxed">
                    <code className="text-code font-mono whitespace-pre">{source}</code>
                </pre>
            </div>

            {outputs.length > 0 && (
                <div className="ml-4 mt-1 border-l-2 border-accent/20 pl-4">
                    <p className="text-[10px] text-muted font-mono uppercase tracking-widest mb-1 opacity-60">
                        Out [{cellNumber}]
                    </p>
                    {outputs.map((o, i) => <OutputBlock key={i} output={o} />)}
                </div>
            )}
        </div>
    )
}

// ─── Markdown / story cell ────────────────────────────────────────────────────
function MarkdownCellBlock({ source }: { source: string }) {
    return (
        <div className="relative pl-5 border-l border-border/50 py-1 my-1">
            {/* subtle left accent dot */}
            <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-accent/30 border border-accent/50" />
            <div className="space-y-1 select-none">
                {renderMarkdown(source)}
            </div>
        </div>
    )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function NotebookViewer({ cells }: { cells: NotebookCell[] }) {
    if (!cells || cells.length === 0) {
        return (
            <p className="text-muted text-sm font-mono text-center py-8">
                No cells found. Re-push the notebook to sync.
            </p>
        )
    }

    let codeIndex = 0

    return (
        <div className="space-y-5">
            {cells.map((cell, i) => {
                if (cell.kind === 'markdown') {
                    return <MarkdownCellBlock key={i} source={cell.source} />
                }
                codeIndex++
                return (
                    <CodeCellBlock
                        key={i}
                        source={cell.source}
                        outputs={cell.outputs}
                        cellNumber={codeIndex}
                    />
                )
            })}
        </div>
    )
}