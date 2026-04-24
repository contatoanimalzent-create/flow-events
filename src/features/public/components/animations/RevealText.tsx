import { type Variants, motion } from 'framer-motion'
import { useMemo } from 'react'
import { cn } from '@/shared/lib'

interface RevealTextProps {
  children: string
  delay?: number
  type?: 'words' | 'chars'
  className?: string
  once?: boolean
}

const WORD_VARIANTS: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const CHAR_VARIANTS: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
    },
  },
}

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export function RevealText({
  children,
  delay = 0,
  type = 'words',
  className,
  once = true,
}: RevealTextProps) {
  const items = useMemo(() => {
    if (type === 'chars') {
      return children.split('')
    }
    return children.split(' ')
  }, [children, type])

  const containerVariants = type === 'chars' ? CHAR_VARIANTS : WORD_VARIANTS

  return (
    <motion.span
      className={cn('inline-flex flex-wrap gap-x-[0.25em]', className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      transition={{ delayChildren: delay }}
    >
      {items.map((item, i) => (
        <motion.span
          key={i}
          variants={ITEM_VARIANTS}
          className="inline-block"
          style={{ whiteSpace: type === 'chars' && item === ' ' ? 'pre' : 'normal' }}
        >
          {item === ' ' && type === 'chars' ? '\u00A0' : item}
        </motion.span>
      ))}
    </motion.span>
  )
}
