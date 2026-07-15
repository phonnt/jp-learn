export function speak(text: string, lang: string = 'ja-JP', rate: number = 0.8) {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = rate
  window.speechSynthesis.speak(utterance)
}
