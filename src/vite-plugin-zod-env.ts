import type { AnyZodObject, ZodFormattedError } from 'zod'
import { Plugin, loadEnv } from 'vite'

const formatErrors = (errors: ZodFormattedError<Map<string, string>, string>) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && '_errors' in value)
        return `${name}: ${value._errors.join(', ')}\n`
    })
    .filter(Boolean)

/**
 *
 * @throws Error
 */
export const zodenv = <T extends AnyZodObject = AnyZodObject>(
  envSchema: T
): Plugin => ({
  name: 'zodenv',
  config(cfg, { mode }) {
    const rawEnv = loadEnv(mode, process.cwd(), '')
    const env = envSchema.safeParse(rawEnv)

    if (!env.success) {
      console.error(
        '❌ Invalid environment variables:\n',
        ...formatErrors(env.error.format())
      )
      process.exit(1)
    }

    return cfg
  },
})
