<template>
  <div class="success-container">
    <BlackBlitzzQuiz />
    <h1>C'est presque fini !</h1>
    <p>Nous avons envoyé un email à <strong>{{ email }}</strong>.</p>
    <p>Veuillez cliquer sur le lien pour activer votre compte BlizzQuiz.</p>
    <button @click="$router.push('/connexion')">Retour à la connexion</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 可以从 Store 里拿，或者通过 query 传过来
      email: this.$route.query.email || "votre email"
    }
  }
}
</script>