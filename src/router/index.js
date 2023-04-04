import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			component: Dashboard
		},
		{
			path: '/monthly',
			component: () => import('../views/Monthly.vue')
		},
		{
			path: '/settings',
			component: () => import('../views/Settings.vue')
		}
	],
})

export default router