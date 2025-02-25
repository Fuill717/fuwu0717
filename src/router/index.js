// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/components/UserLogin.vue'; 
import Register from '@/components/UserRegis.vue'; 
import TaskList from '@/views/TaskList.vue';
import ScheduleTool from '@/views/ScheduleTool.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  { path: '/taskList', 
    name: 'TaskList', 
    component: TaskList 
  },
  { path: '/scheduleTool', 
    name: 'ScheduleTool', 
    component: ScheduleTool 
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes // short for `routes: routes`
});

export default router;