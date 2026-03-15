<template>
  <div class="desktop-inscription-page-2">
    <div class="background-video">
      <video autoplay loop playsinline muted>
        <source src="/videos/LandingPage.mp4" type="video/mp4" />
      </video>
    </div>
    <div class="espace-inscription">
      <div class="form-content">
        <BlackBlitzzQuiz class="logo" />
        <div class="titre">
          <p>Création</p>
          <p> </p>
          <p>du</p>
          <p> </p>
          <p>compte</p>
        </div>

        <InputCourriel
            v-model="formData.email"
            placeholder="Courriel"
            :disabled="registrationStore.isGoogleFlow"
        />

        <InputNomUtilisateur v-model="formData.username" />

        <template v-if="!registrationStore.isGoogleFlow">
          <InputMotDePasse v-model="formData.password" />
          <InputConfirmerMotDePasse v-model="formData.confirmPassword" />
        </template>

        <BoutonRetour class="bouton-retour-position" @click="$router.back()" />
        <BoutonConfirmer class="bouton-confirmer-position" @click="goToValidation" :disabled="loading" />
      </div>
    </div>
  </div>
</template>

<script>
import BlackBlitzzQuiz from '../components/BlackBlitzzQuiz.vue'
import InputCourriel from '../components/InputCourriel.vue'
import InputNomUtilisateur from '../components/InputNomUtilisateur.vue'
import InputMotDePasse from '../components/InputMotDePasse.vue'
import InputConfirmerMotDePasse from '../components/InputConfirmerMotDePasse.vue'
import BoutonRetour from '../components/BoutonRetour.vue'
import BoutonConfirmer from '../components/BoutonConfirmer.vue'
import { authService } from '../../api/auth'
import { useRegistrationStore } from '../../stores/registration'

export default {
  name: 'DesktopInscriptionPage2',
  components: {
    BlackBlitzzQuiz,
    InputCourriel,
    InputNomUtilisateur,
    InputMotDePasse,
    InputConfirmerMotDePasse,
    BoutonRetour,
    BoutonConfirmer,
  },
  setup() {
    const registrationStore = useRegistrationStore()
    return { registrationStore }
  },
  data() {
    return {
      formData: {
        email: this.registrationStore.email || '',
        username: this.registrationStore.username || '',
        password: this.registrationStore.isGoogleFlow 
          ? 'GoogleAuthSecure!' 
          : (this.registrationStore.password || ''),
        confirmPassword: this.registrationStore.isGoogleFlow 
          ? 'GoogleAuthSecure!' 
          : (this.registrationStore.confirmPassword || ''),
      },
      loading: false,
      error: null,
      isSubmitting: false,
    }
  },
  methods: {
    async goToValidation() {
      // 1. 防止重复提交 [cite: 2026-03-15]
      if (this.isSubmitting) return

      // 2. 前端表单预验证
      if (this.registrationStore.isGoogleFlow) {
        if (!this.formData.email || !this.formData.username) {
          alert('Veuillez remplir l\'email et le nom d\'utilisateur')
          return
        }
        if (!this.registrationStore.niveauEtude) {
          alert('Veuillez sélectionner un niveau d\'étude')
          return
        }
      } else {
        if (!this.formData.email || !this.formData.username ||
            !this.formData.password || !this.formData.confirmPassword) {
          alert('Veuillez remplir tous les champs')
          return
        }

        if (this.formData.password !== this.formData.confirmPassword) {
          alert('Les mots de passe ne correspondent pas')
          return
        }
      }

      // 3. 开启加载状态
      this.loading = true
      this.isSubmitting = true
      this.error = null

      try {
        // 同步 Store 数据
        this.registrationStore.setCredentials(
            this.formData.email,
            this.formData.username,
            this.formData.password,
            this.formData.confirmPassword,
            this.registrationStore.niveauEtude
        )

        let data
        if (this.registrationStore.isGoogleFlow) {
          // --- 流程 A: 谷歌注册 ---
          const gid = this.registrationStore.googleUser?.googleId;

          data = await authService.registerGoogleFinal({
            email: this.formData.email,
            username: this.formData.username,
            google_id: gid,
            role: this.registrationStore.role,
            education_level: this.registrationStore.niveauEtude,
            avatar: this.registrationStore.googleUser?.avatar
          });

          // 谷歌用户已自动验证，直接存入 Token 登录
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))

          // 根据角色跳转主页
          if (data.user.role === 'TEACHER') {
            this.$router.push('/enseignant')
          } else {
            this.$router.push('/etudiant')
          }

        } else {
          // --- 流程 B: 普通邮件注册 ---
          data = await authService.register(
              this.formData.email,
              this.formData.username,
              this.formData.password,
              this.formData.confirmPassword,
              this.registrationStore.role,
              this.registrationStore.niveauEtude
          )


          this.$router.push('/inscription/success')
        }

      } catch (error) {
        console.error("Erreur inscription:", error)
        // 捕获后端返回的错误信息（如邮箱已存在）
        alert(error.response?.data?.message || "Erreur lors de l'inscription")
      } finally {
        this.loading = false
        this.isSubmitting = false
      }
    }
  },
}
</script>

<style scoped>
@import './DesktopInscriptionPage2.css';
</style>
