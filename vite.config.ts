import type { UserConfig, ConfigEnv } from 'vite'
import { loadEnv } from 'vite'
import { resolve } from 'path'
import { createPlugins } from './build-conf/vite/plugin'
import { createHtmlPlugin } from 'vite-plugin-html'
function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir)
}

export default ({ mode }: ConfigEnv): UserConfig => {
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const { VITE_PROXY, VITE_APP_SDK_URL } = env
  return {
    resolve: {
      alias: [
        {
          find: '#',
          replacement: pathResolve('mapkit') + '/',
        },
        {
          find: '@',
          replacement: pathResolve('src') + '/',
        },
      ],
    },
    plugins: [
      ...createPlugins(),
      createHtmlPlugin({
        inject: {
          data: {
            injectScript: `<script src="${VITE_APP_SDK_URL}"></script>`,
          },
        },
      }),
    ],
    css: {
      preprocessorOptions: {
        //define global scss variable
        scss: {
          // additionalData: `@import '@/assets/styles/variables.scss';`,
        },
      },
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
    },
  }
}
