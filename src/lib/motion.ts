/** Courbes et durées partagées par les animations motion-v. */
export const easeOut = [0.23, 1, 0.32, 1] as const
export const easeInOut = [0.77, 0, 0.175, 1] as const

export const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  inViewOptions: { once: true, margin: '0px 0px -10% 0px' as `${number}px ${number}px ${number}% ${number}px` },
  transition: { duration: 0.42, ease: easeOut },
}

export const softSpring = { type: 'spring', duration: 0.4, bounce: 0.15 } as const
