<template>
  <div class="data-settings">
    <!-- 图表显示 -->
    <div class="chart-display">
      <h3>统计分析</h3>
      <!-- 添加输入框 -->
      <input type="text" v-model="sheetName" placeholder="请输入sheetName" />
      <button @click="fetchVisualization">加载图表</button>
      <div v-if="chartImageData" class="chart-image">
        <img :src="chartImageData" alt="统计分析图表" />
      </div>
      <div v-else class="import-status">
        图表尚未加载，请点击“加载图表”按钮。
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const chartImageData = ref(null);
const APIBASEURL = 'http://47.97.56.13:12350/api';
// 添加一个新的响应式引用来绑定输入框的值
const sheetName = ref('');

const fetchVisualization = async () => {
  try {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (!token) {
      alert('请先登录');
      return;
    }

    // 使用新的响应式引用作为sheetName的值
    const requestData = {
      sheetName: sheetName.value
    };

    const response = await axios.post(`${APIBASEURL}/visualization`, requestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      responseType: 'blob'
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      chartImageData.value = e.target.result;
    };
    reader.readAsDataURL(response.data);
  } catch (error) {
    console.error('加载图表失败:', error);
    alert('加载图表失败，请稍后再试');
  }
};
</script>

<style scoped>
.data-settings {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chart-display {
  background-color: #f9f9f9;
  border: 1px solid #e1e1e1;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.chart-display h3 {
  margin-top: 0;
  color: #333333;
}

input[type="text"] {
  width: calc(100% - 120px); /* 考虑按钮宽度 */
  padding: 10px;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* 包含padding和border在内的总宽高 */
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

.chart-image img {
  max-width: 100%;
  height: auto;
  margin-top: 10px;
  border-radius: 4px;
}

.import-status {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 10px;
  margin-top: 10px;
  border-radius: 4px;
  color: #666666;
}

/* 添加一些动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.chart-image {
  animation: fadeIn 0.5s ease-in-out;
}
</style>
