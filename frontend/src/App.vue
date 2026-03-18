<template>
  <router-view v-slot="{ Component, route }">
    
    <keep-alive :exclude="['QuizModal', 'QuizOverlay']">
      <component :is="Component" :key="route.fullPath" />
    </keep-alive>

  </router-view>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      videoObserver: null,
      visibilityHandler: null,
      focusHandler: null,
    }
  },
  methods: {
    forcePlay(videoEl) {
      if (!videoEl || typeof videoEl.play !== 'function') return
      const playPromise = videoEl.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {})
      }
    },
    enforceContinuousLoop(videoEl) {
      if (!videoEl || videoEl.dataset.blitzzLoopBound === '1') return

      videoEl.dataset.blitzzLoopBound = '1'
      videoEl.loop = true
      videoEl.muted = true
      videoEl.preload = 'auto'
      videoEl.setAttribute('playsinline', '')
      videoEl.setAttribute('webkit-playsinline', '')

      const restartPlayback = () => {
        if (!videoEl.isConnected) return
        const hasFiniteDuration = Number.isFinite(videoEl.duration) && videoEl.duration > 0
        if (videoEl.ended || (hasFiniteDuration && videoEl.currentTime >= videoEl.duration - 0.05)) {
          try {
            videoEl.currentTime = 0
          } catch (e) {
            // Ignore les erreurs de seek navigateur.
          }
        }
        this.forcePlay(videoEl)
      }

      const resumeIfPaused = () => {
        if (!document.hidden && videoEl.paused) {
          this.forcePlay(videoEl)
        }
      }

      videoEl._blitzzRestartPlayback = restartPlayback
      videoEl._blitzzResumeIfPaused = resumeIfPaused

      videoEl.addEventListener('ended', restartPlayback)
      videoEl.addEventListener('pause', resumeIfPaused)
      videoEl.addEventListener('stalled', restartPlayback)
      videoEl.addEventListener('suspend', restartPlayback)

      this.forcePlay(videoEl)
    },
    enforceContinuousLoopOnAllVideos() {
      document.querySelectorAll('video').forEach((videoEl) => {
        this.enforceContinuousLoop(videoEl)
      })
    },
    cleanupContinuousLoop(videoEl) {
      if (!videoEl || videoEl.dataset.blitzzLoopBound !== '1') return

      videoEl.removeEventListener('ended', videoEl._blitzzRestartPlayback)
      videoEl.removeEventListener('pause', videoEl._blitzzResumeIfPaused)
      videoEl.removeEventListener('stalled', videoEl._blitzzRestartPlayback)
      videoEl.removeEventListener('suspend', videoEl._blitzzRestartPlayback)

      delete videoEl._blitzzRestartPlayback
      delete videoEl._blitzzResumeIfPaused
      delete videoEl.dataset.blitzzLoopBound
    }
  },
  mounted() {
    this.enforceContinuousLoopOnAllVideos()

    this.videoObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return
          const element = node

          if (element.tagName === 'VIDEO') {
            this.enforceContinuousLoop(element)
          }

          if (typeof element.querySelectorAll === 'function') {
            element.querySelectorAll('video').forEach((videoEl) => {
              this.enforceContinuousLoop(videoEl)
            })
          }
        })
      })
    })
    this.videoObserver.observe(document.body, { childList: true, subtree: true })

    this.visibilityHandler = () => {
      if (!document.hidden) {
        this.enforceContinuousLoopOnAllVideos()
      }
    }
    this.focusHandler = () => {
      this.enforceContinuousLoopOnAllVideos()
    }

    document.addEventListener('visibilitychange', this.visibilityHandler)
    window.addEventListener('focus', this.focusHandler)
  },
  beforeUnmount() {
    if (this.videoObserver) {
      this.videoObserver.disconnect()
    }
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler)
    }
    if (this.focusHandler) {
      window.removeEventListener('focus', this.focusHandler)
    }

    document.querySelectorAll('video').forEach((videoEl) => {
      this.cleanupContinuousLoop(videoEl)
    })
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  /* LA CORRECTION EST ICI : on utilise min-height au lieu de height fixe */
  min-height: 100vh; 
  overflow-x: hidden;
  background-color: #f3f4f6; /* Petite couleur de fond neutre quand le quiz est actif */
}
</style>
