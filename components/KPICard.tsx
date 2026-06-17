'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  trend?: number   // positive = up, negative = down, 0 or undefined = flat
  unit?: string
}

export function KPICard({ label, value, trend, unit }: KPICardProps) {
  const trendColor =
    trend === undefined || trend === 0
      ? 'var(--color-muted-foreground)'
      : trend > 0
      ? 'var(--color-success)'
      : 'var(--color-destructive)'

  const TrendIcon =
    trend === undefined || trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-3"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>
        {label}
      </p>
      <div className="flex items-end justify-between gap-2">
        <p className="text-3xl font-bold leading-none" style={{ color: 'var(--color-foreground)' }}>
          {value}
          {unit && (
            <span className="text-base font-medium ml-1" style={{ color: 'var(--color-muted-foreground)' }}>
              {unit}
            </span>
          )}
        </p>
        {trend !== undefined && (
          <div
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: trendColor }}
            aria-label={`${trend > 0 ? 'Up' : trend < 0 ? 'Down' : 'Flat'} ${Math.abs(trend)}% vs last month`}
          >
            <TrendIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      {trend !== undefined && (
        <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
          vs last month
        </p>
      )}
    </div>
  )
}
