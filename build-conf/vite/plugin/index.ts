import vue from '@vitejs/plugin-vue'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import Components from 'unplugin-vue-components/vite'

export function createPlugins() {
  const plugins = [
    vue(),
    // 扩展setup插件，支持在script标签中使用name属性
    vueSetupExtend(),
    // Components({
    //   dts: true,
    //   dirs: ['src/components'], // 按需加载的文件夹
    // }),
    Components({
      resolvers: [],
    }),
  ]
  return plugins
}
