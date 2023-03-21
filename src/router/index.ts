import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const list: RouteRecordRaw[] = [
  {
    path: '/mass',
    name: 'mass',
    component: () => import('@/views/mass/index.vue'),
  },
  {
    path: '/sdf',
    name: 'sdf',
    component: () => import('@/views/sdf/index.vue'),
  },
  {
    path: '/line',
    name: 'line',
    component: () => import('@/views/line/index.vue'),
    meta: {
      title: '',
    },
  },
  {
    path: '/polygon',
    name: 'polygon',
    component: () => import('@/views/polygon/index.vue'),
  }
]

const basicRoutes: RouteRecordRaw[] = list


export const router = createRouter({
  history: createWebHistory(),
  routes: basicRoutes,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

export function setupRouter(app: App<Element>) {
  app.use(router)
}
