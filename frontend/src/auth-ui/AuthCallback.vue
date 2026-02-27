<template>
  <div class="auth-callback">
    <div class="loading">
      <div class="spinner"></div>
      <p>Authentification en cours...</p>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRegistrationStore } from '../stores/registration'

export default {
  name: 'AuthCallback',
  setup() {
    const router = useRouter()
    const registrationStore = useRegistrationStore()

    onMounted(async () => {
      try {
        // 1. 获取 Google 返回的 access_token
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const idToken = hashParams.get('id_token');

        console.log("🔍 [Debug] 当前获取到的 Access Token:", idToken);

        if (!idToken) {
          router.push('/connexion');
          return;
        }

        // 2. 直接发给你的 Laravel 后端，不要在前端解析 JWT
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: idToken }) // 字段名保持 access_token 没关系，只要内容是 id_token
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ [Backend Error] 后端验证失败详情:", errorData);
          throw new Error('Erreur backend');
        }

        const data = await response.json();

        // 3. 存储你自己的 Laravel Token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // 4. 根据后端返回的逻辑跳转
        if (data.needs_completion) {
          registrationStore.startGoogleFlow({
            google_id: data.user.google_id, // 确保字段名与后端 AuthController 返回的一致
            email: data.user.email,
            avatar: data.user.avatar
          });
          router.push('/inscription');
        } else {
          router.push(data.user.role === 'TEACHER' ? '/enseignant' : '/etudiant');
        }
      } catch (error) {
        console.error('Erreur:', error);
        // router.push('/connexion');
      }
    })

    return {}
  }
}
</script>

<style scoped>
.auth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading {
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
