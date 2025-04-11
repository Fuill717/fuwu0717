<template>
  <div class="course-scheduler">
    <nav class="navigation-bar">
      <button
          v-for="(tab, index) in tabs"
          :key="index"
          :class="{ active: currentTab === tab }"
          @click="switchTab(tab)"
      >
        {{ tab }}
        <span class="tab-indicator"></span>
      </button>
    </nav>

<!--    &lt;!&ndash; Display the current TaskId &ndash;&gt;-->
<!--    <div class="task-id-display">-->
<!--      <p>当前任务ID: {{ taskId }}</p>-->
<!--    </div>-->

    <!-- 提示信息 -->
    <div v-if="!dataImported && (currentTab !== '数据设置')" class="data-alert">
      <div class="alert-content">
        <svg class="alert-icon" viewBox="0 0 24 24">
          <path fill="currentColor"
                d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z"/>
        </svg>
        <p>请先完成数据导入</p>
      </div>
    </div>

    <!-- 动态组件 -->
    <div class="tab-content">
    <component
        :is="currentComponent"
        v-show="dataImported || (currentTab === '数据设置')"
        :task-id="taskId"
        :tab-data="tabData[currentTab]"
        @update-data="handleUpdateData"
    ></component>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios'; // 引入 Axios 进行 HTTP 请求
import DataSettings from './DataSettings.vue';
import SchedulingConditions from './SchedulingConditions.vue';
import ManualScheduling from './ManualScheduling.vue';
import StatisticsAnalysis from './StatisticsAnalysis.vue';

// 定义状态
const tabs = ['数据设置', '排课条件设置', '手动排课以及导出', '统计分析'];
const currentTab = ref('数据设置');
const dataImported = ref(true); // 数据是否已导入
const tabData = ref({}); // 各标签页的数据
const route = useRoute();  // 获取路由对象
const taskId = ref(route.query.taskId || '未设置');

// 动态加载组件
const currentComponent = computed(() => {
  const components = {
    '数据设置': DataSettings,
    '排课条件设置': SchedulingConditions,
    '手动排课以及导出': ManualScheduling,
    '统计分析': StatisticsAnalysis,
  };
  return components[currentTab.value];
});

// 初始化数据
onMounted(async () => {
  try {
    const response = await axios.get('/api/course-scheduler/init'); // 获取初始数据
    tabData.value = response || {};
    // dataImported.value = !!tabData.value['数据设置']; // 检查是否有数据导入
    dataImported.value = true; // 检查是否有数据导入
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
});

// 切换标签页
const switchTab = async (tab) => {
  if (!dataImported.value) {
    alert('请先完成数据导入');
    return;
  }

  currentTab.value = tab;
};



// 处理子组件数据更新
const handleUpdateData = (newData) => {
  tabData.value[currentTab.value] = { ...tabData.value[currentTab.value], ...newData };
};
</script>

<style scoped>
.course-scheduler {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: #f5f7fa;
}

.navigation-bar {
  display: flex;
  padding: 0 20px;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 10;
}

.navigation-bar button {
  padding: 12px 24px;
  margin-right: 4px;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
  color: #5f6368;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  position: relative;
  outline: none;
}

.navigation-bar button:hover {
  color: #1976d2;
  background-color: rgba(25, 118, 210, 0.04);
}

.navigation-bar button.active {
  color: #1976d2;
  font-weight: 600;
}

.navigation-bar button.active .tab-indicator {
  transform: scaleX(1);
  background-color: #1976d2;
}

.navigation-bar button.has-data:after {
  content: '';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #4caf50;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: transparent;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.data-alert {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #fff3e0;
  border-radius: 8px;
  margin: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-icon {
  width: 24px;
  height: 24px;
  color: #ff9800;
}

.data-alert p {
  margin: 0;
  color: #e65100;
  font-weight: 500;
}

.tab-content {
  flex: 1;
  padding: 24px;
  background-color: white;
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navigation-bar {
    overflow-x: auto;
    padding: 0 10px;
    -webkit-overflow-scrolling: touch;
  }

  .navigation-bar button {
    padding: 12px 16px;
    font-size: 13px;
    white-space: nowrap;
  }

  .tab-content {
    margin: 8px;
    padding: 16px;
  }
}
</style>