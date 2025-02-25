<template>
  <div class="rule-settings">
    <h2>规则设置</h2>

    <!-- 规则选项 -->
    <div class="rule-option" v-for="(value, key) in rules" :key="key">
      <label>
        <input type="checkbox" v-model="rules[key]" @change="saveRulesToBackend" />
        {{ formatRuleName(key) }}
      </label>
    </div>

    <!-- 选择先不排的课程 -->
    <div class="course-selection">
      <h3>选择先不排的课程</h3>
      <div class="button-group">
        <button @click="showCourseSelection = true">选择课程</button>
        <button @click="clearSelectedCourses" class="clear-button">清空</button>
      </div>
      <ul v-if="selectedCourses.length > 0">
        <li v-for="(course, index) in selectedCourses" :key="index">{{ course }}</li>
      </ul>
    </div>

    <!-- 节假日智能调课 -->
    <div class="holiday-setting">
      <h3>节假日智能调课</h3>
      <div class="button-group">
        <button @click="toggleHolidayCalendar">选择节假日</button>
        <button @click="clearHolidays" class="clear-button">清空</button>
      </div>
      <div v-if="isHolidayCalendarVisible" class="holiday-calendar">
        <input type="date" multiple v-model="holidays" @change="saveHolidaysToBackend" />
      </div>
      <ul v-if="holidays.length > 0">
        <li v-for="(holiday, index) in holidays" :key="index">{{ holiday }}</li>
      </ul>
    </div>

    <!-- 弹窗：选择课程 -->
    <div v-if="showCourseSelection" class="course-selection-modal">
      <h4>选择课程</h4>
      <ul>
        <li v-for="(course, index) in allCourses" :key="index">
          <label>
            <input type="checkbox" v-model="tempSelectedCourses" :value="course" />
            {{ course }}
          </label>
        </li>
      </ul>
      <button @click="confirmCourseSelection">确认</button>
      <button @click="cancelCourseSelection">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios'; // 引入 Axios 进行 HTTP 请求

// 数据定义
const rules = ref({
  priority: false,
  night: false,
  weekend: false,
  experiment: false,
  PE: false,
});

const showCourseSelection = ref(false);
const allCourses = ref(['数学分析', '线性代数', '大学物理', '计算机基础']);
const tempSelectedCourses = ref([]);
const selectedCourses = ref([]);

const isHolidayCalendarVisible = ref(false);
const holidays = ref([]);

// 方法定义
const formatRuleName = (key) => {
  const ruleNames = {
    priority: '是否按优先级排课',
    night: '晚上是否排课',
    weekend: '周末是否排课',
    experiment: '实验课是否能安排在晚上',
    PE: '体育课是否只安排在下午',
  };
  return ruleNames[key] || key;
};

const clearSelectedCourses = () => {
  selectedCourses.value = [];
  saveCoursesToBackend(); // 清空后同步到后端
};

const toggleHolidayCalendar = () => {
  isHolidayCalendarVisible.value = !isHolidayCalendarVisible.value;
};

const confirmCourseSelection = () => {
  selectedCourses.value = [...tempSelectedCourses.value];
  showCourseSelection.value = false;
  saveCoursesToBackend(); // 确认后同步到后端
};

const cancelCourseSelection = () => {
  showCourseSelection.value = false;
};

const clearHolidays = () => {
  holidays.value = [];
  saveHolidaysToBackend(); // 清空后同步到后端
};

// 同步规则设置到后端
const saveRulesToBackend = async () => {
  try {
    await axios.post('/api/rules/settings', rules.value);
  } catch (error) {
    console.error('保存规则失败:', error);
    alert('保存规则失败，请稍后再试');
  }
};

// 同步课程选择到后端
const saveCoursesToBackend = async () => {
  try {
    await axios.post('/api/courses/selection', { courses: selectedCourses.value });
  } catch (error) {
    console.error('保存课程选择失败:', error);
    alert('保存课程选择失败，请稍后再试');
  }
};

// 同步节假日设置到后端
const saveHolidaysToBackend = async () => {
  try {
    await axios.post('/api/holidays/settings', { holidays: holidays.value });
  } catch (error) {
    console.error('保存节假日设置失败:', error);
    alert('保存节假日设置失败，请稍后再试');
  }
};
</script>
  <style scoped>
  .rule-settings {
    padding: 20px;
    background-color: #f5f5f5;
  }
  
  .rule-option {
    margin-bottom: 10px;
  }
  
  .course-selection,
  .holiday-setting {
    margin-top: 20px;
  }
  
  .course-selection h3,
  .holiday-setting h3 {
    margin-bottom: 10px;
  }
  
  /* 按钮组样式 */
  .button-group {
    display: flex;
    gap: 10px; /* 设置按钮之间的间距 */
    align-items: center;
  }
  
  /* 默认按钮样式 */
  .button-group button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    height: 40px;
  }
  
  /* 清空按钮样式 */
  .button-group .clear-button {
    background-color: #ff4d4f; /* 红色背景 */
    color: white;
    font-size: 12px; /* 字体变小 */
    padding: 4px 8px ; /* 尺寸变小 */
    width: 80px;
    height: 40px;
  }
  
  /* 清空按钮悬停效果 */
  .button-group .clear-button:hover {
    background-color: #ff7875; /* 稍浅的红色 */
  }
  
  .course-selection ul li,
  .holiday-setting ul li {
    list-style-type: none;
    margin-bottom: 5px;
  }
  
  .course-selection-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .course-selection-modal ul {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
  }
  
  .course-selection-modal button {
    margin-top: 10px;
  }
  </style>