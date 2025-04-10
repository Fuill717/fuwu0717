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

    <!-- 添加task_id输入框 -->
    <div class="task-id-input">
      <label for="task-id">任务ID:</label>
      <input type="number" id="task-id" v-model.number="rules.task_id" @change="saveRulesToBackend" />
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

    <!-- 保存按钮 -->
    <button @click="saveAllSettings" class="save-button">保存设置</button>

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
import axios from 'axios';

// 假设您的token存储在localStorage中
const token = localStorage.getItem('userToken');

// 创建一个axios实例，配置默认headers
const api = axios.create({
  baseURL: 'http://47.97.56.13:12350/api', // 假设这是您的API基础URL
  headers: {
    'Authorization': `Bearer ${token}` // 在所有请求中添加token
  }
});

// 数据定义
const rules = ref({
  priority: false,
  night: false,
  weekend: false,
  experiment: false,
  PE: false,
  task_id: ref(1), // 初始化task_id为1
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
};

const toggleHolidayCalendar = () => {
  isHolidayCalendarVisible.value = !isHolidayCalendarVisible.value;
};

const confirmCourseSelection = () => {
  selectedCourses.value = [...tempSelectedCourses.value];
  showCourseSelection.value = false;
};

const cancelCourseSelection = () => {
  showCourseSelection.value = false;
};

const clearHolidays = () => {
  holidays.value = [];
};

// 保存所有设置的函数
const saveAllSettings = async () => {
  try {
    // 保存规则到后端
    const rulesToSend = { ...rules.value, task_id: Math.abs(rules.value.task_id) };
    const rulesResponse = await api.post('/set/conditions', rulesToSend);
    console.log('规则保存成功:', rulesResponse.data);

    // 保存课程选择到后端
    const coursesToSend = selectedCourses.value.map(courseName => {
      return { course_id: allCourses.value.indexOf(courseName) + 1, course_name: courseName };
    });
    const coursesDataToSend = { courses: coursesToSend, task_id: rules.value.task_id };
    const coursesResponse = await api.post('/select/courses', coursesDataToSend);
    console.log('课程选择保存成功:', coursesResponse.data);

    // 保存节假日设置到后端
    const holidaysDataToSend = { dates: holidays.value, task_id: rules.value.task_id };
    const holidaysResponse = await api.post('/set/holidays', holidaysDataToSend);
    console.log('节假日设置保存成功:', holidaysResponse.data);

    alert('所有设置已保存成功');
  } catch (error) {
    console.error('保存设置失败:', error);
    alert('保存设置失败，请稍后再试');
  }
};


</script>
<style scoped>
.rule-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}


.course-selection,
.holiday-setting {
  margin-top: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
}

.course-selection h3,
.holiday-setting h3 {
  margin-top: 0;
  color: #333333;
}

.course-selection ul,
.holiday-setting ul {
  padding: 0;
  list-style: none;
}

.course-selection ul li,
.holiday-setting ul li {
  background-color: #ffffff;
  margin-bottom: 5px;
  padding: 10px;
  border: 1px solid #e1e1e1;
  border-radius: 4px;
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

.course-selection-modal .modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.course-selection-modal h4 {
  margin-top: 0;
  color: #333333;
}

.course-selection-modal ul {
  max-height: 300px;
  overflow-y: auto;
  padding: 0;
  list-style: none;
}

.course-selection-modal li {
  margin-bottom: 10px;
}

.course-selection-modal button {
  margin-top: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.course-selection-modal button:hover {
  background-color: #409eff;
  color: white;
}

/* 添加动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.rule-settings h2 {
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  border-bottom: 2px solid #3498db;
  padding-bottom: 12px;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
}

.rule-settings h2::before {
  content: "⚙️";
  margin-right: 10px;
  font-size: 20px;
}

.rule-option {
  margin-bottom: 18px;
  padding: 12px 15px;
  background-color: #f8fafc;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.rule-option:hover {
  background-color: #f1f5f9;
  transform: translateX(5px);
}

.rule-option label {
  display: flex;
  align-items: center;
  color: #4a5568;
  font-size: 15px;
  cursor: pointer;
}

.rule-option input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e0;
  border-radius: 4px;
  margin-right: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rule-option input[type="checkbox"]:checked {
  background-color: #3498db;
  border-color: #3498db;
}

.rule-option input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 14px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.task-id-input {
  margin: 25px 0;
  padding: 15px;
  background-color: #f8fafc;
  border-radius: 8px;
}

.task-id-input label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4a5568;
}

.task-id-input input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.task-id-input input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

.section-container {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 10px;
  border-left: 4px solid #3498db;
}

.section-container h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.section-container h3::before {
  content: "📌";
  margin-right: 8px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
}

.button-group button {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.button-group button::before {
  margin-right: 6px;
}

.button-group button:first-child {
  background-color: #3498db;
  color: white;
}

.button-group button:first-child:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.button-group .clear-button {
  background-color: #e74c3c;
  color: white;
}

.button-group .clear-button:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

.section-container ul {
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.section-container ul li {
  background-color: white;
  padding: 10px 15px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.section-container ul li::before {
  content: "✔";
  color: #27ae60;
  margin-right: 6px;
  font-size: 12px;
}

.save-button {
  display: block;
  width: 100%;
  padding: 14px;
  margin-top: 30px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(39, 174, 96, 0.2);
}

.save-button:hover {
  background-color: #219653;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(39, 174, 96, 0.3);
}

.save-button:active {
  transform: translateY(0);
}

.course-selection-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.4s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px;
  background-color: #3498db;
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-body ul {
  padding: 0;
  list-style: none;
}

.modal-body li {
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.modal-body li:last-child {
  border-bottom: none;
}

.modal-body label {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-body label:hover {
  color: #3498db;
}

.modal-body input[type="checkbox"] {
  margin-right: 12px;
}

.modal-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background-color: #f8fafc;
}

.modal-footer button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-footer button:first-child {
  background-color: #e74c3c;
  color: white;
}

.modal-footer button:last-child {
  background-color: #3498db;
  color: white;
}

.modal-footer button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .rule-settings {
    padding: 20px 15px;
  }

  .section-container {
    padding: 15px;
  }

  .button-group {
    flex-direction: column;
  }

  .modal-content {
    width: 95%;
    max-height: 90vh;
  }
}

/* 添加一些微妙的过渡效果 */
* {
  transition: background-color 0.3s ease, transform 0.2s ease;
}

/* 输入框和按钮的聚焦状态 */
input:focus, button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
}

/* 禁用文本选择 */
button, label {
  user-select: none;
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}
</style>
