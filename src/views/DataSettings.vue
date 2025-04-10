<template>
  <div class="data-settings-container">
    <!-- 左侧卡片 -->
    <div class="left-column">
      <!-- 教室数据导入 -->
      <div class="import-card">
        <h3>教室数据导入</h3>
        <button @click="openFilePicker('classrooms')">导入</button>
        <div v-if="classroomImported" class="import-status">
          已导入，点击重新导入
        </div>
      </div>

      <!-- 排课任务导入 -->
      <div class="import-card">
        <h3>排课任务导入</h3>
        <button @click="openFilePicker('courses')">导入</button>
        <div v-if="schedulingTaskImported" class="import-status">
          已导入，点击重新导入
        </div>
      </div>
    </div>

    <!-- 右侧卡片 -->
    <div class="right-column">
      <!-- 学期时间设置 -->
      <div class="semester-card">
        <h3>学期时间设置</h3>
        <div class="date-picker">
          <label for="start-date">开始时间：</label>
          <button id="start-date-btn" @click="toggleCalendar('start')">{{ startDate || '选择开始时间' }}</button>
          <div id="start-calendar" class="calendar" v-if="isStartCalendarVisible">
            <input type="date" @change="selectDate('start', $event)" />
          </div>
        </div>
        <div class="date-picker">
          <label for="end-date">结束时间：</label>
          <button id="end-date-btn">{{ endDate || '自动计算' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios'; // 引入 Axios 进行 HTTP 请求

const classroomImported = ref(false);
const schedulingTaskImported = ref(false);
const startDate = ref(null); // 开始时间
const endDate = ref(null); // 结束时间
const isStartCalendarVisible = ref(false); // 控制开始时间日历的显示
const weeks = ref([]); // 每周的时间段
const userId = 1; // 用户 ID

// 打开文件选择器并上传文件
const openFilePicker = async (type) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv, .xls, .xlsx'; // 可以根据需要调整文件类型
  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // 从 localStorage 中获取 token， 若没有则从 sessionStorage 中获取
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        alert('请先登录');
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/import/${type}/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.code === 200) {
        if (type === 'classroom') {
          classroomImported.value = true;
        } else if (type === 'scheduling') {
          schedulingTaskImported.value = true;
        }
        alert('导入成功');
      } else {
        alert('导入失败，请检查文件格式');
      }
    } catch (error) {
      console.error(error);
      alert('导入失败，请稍后再试');
    }
  };
  input.click();
};

// 切换日历显示
const toggleCalendar = (type) => {
  if (type === 'start') {
    isStartCalendarVisible.value = !isStartCalendarVisible.value;
  }
};

// 选择日期并更新开始时间
const selectDate = async (type, event) => {
  const selectedDate = event.target.value; // 获取用户选择的日期
  if (type === 'start') {
    startDate.value = selectedDate;
    calculateEndDate(selectedDate); // 根据开始时间计算结束时间
    divideIntoWeeks(selectedDate); // 划分每周时间段
    isStartCalendarVisible.value = false; // 关闭日历

    try {
      await saveSemesterDates(); // 将日期保存到后端
    } catch (error) {
      console.error('保存日期失败:', error);
      alert('保存日期失败，请稍后再试');
    }
  }
};

// 计算结束时间
const calculateEndDate = (startDateStr) => {
  const start = new Date(startDateStr);
  const end = new Date(start.getTime() + 18 * 7 * 24 * 60 * 60 * 1000); // 向后推 18 周
  endDate.value = formatDate(end); // 格式化日期并赋值给结束时间
};

// 划分每周时间段
const divideIntoWeeks = (startDateStr) => {
  const start = new Date(startDateStr);
  const weekArray = [];
  for (let i = 0; i < 18; i++) {
    const weekStart = new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    weekArray.push({
      week: i + 1,
      start: formatDate(weekStart),
      end: formatDate(weekEnd),
    });
  }
  weeks.value = weekArray; // 更新每周时间段
};

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 保存学期时间到后端
const saveSemesterDates = async () => {
  try {
    // 从 localStorage 中获取 token， 若没有则从 sessionStorage 中获取
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (!token) {
      alert('请先登录');
      return;
    }
    await axios.post(`${process.env.VUE_APP_API_BASE_URL}/import/semester/1`, {
      start_date: new Date(startDate.value).toISOString(),
      end_date: new Date(endDate.value).toISOString(),
      weeks: weeks.value,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
  } catch (error) {
    console.error('保存学期日期失败:', error.message); // 记录错误日志
    alert('保存学期日期失败，请稍后再试'); // 提示用户
    throw error; // 如果需要，继续将错误抛出给上层
  }
};
</script>

<style scoped>
/* 全局变量 */
:root {
  --primary-color: #4361ee;
  --primary-hover: #3a56d4;
  --primary-light: rgba(67, 97, 238, 0.1);
  --text-color: #2b2d42;
  --text-light: #6c757d;
  --light-gray: #f8f9fa;
  --gray: #adb5bd;
  --dark-gray: #495057;
  --error-color: #ef233c;
  --success-color: #4bb543;
  --white: #ffffff;
  --box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  --border-radius: 12px;
  --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.data-settings-container {
  display: flex;
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 30px;
  gap: 30px;
  min-height: calc(100vh - 80px);
  align-items: center;
}

.left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
  height: 100%;
}

.right-column {
  flex: 1;
  height: 100%;
}

.import-card, .semester-card {
  background-color: whitesmoke;
  padding: 44px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.import-card::before, .semester-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), #3a0ca3);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
  z-index: 2;
}

.import-card:hover, .semester-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.import-card:hover::before, .semester-card:hover::before {
  transform: scaleX(1);
}

.import-card:hover::after, .semester-card:hover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 80% 20%, rgba(67, 97, 238, 0.08) 0%, transparent 70%);
  z-index: -1;
  border-radius: var(--border-radius);
}

.import-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.semester-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

h3 {
  color: var(--text-color);
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 16px;
}

h3::before {
  content: "";
  position: absolute;
  left: 0;
  width: 5px;
  height: 22px;
  background: linear-gradient(to bottom, var(--primary-color), #3a0ca3);
  border-radius: 3px;
}

button {
  background: linear-gradient(135deg, var(--primary-color), #3a0ca3);
  color: black;
  border: none;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.25);
  position: relative;
  overflow: hidden;
}

button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

button:hover::after {
  animation: ripple 1s ease-out;
  opacity: 1;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0) translate(-50%, -50%);
    opacity: 0.5;
  }
  100% {
    transform: scale(20, 20) translate(-50%, -50%);
    opacity: 0;
  }
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(67, 97, 238, 0.35);
}

.import-status {
  background-color: var(--primary-light);
  color: var(--primary-color);
  padding: 14px;
  margin-top: 20px;
  border-radius: var(--border-radius);
  font-size: 14px;
  display: flex;
  align-items: center;
  transition: var(--transition);
  cursor: pointer;
  border: 1px dashed rgba(67, 97, 238, 0.3);
}

.import-status:hover {
  background-color: rgba(67, 97, 238, 0.15);
  border-color: rgba(67, 97, 238, 0.5);
}

.import-status::before {
  content: "✓";
  display: inline-block;
  margin-right: 10px;
  color: var(--success-color);
  font-weight: bold;
  font-size: 16px;
}

.date-picker {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.date-picker label {
  width: 100px;
  color: var(--text-light);
  font-size: 15px;
  font-weight: 500;
}

.date-picker button {
  flex: 1;
  background: var(--light-gray);
  color: var(--text-color);
  text-align: left;
  justify-content: flex-start;
  padding-left: 18px;
  box-shadow: none;
}

.date-picker button:hover {
  background: #e9ecef;
  transform: none;
}

.calendar {
  position: absolute;
  margin-top: 8px;
  padding: 20px;
  background-color: var(--white);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.calendar input[type="date"] {
  padding: 10px 12px;
  border: 1px solid var(--gray);
  border-radius: var(--border-radius);
  font-family: inherit;
  font-size: 15px;
  width: 100%;
}

/* 卡片内容布局优化 */
.import-card > div:not(.import-status),
.semester-card > div {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .data-settings-container {
    flex-direction: column;
    padding: 20px;
    margin: 20px auto;
    gap: 20px;
  }

  .left-column, .right-column {
    width: 100%;
  }

  .import-card, .semester-card {
    padding: 22px;
  }

  .date-picker {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .date-picker label {
    width: auto;
    margin-bottom: 0;
  }

  .date-picker button {
    width: 100%;
  }
}
</style>
