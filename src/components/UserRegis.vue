<template>
  <div class="container">
    <div class="header">
      <div class="logo">慧排课</div>
      <h1 class="title">创建您的账户</h1>
      <p class="subtitle">开始您的旅程</p>
    </div>
    <form @submit.prevent="register" class="form">
      <div class="input-group">
        <input v-model="username" placeholder=" " @blur="validateUsername" class="input-field" />
        <label class="input-label">用户名</label>
      </div>
      <div class="input-group">
        <input v-model="password" type="password" placeholder=" " @blur="validatePassword" class="input-field" />
        <label class="input-label">密码</label>
      </div>
      <div class="input-group">
        <input v-model="confirmPassword" type="password" placeholder=" " @blur="validateConfirmPassword" class="input-field" />
        <label class="input-label">确认密码</label>
      </div>

      <p v-if="error" class="error-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        {{ error }}
      </p>

      <button :disabled="loading" class="submit-button">
        <span v-if="!loading">立即注册</span>
        <div v-else class="spinner"></div>
      </button>

      <div class="divider">
        <span>或</span>
      </div>

      <div class="login-link">
        已有账号？ <span @click="goToLogin">登录</span>
      </div>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      username: "",
      password: "",
      confirmPassword: "",
      rememberMe: false,
      error: "",
      loading: false,
    };
  },
  methods: {
    validateUsername() {
      if (!this.username) {
        this.error = "请输入账号";
      } else {
        this.error = "";
      }
    },
    validatePassword() {
      if (!this.password) {
        this.error = "请输入密码";
      } else {
        this.error = "";
      }
    },
    validateConfirmPassword() {
      if (this.password !== this.confirmPassword) {
        this.error = "两次密码输入不一致";
      } else {
        this.error = "";
      }
    },
    async register() {
      if (!this.username || !this.password || !this.confirmPassword) {
        this.error = "所有字段都不能为空";
        return;
      }

      this.loading = true;

      try {
        const response = await axios.post("http://47.97.56.13:12350/register", {
          username: this.username,
          password: this.password,
          password_confirm: this.confirmPassword,
        });

        if (response.data.success) {
          this.$router.push({name: "Login"});
        } else {
          this.error = response.data.message || "注册失败";
        }
      } catch (error) {
        if (error.response) {
          this.error = error.response.data.message || "注册失败";
        } else {
          console.error(error);
          this.error = "网络错误，请稍后再试";
        }
      } finally {
        this.loading = false;
      }
    },
    goToLogin() {
      this.$router.push({name: "Login"});
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 440px;
  margin: 0 auto;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.header {
  text-align: center;
  margin-bottom: 36px;
}

.logo {
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  position: relative;
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  padding: 18px 16px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.input-field:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  outline: none;
  background-color: #fff;
}

.input-label {
  position: absolute;
  left: 16px;
  top: 18px;
  color: #95a5a6;
  font-size: 16px;
  transition: all 0.3s ease;
  pointer-events: none;
}

.input-field:focus + .input-label,
.input-field:not(:placeholder-shown) + .input-label {
  top: 8px;
  font-size: 12px;
  color: #3498db;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e74c3c;
  font-size: 14px;
  margin: -12px 0 8px;
  padding: 0 8px;
}

.submit-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  height: 52px;
  position: relative;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.3);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.divider {
  display: flex;
  align-items: center;
  color: #95a5a6;
  font-size: 14px;
  margin: 8px 0;
}

.divider::before, .divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #e0e0e0;
}

.divider::before {
  margin-right: 16px;
}

.divider::after {
  margin-left: 16px;
}

.login-link {
  text-align: center;
  color: #7f8c8d;
  font-size: 15px;
}

.login-link span {
  color: #3498db;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.login-link span:hover {
  color: #2980b9;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .container {
    margin: 20px;
    padding: 30px 24px;
    border-radius: 12px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .form {
    gap: 20px;
  }

  .input-field {
    padding: 16px 14px 6px;
  }

  .submit-button {
    padding: 14px;
    height: 48px;
  }
}
</style>
