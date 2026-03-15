'use client'

import { useState } from 'react'
import type { NotebookCell, CellOutput } from '@/types'

// ─── Copy button ────────────────────────────────────────────────────────────
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

// ─── Single output block ────────────────────────────────────────────────────
function OutputBlock({ output }: { output: CellOutput }) {
    if (output.type === 'image') {
        return (
            <div className="mt-2 rounded-lg overflow-hidden border border-border bg-white">
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

    // text
    return (
        <div className="mt-2 rounded-lg border border-border bg-[#0D0D10] px-4 py-3">
            <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                {output.content}
            </pre>
        </div>
    )
}

// ─── Single notebook cell ────────────────────────────────────────────────────
function NotebookCellBlock({
    cell,
    index,
}: {
    cell: NotebookCell
    index: number
}) {
    return (
        <div className="group animate-slide-up" style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}>
            {/* Cell wrapper */}
            <div className="rounded-xl border border-border overflow-hidden">

                {/* Terminal bar with cell number + copy */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#1A1A20] border-b border-border">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                        <span className="text-muted text-xs font-mono ml-2 opacity-50">
                            In [{index + 1}]
                        </span>
                    </div>
                    <CopyButton text={cell.source} />
                </div>

                {/* Source code */}
                <pre className="bg-surface px-5 py-4 overflow-x-auto text-sm leading-relaxed">
                    <code className="text-code font-mono whitespace-pre">{cell.source}</code>
                </pre>
            </div>

            {/* Outputs (if any) */}
            {cell.outputs.length > 0 && (
                <div className="ml-4 mt-1 border-l-2 border-accent/20 pl-4 space-y-1">
                    <p className="text-[10px] text-muted font-mono uppercase tracking-widest mb-1 opacity-60">
                        Out [{index + 1}]
                    </p>
                    {cell.outputs.map((output, i) => (
                        <OutputBlock key={i} output={output} />
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function NotebookViewer({ cells }: { cells: NotebookCell[] }) {
    if (!cells || cells.length === 0) {
        return (
            <p className="text-muted text-sm font-mono text-center py-8">
                No cells found. Re-push the notebook to sync.
            </p>
        )
    }

    return (
        <div className="space-y-4">
            {cells.map((cell, i) => (
                <NotebookCellBlock key={i} cell={cell} index={i} />
            ))}
        </div>
    )
}