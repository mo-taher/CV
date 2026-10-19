import { useEffect } from 'react'
import { gsap, SplitText } from './motion'

// Scroll reveals for any element inside rootRef:
//   [data-split]  lines rise out of a mask
//   [data-fade]   fades and lifts in
export function useReveals(rootRef, { ready, reduced }) {
  useEffect(() => {
    if (!ready || reduced || !rootRef.current) return undefined
    const splits = []
    const ctx = gsap.context(() => {
      rootRef.current.querySelectorAll('[data-split]').forEach((el) => {
        const split = SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.3,
              ease: 'cine',
              stagger: 0.08,
              scrollTrigger: { trigger: el, start: 'top 85%' },
            }),
        })
        splits.push(split)
      })
      gsap.utils.toArray(rootRef.current.querySelectorAll('[data-fade]')).forEach((el) => {
        gsap.from(el, {
          y: 48,
          opacity: 0,
          duration: 1.2,
          ease: 'cine',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })
    }, rootRef)
    return () => {
      ctx.revert()
      splits.forEach((s) => s.revert())
    }
  }, [ready, reduced, rootRef])
}
