<template>
  <div v-if="!isLoginPage && !isRegisterPage" class="header-container">
    <div class="header-content">
      <span class="app-title">智能排课系统</span>
      <div class="header-right-section">
        <span v-if="currentTaskName" class="current-task">
          <i class="el-icon-notebook-2 task-icon"></i>
          {{ currentTaskName }}
        </span>

        <ul class="nav-menu">
          <li><router-link to="/taskList" active-class="active">任务列表</router-link></li>
          <li><router-link to="/scheduleTool" active-class="active">排课工具</router-link></li>
        </ul>

        <div v-if="username" class="user-profile">
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="el-dropdown-link">
              <i class="el-icon-user user-icon"></i>
              <span class="username">{{ username }}</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <i class="el-icon-switch-button"></i> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState(['username', 'currentTaskName']),
    isLoginPage() {
      return this.$route.name === 'Login';
    },
    isRegisterPage() {
      return this.$route.name === 'Register';
    }
  },
  methods: {
    handleCommand(command) {
      if (command === 'logout') {
        this.logout();
      }
    },
    ...mapActions(['logout'])
  }
};
</script>

<style scoped lang="scss">
.header-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 0 30px;
  height: 60px;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 100;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  background: linear-gradient(to right, #3498db, #2c3e50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-right-section {
  display: flex;
  align-items: center;
  gap: 30px;
}

.current-task {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
  color: #34495e;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 6px 12px;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .task-icon {
    margin-right: 6px;
    color: #3498db;
  }
}

.nav-menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 20px;

  li {
    position: relative;

    a {
      text-decoration: none;
      color: #7f8c8d;
      padding: 8px 0;
      font-weight: 500;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;

      &:hover {
        color: #3498db;
      }

      &.active {
        color: #3498db;
        font-weight: 600;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(to right, #3498db, #2ecc71);
          border-radius: 3px 3px 0 0;
        }
      }
    }
  }
}

.user-profile {
  .el-dropdown-link {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #34495e;
    transition: all 0.3s;

    &:hover {
      color: #3498db;
    }

    .user-icon {
      font-size: 18px;
      margin-right: 8px;
      color: #3498db;
    }

    .username {
      font-weight: 500;
    }
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 15px;
  }

  .current-task {
    display: none;
  }

  .nav-menu {
    gap: 10px;
  }
}
</style>
