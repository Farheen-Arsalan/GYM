import { motion } from 'framer-motion'

export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between"
    >
      <div>
        {eyebrow && <p className="label mb-2">{eyebrow}</p>}
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-muted">{subtitle}</p>}
      </div>
      {action}
    </motion.header>
  )
}
