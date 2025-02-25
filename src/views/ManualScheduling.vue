<template>
  <div class="schedule-page">
    <!-- 功能栏 -->
    <div class="toolbar">
      <button @click="autoSchedule">自动排课</button>
      <button @click="checkSchedule">课表检测</button>
      <button @click="resetSchedule">重置课表</button>

      <select @change="setViewMode" v-model="viewMode">
        <option value="classroom">教室课表</option>
        <option value="class">教学班课表</option>
        <option value="teacher">教师课表</option>
      </select>
      <button @click="exportSchedule">导出</button>
    </div>

    <div id="app" class="course-table">
      <div class="header">
        <div></div> <!-- 占位符，确保时间列对齐 -->
        <div v-for="(day, index) in daysOfWeek" :key="index">{{ day }}</div>
      </div>
      <div v-for="(row, rowIndex) in schedule" :key="rowIndex" class="row">
        <div class="time">{{ row.time }}</div> <!-- 显示时间 -->
        <div
          v-for="(cell, colIndex) in row.cells"
          :key="colIndex"
          class="cell"
          :class="{ selected: cell.selected }"
          @click="selectCell(rowIndex, colIndex)"
          @contextmenu.prevent="deleteCourse(rowIndex, colIndex)"
        >
          {{ cell.course || '空闲' }} <!-- 显示课程名称或“空闲” -->
        </div>
      </div>
    </div>

    <div class="course-selector">
      <input type="text" placeholder="搜索课程" v-model="searchCourse" @keyup="filterCourses" />
      <ul>
        <li v-for="(course, index) in filteredCourses" :key="index">
          <span>{{ course.name }}</span> <!-- 显示课程名称 -->
          <button @click="addCourse(course)">添加课程</button>
        </li>
      </ul>
    </div>

    <div class="temp-course-area">
      <h4>课程暂放区</h4>
      <ul>
        <li v-for="(course, index) in tempCourses" :key="index">
          <button @click="restoreCourse(index)">恢复课程</button>
          {{ course.name }}
        </li>
      </ul>
    </div>

    <!-- 统计信息 -->
    <div class="task-statistics">
      <p>总任务数: {{ totalTasks }}</p>
      <p>已完成数: {{ completedTasks }}</p>
      <p>未完成数: {{ uncompletedTasks }}</p>
      <p>未完成原因: {{ uncompletedReasons }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios"; // 引入 Axios 进行 HTTP 请求

export default {
  data() {
    return {
      schedule: [], // 初始化为空数组，从后端加载数据
      viewMode: "classroom",
      daysOfWeek: ["周一", "周二", "周三", "周四", "周五"],
      searchCourse: "",
      courses: [], // 从后端加载课程列表
      filteredCourses: [],
      selectedCourses: [],
      tempCourses: [],
      totalTasks: 0,
      completedTasks: 0,
      uncompletedTasks: 0,
      uncompletedReasons: ["课表冲突", "手动删除", "设置冲突"],
    };
  },
  methods: {
    async loadScheduleFromBackend() {
      try {
        const response = await axios.get("/api/schedule");
        this.schedule = response.data; // 更新课表数据
      } catch (error) {
        console.error("加载课表失败:", error);
        alert("加载课表失败，请稍后再试");
      }
    },
    async saveScheduleToBackend() {
      try {
        await axios.post("/api/schedule/save", { schedule: this.schedule });
      } catch (error) {
        console.error("保存课表失败:", error);
        alert("保存课表失败，请稍后再试");
      }
    },
    async loadCoursesFromBackend() {
      try {
        const response = await axios.get("/api/courses");
        this.courses = response.data; // 更新课程列表
        this.filteredCourses = [...this.courses];
      } catch (error) {
        console.error("加载课程失败:", error);
        alert("加载课程失败，请稍后再试");
      }
    },
    autoSchedule() {
      // 示例：随机填充课表
      this.schedule.forEach((row) => {
        row.cells = row.cells.map(() => ({
          course: this.courses[Math.floor(Math.random() * this.courses.length)]?.name || null,
        }));
      });
      this.saveScheduleToBackend(); // 自动排课后保存到后端
    },
    checkSchedule() {
      const conflicts = [];
      this.schedule.forEach((row) => {
        row.cells.forEach((cell) => {
          if (cell.course && !this.isValidCourse(cell.course)) {
            conflicts.push(cell.course);
          }
        });
      });

      if (conflicts.length > 0) {
        alert(`以下课程不符合要求：${conflicts.join(", ")}`);
      } else {
        alert("无问题");
      }
    },
    resetSchedule() {
      this.loadScheduleFromBackend(); // 重置课表时重新加载初始数据
    },
    setViewMode() {
      console.log("切换视角为:", this.viewMode);
      // 实现视角切换逻辑
    },
    exportSchedule() {
      const tableData = [];
      this.schedule.forEach((row) => {
        const rowData = [row.time];
        row.cells.forEach((cell) => {
          rowData.push(cell.course || "空闲");
        });
        tableData.push(rowData);
      });

      // 导出为 Excel 或 PDF 的逻辑（需引入第三方库如 SheetJS 或 jsPDF）
      console.log("导出数据:", tableData);
    },
    deleteCourse(rowIndex, colIndex) {
      const removedCourse = this.schedule[rowIndex].cells[colIndex].course;
      if (removedCourse) {
        // 将课程对象及其位置信息添加到暂放区
        this.tempCourses.push({
          name: removedCourse,
          rowIndex: rowIndex,
          colIndex: colIndex,
        });
      }
      // 清空课表单元格
      this.schedule[rowIndex].cells[colIndex] = {};
      this.saveScheduleToBackend(); // 删除课程后保存到后端
    },
    restoreCourse(index) {
      const restoredCourse = this.tempCourses.splice(index, 1)[0]; // 移除暂放区的课程
      if (restoredCourse) {
        const { rowIndex, colIndex, name } = restoredCourse;

        // 恢复课程到原位
        this.schedule[rowIndex].cells[colIndex] = { course: name };

        alert(`已恢复课程：${name}`);
        this.saveScheduleToBackend(); // 恢复课程后保存到后端
      }
    },
    selectCell(rowIndex, colIndex) {
      const cell = this.schedule[rowIndex].cells[colIndex];
      if (!cell.course) {
        this.selectedCell = [rowIndex, colIndex]; // 记录选中的单元格位置
        cell.selected = true; // 设置选中状态
      } else {
        alert("该单元格已有课程，无法选中");
      }
    },
    addCourse(course) {
      if (!this.selectedCell) {
        alert("请先选择一个单元格");
        return;
      }

      const [rowIndex, colIndex] = this.selectedCell;
      const targetCell = this.schedule[rowIndex].cells[colIndex];

      if (targetCell.course) {
        alert("该单元格已有课程，无法添加");
        return;
      }

      // 添加课程到目标单元格
      targetCell.course = course.name;

      // 清空选中的单元格
      this.selectedCell = null;
      this.saveScheduleToBackend(); // 添加课程后保存到后端
    },
    filterCourses() {
      this.filteredCourses = this.courses.filter((course) =>
        course.name.toLowerCase().includes(this.searchCourse.toLowerCase())
      );
    },
    isValidCourse(courseName) {
      // 示例：检查课程是否符合规则
      return !["冲突课程1", "冲突课程2"].includes(courseName);
    },
  },
  watch: {
    searchCourse() {
      this.filterCourses();
    },
  },
  created() {
    this.loadScheduleFromBackend(); // 页面加载时加载课表数据
    this.loadCoursesFromBackend(); // 页面加载时加载课程列表
  },
};
</script>
<style scoped>
.schedule-page {
  display: flex;
  flex-direction: column;
}
.course-table {
  font-family: Arial, sans-serif;
  border: 1px solid #ddd;
  border-spacing: 0;
  width: 100%;
}

.header,
.row {
  display: grid;
  grid-template-columns: 150px repeat(5, 1fr); /* 第一列固定宽度，其余列均分 */
  align-items: center;
}

.header > div,
.row > div {
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
}

.header > div:first-child {
  background-color: #f0f0f0;
}

.cell {
  height: 60px;
  background-color: #fff;
  border: 1px solid #ddd;
  cursor: pointer; /* 鼠标悬停时显示为手型 */
}

.cell:hover {
  background-color: #f9f9f9;
}

/* 选中状态样式 */
.cell.selected {
  background-color: #d4edda; /* 绿色背景表示选中 */
  color: #155724;
  font-weight: bold;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.schedule-preview {
  flex: 1;
  overflow-y: auto;
}

.course-selector {
  margin-top: 20px;
}

.course-selector ul {
  list-style: none;
  padding: 0;
}

.course-selector li {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 让名称和按钮分开 */
  margin-bottom: 8px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.course-selector span {
  font-weight: bold;
  flex-grow: 1; /* 让名称占据更多空间 */
}

.course-selector button {
  margin-left: 10px;
}

.temp-course-area ul {
  list-style: none;
  padding: 0;
}

.temp-course-area li {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.temp-course-area button {
  margin-right: 10px;
}
.task-statistics {
  margin-top: 10px;
}
</style>
